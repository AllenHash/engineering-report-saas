// 这是一个简单的HTML页面，通过Next.js服务来避免跨域问题
import { NextResponse } from 'next/server';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎯 Agent Hub - OpenClaw</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #e4e4e7; min-height: 100vh; margin: 0; }
    .glass { background: rgba(30,30,50,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
    .card { background: linear-gradient(145deg, #1e1e32, #252540); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s; }
    .card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
    .status-dot { animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
    .input { background: rgba(15,15,26,0.8); border: 1px solid rgba(255,255,255,0.1); color: #e4e4e7; }
    .input:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); transition: all 0.2s; }
    .btn-primary:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
    .message-user { background: linear-gradient(135deg, #4f46e5, #6366f1); }
    .message-agent { background: linear-gradient(145deg, #2a2a40, #323248); border: 1px solid rgba(255,255,255,0.1); }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
  </style>
</head>
<body class="h-screen flex flex-col overflow-hidden">
  
  <header class="glass px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">🎯</div>
      <div>
        <h1 class="text-lg font-semibold text-white">Agent Hub</h1>
        <p class="text-xs text-zinc-400">通过 http://localhost:3000/agent-hub 访问</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
        <span id="connection-status" class="w-2 h-2 rounded-full bg-green-500"></span>
        <span class="text-xs text-green-400" id="connection-text">正在连接...</span>
      </div>
    </div>
  </header>

  <div class="flex-1 flex overflow-hidden p-4 gap-4">
    
    <aside class="w-72 flex flex-col gap-4">
      <div class="glass rounded-2xl p-4">
        <h2 class="text-sm font-medium text-zinc-400 mb-3">🤖 我的Agent团队</h2>
        <div class="space-y-2" id="agent-list"></div>
      </div>
      
      <div class="glass rounded-2xl p-4">
        <h2 class="text-sm font-medium text-zinc-400 mb-3">📊 Token消耗</h2>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-zinc-400">今日</span>
              <span class="text-white font-medium" id="today-cost">¥12.34</span>
            </div>
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div id="cost-bar" class="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style="width: 25%"></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-zinc-500">
            <span>预算 ¥50/天</span>
            <span id="budget-left">剩余 ¥37.66</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="font-medium text-white">📋 任务队列 <span id="task-count" class="text-zinc-500">(3)</span></h2>
        <button onclick="openNewTaskModal()" class="btn-primary px-3 py-1.5 rounded-lg text-sm text-white">+ 新建任务</button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-3 gap-4 h-full">
          <div class="rounded-xl bg-white/5 p-3">
            <div class="flex items-center gap-2 mb-3 text-xs font-medium text-yellow-400"><span class="w-2 h-2 rounded-full bg-yellow-500"></span>待处理</div>
            <div class="space-y-2" id="pending-tasks"></div>
          </div>
          <div class="rounded-xl bg-white/5 p-3">
            <div class="flex items-center gap-2 mb-3 text-xs font-medium text-green-400"><span class="w-2 h-2 rounded-full bg-green-500 status-dot"></span>进行中</div>
            <div class="space-y-2" id="working-tasks"></div>
          </div>
          <div class="rounded-xl bg-white/5 p-3">
            <div class="flex items-center gap-2 mb-3 text-xs font-medium text-zinc-400"><span class="w-2 h-2 rounded-full bg-zinc-500"></span>已完成</div>
            <div class="space-y-2" id="completed-tasks"></div>
          </div>
        </div>
      </div>
    </main>

    <aside class="w-96 flex flex-col gap-4">
      <div class="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2"><span class="text-lg">🐱</span><h2 class="font-medium text-white">与阿飞对话</h2></div>
          <button onclick="refreshChat()" class="text-xs text-zinc-400 hover:text-white">🔄</button>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3" id="chat-history"></div>
        <div class="p-3 border-t border-white/10">
          <div class="flex gap-2">
            <input type="text" id="input-msg" onkeydown="if(event.key==='Enter')sendMsg()" placeholder="向阿飞发送消息..." class="input flex-1 rounded-xl px-4 py-2 text-sm">
            <button onclick="sendMsg()" class="btn-primary px-4 py-2 rounded-xl text-sm text-white">发送</button>
          </div>
        </div>
      </div>

      <div class="glass rounded-2xl p-4">
        <h2 class="text-sm font-medium text-zinc-400 mb-3">⚙️ Agent配置</h2>
        <select id="config-agent" class="input w-full rounded-xl px-3 py-2 text-sm mb-3">
          <option value="">选择Agent</option>
          <option value="coding">💻 Coding</option>
          <option value="market">📊 市场</option>
          <option value="research">🔍 研究</option>
          <option value="finance">💰 财务</option>
        </select>
        <div class="flex gap-2">
          <button onclick="editSoul()" class="flex-1 bg-white/10 hover:bg-white/20 rounded-lg py-2 text-sm">配置SOUL</button>
          <button onclick="editMemory()" class="flex-1 bg-white/10 hover:bg-white/20 rounded-lg py-2 text-sm">配置MEMORY</button>
        </div>
      </div>
    </aside>
  </div>

  <div id="edit-modal" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50">
    <div class="glass rounded-2xl w-[600px] max-h-[80vh] flex flex-col">
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 class="font-medium text-white" id="modal-title">编辑</h3>
        <button onclick="closeModal()" class="text-zinc-400 hover:text-white">✕</button>
      </div>
      <div class="flex-1 overflow-y-auto p-5">
        <textarea id="edit-content" class="input w-full h-64 rounded-xl p-4 text-sm font-mono"></textarea>
      </div>
      <div class="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
        <button onclick="closeModal()" class="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white">取消</button>
        <button onclick="saveConfig()" class="btn-primary px-4 py-2 rounded-lg text-sm text-white">保存配置</button>
      </div>
    </div>
  </div>

<script>
const agents = [
  { id: "coding", name: "Coding", icon: "💻", status: "working", model: "DeepSeek", task: "开发登录页面", color: "blue" },
  { id: "market", name: "市场", icon: "📊", status: "idle", model: "MiniMax", color: "green" },
  { id: "research", name: "研究", icon: "🔍", status: "idle", model: "GLM", color: "purple" },
  { id: "finance", name: "财务", icon: "💰", status: "idle", model: "DeepSeek", color: "amber" },
];

let tasks = [
  { id: 1, title: "开发登录页面", agent: "coding", status: "working" },
  { id: 2, title: "写推广方案", agent: "market", status: "pending" },
  { id: 3, title: "分析竞品", agent: "research", status: "pending" },
];

let chatHistory = [
  { role: "user", content: "阿飞，帮我开发登录功能", time: "11:00" },
  { role: "assistant", content: "好的！我安排Coding Agent来实现。", time: "11:00" },
];

function render() {
  renderAgents();
  renderTasks();
  renderChat();
}

function renderAgents() {
  document.getElementById('agent-list').innerHTML = agents.map(a => 
    '<div class="card rounded-xl p-3 cursor-pointer" onclick="selectAgent(\\''+a.id+'\\')">' +
      '<div class="flex items-center justify-between">' +
        '<div class="flex items-center gap-2"><span class="text-lg">'+a.icon+'</span><span class="font-medium text-white">'+a.name+'</span></div>' +
        '<span class="text-xs '+(a.status === 'working' ? 'text-green-400' : 'text-zinc-400')+'">'+(a.status === 'working' ? '工作中' : '空闲')+'</span>' +
      '</div>' +
      '<div class="mt-2 text-xs text-zinc-500">模型: '+a.model+'</div>' +
      (a.task ? '<div class="mt-2 text-xs text-zinc-400">📋 '+a.task+'</div>' : '') +
    '</div>'
  ).join('');
}

function renderTasks() {
  ['pending','working','completed'].forEach(s => {
    const filtered = tasks.filter(t=>t.status===s);
    document.getElementById(s+'-tasks').innerHTML = filtered.map(t => {
      const agent = agents.find(a=>a.id===t.agent);
      return '<div class="rounded-lg '+(s==='working'?'border border-green-500/30 bg-green-500/10':s==='completed'?'border border-zinc-700 bg-zinc-800/30 opacity-60':'border border-zinc-700 bg-zinc-800/50')+' p-3">' +
        '<div class="flex items-center gap-2 text-sm text-zinc-200"><span>'+(agent?.icon || '🤖')+'</span><span class="truncate">'+t.title+'</span></div>' +
        (s==='working'?'<div class="mt-2 text-xs text-green-400">⚡ 工作中...</div>':'') +
        (s==='completed'?'<div class="mt-1 text-xs text-zinc-500">✓ 完成</div>':'') +
      '</div>';
    }).join('') || '<div class="text-xs text-zinc-600 text-center py-4">无</div>';
  });
  document.getElementById('task-count').textContent = '('+tasks.length+')';
}

function renderChat() {
  const container = document.getElementById('chat-history');
  container.innerHTML = chatHistory.map(m => 
    '<div class="flex '+(m.role==='user'?'justify-end':'justify-start')+'">' +
      '<div class="max-w-[90%] rounded-2xl px-4 py-3 '+(m.role==='user'?'message-user text-white':'message-agent text-zinc-200')+'">' +
        '<div class="flex items-center gap-1.5 mb-1 text-xs opacity-70">' +
          '<span>'+(m.role==='user'?'👤':'🐱')+'</span>' +
          '<span>'+(m.role==='user'?'你':'阿飞')+'</span>' +
        '</div>' +
        '<div class="text-sm whitespace-pre-wrap">'+m.content+'</div>' +
        '<div class="text-xs opacity-50 mt-1">'+m.time+'</div>' +
      '</div>' +
    '</div>'
  ).join('');
  container.scrollTop = container.scrollHeight;
}

function selectAgent(id) {
  document.getElementById('config-agent').value = id;
}

let currentConfigType = '';

function editSoul() {
  const agent = document.getElementById('config-agent').value;
  if (!agent) return alert('请先选择Agent');
  currentConfigType = 'soul';
  const agentName = agents.find(a=>a.id===agent).name;
  document.getElementById('modal-title').textContent = '编辑 SOUL - ' + agentName;
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('edit-modal').classList.add('flex');
}

function editMemory() {
  const agent = document.getElementById('config-agent').value;
  if (!agent) return alert('请先选择Agent');
  currentConfigType = 'memory';
  const agentName = agents.find(a=>a.id===agent).name;
  document.getElementById('modal-title').textContent = '编辑 MEMORY - ' + agentName;
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('edit-modal').classList.add('flex');
}

function saveConfig() {
  const agent = document.getElementById('config-agent').value;
  const content = document.getElementById('edit-content').value;
  if (!agent || !content) return;
  alert('已保存配置 (演示模式)');
  closeModal();
}

function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  document.getElementById('edit-modal').classList.remove('flex');
}

function refreshChat() {
  chatHistory = [];
  renderChat();
}

async function sendMsg() {
  const input = document.getElementById('input-msg');
  const content = input.value.trim();
  if (!content) return;

  const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
  chatHistory.push({ role: 'user', content, time });
  
  // 添加loading
  chatHistory.push({ role: 'assistant', content: '...', time, loading: true });
  renderChat();
  input.value = '';

  try {
    // 使用相对路径，同源无CORS问题
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{role: 'user', content: content}]
      })
    });
    
    const data = await response.json();
    
    // 替换loading消息
    const loadingIndex = chatHistory.findIndex(m => m.loading);
    if (loadingIndex > -1) chatHistory.splice(loadingIndex, 1);
    
    const responseTime = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
    chatHistory.push({ role: 'assistant', content: data.message || '收到回复', time: responseTime });
    
  } catch (e) {
    console.error('API错误:', e);
    const loadingIndex = chatHistory.findIndex(m => m.loading);
    if (loadingIndex > -1) chatHistory.splice(loadingIndex, 1);
    
    const responseTime = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
    chatHistory.push({ role: 'assistant', content: '连接失败: ' + e.message, time: responseTime });
  }
  
  renderChat();
}

function openNewTaskModal() {
  const title = prompt('任务名称:');
  if (!title) return;
  const agent = prompt('分配给 (coding/market/research/finance):');
  if (!agent) return;
  
  tasks.push({ id: Date.now(), title, agent, status: 'pending' });
  renderTasks();
}

document.addEventListener('DOMContentLoaded', () => {
  // 检查连接
  const statusEl = document.getElementById('connection-status');
  const textEl = document.getElementById('connection-text');
  
  fetch('/api/afei')
    .then(r => {
      if (r.ok) {
        statusEl.className = 'w-2 h-2 rounded-full bg-green-500';
        textEl.textContent = '已连接 阿飞';
      } else {
        throw new Error('API error');
      }
    })
    .catch(e => {
      statusEl.className = 'w-2 h-2 rounded-full bg-yellow-500';
      textEl.textContent = '本地模式';
    });
  
  render();
});
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}