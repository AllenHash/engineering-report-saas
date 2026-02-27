import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import { getUserPoints, addPoints, deductPoints, getUserTransactions, rechargePoints, deductPointsWithRecord } from "@/lib/db";

// 积分配置
const POINTS_CONFIG = {
  // 生成报告消耗积分
  REPORT_COST: 20,
  // 新用户赠送积分
  NEW_USER_POINTS: 100,
  // 充值套餐
  RECHARGE_PACKAGES: [
    { id: 'pack_100', name: '基础套餐', points: 100, price: 10, bonus: 0 },
    { id: 'pack_300', name: '标准套餐', points: 300, price: 28, bonus: 20 },
    { id: 'pack_500', name: '高级套餐', points: 500, price: 45, bonus: 50 },
    { id: 'pack_1000', name: '企业套餐', points: 1000, price: 80, bonus: 120 },
  ],
};

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

// 获取用户积分
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const points = getUserPoints(userId);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 获取交易历史
    if (action === 'history') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const transactions = getUserTransactions(userId, limit);
      return NextResponse.json({
        success: true,
        transactions,
        config: POINTS_CONFIG
      });
    }

    // 默认获取积分余额
    return NextResponse.json({
      success: true,
      points,
      config: POINTS_CONFIG
    });
  } catch (error) {
    console.error("Get points error:", error);
    return NextResponse.json(
      { error: "获取积分失败" },
      { status: 500 }
    );
  }
}

// 积分操作
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, amount, packageId, description, relatedId } = body;

    if (action === "deduct") {
      // 扣除积分（生成报告时调用）- 记录交易
      const deductAmount = amount || POINTS_CONFIG.REPORT_COST;
      const desc = description || `生成可行性报告`;

      const success = deductPointsWithRecord(userId, deductAmount, desc, relatedId);

      if (!success) {
        const currentPoints = getUserPoints(userId);
        return NextResponse.json(
          { error: `积分不足，需要${deductAmount}积分，当前${currentPoints}积分`, code: 'INSUFFICIENT_POINTS' },
          { status: 400 }
        );
      }

      const remainingPoints = getUserPoints(userId);

      return NextResponse.json({
        success: true,
        message: "积分扣除成功",
        deducted: deductAmount,
        remaining: remainingPoints
      });
    } else if (action === "recharge") {
      // 充值积分
      const rechargeAmount = amount || 0;
      const paymentMethod = body.paymentMethod || 'alipay';

      if (rechargeAmount <= 0) {
        return NextResponse.json(
          { error: "充值金额必须大于0" },
          { status: 400 }
        );
      }

      // 模拟支付流程 - 实际项目中应该调用支付网关
      // 这里直接增加积分
      const success = rechargePoints(userId, rechargeAmount, paymentMethod);

      if (!success) {
        return NextResponse.json(
          { error: "充值失败" },
          { status: 500 }
        );
      }

      const remainingPoints = getUserPoints(userId);

      return NextResponse.json({
        success: true,
        message: "充值成功",
       充值: rechargeAmount,
        remaining: remainingPoints
      });
    } else if (action === "recharge_package") {
      // 使用套餐充值
      const pkg = POINTS_CONFIG.RECHARGE_PACKAGES.find(p => p.id === packageId);

      if (!pkg) {
        return NextResponse.json(
          { error: "无效的套餐" },
          { status: 400 }
        );
      }

      const totalPoints = pkg.points + pkg.bonus;
      const paymentMethod = body.paymentMethod || 'alipay';

      // 模拟支付流程 - 实际项目中应该调用支付网关
      const success = rechargePoints(userId, totalPoints, paymentMethod);

      if (!success) {
        return NextResponse.json(
          { error: "充值失败" },
          { status: 500 }
        );
      }

      const remainingPoints = getUserPoints(userId);

      return NextResponse.json({
        success: true,
        message: `充值成功，获得${pkg.name}（${pkg.points}+${pkg.bonus}积分）`,
        package: pkg,
        totalPoints,
        remaining: remainingPoints
      });
    } else if (action === "add") {
      // 增加积分（管理员操作或活动赠送）
      addPoints(userId, amount || 0);

      const remainingPoints = getUserPoints(userId);

      return NextResponse.json({
        success: true,
        message: "积分增加成功",
        added: amount || 0,
        remaining: remainingPoints
      });
    } else if (action === "check") {
      // 检查积分是否足够
      const required = amount || POINTS_CONFIG.REPORT_COST;
      const currentPoints = getUserPoints(userId);

      return NextResponse.json({
        success: true,
        sufficient: currentPoints >= required,
        current: currentPoints,
        required
      });
    } else {
      return NextResponse.json(
        { error: "无效的操作" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Points operation error:", error);
    return NextResponse.json(
      { error: "操作失败" },
      { status: 500 }
    );
  }
}