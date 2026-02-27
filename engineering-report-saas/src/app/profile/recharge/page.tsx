"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Coins,
  CreditCard,
  ChevronLeft,
  Check,
  Loader2,
  Shield,
  Zap
} from "lucide-react";

const PACKAGES = [
  {
    id: "basic",
    name: "入门套餐",
    points: 500,
    price: 50,
    badge: null,
    popular: false
  },
  {
    id: "standard",
    name: "标准套餐",
    points: 1500,
    price: 120,
    badge: "热门",
    popular: true
  },
  {
    id: "pro",
    name: "专业套餐",
    points: 5000,
    price: 350,
    badge: "超值",
    popular: false
  },
  {
    id: "enterprise",
    name: "企业套餐",
    points: 15000,
    price: 900,
    badge: null,
    popular: false
  }
];

export default function RechargePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleRecharge = async (pkg: typeof PACKAGES[0]) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/points/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          packageId: pkg.id,
          points: pkg.points,
          amount: pkg.price
        })
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        alert(`充值成功！已获得 ${pkg.points} 积分`);
        router.push("/profile");
      } else {
        alert(data.error || "充值失败");
      }
    } catch (error) {
      alert("充值失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* 顶部导航栏 */}
      <header
        className="border-b px-6 py-4"
        style={{
          borderColor: 'var(--border-color)',
          background: 'linear-gradient(180deg, #0f172a 0%, rgba(15, 23, 42, 0.95) 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-white/10 border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-lg font-semibold text-white">充值积分</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>选择套餐，充值积分</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 当前余额 */}
        <section
          className={`rounded-2xl border p-6 mb-8 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            borderColor: 'var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
              >
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>当前余额</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{user?.points?.toLocaleString() || 0}</span>
                  <span className="text-lg" style={{ color: 'var(--accent-primary)' }}>积分</span>
                </div>
              </div>
            </div>
            <a
              href="/profile/history"
              className="text-sm underline"
              style={{ color: 'var(--accent-secondary)' }}
            >
              查看历史 →
            </a>
          </div>
        </section>

        {/* 套餐选择 */}
        <section
          className={`transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ animationDelay: '100ms' }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">选择套餐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PACKAGES.map((pkg, index) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  onDoubleClick={() => handleRecharge(pkg)}
                  disabled={isLoading}
                  className={`relative rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    isSelected ? 'ring-2 ring-amber-500' : ''
                  }`}
                  style={{
                    border: isSelected
                      ? '1px solid rgba(245, 158, 11, 0.5)'
                      : '1px solid var(--border-color)',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                      : 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                    boxShadow: isSelected
                      ? '0 8px 32px rgba(245, 158, 11, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.2)',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* 标签 */}
                  {pkg.badge && (
                    <div
                      className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                        pkg.popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-purple-500 text-white'
                      }`}
                    >
                      {pkg.badge}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-white">{pkg.name}</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>获得积分</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected ? 'scale-100' : 'scale-90 opacity-50'
                      }`}
                      style={{
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        border: '2px solid ' + (isSelected ? 'var(--accent-primary)' : 'var(--border-color)')
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {pkg.points.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>积分</span>
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-2xl font-bold text-white">¥{pkg.price}</span>
                    <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/ {Math.round(pkg.points / pkg.price)} 积分/元</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 充值按钮 */}
        <section
          className={`mt-8 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ animationDelay: '300ms' }}
        >
          <button
            onClick={() => {
              const pkg = PACKAGES.find(p => p.id === selectedPackage);
              if (pkg) handleRecharge(pkg);
            }}
            disabled={!selectedPackage || isLoading}
            className="w-full py-4 rounded-2xl text-base font-semibold text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-amber-500/30"
            style={{
              background: selectedPackage
                ? 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)'
                : 'var(--bg-tertiary)'
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                充值中...
              </span>
            ) : selectedPackage ? (
              `立即充值 ¥${PACKAGES.find(p => p.id === selectedPackage)?.price}`
            ) : (
              "请选择套餐"
            )}
          </button>
        </section>

        {/* 说明 */}
        <section
          className={`mt-8 rounded-xl p-5 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            animationDelay: '400ms'
          }}
        >
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
            充值说明
          </h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
              积分用于生成工程可行性报告，每次生成消耗 100 积分
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
              充值成功后，积分实时到账，无有效期限制
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
              如有问题，请联系客服处理
            </li>
          </ul>
        </section>

        {/* 底部安全提示 */}
        <div className="text-center mt-8 pb-8">
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Shield className="w-4 h-4" />
            <span>安全支付 · 积分实时到账 · 7×24小时服务</span>
          </div>
        </div>
      </main>
    </div>
  );
}