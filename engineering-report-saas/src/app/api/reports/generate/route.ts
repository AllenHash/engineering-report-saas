import { NextRequest, NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates/outlines";

// API配置
const getApiKey = () => process.env.SILICONFLOW_API_KEY || "sk-qqqmkuqspdfmtmdokzckygylkxktxgojlnqqadnxztenmtkh";
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";

// 生成章节内容的系统提示词
const getSectionPrompt = (section: any, projectInfo: any, templateName: string) => {
  return `你是一个专业的工程可行性报告撰写专家。请根据以下信息撰写报告的"${section.title}"章节内容。

## 项目信息
- 项目名称：${projectInfo.name || '待定'}
- 建设地点：${projectInfo.location || '待定'}
- 工程类型：${projectInfo.type || '待定'}
- 建设规模：${projectInfo.scale || '待定'}
- 投资估算：${projectInfo.investment || '待定'}

## 模板信息
- 模板名称：${templateName}
- 章节标题：${section.title}

## 章节要求
${section.children?.map((c: any) => `- ${c.id} ${c.title}: ${c.description || ''}`).join('\n') || '无二级目录'}

## 要求
1. 根据项目信息撰写专业的内容
2. 内容要符合中国工程可行性报告的规范
3. 使用正式、专业的语言
4. 如果信息不足，可以基于常见情况给出合理的假设
5. 直接返回内容，不要有前言或总结

请开始撰写：`;
};

// 调用AI生成章节内容
async function generateSection(
  section: any, 
  projectInfo: any, 
  templateName: string
): Promise<string> {
  const prompt = getSectionPrompt(section, projectInfo, templateName);
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getApiKey()}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          { role: "system", content: "你是一个专业的工程可行性报告撰写专家，擅长撰写符合中国规范的可行性报告。回复要简洁专业，直接给出内容。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "（内容生成中...）";
  } catch (error) {
    console.error("Generate section error:", error);
    return "（内容生成失败，请稍后重试）";
  }
}

// 生成完整报告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectInfo,   // 项目信息：{ name, location, type, scale, investment }
      templateId,    // 大纲模板ID
      sections       // 要生成的章节列表（默认全部）
    } = body;

    if (!projectInfo || !templateId) {
      return NextResponse.json(
        { error: "缺少必要参数：projectInfo 和 templateId" },
        { status: 400 }
      );
    }

    // 获取模板
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "模板不存在" },
        { status: 404 }
      );
    }

    // 确定要生成的章节
    const sectionsToGenerate = sections || template.sections;
    
    // 生成报告标题
    const reportTitle = `${projectInfo.name || '工程'}可行性研究报告`;
    
    // 生成每个章节
    const generatedSections = [];
    
    for (const section of sectionsToGenerate) {
      console.log(`[Report] Generating section: ${section.title}`);
      const content = await generateSection(section, projectInfo, template.name);
      
      generatedSections.push({
        id: section.id,
        title: section.title,
        content: content,
        children: section.children?.map((child: any) => ({
          id: child.id,
          title: child.title,
          // 可以进一步生成子章节内容，这里先留空
          content: ""
        }))
      });
    }

    // 整合报告
    const fullReport = {
      id: `report_${Date.now()}`,
      title: reportTitle,
      templateId: templateId,
      templateName: template.name,
      industry: template.industry,
      projectInfo: projectInfo,
      sections: generatedSections,
      createdAt: new Date().toISOString(),
      status: "draft"
    };

    return NextResponse.json({
      success: true,
      report: fullReport
    });

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "报告生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}

// 获取报告（模拟数据）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // 模拟返回报告数据
  const mockReport = {
    id: "report_demo",
    title: "成灌高速公路可行性研究报告",
    templateId: "highway-2023",
    templateName: "公路工程可行性研究报告大纲",
    industry: "highway",
    projectInfo: {
      name: "成灌高速公路",
      location: "四川省成都市",
      type: "highway",
      scale: "50公里",
      investment: "10亿元"
    },
    sections: [],
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  return NextResponse.json({ report: mockReport });
}