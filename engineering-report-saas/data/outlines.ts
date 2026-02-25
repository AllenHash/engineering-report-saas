/**
 * 工程可行性研究报告大纲
 * 基于国家发改委《投资项目可行性研究报告编写大纲（2023年版）》
 * 
 * 使用方式：
 * import { getOutline } from '@/data/outlines';
 * const outline = getOutline('highway'); // 获取公路工程大纲
 */

export interface OutlineSection {
  id: string;
  title: string;
  content?: string;
  subsections?: OutlineSection[];
}

export interface Outline {
  type: string;
  name: string;
  description: string;
  sections: OutlineSection[];
}

// 通用基础大纲（2023年国家发改委标准）
const GENERAL_OUTLINE: Outline = {
  type: "general",
  name: "通用可行性报告大纲",
  description: "基于国家发改委发改投资规〔2023〕304号",
  sections: [
    {
      id: "1",
      title: "第一章 项目概况",
      subsections: [
        { id: "1.1", title: "项目名称" },
        { id: "1.2", title: "项目建设地点" },
        { id: "1.3", title: "项目单位" },
        { id: "1.4", title: "建设规模与内容" },
        { id: "1.5", title: "总投资及资金来源" },
        { id: "1.6", title: "建设工期" }
      ]
    },
    {
      id: "2",
      title: "第二章 项目建设背景及必要性",
      subsections: [
        { id: "2.1", title: "项目建设背景" },
        { id: "2.2", title: "项目建设的必要性" }
      ]
    },
    {
      id: "3",
      title: "第三章 建设条件与场址选择",
      subsections: [
        { id: "3.1", title: "自然条件" },
        { id: "3.2", title: "建设条件" },
        { id: "3.3", title: "场址选择" }
      ]
    },
    {
      id: "4",
      title: "第四章 工程技术方案",
      subsections: [
        { id: "4.1", title: "技术方案" },
        { id: "4.2", title: "工程方案" },
        { id: "4.3", title: "主要设备方案" }
      ]
    },
    {
      id: "5",
      title: "第五章 环境影响评价",
      subsections: [
        { id: "5.1", title: "环境现状" },
        { id: "5.2", title: "环境影响分析" },
        { id: "5.3", title: "环境保护措施" }
      ]
    },
    {
      id: "6",
      title: "第六章 投资估算与资金筹措",
      subsections: [
        { id: "6.1", title: "投资估算" },
        { id: "6.2", title: "资金来源" },
        { id: "6.3", title: "资金使用计划" }
      ]
    },
    {
      id: "7",
      title: "第七章 财务评价",
      subsections: [
        { id: "7.1", title: "财务评价依据" },
        { id: "7.2", title: "销售收入与成本估算" },
        { id: "7.3", title: "财务评价指标" }
      ]
    },
    {
      id: "8",
      title: "第八章 社会评价",
      subsections: [
        { id: "8.1", title: "社会影响分析" },
        { id: "8.2", title: "互适性分析" },
        { id: "8.3", title: "社会风险分析" }
      ]
    },
    {
      id: "9",
      title: "第九章 结论与建议",
      subsections: [
        { id: "9.1", title: "结论" },
        { id: "9.2", title: "建议" }
      ]
    }
  ]
};

