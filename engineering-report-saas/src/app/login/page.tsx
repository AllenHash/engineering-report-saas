'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0f172a 50%, #0d1321 100%)',
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* 登录卡片 */}
      <div
        className={`relative w-full max-w-md mx-4 p-8 rounded-2xl border transition-all duration-500 ${
          isLoaded ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderColor: 'rgba(71, 85, 105, 0.5)',
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
            }}
          >
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            登录到工程可行性报告系统
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="p-3 rounded-lg text-sm animate-fade-in"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {error}
            </div>
          )}

          {/* 邮箱输入框 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              邮箱地址
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* 密码输入框 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              密码
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
                placeholder="请输入密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:scale-110"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 border border-amber-500/30"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                登录中...
              </span>
            ) : (
              '登录'
            )}
          </button>

          {/* 分割线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>或</span>
            </div>
          </div>

          {/* 注册链接 */}
          <div className="text-center">
            <span style={{ color: 'var(--text-secondary)' }}>还没有账号？</span>{' '}
            <Link
              href="/register"
              className="font-medium transition-all duration-200 hover:underline hover:scale-105 inline-block"
              style={{ color: '#f59e0b' }}
            >
              立即注册
            </Link>
          </div>
        </form>

        {/* 底部返回首页 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}