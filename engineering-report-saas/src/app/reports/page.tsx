"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Report {
  id: string;
  title: string;
  projectName: string;
  projectType: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 从数据库获取报告列表
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReports(data.reports || []);
        }
      })
      .catch(err => {
        console.error("Failed to fetch reports:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, authLoading]);

  // 删除报告
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这份报告吗？")) return;

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setReports(reports.filter(r => r.id !== id));
      } else {
        alert(data.error || "删除失败");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("删除失败，请重试");
    }
  };

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter(r => r.status === filter);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      highway: "🛣️",
      municipal: "🏙️",
      ecology: "🌿",
      environmental: "🌿",
      water: "💧",
      building: "🏗️",
    };
    return icons[type] || "📋";
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">已完成</span>;
    }
    if (status === "generating") {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">生成中</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">草稿</span>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 未登录时显示提示
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-400 mb-4">请先登录查看您的报告</p>
          <Link href="/login" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            登录
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href="/reports" className="text-sm text-white">历史报告</Link>
            {user && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">历史报告</h1>
            <p className="text-gray-400 mt-1">管理您创建的所有可行性研究报告</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新建报告
          </Link>
        </div>

        {/* 筛选器 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === "completed" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            已完成
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === "draft" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            草稿
          </button>
        </div>

        {/* 报告列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-400">暂无报告</p>
            <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">
              创建第一份报告
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(report.projectType)}</span>
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <span>📛 {report.projectName || '未命名项目'}</span>
                      <span>📍 {report.location || '地址未填写'}</span>
                      <span>🕐 {formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/editor/${report.id}`}
                      className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-red-600/50 text-red-400 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}