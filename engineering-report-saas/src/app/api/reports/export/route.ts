import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getReportById } from '@/lib/db';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { marked } from 'marked';

// 生成Word文档
async function generateWordDocument(report: any): Promise<Buffer> {
  const children: Paragraph[] = [];

  // 标题
  children.push(
    new Paragraph({
      text: report.title || '工程可行性研究报告',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // 模板名称
  if (report.templateName) {
    children.push(
      new Paragraph({
        text: report.templateName,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // 项目信息
  if (report.projectInfo) {
    const projectInfoLines: string[] = [];
    if (report.projectInfo.name) projectInfoLines.push(`项目名称：${report.projectInfo.name}`);
    if (report.projectInfo.location) projectInfoLines.push(`建设地点：${report.projectInfo.location}`);
    if (report.projectInfo.type) projectInfoLines.push(`项目类型：${report.projectInfo.type}`);
    if (report.projectInfo.scale) projectInfoLines.push(`建设规模：${report.projectInfo.scale}`);
    if (report.projectInfo.investment) projectInfoLines.push(`总投资：${report.projectInfo.investment}`);

    if (projectInfoLines.length > 0) {
      children.push(
        new Paragraph({
          text: '项目信息',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      for (const line of projectInfoLines) {
        children.push(
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        );
      }
    }
  }

  // 章节内容
  for (const section of report.sections) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // 将内容按段落分割
    const content = section.content || '';
    const paragraphs = content.split('\n').filter((p: string) => p.trim());

    for (const para of paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para.trim() })],
          spacing: { after: 100 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  return await Packer.toBuffer(doc);
}

// 生成Markdown内容
function generateMarkdownContent(report: any): string {
  let md = '';

  // 标题
  md += `# ${report.title || '工程可行性研究报告'}\n\n`;

  // 模板名称
  if (report.templateName) {
    md += `*${report.templateName}*\n\n`;
  }

  // 项目信息
  if (report.projectInfo) {
    md += `## 项目信息\n\n`;
    if (report.projectInfo.name) md += `- **项目名称**：${report.projectInfo.name}\n`;
    if (report.projectInfo.location) md += `- **建设地点**：${report.projectInfo.location}\n`;
    if (report.projectInfo.type) md += `- **项目类型**：${report.projectInfo.type}\n`;
    if (report.projectInfo.scale) md += `- **建设规模**：${report.projectInfo.scale}\n`;
    if (report.projectInfo.investment) md += `- **总投资**：${report.projectInfo.investment}\n`;
    md += '\n';
  }

  // 章节内容
  for (const section of report.sections) {
    md += `## ${section.title}\n\n`;

    const content = section.content || '';
    md += content + '\n\n';
  }

  return md;
}

// 获取报告数据用于导出
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '登录已过期' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportId, format } = body;

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: '报告ID不能为空' },
        { status: 400 }
      );
    }

    const report = await getReportById(reportId, payload.id);

    if (!report) {
      return NextResponse.json(
        { success: false, error: '报告不存在' },
        { status: 404 }
      );
    }

    const reportData = {
      id: report.id,
      title: report.title,
      templateName: report.templateName,
      projectInfo: report.projectInfo,
      sections: report.sections,
    };

    // 返回报告数据供前端生成PDF（保持原有逻辑）
    if (format === 'pdf' || !format) {
      return NextResponse.json({
        success: true,
        report: reportData
      });
    }

    // 生成Word文档
    if (format === 'word') {
      const wordBuffer = await generateWordDocument(reportData);
      return new NextResponse(new Uint8Array(wordBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(reportData.title || '工程可行性报告')}.docx"`,
        },
      });
    }

    // 生成Markdown
    if (format === 'markdown') {
      const markdownContent = generateMarkdownContent(reportData);
      return new NextResponse(markdownContent, {
        headers: {
          'Content-Type': 'text/markdown;charset=utf-8',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(reportData.title || '工程可行性报告')}.md"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: '不支持的导出格式' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: '导出失败' },
      { status: 500 }
    );
  }
}