// 公路工程专业大纲
const HIGHWAY_OUTLINE: Outline = {
  type: "highway",
  name: "公路工程可行性研究报告大纲",
  description: "适用于高速公路、国省干线、农村公路等",
  sections: [
    {
      id: "1",
      title: "第一章 项目概况",
      subsections: [
        { id: "1.1", title: "项目名称" },
        { id: "1.2", title: "路线走向及建设地点" },
        { id: "1.3", title: "项目单位" },
        { id: "1.4", title: "建设规模（路线长度、技术等级）" },
        { id: "1.5", title: "总投资及资金来源" },
        { id: "1.6", title: "建设工期" }
      ]
    },
    {
      id: "2",
      title: "第二章 项目建设背景及必要性",
      subsections: [
        { id: "2.1", title: "区域经济社会发展概况" },
        { id: "2.2", title: "公路网现状及规划" },
        { id: "2.3", title: "项目建设的必要性" }
      ]
    },
    {
      id: "3",
      title: "第三章 交通量预测",
      subsections: [
        { id: "3.1", title: "交通调查现状" },
        { id: "3.2", title: "交通量预测方法" },
        { id: "3.3", title: "预测结果" }
      ]
    },
    {
      id: "4",
      title: "第四章 建设条件与路线方案",
      subsections: [
        { id: "4.1", title: "自然条件（地形、地质、气候、水文）" },
        { id: "4.2", title: "筑路材料及运输条件" },
        { id: "4.3", title: "路线方案比选" }
      ]
    },
    {
      id: "5",
      title: "第五章 工程技术方案",
      subsections: [
        { id: "5.1", title: "技术标准" },
        { id: "5.2", title: "路线设计" },
        { id: "5.3", title: "路基路面设计" },
        { id: "5.4", title: "桥涵设计" },
        { id: "5.5", title: "隧道设计" },
        { id: "5.6", title: "交叉工程" },
        { id: "5.7", title: "交通工程及沿线设施" }
      ]
    },
    {
      id: "6",
      title: "第六章 环境影响评价",
      subsections: [
        { id: "6.1", title: "环境现状调查" },
        { id: "6.2", title: "环境影响分析" },
        { id: "6.3", title: "环境保护措施" }
      ]
    },
    {
      id: "7",
      title: "第七章 投资估算与资金筹措",
      subsections: [
        { id: "7.1", title: "投资估算依据" },
        { id: "7.2", title: "投资估算" },
        { id: "7.3", title: "资金来源与筹措" }
      ]
    },
    {
      id: "8",
      title: "第八章 经济评价",
      subsections: [
        { id: "8.1", title: "评价依据与方法" },
        { id: "8.2", title: "国民经济评价" },
        { id: "8.3", title: "财务评价" }
      ]
    },
    {
      id: "9",
      title: "第九章 社会评价",
      subsections: [
        { id: "9.1", title: "社会影响分析" },
        { id: "9.2", title: "互适性分析" },
        { id: "9.3", title: "社会风险分析" }
      ]
    },
    {
      id: "10",
      title: "第十章 结论与建议"
    }
  ]
};

// 市政工程专业大纲
const MUNICIPAL_OUTLINE: Outline = {
  type: "municipal",
  name: "市政工程可行性研究报告大纲",
  description: "适用于城市道路、排水、供水、燃气等市政基础设施",
  sections: [
    {
      id: "1",
      title: "第一章 项目概况",
      subsections: [
        { id: "1.1", title: "项目名称" },
        { id: "1.2", title: "建设地点" },
        { id: "1.3", title: "项目单位" },
        { id: "1.4", title: "建设规模与内容" },
        { id: "1.5", title: "总投资及资金来源" },
        { id: "1.6", title: "建设工期" }
      ]
    },
    {
      id: "2",
      title: "第二章 项目建设背景及必要性",
      subsections: [
        { id: "2.1", title: "城市发展概况" },
        { id: "2.2", title: "城市基础设施现状" },
        { id: "2.3", title: "项目建设的必要性" }
      ]
    },
    {
      id: "3",
      title: "第三章 建设条件分析",
      subsections: [
        { id: "3.1", title: "自然条件" },
        { id: "3.2", title: "公用设施条件" },
        { id: "3.3", title: "施工条件" }
      ]
    },
    {
      id: "4",
      title: "第四章 工程技术方案",
      subsections: [
        { id: "4.1", title: "设计标准" },
        { id: "4.2", title: "工程方案" },
        { id: "4.3", title: "主要设备选型" }
      ]
    },
    {
      id: "5",
      title: "第五章 环境影响评价",
      subsections: [
        { id: "5.1", title: "环境现状" },
        { id: "5.2", title: "环境影响分析" },
        { id: "5.3", title: "环保措施" }
      ]
    },
    {
      id: "6",
      title: "第六章 投资估算与资金筹措",
      subsections: [
        { id: "6.1", title: "投资估算" },
        { id: "6.2", title: "资金来源" }
      ]
    },
    {
      id: "7",
      title: "第七章 财务评价",
      subsections: [
        { id: "7.1", title: "成本费用估算" },
        { id: "7.2", title: "收入测算" },
        { id: "7.3", title: "财务评价指标" }
      ]
    },
    {
      id: "8",
      title: "第八章 社会评价",
      subsections: [
        { id: "8.1", title: "社会影响分析" },
        { id: "8.2", title: "公众参与" }
      ]
    },
    {
      id: "9",
      title: "第九章 结论与建议"
    }
  ]
};

