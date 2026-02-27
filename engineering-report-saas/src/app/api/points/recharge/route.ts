import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { rechargePoints, getUserPoints } from "@/lib/db";

// 充值套餐配置
const PACKAGES: Record<string, { points: number; price: number; name: string; bonus: number }> = {
  basic: { points: 500, price: 50, name: "入门套餐", bonus: 0 },
  standard: { points: 1500, price: 120, name: "标准套餐", bonus: 0 },
  pro: { points: 5000, price: 350, name: "专业套餐", bonus: 0 },
  enterprise: { points: 15000, price: 900, name: "企业套餐", bonus: 0 },
};

function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId, points, amount } = body;

    // 获取套餐信息
    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "无效的套餐" },
        { status: 400 }
      );
    }

    const rechargeAmount = pkg.points;
    const paymentMethod = "alipay"; // 模拟支付方式

    // 执行充值
    const success = await rechargePoints(userId, rechargeAmount, paymentMethod);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "充值失败" },
        { status: 500 }
      );
    }

    const remainingPoints = await getUserPoints(userId);

    return NextResponse.json({
      success: true,
      message: `充值成功，获得 ${pkg.name}（${pkg.points} 积分）`,
      points: rechargeAmount,
      remaining: remainingPoints,
      bonus: pkg.bonus,
      totalReceived: rechargeAmount + pkg.bonus,
    });
  } catch (error) {
    console.error("Recharge error:", error);
    return NextResponse.json(
      { success: false, error: "充值失败，请稍后重试" },
      { status: 500 }
    );
  }
}