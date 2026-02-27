import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import { getReportsByUser, createReport } from '@/lib/db';

// 获取用户报告列表
export async function GET(request: NextRequest) {
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

    const reports = await getReportsByUser(payload.id);

    return NextResponse.json({
      success: true,
      reports: reports.map(r => ({
        id: r.id,
        title: r.title,
        projectName: (r.projectInfo as any).name || '',
        projectType: (r.projectInfo as any).type || '',
        location: (r.projectInfo as any).location || '',
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建新报告
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
    const { title, templateId, templateName, projectInfo, sections } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: '报告标题不能为空' },
        { status: 400 }
      );
    }

    const report = await createReport(payload.id, {
      title,
      templateId,
      templateName,
      projectInfo: projectInfo || {},
      sections: sections || [],
      status: 'draft',
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        projectName: report.projectInfo.name || '',
        projectType: report.projectInfo.type || '',
        location: report.projectInfo.location || '',
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}