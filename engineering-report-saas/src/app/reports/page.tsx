"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
  id: string;
  title: string;
  projectName: string;
  projectType: string;
  location: string;
  status: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 模拟数据（后续连接后端）
  useEffect(() => {
    // TODO: 替换为真实API调用
    setTimeout(() => {
      setReports([
        {
          id: "1",
          title: "成灌高速公路可行性研究报告",
          projectName: "成灌高速公路",
          projectType: "highway",
          location: "四川省成都市",
          status: "completed",
          createdAt: "2026-02-25 14:30",
        },
        {
          id: "2",
          title: "成都市政道路改造工程报告",
          projectName: "成都市政道路改造",
          projectType: "municipal",
          location: "四川省成都市",
          status: "completed",
          createdAt: "2026-02-24 10:15",
        },
        {
          id: "3",
          title: "河道生态修复工程报告",
          projectName: "某河道生态修复",
          projectType: "ecology",
          location: "四川省某市",
          status: "draft",
          createdAt: "2026-02-23 16:45",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter(r => r.status === filter);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      highway: "🛣️",
      municipal: "🏙️",
      ecology: "🌿",
      water: "💧",
      building: "🏗️",
    };
    return icons[type] || "📋";
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">已完成</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">草稿</span>;
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
            <Link href="/reports" className="text-sm text-white">历史报告</Link>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
              用
            </div>
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
                      <span>📛 {report.projectName}</span>
                      <span>📍 {report.location}</span>
                      <span>🕐 {report.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/reports/${report.id}`}
                      className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      查看
                    </Link>
                    <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
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