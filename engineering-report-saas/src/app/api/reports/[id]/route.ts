import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getReportById, updateReport, deleteReport } from '@/lib/db';

// 获取单个报告
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const report = await getReportById(id, payload.id);

    if (!report) {
      return NextResponse.json(
        { success: false, error: '报告不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        templateId: report.templateId,
        templateName: report.templateName,
        projectInfo: report.projectInfo,
        sections: report.sections,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 更新报告
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const { title, projectInfo, sections, status } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (projectInfo !== undefined) updateData.projectInfo = projectInfo;
    if (sections !== undefined) updateData.sections = sections;
    if (status !== undefined) updateData.status = status;

    const report = await updateReport(id, payload.id, updateData);

    if (!report) {
      return NextResponse.json(
        { success: false, error: '报告不存在或无权修改' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        templateId: report.templateId,
        templateName: report.templateName,
        projectInfo: report.projectInfo,
        sections: report.sections,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除报告
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const success = await deleteReport(id, payload.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '报告不存在或无权删除' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '报告已删除'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}