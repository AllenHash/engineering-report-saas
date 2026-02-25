import { NextRequest, NextResponse } from "next/server";
import { 
  getAllTemplates, 
  getTemplateById, 
  getTemplatesByIndustry, 
  searchTemplates,
  INDUSTRIES 
} from "@/data/templates/outlines";

// 获取大纲列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get('industry');
  const keyword = searchParams.get('keyword');
  const id = searchParams.get('id');

  try {
    // 根据ID获取单个模板
    if (id) {
      const template = getTemplateById(id);
      if (!template) {
        return NextResponse.json({ error: "模板不存在" }, { status: 404 });
      }
      return NextResponse.json({ template });
    }

    // 根据行业筛选
    if (industry && industry !== 'all') {
      const templates = getTemplatesByIndustry(industry);
      return NextResponse.json({ templates, industries: INDUSTRIES });
    }

    // 关键词搜索
    if (keyword) {
      const templates = searchTemplates(keyword);
      return NextResponse.json({ templates, industries: INDUSTRIES });
    }

    // 获取所有模板
    const templates = getAllTemplates();
    return NextResponse.json({ templates, industries: INDUSTRIES });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 创建新模板（预留接口）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必要字段
    if (!body.name || !body.industry || !body.sections) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // MVP阶段暂不支持用户创建模板
    return NextResponse.json({ 
      message: "MVP阶段暂不支持用户创建模板，请联系系统管理员",
      status: "coming_soon"
    });
  } catch (error) {
    console.error("Templates POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}