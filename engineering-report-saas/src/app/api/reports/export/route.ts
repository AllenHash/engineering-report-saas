import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getReportById } from '@/lib/db';

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
    const { reportId } = body;

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

    // 返回报告数据供前端生成PDF
    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        templateName: report.templateName,
        projectInfo: report.projectInfo,
        sections: report.sections,
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: '获取报告数据失败' },
      { status: 500 }
    );
  }
}