import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化时间距离
export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * 格式化注册时间
 * 直接显示注册日期（如：2026年2月27日）
 */
export function formatRegisterTime(date: string | Date): string {
  const target = new Date(date);
  return target.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 计算年级标签
 * 以2026年2月（初二下学期）为基准
 * 
 * 入学年份与年级对应关系（2026年2月）：
 * - 2025年9月入学 → 2025级 → 初一（下学期）
 * - 2024年9月入学 → 2024级 → 初二（下学期）
 * - 2023年9月入学 → 2023级 → 初三（上学期）
 * - 2022年及之前入学 → 已毕业
 * 
 * @param enrollmentYear 入学年份
 * @returns 年级标签（初一/初二/初三/已毕业）
 */
export function getGradeLabel(enrollmentYear: number): string {
  // 2026年2月的时间点
  // 2025级 = 初一（2025年9月入学，现在是第二学期）
  // 2024级 = 初二（2024年9月入学，现在是第四学期）
  // 2023级 = 初三（2023年9月入学，现在是第五学期，即将毕业）
  
  if (enrollmentYear === 2025) {
    return '初一';
  } else if (enrollmentYear === 2024) {
    return '初二';
  } else if (enrollmentYear === 2023) {
    return '初三';
  } else if (enrollmentYear <= 2022) {
    return '已毕业';
  } else {
    return '预备';
  }
}
