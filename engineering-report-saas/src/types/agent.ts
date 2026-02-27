/**
 * Agent系统类型定义
 */

// Agent类型
export type AgentType = 
  | 'intentAnalyzer'   // 意图分析Agent
  | 'taskDispatcher'   // 任务分发Agent
  | 'infoExtractor'    // 信息提取Agent
  | 'contentGenerator' // 内容生成Agent
  | 'integrator'       // 结果整合Agent
  | 'evaluator'        // 检查评估Agent
  | 'planGenerator'    // 计划生成Agent
  | 'qualityChecker'   // 质量检查Agent;

// 任务类型
export type TaskType = 
  | 'extract_info'      // 提取项目信息
  | 'select_template'   // 选择大纲模板
  | 'generate_section'  // 生成章节内容
  | 'generate_full_report' // 生成完整报告
  | 'validate_result'   // 验证结果质量
  | 'plan_generation'   // 生成执行计划
  | 'optimize_content'  // 内容优化
  | 'format_report';    // 格式化报告

// 任务状态
export type TaskStatus = 
  | 'pending'    // 等待执行
  | 'running'    // 执行中
  | 'completed'  // 已完成
  | 'failed'     // 失败
  | 'cancelled'; // 已取消

// 任务接口
export interface Task {
  id: string;
  type: TaskType;
  description: string;
  input: any;
  output?: any;
  status: TaskStatus;
  agentType: AgentType;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
}

// 用户意图
export interface UserIntent {
  id: string;
  coreGoal: string;           // 核心目标
  projectType?: string;       // 项目类型
  projectName?: string;       // 项目名称
  projectLocation?: string;   // 项目地点
  extraRequirements?: string; // 额外需求
  tasks: Task[];              // 分解的任务
  confidence: number;         // 意图识别置信度 (0-1)
  createdAt: Date;
  updatedAt: Date;
}

// Agent接口
export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  version: string;
  
  // Agent生命周期
  initialize(): Promise<void>;
  process(input: any): Promise<any>;
  cleanup(): Promise<void>;
  
  // 状态
  isReady: boolean;
  lastUsed: Date;
  usageCount: number;
  successRate: number;
  
  // 配置
  config: AgentConfig;
}

// Agent配置
export interface AgentConfig {
  maxRetries: number;
  timeout: number; // 毫秒
  temperature?: number;
  maxTokens?: number;
  model?: string;
  provider?: string;
  systemPrompt?: string;
}

// Agent执行结果
export interface AgentResult {
  success: boolean;
  data: any;
  error?: string;
  metadata: {
    executionTime: number;
    tokenUsage?: {
      input: number;
      output: number;
      total: number;
    };
    model: string;
    provider: string;
    cost?: number;
  };
}

// Agent错误
export interface AgentError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
}

// 任务分发策略
export interface TaskDispatchStrategy {
  name: string;
  description: string;
  rules: DispatchRule[];
}

export interface DispatchRule {
  condition: (task: Task, context: any) => boolean;
  action: (task: Task, context: any) => AgentType;
  priority: number;
}

// Agent注册表
export interface AgentRegistry {
  [agentType: string]: Agent;
}

// 工作流定义
export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  defaultAgentMapping: Record<TaskType, AgentType>;
  errorHandling: ErrorHandlingStrategy;
}

export interface WorkflowStep {
  id: string;
  taskType: TaskType;
  agentType?: AgentType; // 可省略，使用默认映射
  dependsOn?: string[]; // 依赖的步骤ID
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffFactor: number;
  backoffDelay: number; // 基础延迟毫秒
}

export interface ErrorHandlingStrategy {
  onError: 'continue' | 'stop' | 'retry' | 'escalate';
  escalationLevels: number;
  fallbackAgent?: AgentType;
}

// 性能监控
export interface AgentPerformanceMetrics {
  agentType: AgentType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageExecutionTime: number;
  successRate: number;
  tokenUsage: {
    total: number;
    averagePerRequest: number;
  };
  lastUpdated: Date;
}