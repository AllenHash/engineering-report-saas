"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Transaction {
  id: string;
  type: 'recharge' | 'report' | 'bonus' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  relatedId?: string;
  createdAt: number;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  recharge: { label: '充值', color: 'text-green-400' },
  report: { label: '消费', color: 'text-red-400' },
  bonus: { label: '赠送', color: 'text-yellow-400' },
  refund: { label: '退款', color: 'text-blue-400' },
};

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 检查登录
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 获取交易记录
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/points?action=history&limit=100');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    if (amount > 0) {
      return <span className="text-green-400">+{amount}</span>;
    }
    return <span className="text-red-400">{amount}</span>;
  };

  if (loading || isLoading) {
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
            <span className="font-semibold">交易记录</span>
          </div>
          <Link href="/profile/recharge" className="text-yellow-400 text-sm hover:underline">
            去充值 →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-400 mb-4">暂无交易记录</p>
            <Link
              href="/profile/recharge"
              className="inline-block px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg"
            >
              立即充值
            </Link>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-700">
              {transactions.map((tx) => {
                const typeInfo = typeLabels[tx.type] || { label: '未知', color: 'text-gray-400' };
                return (
                  <div key={tx.id} className="p-4 hover:bg-gray-750">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {tx.relatedId && tx.type === 'report' && (
                            <span className="text-xs text-gray-500">
                              (报告生成)
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{tx.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium">
                          {formatAmount(tx.amount)}
                        </div>
                        <p className="text-gray-500 text-xs">
                          余额: {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {transactions.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-4">统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">累计充值</div>
                <div className="text-2xl font-bold text-green-400">
                  {transactions.filter(t => t.type === 'recharge').reduce((sum, t) => sum + t.amount, 0)}
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">累计消费</div>
                <div className="text-2xl font-bold text-red-400">
                  {Math.abs(transactions.filter(t => t.type === 'report').reduce((sum, t) => sum + t.amount, 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}