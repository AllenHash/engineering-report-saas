# 数据模型设计文档

**版本**：1.0  
**日期**：2026-02-25  
**状态**：已完成

---

## 1. 核心数据表

### 1.1 users（用户表）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 用户ID | ✅ |
| phone | VARCHAR(20) | 手机号 | ✅ |
| wechat_openid | VARCHAR(64) | 微信OpenID | - |
| wechat_unionid | VARCHAR(64) | 微信UnionID | - |
| name | VARCHAR(50) | 昵称 | - |
| balance | INT | 积分余额（默认0） | ✅ |
| created_at | TIMESTAMP | 注册时间 | ✅ |
| updated_at | TIMESTAMP | 更新时间 | ✅ |

### 1.2 conversations（对话表）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 对话ID | ✅ |
| user_id | UUID | 所属用户ID | ✅ |
| title | VARCHAR(200) | 对话标题 | ✅ |
| engine_type | VARCHAR(20) | 工程类型（highway/municipal/ecology） | ✅ |
| status | VARCHAR(20) | 状态（active/completed） | ✅ |
| created_at | TIMESTAMP | 创建时间 | ✅ |
| updated_at | TIMESTAMP | 更新时间 | ✅ |

### 1.3 messages（消息表）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 消息ID | ✅ |
| conversation_id | UUID | 所属对话ID | ✅ |
| role | VARCHAR(20) | 角色（user/assistant/system） | ✅ |
| content | TEXT | 消息内容 | ✅ |
| metadata | JSONB | 附加信息（如提取的关键词） | - |
| created_at | TIMESTAMP | 时间 | ✅ |

### 1.4 reports（报告表）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 报告ID | ✅ |
| user_id | UUID | 所属用户ID | ✅ |
| conversation_id | UUID | 关联对话ID | ✅ |
| title | VARCHAR(200) | 报告标题 | ✅ |
| content | TEXT | 报告内容（Markdown） | ✅ |
| pdf_url | VARCHAR(500) | PDF文件链接 | - |
| status | VARCHAR(20) | 状态（draft/completed） | ✅ |
| created_at | TIMESTAMP | 生成时间 | ✅ |
| updated_at | TIMESTAMP | 更新时间 | ✅ |

### 1.5 credits（积分记录表）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 记录ID | ✅ |
| user_id | UUID | 用户ID | ✅ |
| amount | INT | 数量（正数充值/负数消耗） | ✅ |
| type | VARCHAR(20) | 类型（purchase/consume/refund/gift） | ✅ |
| related_id | UUID | 关联ID（如订单ID/报告ID） | - |
| expire_at | TIMESTAMP | 过期时间（默认1年后） | ✅ |
| created_at | TIMESTAMP | 时间 | ✅ |

### 1.6 orders（订单表）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 订单ID | ✅ |
| user_id | UUID | 用户ID | ✅ |
| amount | DECIMAL(10,2) | 金额（元） | ✅ |
| credits | INT | 购买积分数量 | ✅ |
| status | VARCHAR(20) | 状态（pending/paid/refunded） | ✅ |
| payment_method | VARCHAR(20) | 支付方式（wechat/alipay） | ✅ |
| paid_at | TIMESTAMP | 支付时间 | - |
| created_at | TIMESTAMP | 创建时间 | ✅ |

---

## 2. 索引设计

```sql
-- 用户表
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_wechat ON users(wechat_openid);

-- 对话表
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);

-- 消息表
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- 报告表
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_conversation ON reports(conversation_id);

-- 积分记录表
CREATE INDEX idx_credits_user ON credits(user_id);
CREATE INDEX idx_credits_expire ON credits(expire_at);

-- 订单表
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## 3. ER 关系图

```
┌─────────┐       ┌──────────────┐       ┌──────────┐
│  users  │◄──────│ conversations│◄──────│ messages │
└─────────┘       └──────────────┘       └──────────┘
      │                   │
      │                   │
      │                   ▼
      │            ┌──────────┐
      │            │ reports  │
      │            └──────────┘
      │
      │
      ▼
┌─────────┐       ┌──────────┐
│ credits │       │ orders   │
└─────────┘       └──────────┘
```

---

## 4. 其他说明

### 4.1 登录流程
- 手机号验证码登录
- 微信扫码登录（通过微信OpenID关联）

### 4.2 积分规则
- 积分有效期：1年
- 退费：原路退回，扣除已消耗积分

### 4.3 历史报告
- 用户可以查看所有历史报告
- MVP版本不支持版本管理

---

*本文档将根据开发实际情况持续更新*