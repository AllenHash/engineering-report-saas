"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Coins,
  CreditCard,
  History,
  LogOut,
  Settings,
  ChevronRight,
  Edit3,
  Save,
  X,
  Loader2,
  FileText,
  Home,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, loading, refresh } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: ""
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        setIsEditing(false);
      } else {
        alert(data.error || "更新失败");
      }
    } catch (error) {
      alert("更新失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || "",
      phone: user?.phone || ""
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading || !user) {
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
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">个人中心</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>管理您的账户信息</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-white/10 border"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <Home className="w-4 h-4" />
              返回首页
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 用户信息卡片 */}
        <section
          className={`rounded-2xl border p-6 mb-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            borderColor: 'var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              {/* 头像 */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #1d4ed8 100%)' }}
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{user.name}</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                {user.phone && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    <Phone className="w-3 h-3 inline mr-1" />
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-white/10 border"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
              >
                <Edit3 className="w-4 h-4" />
                编辑资料
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 border border-emerald-500/30"
                  style={{ background: 'linear-gradient(135deg, var(--accent-success) 0%, #059669 100%)' }}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-white/10 border"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>
            )}
          </div>

          {/* 编辑表单 */}
          {isEditing && (
            <div
              className="grid gap-4 p-4 rounded-xl animate-fade-in"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            >
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-4 h-4 inline mr-1" />
                  用户名
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="w-4 h-4 inline mr-1" />
                  手机号
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="请输入手机号"
                />
              </div>
            </div>
          )}

          {/* 非编辑状态下的信息展示 */}
          {!isEditing && (
            <div className="grid grid-cols-3 gap-4">
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>邮箱</span>
                </div>
                <p className="text-sm text-white truncate">{user.email}</p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>手机号</span>
                </div>
                <p className="text-sm text-white">{user.phone || "未绑定"}</p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>用户ID</span>
                </div>
                <p className="text-sm text-white truncate">{user.id}</p>
              </div>
            </div>
          )}
        </section>

        {/* 积分卡片 */}
        <section
          className={`rounded-2xl border p-6 mb-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            borderColor: 'var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
              >
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">我的积分</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>用于生成工程报告</p>
              </div>
            </div>
            <a
              href="/profile/recharge"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] border border-amber-500/30"
              style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
            >
              <CreditCard className="w-4 h-4" />
              充值积分
            </a>
          </div>

          <div
            className="relative overflow-hidden rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Coins className="w-full h-full text-amber-500" />
            </div>
            <div className="relative">
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>当前余额</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{user.points?.toLocaleString() || 0}</span>
                <span className="text-lg" style={{ color: 'var(--accent-primary)' }}>积分</span>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                每次生成报告消耗 100 积分
              </p>
            </div>
          </div>
        </section>

        {/* 功能菜单 */}
        <section
          className={`rounded-2xl border overflow-hidden transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            borderColor: 'var(--border-color)',
            background: 'var(--bg-secondary)'
          }}
        >
          <a
            href="/profile/history"
            className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-white/5 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59, 130, 246, 0.15)' }}
              >
                <History className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">积分历史</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>查看积分充值和消费记录</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </a>

          <a
            href="/"
            className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-white/5 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34, 197, 94, 0.15)' }}
              >
                <FileText className="w-5 h-5" style={{ color: 'var(--accent-success)' }} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">我的报告</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>查看和管理已生成的报告</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </a>

          <a
            href="/templates"
            className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-white/5"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168, 85, 247, 0.15)' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">报告模板</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>查看支持的工程报告模板</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </a>
        </section>

        {/* 账号管理 */}
        <section
          className={`rounded-2xl border overflow-hidden mt-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{
            borderColor: 'var(--border-color)',
            background: 'var(--bg-secondary)'
          }}
        >
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-between p-5 transition-all duration-200 hover:bg-red-500/10"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239, 68, 68, 0.15)' }}
              >
                <LogOut className="w-5 h-5" style={{ color: 'var(--accent-danger)' }} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium" style={{ color: 'var(--accent-danger)' }}>退出登录</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>安全退出当前账户</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </section>

        {/* 退出登录确认弹窗 */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.7)' }}
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div
              className="relative rounded-2xl p-6 w-full max-w-sm animate-fade-in-scale"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(239, 68, 68, 0.15)' }}
                >
                  <LogOut className="w-8 h-8" style={{ color: 'var(--accent-danger)' }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">确认退出</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  确定要退出当前账户吗？
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10 border"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:bg-red-600 border border-red-500/30"
                    style={{ background: 'var(--accent-danger)' }}
                  >
                    确认退出
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 版本信息 */}
        <div className="text-center mt-8 pb-8">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            工程可行性报告AI生成系统 v1.0.0
          </p>
        </div>
      </main>
    </div>
  );
}