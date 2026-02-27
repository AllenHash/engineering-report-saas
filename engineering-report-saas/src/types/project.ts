/**
 * 项目管理类型定义
 */

// 项目类型枚举
export enum ProjectType {
  HIGHWAY = 'highway',           // 公路工程
  MUNICIPAL = 'municipal',       // 市政工程
  HYDRAULIC = 'hydraulic',       // 水利工程
  POWER = 'power',               // 电力工程
  ENVIRONMENT = 'environment',   // 环境工程
  ECOLOGY = 'ecology',           // 生态环境工程
  CONSTRUCTION = 'construction', // 建筑工程
  TRANSPORT = 'transport',       // 交通工程
  OTHER = 'other'                // 其他工程
}

// 项目阶段
export enum ProjectPhase {
  PRE_FEASIBILITY = 'pre_feasibility',     // 预可行性研究
  FEASIBILITY = 'feasibility',             // 可行性研究
  PRELIMINARY_DESIGN = 'preliminary_design', // 初步设计
  DETAILED_DESIGN = 'detailed_design',     // 详细设计
  CONSTRUCTION = 'construction',           // 施工阶段
  OPERATION = 'operation',                 // 运营阶段
}

// 项目规模
export interface ProjectScale {
  area?: number;      // 面积（公顷）
  length?: number;    // 长度（公里）
  capacity?: number;  // 容量（MW/吨/人等）
  investment: number; // 投资估算（万元）
  constructionPeriod: string; // 建设工期
}

// 项目信息
export interface ProjectInfo {
  id: string;
  name: string;                   // 项目名称
  location: string;               // 建设地点
  type: ProjectType;              // 项目类型
  phase: ProjectPhase;            // 项目阶段
  scale: ProjectScale;            // 项目规模
  owner?: string;                 // 建设单位
  designer?: string;              // 设计单位
  approvalAuthority?: string;     // 审批机关
  
  // 联系人信息
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  
  // 技术参数
  technicalParameters?: Record<string, any>;
  
  // 时间信息
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // 状态
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  
  // 元数据
  metadata?: {
    source?: string;              // 信息来源
    confidence?: number;          // 信息可信度
    lastVerified?: Date;          // 最后验证时间
    notes?: string;               // 备注
  };
}

// 报告模板
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;      // 适用的项目类型
  phase: ProjectPhase;           // 适用的项目阶段
  version: string;
  sections: ReportSection[];
  
  // 模板元数据
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  rating?: number;               // 用户评分
  usageCount: number;            // 使用次数
  
  // 积分相关
  pointsRequired: number;        // 使用所需积分
  pointsEarned: number;          // 上传者获得积分
  isPremium: boolean;            // 是否高级模板
  isPublic: boolean;             // 是否公开模板
  
  // 验证状态
  validated: boolean;            // 是否经过验证
  validator?: string;            // 验证者
  validatedAt?: Date;            // 验证时间
}

// 报告章节
export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  content?: string;
  order: number;                 // 章节顺序
  required: boolean;             // 是否必需
  children?: ReportSection[];    // 子章节
  
  // 章节类型
  type: 'text' | 'table' | 'chart' | 'image' | 'calculation';
  
  // 内容指南
  guidelines?: string[];         // 撰写指南
  examples?: string[];           // 示例内容
  keywords?: string[];           // 关键词
  
  // 元数据
  wordCount?: number;            // 建议字数
  timeEstimate?: number;         // 预估撰写时间（分钟）
  difficulty?: 'easy' | 'medium' | 'hard'; // 难度级别
}

// 完整报告
export interface Report {
  id: string;
  projectId: string;
  templateId: string;
  title: string;
  status: 'draft' | 'generating' | 'reviewing' | 'completed' | 'published';
  
  // 内容
  sections: ReportSection[];
  summary?: string;              // 报告摘要
  conclusion?: string;           // 结论与建议
  
  // 质量评估
  qualityScore?: number;         // 质量评分（0-100）
  completeness?: number;         // 完整度（0-100）
  accuracy?: number;             // 准确度（0-100）
  readability?: number;          // 可读性（0-100）
  
  // 生成信息
  generatedBy?: string;          // 生成者（用户/Agent）
  generationTime?: number;       // 生成耗时（毫秒）
  tokensUsed?: number;           // 使用的Token数
  modelUsed?: string;            // 使用的模型
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;            // 生成时间
  reviewedAt?: Date;             // 审核时间
  publishedAt?: Date;            // 发布时间
  
  // 版本控制
  version: string;
  parentVersion?: string;        // 父版本ID
  changelog?: string;            // 变更日志
  
  // 元数据
  metadata?: {
    language?: string;           // 报告语言
    format?: 'markdown' | 'word' | 'pdf'; // 输出格式
    confidentiality?: 'public' | 'internal' | 'confidential'; // 保密级别
    tags?: string[];             // 标签
  };
}

// 积分交易
export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer' | 'reward';
  amount: number;
  balanceAfter: number;
  description: string;
  
  // 关联对象
  referenceType?: 'template' | 'report' | 'subscription' | 'invitation';
  referenceId?: string;
  
  // 时间
  createdAt: Date;
  
  // 元数据
  metadata?: {
    rate?: number;               // 兑换率（如积分:现金）
    source?: string;             // 来源
    notes?: string;              // 备注
  };
}

// 用户项目设置
export interface UserProjectSettings {
  userId: string;
  defaultProjectType?: ProjectType;
  defaultLocation?: string;
  preferredTemplates?: string[]; // 偏好模板ID列表
  autoSaveInterval?: number;     // 自动保存间隔（秒）
  exportFormat?: 'markdown' | 'word' | 'pdf';
  notificationPreferences?: {
    onReportComplete: boolean;
    onPointsEarned: boolean;
    onTemplateUpdate: boolean;
  };
  
  // 质量偏好
  contentQuality: 'standard' | 'high' | 'premium';
  detailLevel: 'brief' | 'standard' | 'detailed';
  technicalDepth: 'basic' | 'intermediate' | 'advanced';
  
  // 历史记录
  recentlyUsedTemplates: string[];
  frequentlyUsedTypes: ProjectType[];
  searchHistory: string[];
  
  updatedAt: Date;
}

// 项目统计
export interface ProjectStatistics {
  projectId: string;
  totalReports: number;
  totalWords: number;
  totalTokens: number;
  averageQualityScore: number;
  completionRate: number;        // 报告完成率
  timeSaved: number;             // 节省时间（小时）
  
  // 用户行为
  userEngagement: {
    averageSessionDuration: number; // 平均会话时长（分钟）
    reportsPerSession: number;      // 每次会话生成报告数
    templateUsage: Record<string, number>; // 模板使用统计
  };
  
  // 财务统计（如适用）
  financial?: {
    totalPointsSpent: number;
    totalPointsEarned: number;
    estimatedValue: number;      // 估算价值（元）
  };
  
  // 时间范围
  periodStart: Date;
  periodEnd: Date;
  updatedAt: Date;
}