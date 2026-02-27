"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout, loading, refresh } = useAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);

  // 如果正在加载，显示loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  // 如果未登录，跳转到登录页
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 获取积分余额
  useEffect(() => {
    if (user) {
      setPoints(user.points || 0);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleRechargeSuccess = () => {
    // 刷新用户数据以更新积分
    refresh();
    setPoints((prev: number) => prev + 100); // 乐观更新
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">📋</Link>
            <span className="font-semibold">工程报告AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white">首页</Link>
            <Link href="/profile" className="text-sm text-white">个人中心</Link>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
              {user?.name?.charAt(0) || "用"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0) || "用"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{user?.name || "用户"}</h1>
              <p className="text-gray-400 text-sm">📧 {user?.email}</p>
              <p className="text-gray-500 text-xs mt-1">手机号：{user?.phone || '未设置'}</p>
            </div>
          </div>
        </div>

        {/* 积分卡片 */}
        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-2xl p-6 mb-8 border border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm mb-1">当前积分</p>
              <p className="text-4xl font-bold text-yellow-400">{points}</p>
              <p className="text-yellow-200/60 text-xs mt-2">生成报告每次消耗 20 积分</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/profile/recharge"
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors text-center"
              >
                充值积分
              </Link>
              <Link
                href="/profile/history"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
              >
                查看记录
              </Link>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/create"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">创建报告</div>
          </Link>
          <Link
            href="/reports"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">我的报告</div>
          </Link>
          <Link
            href="/profile/recharge"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-yellow-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium">充值积分</div>
          </Link>
          <Link
            href="/profile/history"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📜</div>
            <div className="font-medium">交易记录</div>
          </Link>
        </div>

        {/* 设置选项 */}
        <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b border-gray-700">设置</h2>
          <div className="divide-y divide-gray-700">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3">
                <span>🔔</span>
                <span>通知设置</span>
              </div>
              <span className="text-gray-500">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3">
                <span>🔒</span>
                <span>账号安全</span>
              </div>
              <span className="text-gray-500">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3">
                <span>📖</span>
                <span>使用帮助</span>
              </div>
              <span className="text-gray-500">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3">
                <span>ℹ️</span>
                <span>关于我们</span>
              </div>
              <span className="text-gray-500">›</span>
            </button>
          </div>
        </div>

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
        >
          退出登录
        </button>
      </main>
    </div>
  );
}