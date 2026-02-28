// 用户角色
export type UserRole = 'owner' | 'admin' | 'user' | 'banned';

// 用户类型
export interface User {
  id: string;
  username: string;
  nickname: string;
  enrollmentYear: number;
  classNumber: number;
  avatar?: string;
  password: string;
  role: UserRole;
  postCount: number;
  likeCount: number;
  createdAt: string;
  // 个人资料
  profile?: UserProfile;
  // 禁言信息
  banInfo?: BanInfo;
}

// 用户个人资料
export interface UserProfile {
  bio?: string; // 个人简介
  hobbies?: string[]; // 爱好
  phone?: string; // 手机号
  wechat?: string; // 微信号
  email?: string; // 邮箱
  qq?: string; // QQ号
  birthday?: string; // 生日 (YYYY-MM-DD格式)
  gender?: 'male' | 'female' | 'other'; // 性别
  location?: string; // 所在地
}

// 禁言信息
export interface BanInfo {
  isBanned: boolean;
  bannedAt?: string;
  bannedUntil?: string;
  banReason?: string;
  bannedBy?: string;
}

// 标签类型
export type TagType = '伙食' | '八卦' | '老师' | '笔记' | '小道消息' | '活动' | '失物招领' | '二手交易' | '成绩' | '其他';

// 权限级别
export type VisibilityLevel = 'school' | 'grade' | 'class';

// 帖子类型
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorYear: number;
  authorClass: number;
  title: string;
  content: string;
  images: string[];
  tag: TagType;
  visibility: VisibilityLevel;
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  likedBy: string[];
  // 管理员删除标记
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
}

// 评论类型
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
  createdAt: string;
  likes: number;
  // 管理员删除标记
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

// 公告类型
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  isActive: boolean;
}

// 搜索筛选
export interface SearchFilters {
  keyword?: string;
  tag?: TagType;
  visibility?: VisibilityLevel;
  sortBy?: 'newest' | 'hottest';
}

// 系统设置
export interface SystemSettings {
  // 可选择的年级范围
  enrollmentYears: number[];
  // 可选择的班级范围
  classNumbers: number[];
  // 是否允许注册
  allowRegistration: boolean;
  // 站主用户名
  ownerUsername: string;
}

// 标签配置
export const TAG_CONFIG: Record<TagType, { color: string; bgColor: string }> = {
  '伙食': { color: '#F97316', bgColor: '#FFF7ED' },
  '八卦': { color: '#EC4899', bgColor: '#FDF2F8' },
  '老师': { color: '#8B5CF6', bgColor: '#F5F3FF' },
  '笔记': { color: '#10B981', bgColor: '#ECFDF5' },
  '小道消息': { color: '#EF4444', bgColor: '#FEF2F2' },
  '活动': { color: '#3B82F6', bgColor: '#EFF6FF' },
  '失物招领': { color: '#06B6D4', bgColor: '#ECFEFF' },
  '二手交易': { color: '#84CC16', bgColor: '#F7FEE7' },
  '成绩': { color: '#F59E0B', bgColor: '#FEF3C7' },
  '其他': { color: '#6B7280', bgColor: '#F3F4F6' },
};

// 权限配置
export const VISIBILITY_CONFIG: Record<VisibilityLevel, { label: string; color: string; bgColor: string; icon: string }> = {
  'school': { label: '全校', color: '#3B82F6', bgColor: '#DBEAFE', icon: '🏫' },
  'grade': { label: '年级', color: '#10B981', bgColor: '#D1FAE5', icon: '📚' },
  'class': { label: '班级', color: '#F59E0B', bgColor: '#FEF3C7', icon: '👥' },
};

// 角色配置
export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string; badgeColor: string }> = {
  'owner': { label: '站主', color: '#DC2626', bgColor: '#FEE2E2', badgeColor: 'bg-red-500' },
  'admin': { label: '管理员', color: '#7C3AED', bgColor: '#EDE9FE', badgeColor: 'bg-purple-500' },
  'user': { label: '用户', color: '#3B82F6', bgColor: '#DBEAFE', badgeColor: 'bg-blue-500' },
  'banned': { label: '已禁言', color: '#6B7280', bgColor: '#F3F4F6', badgeColor: 'bg-gray-500' },
};

// 默认系统设置
export const DEFAULT_SETTINGS: SystemSettings = {
  enrollmentYears: [2023, 2024, 2025],
  classNumbers: Array.from({ length: 25 }, (_, i) => i + 1),
  allowRegistration: true,
  ownerUsername: 'ZJCjonathan25',
};

// 性别选项
export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '保密' },
] as const;

// 生成年份选项（用于生日选择）
export const BIRTH_YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - 25 + i).toString());

// 生成月份选项
export const BIRTH_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

// 生成日期选项
export const BIRTH_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
