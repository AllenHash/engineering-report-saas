"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Package {
  id: string;
  name: string;
  points: number;
  price: number;
  bonus: number;
  tag?: string;
}

const packages: Package[] = [
  { id: 'pack_100', name: '基础套餐', points: 100, price: 10, bonus: 0, tag: '适合新手' },
  { id: 'pack_300', name: '标准套餐', points: 300, price: 28, bonus: 20, tag: '热门' },
  { id: 'pack_500', name: '高级套餐', points: 500, price: 45, bonus: 50, tag: '超值' },
  { id: 'pack_1000', name: '企业套餐', points: 1000, price: 80, bonus: 120, tag: '企业首选' },
];

export default function RechargePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 检查登录
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 获取当前积分
  useEffect(() => {
    if (user) {
      setCurrentPoints(user.points || 0);
    }
  }, [user]);

  const handleRecharge = async () => {
    if (!selectedPackage) {
      setMessage({ type: 'error', text: '请选择一个套餐' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recharge_package',
          packageId: selectedPackage.id,
          paymentMethod
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setCurrentPoints(data.remaining);
        setSelectedPackage(null);
        // 刷新页面数据
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: data.error || '充值失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-gray-400 hover:text-white">← 返回</Link>
            <span className="font-semibold">积分充值</span>
          </div>
          <div className="text-yellow-400 font-medium">
            当前积分: {currentPoints}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 积分说明 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">积分说明</h2>
          <ul className="space-y-2 text-gray-400">
            <li>• 积分用于生成工程可行性报告</li>
            <li>• 每次生成报告消耗 20 积分</li>
            <li>• 积分充值后永久有效，不过期</li>
            <li>• 充值成功后可在"交易记录"查看详情</li>
          </ul>
        </div>

        {/* 充值套餐 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">选择套餐</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`bg-gray-900 rounded-lg p-4 border-2 transition-all cursor-pointer relative ${
                  selectedPackage?.id === pkg.id
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                {pkg.tag && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500 text-gray-900 text-xs font-medium rounded-full">
                    {pkg.tag}
                  </div>
                )}
                <div className="text-lg font-semibold mb-2">{pkg.name}</div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">¥{pkg.price}</div>
                <div className="text-sm text-gray-400">
                  {pkg.points} 积分
                  {pkg.bonus > 0 && (
                    <span className="text-green-400"> + {pkg.bonus} 赠送</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 支付方式 */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">支付方式</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setPaymentMethod('alipay')}
              className={`flex-1 py-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'alipay'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">💳</div>
              <div className="font-medium">支付宝</div>
            </button>
            <button
              onClick={() => setPaymentMethod('wechat')}
              className={`flex-1 py-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'wechat'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">💚</div>
              <div className="font-medium">微信支付</div>
            </button>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* 充值按钮 */}
        <button
          onClick={handleRecharge}
          disabled={!selectedPackage || isLoading}
          className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            selectedPackage && !isLoading
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? '处理中...' : selectedPackage ? `立即支付 ¥${selectedPackage.price}` : '请选择套餐'}
        </button>

        {/* 模拟支付说明 */}
        <p className="text-center text-gray-500 text-sm mt-4">
          * 当前为演示模式，支付后将直接到账
        </p>
      </main>
    </div>
  );
}