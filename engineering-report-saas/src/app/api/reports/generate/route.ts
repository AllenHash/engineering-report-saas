import { NextRequest, NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates/outlines";
import { getUserPoints, deductPointsWithRecord } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// 生成报告消耗的积分
const REPORT_COST = 20;

// API配置
const getApiKey = () => process.env.SILICONFLOW_API_KEY || "sk-couqaakwgtkgrivhntvorigljarpuyvsmfedappuvlctloeg";
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

// 生成完整报告
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

    // 检查积分并扣除（如果有用户登录）
    if (userId) {
      const points = await getUserPoints(userId);
      if (points < REPORT_COST) {
        return NextResponse.json(
          {
            error: `积分不足`,
            code: 'INSUFFICIENT_POINTS',
            required: REPORT_COST,
            current: points,
            message: `生成报告需要${REPORT_COST}积分，当前${points}积分，请先充值`
          },
          { status: 400 }
        );
      }

      // 扣除积分并记录交易
      const reportId = `report_${Date.now()}`;
      const description = `生成报告: ${projectInfo.name || '工程可行性报告'}`;
      const success = deductPointsWithRecord(userId, REPORT_COST, description, reportId);

      if (!success) {
        return NextResponse.json(
          { error: "积分扣除失败" },
          { status: 500 }
        );
      }

      // 将报告ID返回给前端，后续可用于关联
      body.generatedReportId = reportId;
    }

    // 确定要生成的章节（限制前3章，确保快速响应）
    const sectionsToGenerate = (sections || template.sections).slice(0, 3);
    
    if (sectionsToGenerate.length === 0) {
      return NextResponse.json(
        { error: "没有可生成的章节" },
        { status: 400 }
      );
    }
    
    // 生成报告标题
    const reportTitle = `${projectInfo.name || '工程'}可行性研究报告`;
    
    // 生成每个章节（并行处理提高速度）
    const generatedSections = [];
    const sectionPromises = [];
    
    for (const section of sectionsToGenerate) {
      console.log(`[Report] Queuing section: ${section.title}`);
      sectionPromises.push(
        generateSection(section, projectInfo, template.name)
          .then(content => ({
            id: section.id,
            title: section.title,
            content: content,
            children: section.children?.map((child: any) => ({
              id: child.id,
              title: child.title,
              content: ""  // 子章节内容可在后续生成
            }))
          }))
          .catch(error => {
            console.error(`[Report] Failed to generate section ${section.title}:`, error);
            return {
              id: section.id,
              title: section.title,
              content: "（章节内容生成失败，请稍后重试）",
              children: []
            };
          })
      );
    }
    
    // 等待所有章节生成完成（带有超时控制）
    const timeoutPromise = new Promise(resolve => setTimeout(() => {
      resolve([]);
    }, 30000)); // 30秒超时
    
    const sectionsResult = await Promise.race([
      Promise.all(sectionPromises),
      timeoutPromise
    ]);
    
    if (Array.isArray(sectionsResult)) {
      generatedSections.push(...sectionsResult);
    } else {
      // 超时情况，提供部分内容
      generatedSections.push({
        id: "1",
        title: "概述",
        content: "报告生成超时，请稍后重试或联系客服。",
        children: []
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
      totalSections: template.sections.length,
      generatedSections: generatedSections.length,
      createdAt: new Date().toISOString(),
      status: generatedSections.length > 0 ? "partial" : "failed"
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