import { NextRequest, NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates/outlines";
import { getUserPoints, deductPointsWithRecord, saveReport } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// 生成报告消耗的积分
const REPORT_COST = 20;

// API配置
const getApiKey = () => process.env.SILICONFLOW_API_KEY || "sk-couqaakwgtkgrivhntvorigljarpuyvsmfedappuvlctloeg";
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";

// SSE相关工具函数
function createSSEEncoder() {
  return new TextEncoder();
}

function sendSSEMessage(writer: WritableStreamDefaultWriter<Uint8Array>, event: string, data: any) {
  const encoder = createSSEEncoder();
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return writer.write(encoder.encode(message));
}

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
// 生成单个章节内容（非流式）
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

// 流式生成单个章节内容
async function* streamGenerateSection(
  section: any,
  projectInfo: any,
  templateName: string
): AsyncGenerator<string, void, unknown> {
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
        max_tokens: 2048,
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') {
          return;
        }

        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  } catch (error) {
    console.error("Stream generate section error:", error);
    yield "（内容生成失败，请稍后重试）";
  }
}

// 从请求中获取用户ID
function getUserIdFromRequest(request: NextRequest): string | null {
  // 优先从 header 获取
  const userId = request.headers.get("x-user-id");
  if (userId) return userId;

  // 从 cookie 获取
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.id || null;
}

