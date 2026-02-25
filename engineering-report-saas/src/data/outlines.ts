/**
 * 工程可行性研究报告大纲
 * 基于国家发改委《投资项目可行性研究报告编写大纲及说明（2023年版）》
 * 发改投资规〔2023〕304号
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
  version: string;
  description: string;
  sections: OutlineSection[];
}

// 政府投资项目通用大纲（2023年版）- 完整版
export const GOVERNMENT_OUTLINE: Outline = {
  type: "government",
  name: "政府投资项目可行性研究报告编写通用大纲",
  version: "2023年版",
  description: "国家发展改革委发改投资规〔2023〕304号",
  sections: [
    {
      id: "1",
      title: "一、概述",
      subsections: [
        { id: "1.1", title: "（一）项目概况" },
        { id: "1.2", title: "（二）项目单位概况" },
        { id: "1.3", title: "（三）编制依据" },
        { id: "1.4", title: "（四）主要结论和建议" }
      ]
    },
    {
      id: "2",
      title: "二、项目建设背景和必要性",
      subsections: [
        { id: "2.1", title: "（一）项目建设背景" },
        { id: "2.2", title: "（二）规划政策符合性" },
        { id: "2.3", title: "（三）项目建设必要性" }
      ]
    },
    {
      id: "3",
      title: "三、项目需求分析与产出方案",
      subsections: [
        { id: "3.1", title: "（一）需求分析" },
        { id: "3.2", title: "（二）建设内容和规模" },
        { id: "3.3", title: "（三）项目产出方案" }
      ]
    },
    {
      id: "4",
      title: "四、项目选址与要素保障",
      subsections: [
        { id: "4.1", title: "（一）项目选址或选线" },
        { id: "4.2", title: "（二）项目建设条件" },
        { id: "4.3", title: "（三）要素保障分析" }
      ]
    },
    {
      id: "5",
      title: "五、项目建设方案",
      subsections: [
        { id: "5.1", title: "（一）技术方案" },
        { id: "5.2", title: "（二）设备方案" },
        { id: "5.3", title: "（三）工程方案" },
        { id: "5.4", title: "（四）用地用海征收补偿（安置）方案" },
        { id: "5.5", title: "（五）数字化方案" },
        { id: "5.6", title: "（六）建设管理方案" }
      ]
    },
    {
      id: "6",
      title: "六、项目运营方案",
      subsections: [
        { id: "6.1", title: "（一）运营模式选择" },
        { id: "6.2", title: "（二）运营组织方案" },
        { id: "6.3", title: "（三）安全保障方案" },
        { id: "6.4", title: "（四）绩效管理方案" }
      ]
    },
    {
      id: "7",
      title: "七、项目投融资与财务方案",
      subsections: [
        { id: "7.1", title: "（一）投资估算" },
        { id: "7.2", title: "（二）盈利能力分析" },
        { id: "7.3", title: "（三）融资方案" },
        { id: "7.4", title: "（四）债务清偿能力分析" },
        { id: "7.5", title: "（五）财务可持续性分析" }
      ]
    },
    {
      id: "8",
      title: "八、项目影响效果分析",
      subsections: [
        { id: "8.1", title: "（一）经济影响分析" },
        { id: "8.2", title: "（二）社会影响分析" },
        { id: "8.3", title: "（三）生态环境影响分析" },
        { id: "8.4", title: "（四）资源和能源利用效果分析" },
        { id: "8.5", title: "（五）碳达峰碳中和分析" }
      ]
    },
    {
      id: "9",
      title: "九、项目风险管控方案",
      subsections: [
        { id: "9.1", title: "（一）风险识别与评价" },
        { id: "9.2", title: "（二）风险管控方案" },
        { id: "9.3", title: "（三）风险应急预案" }
      ]
    },
    {
      id: "10",
      title: "十、研究结论及建议",
      subsections: [
        { id: "10.1", title: "（一）主要研究结论" },
        { id: "10.2", title: "（二）问题与建议" }
      ]
    },
    {
      id: "11",
      title: "十一、附表、附图和附件",
      subsections: []
    }
  ]
};

// 企业投资项目参考大纲（2023年版）
export const ENTERPRISE_OUTLINE: Outline = {
  type: "enterprise",
  name: "企业投资项目可行性研究报告编写参考大纲",
  version: "2023年版",
  description: "国家发展改革委发改投资规〔2023〕304号",
  sections: [
    { id: "1", title: "一、概述", subsections: [{ id: "1.1", title: "（一）项目概况" }, { id: "1.2", title: "（二）企业概况" }, { id: "1.3", title: "（三）编制依据" }, { id: "1.4", title: "（四）主要结论和建议" }] },
    { id: "2", title: "二、项目建设背景、需求分析及产出方案", subsections: [{ id: "2.1", title: "（一）规划政策符合性" }, { id: "2.2", title: "（二）企业发展战略需求分析" }, { id: "2.3", title: "（三）项目市场需求分析" }, { id: "2.4", title: "（四）项目建设内容、规模和产出方案" }, { id: "2.5", title: "（五）项目商业模式" }] },
    { id: "3", title: "三、项目选址与要素保障", subsections: [{ id: "3.1", title: "（一）项目选址或选线" }, { id: "3.2", title: "（二）项目建设条件" }, { id: "3.3", title: "（三）要素保障分析" }] },
    { id: "4", title: "四、项目建设方案", subsections: [{ id: "4.1", title: "（一）技术方案" }, { id: "4.2", title: "（二）设备方案" }, { id: "4.3", title: "（三）工程方案" }, { id: "4.4", title: "（四）资源开发方案" }, { id: "4.5", title: "（五）用地用海征收补偿（安置）方案" }, { id: "4.6", title: "（六）数字化方案" }, { id: "4.7", title: "（七）建设管理方案" }] },
    { id: "5", title: "五、项目运营方案", subsections: [{ id: "5.1", title: "（一）生产经营方案" }, { id: "5.2", title: "（二）安全保障方案" }, { id: "5.3", title: "（三）运营管理方案" }] },
    { id: "6", title: "六、项目投融资与财务方案", subsections: [{ id: "6.1", title: "（一）投资估算" }, { id: "6.2", title: "（二）盈利能力分析" }, { id: "6.3", title: "（三）融资方案" }, { id: "6.4", title: "（四）债务清偿能力分析" }, { id: "6.5", title: "（五）财务可持续性分析" }] },
    { id: "7", title: "七、项目影响效果分析", subsections: [{ id: "7.1", title: "（一）经济影响分析" }, { id: "7.2", title: "（二）社会影响分析" }, { id: "7.3", title: "（三）生态环境影响分析" }, { id: "7.4", title: "（四）资源和能源利用效果分析" }, { id: "7.5", title: "（五）碳达峰碳中和分析" }] },
    { id: "8", title: "八、项目风险管控方案", subsections: [{ id: "8.1", title: "（一）风险识别与评价" }, { id: "8.2", title: "（二）风险管控方案" }, { id: "8.3", title: "（三）风险应急预案" }] },
    { id: "9", title: "九、研究结论及建议", subsections: [{ id: "9.1", title: "（一）主要研究结论" }, { id: "9.2", title: "（二）问题与建议" }] },
    { id: "10", title: "十、附表、附图和附件", subsections: [] }
  ]
};

// 公路工程专业大纲
export const HIGHWAY_OUTLINE: Outline = {
  type: "highway",
  name: "公路工程可行性研究报告大纲",
  version: "2023年版（行业细化版）",
  description: "基于国家发改委通用大纲，针对公路工程行业细化",
  sections: [
    { id: "1", title: "一、概述", subsections: [{ id: "1.1", title: "项目概况" }, { id: "1.2", title: "项目单位概况" }, { id: "1.3", title: "编制依据" }, { id: "1.4", title: "主要结论和建议" }] },
    { id: "2", title: "二、项目建设背景和必要性", subsections: [{ id: "2.1", title: "区域经济社会发展概况" }, { id: "2.2", title: "公路网现状及规划" }, { id: "2.3", title: "项目建设背景" }, { id: "2.4", title: "规划政策符合性" }, { id: "2.5", title: "项目建设必要性" }] },
    { id: "3", title: "三、交通量预测与技术标准", subsections: [{ id: "3.1", title: "交通调查现状" }, { id: "3.2", title: "交通量预测方法" }, { id: "3.3", title: "预测结果" }, { id: "3.4", title: "技术标准" }] },
    { id: "4", title: "四、项目选址与要素保障", subsections: [{ id: "4.1", title: "路线方案比选" }, { id: "4.2", title: "沿线自然条件" }, { id: "4.3", title: "筑路材料及运输条件" }, { id: "4.4", title: "土地要素保障" }] },
    { id: "5", title: "五、工程建设方案", subsections: [{ id: "5.1", title: "路线设计" }, { id: "5.2", title: "路基路面设计" }, { id: "5.3", title: "桥涵设计" }, { id: "5.4", title: "隧道设计" }, { id: "5.5", title: "交叉工程" }, { id: "5.6", title: "交通工程及沿线设施" }] },
    { id: "6", title: "六、项目运营方案", subsections: [{ id: "6.1", title: "运营模式选择" }, { id: "6.2", title: "运营组织方案" }, { id: "6.3", title: "安全保障方案" }, { id: "6.4", title: "绩效管理方案" }] },
    { id: "7", title: "七、项目投融资与财务方案", subsections: [{ id: "7.1", title: "投资估算" }, { id: "7.2", title: "盈利能力分析" }, { id: "7.3", title: "融资方案" }, { id: "7.4", title: "债务清偿能力分析" }, { id: "7.5", title: "财务可持续性分析" }] },
    { id: "8", title: "八、项目影响效果分析", subsections: [{ id: "8.1", title: "经济影响分析" }, { id: "8.2", title: "社会影响分析" }, { id: "8.3", title: "生态环境影响分析" }, { id: "8.4", title: "资源和能源利用效果分析" }, { id: "8.5", title: "碳达峰碳中和分析" }] },
    { id: "9", title: "九、项目风险管控方案", subsections: [{ id: "9.1", title: "风险识别与评价" }, { id: "9.2", title: "风险管控方案" }, { id: "9.3", title: "风险应急预案" }] },
    { id: "10", title: "十、研究结论及建议", subsections: [{ id: "10.1", title: "主要研究结论" }, { id: "10.2", title: "问题与建议" }] },
    { id: "11", title: "十一、附表、附图和附件", subsections: [] }
  ]
};

// 市政工程专业大纲
export const MUNICIPAL_OUTLINE: Outline = {
  type: "municipal",
  name: "市政工程可行性研究报告大纲",
  version: "2023年版（行业细化版）",
  description: "基于国家发改委通用大纲，针对市政工程行业细化",
  sections: [
    { id: "1", title: "一、概述", subsections: [{ id: "1.1", title: "项目概况" }, { id: "1.2", title: "项目单位概况" }, { id: "1.3", title: "编制依据" }, { id: "1.4", title: "主要结论和建议" }] },
    { id: "2", title: "二、项目建设背景和必要性", subsections: [{ id: "2.1", title: "城市发展概况" }, { id: "2.2", title: "城市基础设施现状" }, { id: "2.3", title: "项目建设背景" }, { id: "2.4", title: "规划政策符合性" }, { id: "2.5", title: "项目建设必要性" }] },
    { id: "3", title: "三、项目需求分析与产出方案", subsections: [{ id: "3.1", title: "设施现状及问题" }, { id: "3.2", title: "需求预测分析" }, { id: "3.3", title: "建设规模和标准" }, { id: "3.4", title: "项目产出方案" }] },
    { id: "4", title: "四、项目选址与建设条件", subsections: [{ id: "4.1", title: "场址选择" }, { id: "4.2", title: "自然条件" }, { id: "4.3", title: "公用设施条件" }, { id: "4.4", title: "施工条件" }] },
    { id: "5", title: "五、工程技术方案", subsections: [{ id: "5.1", title: "主要工程量" }, { id: "5.2", title: "设计标准" }, { id: "5.3", title: "工程方案" }, { id: "5.4", title: "主要设备选型" }] },
    { id: "6", title: "六、项目运营方案", subsections: [{ id: "6.1", title: "运营模式" }, { id: "6.2", title: "组织机构" }, { id: "6.3", title: "安全保障" }] },
    { id: "7", title: "七、项目投融资与财务方案", subsections: [] },
    { id: "8", title: "八、项目影响效果分析", subsections: [] },
    { id: "9", title: "九、项目风险管控方案", subsections: [] },
    { id: "10", title: "十、研究结论及建议", subsections: [] },
    { id: "11", title: "十一、附表、附图和附件", subsections: [] }
  ]
};

// 生态环境工程专业大纲
export const ECOLOGY_OUTLINE: Outline = {
  type: "ecology",
  name: "生态环境工程可行性研究报告大纲",
  version: "2023年版（行业细化版）",
  description: "基于国家发改委通用大纲，针对生态环境工程行业细化",
  sections: [
    { id: "1", title: "一、概述", subsections: [] },
    { id: "2", title: "二、项目背景及必要性", subsections: [{ id: "2.1", title: "生态环境现状" }, { id: "2.2", title: "问题与成因" }, { id: "2.3", title: "项目建设背景" }, { id: "2.4", title: "规划政策符合性" }] },
    { id: "3", title: "三、生态调查与需求分析", subsections: [{ id: "3.1", title: "本底调查" }, { id: "3.2", title: "问题诊断" }, { id: "3.3", title: "修复目标确定" }] },
    { id: "4", title: "四、项目选址与条件", subsections: [] },
    { id: "5", title: "五、生态修复方案", subsections: [{ id: "5.1", title: "修复目标与技术路线" }, { id: "5.2", title: "主要修复技术" }, { id: "5.3", title: "工程措施" }, { id: "5.4", title: "植物配置" }, { id: "5.5", title: "监测方案" }] },
    { id: "6", title: "六、项目运营方案", subsections: [] },
    { id: "7", title: "七、项目投融资与财务方案", subsections: [] },
    { id: "8", title: "八、项目影响效果分析", subsections: [{ id: "8.1", title: "生态效益" }, { id: "8.2", title: "经济效益" }, { id: "8.3", title: "社会效益" }] },
    { id: "9", title: "九、项目风险管控方案", subsections: [] },
    { id: "10", title: "十、研究结论及建议", subsections: [] },
    { id: "11", title: "十一、附表、附图和附件", subsections: [] }
  ]
};

export const OUTLINES: Record<string, Outline> = {
  government: GOVERNMENT_OUTLINE,
  enterprise: ENTERPRISE_OUTLINE,
  highway: HIGHWAY_OUTLINE,
  municipal: MUNICIPAL_OUTLINE,
  ecology: ECOLOGY_OUTLINE
};

export function getOutline(type: string): Outline {
  return OUTLINES[type] || GOVERNMENT_OUTLINE;
}

export function getOutlineList() {
  return Object.values(OUTLINES).map(o => ({ type: o.type, name: o.name, version: o.version, description: o.description }));
}

export function exportOutlineToMarkdown(outline: Outline): string {
  let md = `# ${outline.name}\n\n**版本**: ${outline.version}\n\n${outline.description}\n\n---\n\n`;
  for (const section of outline.sections) {
    md += `## ${section.title}\n\n`;
    if (section.subsections?.length) {
      for (const sub of section.subsections) md += `- ${sub.id} ${sub.title}\n`;
      md += "\n";
    }
  }
  return md;
}

export function getRecommendedOutline(projectType: string): Outline {
  const typeMap: Record<string, string> = { 'highway': 'highway', 'road': 'highway', '桥梁': 'highway', 'municipal': 'municipal', '市政': 'municipal', '排水': 'municipal', '供水': 'municipal', 'ecology': 'ecology', '生态': 'ecology', '环境': 'ecology', '湿地': 'ecology', '修复': 'ecology' };
  for (const [key, value] of Object.entries(typeMap)) {
    if (projectType.toLowerCase().includes(key)) return getOutline(value);
  }
  return GOVERNMENT_OUTLINE;
}