// 生态环境工程专业大纲
const ECOLOGY_OUTLINE: Outline = {
  type: "ecology",
  name: "生态环境工程可行性研究报告大纲",
  description: "适用于湿地修复、矿山修复、河道治理、生态修复等",
  sections: [
    {
      id: "1",
      title: "第一章 项目概况",
      subsections: [
        { id: "1.1", title: "项目名称" },
        { id: "1.2", title: "项目地点" },
        { id: "1.3", title: "项目单位" },
        { id: "1.4", title: "修复/建设规模" },
        { id: "1.5", title: "总投资及资金来源" },
        { id: "1.6", title: "建设工期" }
      ]
    },
    {
      id: "2",
      title: "第二章 项目背景及必要性",
      subsections: [
        { id: "2.1", title: "生态环境现状" },
        { id: "2.2", title: "问题与成因" },
        { id: "2.3", title: "项目建设的必要性" }
      ]
    },
    {
      id: "3",
      title: "第三章 建设条件",
      subsections: [
        { id: "3.1", title: "自然地理条件" },
        { id: "3.2", title: "生态环境条件" },
        { id: "3.3", title: "社会经济条件" }
      ]
    },
    {
      id: "4",
      title: "第四章 修复/治理方案",
      subsections: [
        { id: "4.1", title: "修复目标与技术路线" },
        { id: "4.2", title: "主要修复技术" },
        { id: "4.3", title: "工程措施" },
        { id: "4.4", title: "植物配置" }
      ]
    },
    {
      id: "5",
      title: "第五章 环境影响评价",
      subsections: [
        { id: "5.1", title: "环境现状调查" },
        { id: "5.2", title: "环境影响预测" },
        { id: "5.3", title: "环境效益分析" }
      ]
    },
    {
      id: "6",
      title: "第六章 投资估算与资金筹措",
      subsections: [
        { id: "6.1", title: "投资估算依据" },
        { id: "6.2", title: "投资估算" },
        { id: "6.3", title: "资金来源" }
      ]
    },
    {
      id: "7",
      title: "第七章 效益分析",
      subsections: [
        { id: "7.1", title: "生态效益" },
        { id: "7.2", title: "经济效益" },
        { id: "7.3", title: "社会效益" }
      ]
    },
    {
      id: "8",
      title: "第八章 结论与建议"
    }
  ]
};

// 大纲导出
export const OUTLINES: Record<string, Outline> = {
  general: GENERAL_OUTLINE,
  highway: HIGHWAY_OUTLINE,
  municipal: MUNICIPAL_OUTLINE,
  ecology: ECOLOGY_OUTLINE
};

// 获取大纲
export function getOutline(type: string): Outline {
  return OUTLINES[type] || OUTLINES.general;
}

// 获取大纲列表
export function getOutlineList(): { type: string; name: string; description: string }[] {
  return Object.values(OUTLINES).map(o => ({
    type: o.type,
    name: o.name,
    description: o.description
  }));
}

// 导出大纲为Markdown格式
export function exportOutlineToMarkdown(outline: Outline): string {
  let md = `# ${outline.name}\n\n${outline.description}\n\n`;
  
  for (const section of outline.sections) {
    md += `## ${section.id} ${section.title}\n\n`;
    
    if (section.subsections) {
      for (const sub of section.subsections) {
        md += `- ${sub.id} ${sub.title}\n`;
      }
      md += "\n";
    }
  }
  
  return md;
}