/**
 * AI模型相关类型定义
 */

// 模型提供商
export enum ModelProvider {
  SILICONFLOW = 'siliconflow',
  ALIBABA = 'alibaba',
  ZHIPU = 'zhipu',
  MINIMAX = 'minimax',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  LOCAL = 'local' // 本地部署模型
}

// 模型类型
export enum ModelType {
  CHAT = 'chat',             // 对话模型
  CODE = 'code',             // 代码模型
  REASONING = 'reasoning',   // 推理模型
  EMBEDDING = 'embedding',   // 嵌入模型
  VISION = 'vision',         // 视觉模型
  AUDIO = 'audio',           // 音频模型
  MULTIMODAL = 'multimodal'  // 多模态模型
}

// 模型能力
export interface ModelCapabilities {
  chat: boolean;             // 对话能力
  codeGeneration: boolean;   // 代码生成
  reasoning: boolean;        // 复杂推理
  vision: boolean;           // 视觉理解
  functionCalling: boolean;  // 函数调用
  streaming: boolean;        // 流式输出
  jsonMode: boolean;         // JSON模式
  toolUse: boolean;          // 工具使用
  longContext: boolean;      // 长上下文支持
}

// 模型配置
export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  type: ModelType;
  capabilities: ModelCapabilities;
  
  // 技术参数
  contextWindow: number;     // 上下文长度（Token）
  maxOutputTokens: number;   // 最大输出Token数
  trainingDataCutoff: string; // 训练数据截止日期
  
  // 性能参数
  speed: 'slow' | 'medium' | 'fast';
  quality: 'low' | 'medium' | 'high' | 'very_high';
  
  // 成本参数（每百万Token）
  cost: {
    input: number;          // 输入成本
    output: number;         // 输出成本
    cacheRead?: number;     // 缓存读取成本
    cacheWrite?: number;    // 缓存写入成本
  };
  
  // 区域和可用性
  regions: string[];        // 可用区域
  rateLimit: {
    rpm: number;            // 每分钟请求数
    tpm: number;            // 每分钟Token数
  };
  
  // 元数据
  version: string;
  releasedAt: Date;
  deprecated: boolean;
  successor?: string;       // 后续版本ID
  
  // 集成信息
  apiEndpoint?: string;     // API端点
  authMethod: 'api_key' | 'oauth' | 'bearer' | 'custom';
  headers?: Record<string, string>; // 自定义请求头
  
  // 模型特定配置
  parameters?: {
    temperature?: {
      min: number;
      max: number;
      default: number;
    };
    topP?: {
      min: number;
      max: number;
      default: number;
    };
    frequencyPenalty?: {
      min: number;
      max: number;
      default: number;
    };
    presencePenalty?: {
      min: number;
      max: number;
      default: number;
    };
  };
}

// API调用配置
export interface ApiCallConfig {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
  
  // 特定提供商参数
  providerParams?: Record<string, any>;
  
  // 重试配置
  retry?: {
    maxAttempts: number;
    backoffMultiplier: number;
    baseDelay: number;
  };
  
  // 超时配置
  timeout?: number;
  
  // 回退配置
  fallbackModels?: string[]; // 降级模型列表
}

// 模型调用请求
export interface ModelRequest {
  messages: ChatMessage[];
  config: ApiCallConfig;
  
  // 上下文信息
  context?: {
    taskType?: string;
    agentType?: string;
    projectInfo?: any;
    templateInfo?: any;
    history?: any[];
  };
  
  // 元数据
  metadata?: {
    requestId: string;
    userId?: string;
    sessionId?: string;
    timestamp: Date;
    purpose: 'chat' | 'report_generation' | 'code_generation' | 'analysis';
  };
}

// 聊天消息
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | any[]; // 字符串或内容块数组（多模态）
  name?: string;          // 可选的消息发送者名称
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: any[];
  tool_call_id?: string;
}

// 模型响应
export interface ModelResponse {
  id: string;
  model: string;
  choices: ResponseChoice[];
  usage?: TokenUsage;
  created: number;
  
  // 提供商特定字段
  providerSpecific?: any;
  
  // 元数据
  metadata: {
    requestId: string;
    processingTime: number;
    modelVersion?: string;
    finishReason?: string;
  };
}

export interface ResponseChoice {
  index: number;
  message: ChatMessage;
  finishReason?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

// 流式响应块
export interface ResponseChunk {
  id: string;
  model: string;
  choices: ChunkChoice[];
  created: number;
}

export interface ChunkChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
    function_call?: any;
    tool_calls?: any[];
  };
  finishReason?: string | null;
}

// 模型路由策略
export interface ModelRoutingStrategy {
  id: string;
  name: string;
  description: string;
  
  // 路由规则
  rules: RoutingRule[];
  
  // 默认行为
  defaultModel: string;
  fallbackModels: string[];
  
  // 性能要求
  requirements?: {
    maxLatency?: number;    // 最大延迟（毫秒）
    minQuality?: number;    // 最小质量要求（0-1）
    maxCost?: number;       // 最高成本（每请求）
  };
}

export interface RoutingRule {
  condition: (request: ModelRequest, context: any) => boolean;
  action: (request: ModelRequest, context: any) => string; // 返回模型ID
  priority: number;
  description: string;
}

// 模型性能指标
export interface ModelPerformanceMetrics {
  modelId: string;
  provider: ModelProvider;
  
  // 调用统计
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  
  // 性能统计
  averageLatency: number;        // 平均延迟（毫秒）
  p95Latency: number;           // P95延迟（毫秒）
  p99Latency: number;           // P99延迟（毫秒）
  
  // Token统计
  averagePromptTokens: number;
  averageCompletionTokens: number;
  totalTokens: number;
  
  // 成本统计
  totalCost: number;
  averageCostPerRequest: number;
  averageCostPerToken: number;
  
  // 质量指标（如有）
  qualityScores?: {
    relevance: number;          // 相关性（0-1）
    accuracy: number;          // 准确度（0-1）
    helpfulness: number;       // 帮助性（0-1）
    avgUserRating: number;     // 平均用户评分（1-5）
  };
  
  // 时间范围
  periodStart: Date;
  periodEnd: Date;
  updatedAt: Date;
}

// 错误类型
export interface ModelError {
  code: string;
  message: string;
  provider: ModelProvider;
  modelId?: string;
  
  // 错误分类
  category: 
    | 'authentication'   // 认证错误
    | 'rate_limit'       // 速率限制
    | 'model_unavailable' // 模型不可用
    | 'invalid_request'   // 请求无效
    | 'server_error'      // 服务器错误
    | 'timeout'           // 超时
    | 'network'           // 网络错误
    | 'unknown';          // 未知错误
  
  // 错误详情
  details?: any;
  retryable: boolean;
  suggestedAction?: string;
  
  // 时间戳
  timestamp: Date;
}

// 支持的模型列表（示例）
export interface SupportedModels {
  [provider: string]: ModelConfig[];
}