"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  History,
  ChevronLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Gift,
  RotateCcw,
  FileText,
  Coins
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'recharge' | 'report' | 'bonus' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  relatedId?: string;
  createdAt: number;
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  recharge: {
    label: '充值',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    icon: TrendingUp
  },
  report: {
    label: '消费',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    icon: FileText
  },
  bonus: {
    label: '赠送',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    icon: Gift
  },
  refund: {
    label: '退款',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    icon: RotateCcw
  }
};

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/points?action=history&limit=100");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatAmount = (amount: number) => {
    if (amount > 0) {
      return <span className="text-emerald-400">+{amount}</span>;
    }
    return <span className="text-red-400">{amount}</span>;
  };

  // 统计数据
  const totalRecharge = transactions
    .filter(t => t.type === "recharge")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpend = Math.abs(
    transactions
      .filter(t => t.type === "report")
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const totalBonus = transactions
    .filter(t => t.type === "bonus")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* 顶部导航栏 */}
      <header
        className="border-b px-6 py-4"
        style={{
          borderColor: "var(--border-color)",
          background: "linear-gradient(180deg, #0f172a 0%, rgba(15, 23, 42, 0.95) 100%)"
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-white/10 border"
              style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-lg font-semibold text-white">积分历史</h1>
              <p className="text-xs" style={{ color: "var(--var-text-muted)" }}>查看积分变动记录</p>
            </div>
          </div>
          <a
            href="/profile/recharge"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 border border-amber-500/30"
            style={{ background: "linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)" }}
          >
            <Coins className="w-4 h-4" />
            去充值
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 当前余额 */}
        <section
          className={`rounded-2xl border p-6 mb-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            borderColor: "var(--border-color)",
            background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)"
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>当前余额</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{user?.points?.toLocaleString() || 0}</span>
                <span className="text-lg" style={{ color: "var(--accent-primary)" }}>积分</span>
              </div>
            </div>
            <div
              className="px-4 py-2 rounded-xl"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>共 {transactions.length} 笔记录</p>
            </div>
          </div>
        </section>

        {/* 统计卡片 */}
        {transactions.length > 0 && (
          <section
            className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: "100ms" }}
          >
            <div
              className="rounded-xl p-4 border"
              style={{
                borderColor: "rgba(16, 185, 129, 0.3)",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)"
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>累计充值</span>
              </div>
              <p className="text-xl font-bold text-emerald-400">{totalRecharge.toLocaleString()}</p>
            </div>
            <div
              className="rounded-xl p-4 border"
              style={{
                borderColor: "rgba(239, 68, 68, 0.3)",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)"
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>累计消费</span>
              </div>
              <p className="text-xl font-bold text-red-400">{totalSpend.toLocaleString()}</p>
            </div>
            <div
              className="rounded-xl p-4 border"
              style={{
                borderColor: "rgba(234, 179, 8, 0.3)",
                background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)"
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>累计赠送</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">{totalBonus.toLocaleString()}</p>
            </div>
          </section>
        )}

        {/* 交易记录列表 */}
        {transactions.length === 0 ? (
          <section
            className={`rounded-2xl border p-12 text-center transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-secondary)"
            }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(100, 116, 139, 0.2)" }}
            >
              <History className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">暂无交易记录</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              首次充值后，您的积分变动将显示在这里
            </p>
            <a
              href="/profile/recharge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 border border-amber-500/30"
              style={{ background: "linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)" }}
            >
              <Coins className="w-4 h-4" />
              立即充值
            </a>
          </section>
        ) : (
          <section
            className={`rounded-2xl border overflow-hidden transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-secondary)",
              animationDelay: "200ms"
            }}
          >
            <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
              {transactions.map((tx, index) => {
                const config = typeConfig[tx.type] || {
                  label: "未知",
                  color: "text-gray-400",
                  bg: "bg-gray-500/20",
                  icon: History
                };
                const IconComponent = config.icon;

                return (
                  <div
                    key={tx.id}
                    className="p-4 transition-all duration-200 hover:bg-white/5"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}
                        >
                          <IconComponent className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            {tx.relatedId && tx.type === "report" && (
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                (报告生成)
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {tx.description}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium">
                          {formatAmount(tx.amount)}
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          余额: {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 底部信息 */}
        <div className="text-center mt-8 pb-8">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            仅显示最近 100 条记录
          </p>
        </div>
      </main>
    </div>
  );
}