// 生成完整报告（支持SSE进度推送和取消）
export async function POST(request: NextRequest) {
  let userId: string | null = null;

  // 首先尝试获取用户ID用于积分检查
  try {
    userId = getUserIdFromRequest(request);
  } catch (e) {
    // 继续处理，允许未登录用户生成报告但不扣除积分
  }

  try {
    const body = await request.json();
    const {
      projectInfo,   // 项目信息：{ name, location, type, scale, investment }
      templateId,    // 大纲模板ID
      sections,      // 要生成的章节列表（默认全部）
      useSSE = false,// 是否使用SSE推送进度
      generateAll = false, // 是否生成所有章节（否则只生成3个）
      reportId       // 报告ID（用于取消时标识）
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

    // 检查积分并扣除（如果有用户登录）
    if (userId) {
      const points = await getUserPoints(userId);
      // 根据生成章节数量调整积分
      const sectionsCount = generateAll ? template.sections.length : Math.min(3, template.sections.length);
      const cost = REPORT_COST * Math.ceil(sectionsCount / 3);

      if (points < cost) {
        return NextResponse.json(
          {
            error: `积分不足`,
            code: 'INSUFFICIENT_POINTS',
            required: cost,
            current: points,
            message: `生成报告需要${cost}积分，当前${points}积分，请先充值`
          },
          { status: 400 }
        );
      }

      // 扣除积分并记录交易
      const generatedReportId = reportId || `report_${Date.now()}`;
      const description = `生成报告: ${projectInfo.name || '工程可行性报告'}`;
      const success = deductPointsWithRecord(userId, cost, description, generatedReportId);

      if (!success) {
        return NextResponse.json(
          { error: "积分扣除失败" },
          { status: 500 }
        );
      }
    }

    // 确定要生成的章节
    let sectionsToGenerate = sections || template.sections;
    if (!generateAll) {
      sectionsToGenerate = sectionsToGenerate.slice(0, 3); // 默认只生成前3章
    }

    if (sectionsToGenerate.length === 0) {
      return NextResponse.json(
        { error: "没有可生成的章节" },
        { status: 400 }
      );
    }

    const totalSections = sectionsToGenerate.length;
    const finalReportId = reportId || `report_${Date.now()}`;
    const reportTitle = `${projectInfo.name || '工程'}可行性研究报告`;

    // SSE 模式：使用流式响应推送进度
    if (useSSE) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let generatedSections: any[] = [];
          let cancelled = false;

          // 发送进度更新
          const sendProgress = async (progress: number, message: string, currentSection?: string) => {
            const data = JSON.stringify({
              progress,
              message,
              currentSection,
              totalSections,
              generated: generatedSections.length,
              reportId: finalReportId
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          };

          try {
            // 发送开始生成消息
            await sendProgress(0, '开始生成报告...');

            // 逐章生成
            for (let i = 0; i < sectionsToGenerate.length; i++) {
              // 检查是否已取消（通过发送特殊事件）
              const section = sectionsToGenerate[i];
              console.log(`[Report] Generating section ${i + 1}/${totalSections}: ${section.title}`);

              await sendProgress(
                Math.round((i / totalSections) * 100),
                `正在生成第 ${i + 1} 章：${section.title}`,
                section.title
              );

              try {
                const content = await generateSection(section, projectInfo, template.name);

                const generatedSection = {
                  id: section.id,
                  title: section.title,
                  content: content,
                  children: section.children?.map((child: any) => ({
                    id: child.id,
                    title: child.title,
                    content: ""
                  }))
                };

                generatedSections.push(generatedSection);

                await sendProgress(
                  Math.round(((i + 1) / totalSections) * 100),
                  `已完成第 ${i + 1} 章：${section.title}`,
                  section.title
                );
              } catch (error) {
                console.error(`[Report] Failed to generate section ${section.title}:`, error);
                generatedSections.push({
                  id: section.id,
                  title: section.title,
                  content: "（章节内容生成失败，请稍后重试）",
                  children: []
                });
              }

              // 避免请求过快
              await new Promise(resolve => setTimeout(resolve, 300));
            }

            // 生成完成
            const fullReport = {
              id: finalReportId,
              title: reportTitle,
              templateId: templateId,
              templateName: template.name,
              industry: template.industry,
              projectInfo: projectInfo,
              sections: generatedSections,
              totalSections: template.sections.length,
              generatedSections: generatedSections.length,
              createdAt: new Date().toISOString(),
              status: "completed" as const
            };

            await sendProgress(100, '报告生成完成！');
            controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify({ report: fullReport })}\n\n`));
            controller.close();

          } catch (error) {
            console.error("SSE generation error:", error);
            await sendProgress(0, '生成失败，请重试');
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    // 普通模式（非SSE）：直接返回完整结果
    const generatedSections: any[] = [];

    for (const section of sectionsToGenerate) {
      console.log(`[Report] Queuing section: ${section.title}`);
      try {
        const content = await generateSection(section, projectInfo, template.name);
        generatedSections.push({
          id: section.id,
          title: section.title,
          content: content,
          children: section.children?.map((child: any) => ({
            id: child.id,
            title: child.title,
            content: ""
          }))
        });
      } catch (error) {
        console.error(`[Report] Failed to generate section ${section.title}:`, error);
        generatedSections.push({
          id: section.id,
          title: section.title,
          content: "（章节内容生成失败，请稍后重试）",
          children: []
        });
      }
    }

    // 整合报告
    const fullReport = {
      id: finalReportId,
      title: reportTitle,
      templateId: templateId,
      templateName: template.name,
      industry: template.industry,
      projectInfo: projectInfo,
      sections: generatedSections,
      totalSections: template.sections.length,
      generatedSections: generatedSections.length,
      createdAt: new Date().toISOString(),
      status: generatedSections.length > 0 ? "completed" as const : "failed" as const
    };

    return NextResponse.json({
      success: generatedSections.length > 0,
      message: `生成完成（${generatedSections.length}/${sectionsToGenerate.length}个章节）`,
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

// 流式生成单个章节（SSE）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, projectInfo, templateId, sectionId } = body;

    if (!section || !projectInfo || !templateId || !sectionId) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "模板不存在" },
        { status: 404 }
      );
    }

    // 创建SSE流
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullContent = '';

        const sendContent = (content: string, done: boolean = false) => {
          const data = JSON.stringify({
            content,
            done,
            sectionId
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          // 开始生成
          sendContent('', false);

          // 流式获取内容
          for await (const chunk of streamGenerateSection(section, projectInfo, template.name)) {
            fullContent += chunk;
            sendContent(fullContent, false);
          }

          // 完成
          sendContent(fullContent, true);
          controller.close();

        } catch (error) {
          console.error("Stream generation error:", error);
          const errorMsg = "（内容生成失败，请稍后重试）";
          sendContent(errorMsg, true);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error("Patch error:", error);
    return NextResponse.json(
      { error: "生成失败" },
      { status: 500 }
    );
  }
}

// 取消报告生成
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    return NextResponse.json(
      { error: "缺少报告ID" },
      { status: 400 }
    );
  }

  // 标记该报告为已取消
  // 在实际生产环境中，这里可以存储取消状态供生成过程检查
  console.log(`[Report] Cancellation requested for report: ${reportId}`);

  return NextResponse.json({
    success: true,
    message: "已收到取消请求"
  });
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