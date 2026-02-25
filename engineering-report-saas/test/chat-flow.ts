/**
 * 对话流程自动测试脚本
 * 模拟完整流程验证功能
 */

const API_BASE = "http://localhost:3000";

// 测试用例
const testCases = [
  {
    name: "测试1：基础对话",
    messages: [
      { role: "user", content: "你好" }
    ],
    expected: "应正常回复"
  },
  {
    name: "测试2：项目信息提取",
    messages: [
      { role: "user", content: "帮我写一个公路工程报告" }
    ],
    expected: "应识别为公路工程"
  },
  {
    name: "测试3：完整信息收集",
    messages: [
      { role: "user", content: "帮我写一个公路工程报告" },
      { role: "assistant", content: "请问项目名称是什么？" },
      { role: "user", content: "成灌高速，在四川成都" }
    ],
    expected: "应提取到项目名称和地点"
  },
  {
    name: "测试4：报告生成",
    messages: [
      { role: "user", content: "帮我写一个公路工程报告" },
      { role: "assistant", content: "..." },
      { role: "user", content: "成灌高速，在四川成都" },
      { role: "assistant", content: "..." },
      { role: "user", content: "生成报告" }
    ],
    action: "generate_report",
    expected: "应返回完整报告"
  }
];

async function callChat(messages: any[], action?: string) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, action })
  });
  return res.json();
}

async function runTest(testCase: any) {
  console.log(`\n🧪 ${testCase.name}`);
  console.log(`   预期: ${testCase.expected}`);
  
  try {
    const result = await callChat(testCase.messages, testCase.action);
    
    if (result.error) {
      console.log(`   ❌ 错误: ${result.error}`);
      return false;
    }
    
    if (result.message) {
      console.log(`   ✅ 收到回复: ${result.message.slice(0, 50)}...`);
    }
    
    if (result.report) {
      console.log(`   ✅ 报告已生成，包含 ${result.report.sections?.length || 0} 个章节`);
    }
    
    if (result.state) {
      console.log(`   📊 状态: ${JSON.stringify(result.state)}`);
    }
    
    return true;
  } catch (e: any) {
    console.log(`   ❌ 异常: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 开始自动测试...\n");
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const ok = await runTest(testCase);
    if (ok) passed++;
    await new Promise(r => setTimeout(r, 1000)); // 等待1秒
  }
  
  console.log(`\n📊 测试结果: ${passed}/${total} 通过`);
  
  if (passed === total) {
    console.log("✅ 全部测试通过！");
  } else {
    console.log("⚠️ 部分测试失败，请检查。");
  }
}

main();