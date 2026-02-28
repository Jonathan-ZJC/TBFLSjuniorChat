import type { User, Post, Comment, TagType, VisibilityLevel, SystemSettings, UserProfile, BanInfo } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

// 存储键名
const STORAGE_KEYS = {
  USERS: 'bhxw_users',
  POSTS: 'bhxw_posts',
  COMMENTS: 'bhxw_comments',
  CURRENT_USER: 'bhxw_current_user',
  SETTINGS: 'bhxw_settings',
  TAGS: 'bhxw_tags',
  ANNOUNCEMENTS: 'bhxw_announcements',
};

// 初始化示例数据
const initSampleData = () => {
  const users: User[] = [
    {
      id: 'user_owner',
      username: 'ZJCjonathan25',
      nickname: '站主',
      enrollmentYear: 2024,
      classNumber: 15,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZJCjonathan25',
      password: 'ZJCjonathan0721',
      role: 'owner',
      postCount: 0,
      likeCount: 0,
      createdAt: '2026-02-27T00:00:00Z',
      profile: {
        bio: '滨海小外初中论坛站主，欢迎大家！',
        hobbies: ['编程', '篮球', '音乐'],
        phone: '138****8888',
        wechat: 'ZJCjonathan25',
        email: 'owner@bhxw.edu',
        gender: 'male',
        location: '天津',
      },
    },
    {
      id: 'user_admin1',
      username: 'admin01',
      nickname: '管理员',
      enrollmentYear: 2024,
      classNumber: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin01',
      password: '123456',
      role: 'admin',
      postCount: 0,
      likeCount: 0,
      createdAt: '2024-01-15T08:30:00Z',
      profile: {
        bio: '热爱学习，乐于助人',
        hobbies: ['阅读', '跑步'],
        gender: 'male',
      },
    },
  ];

  const posts: Post[] = [];

  const comments: Comment[] = [];

  const defaultTags = ['伙食', '八卦', '老师', '笔记', '小道消息', '活动', '失物招领', '二手交易', '成绩', '其他'];
  
  // 使用新的默认设置
  const defaultSettings = {
    enrollmentYears: [2023, 2024, 2025],
    classNumbers: Array.from({ length: 25 }, (_, i) => i + 1),
    allowRegistration: true,
    ownerUsername: 'ZJCjonathan25',
  };

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(defaultTags));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([]));
};

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

// 重新导出Announcement类型
export type { Announcement as AnnouncementType };

// 数据存储类
class Store {
  constructor() {
    // 检查是否已有数据
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      initSampleData();
    }
  }

  // 系统设置
  getSettings(): SystemSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // 公告管理
  getAnnouncements(): Announcement[] {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : [];
  }

  getActiveAnnouncements(): Announcement[] {
    return this.getAnnouncements().filter(a => a.isActive);
  }

  createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
    const announcements = this.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `announcement_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    announcements.unshift(newAnnouncement);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    return newAnnouncement;
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    if (index === -1) return null;
    announcements[index] = { ...announcements[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    return announcements[index];
  }

  deleteAnnouncement(id: string): boolean {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    return true;
  }

  // 标签管理
  getTags(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : Object.keys(DEFAULT_SETTINGS);
  }

  addTag(tag: string): boolean {
    const tags = this.getTags();
    if (tags.includes(tag)) return false;
    tags.push(tag);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return true;
  }

  removeTag(tag: string): boolean {
    const tags = this.getTags();
    const index = tags.indexOf(tag);
    if (index === -1) return false;
    tags.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return true;
  }

  // 用户相关
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find(u => u.username === username);
  }

  getAdmins(): User[] {
    return this.getUsers().filter(u => u.role === 'admin');
  }

  createUser(user: Omit<User, 'id' | 'postCount' | 'likeCount' | 'createdAt' | 'role'>): User {
    const users = this.getUsers();
    const settings = this.getSettings();
    
    // 检查是否是站主
    const isOwner = user.username === settings.ownerUsername;
    
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      role: isOwner ? 'owner' : 'user',
      postCount: 0,
      likeCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }

  // 删除用户（仅站主）
  deleteUser(userId: string, ownerId: string): boolean {
    const owner = this.getUserById(ownerId);
    if (!owner || owner.role !== 'owner') return false;
    
    const user = this.getUserById(userId);
    if (!user) return false;
    
    // 不能删除自己
    if (userId === ownerId) return false;
    
    // 删除用户的所有帖子
    const posts = this.getPosts();
    const userPosts = posts.filter(p => p.authorId === userId);
    userPosts.forEach(post => {
      this.permanentlyDeletePost(post.id, ownerId);
    });
    
    // 删除用户的所有评论
    const comments = this.getComments();
    const userComments = comments.filter(c => c.authorId === userId);
    userComments.forEach(comment => {
      this.permanentlyDeleteComment(comment.id);
    });
    
    // 删除用户
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    
    return true;
  }

  // 任命/罢免管理员（仅站主可用）
  appointAdmin(userId: string, appointedBy: string): User | null {
    const appointer = this.getUserById(appointedBy);
    if (!appointer || appointer.role !== 'owner') return null;
    
    const user = this.getUserById(userId);
    if (!user || user.role === 'owner') return null;
    
    return this.updateUser(userId, { role: 'admin' });
  }

  removeAdmin(userId: string, removedBy: string): User | null {
    const remover = this.getUserById(removedBy);
    if (!remover || remover.role !== 'owner') return null;
    
    const user = this.getUserById(userId);
    if (!user || user.role !== 'admin') return null;
    
    return this.updateUser(userId, { role: 'user' });
  }

  // 禁言/解封用户（管理员和站主可用）
  banUser(userId: string, bannedBy: string, reason?: string, duration?: number): User | null {
    const banner = this.getUserById(bannedBy);
    if (!banner || (banner.role !== 'owner' && banner.role !== 'admin')) return null;
    
    const user = this.getUserById(userId);
    if (!user || user.role === 'owner') return null; // 不能禁言站主
    
    const banInfo: BanInfo = {
      isBanned: true,
      bannedAt: new Date().toISOString(),
      bannedUntil: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : undefined,
      banReason: reason,
      bannedBy,
    };
    
    return this.updateUser(userId, { role: 'banned', banInfo });
  }

  unbanUser(userId: string, unbannedBy: string): User | null {
    const unbanner = this.getUserById(unbannedBy);
    if (!unbanner || (unbanner.role !== 'owner' && unbanner.role !== 'admin')) return null;
    
    const user = this.getUserById(userId);
    if (!user || user.role !== 'banned') return null;
    
    return this.updateUser(userId, { role: 'user', banInfo: undefined });
  }

  // 检查用户是否被禁言
  isUserBanned(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user || user.role !== 'banned') return false;
    
    // 检查禁言是否到期
    if (user.banInfo?.bannedUntil) {
      if (new Date(user.banInfo.bannedUntil) < new Date()) {
        // 自动解封
        this.updateUser(userId, { role: 'user', banInfo: undefined });
        return false;
      }
    }
    return true;
  }

  // 更新用户资料
  updateUserProfile(userId: string, profile: UserProfile): User | null {
    return this.updateUser(userId, { profile });
  }

  // 更新用户头像
  updateUserAvatar(userId: string, avatarUrl: string): User | null {
    // 同时更新用户的帖子中的头像
    const user = this.getUserById(userId);
    if (!user) return null;
    
    // 更新用户头像
    const updated = this.updateUser(userId, { avatar: avatarUrl });
    
    // 更新所有帖子中的头像
    const posts = this.getPosts();
    posts.forEach(post => {
      if (post.authorId === userId) {
        this.updatePost(post.id, { authorAvatar: avatarUrl });
      }
    });
    
    // 更新所有评论中的头像
    const comments = this.getComments();
    comments.forEach(comment => {
      if (comment.authorId === userId) {
        comment.authorAvatar = avatarUrl;
      }
    });
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    return updated;
  }

  // 当前用户
  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    
    const user = JSON.parse(data) as User;
    // 检查是否被禁言
    if (this.isUserBanned(user.id)) {
      return null;
    }
    return user;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // 帖子相关
  getPosts(): Post[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  }

  getPostById(id: string): Post | undefined {
    return this.getPosts().find(p => p.id === id);
  }

  getPostsByAuthor(authorId: string): Post[] {
    return this.getPosts().filter(p => p.authorId === authorId && !p.isDeleted);
  }

  createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'views' | 'likedBy' | 'isDeleted'>): Post | null {
    // 检查作者是否被禁言
    if (this.isUserBanned(post.authorId)) {
      return null;
    }
    
    const posts = this.getPosts();
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      views: 0,
      likedBy: [],
      isDeleted: false,
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    
    // 更新用户发帖数
    const user = this.getUserById(post.authorId);
    if (user) {
      this.updateUser(user.id, { postCount: user.postCount + 1 });
    }
    
    return newPost;
  }

  updatePost(id: string, updates: Partial<Post>): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;
    posts[index] = { ...posts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts[index];
  }

  // 管理员删除帖子
  deletePostByAdmin(postId: string, adminId: string, reason?: string): boolean {
    const admin = this.getUserById(adminId);
    if (!admin || (admin.role !== 'owner' && admin.role !== 'admin')) return false;
    
    const post = this.getPostById(postId);
    if (!post) return false;
    
    this.updatePost(postId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: adminId,
      deleteReason: reason,
    });
    
    // 更新作者发帖数
    const author = this.getUserById(post.authorId);
    if (author) {
      this.updateUser(author.id, { postCount: Math.max(0, author.postCount - 1) });
    }
    
    return true;
  }

  // 用户删除自己的帖子
  deletePostByUser(postId: string, userId: string): boolean {
    const post = this.getPostById(postId);
    if (!post) return false;
    
    // 只能删除自己的帖子
    if (post.authorId !== userId) return false;
    
    this.updatePost(postId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
      deleteReason: '用户自行删除',
    });
    
    // 更新用户发帖数
    const author = this.getUserById(userId);
    if (author) {
      this.updateUser(author.id, { postCount: Math.max(0, author.postCount - 1) });
    }
    
    return true;
  }

  // 恢复被删除的帖子（仅站主）
  restorePost(postId: string, ownerId: string): boolean {
    const owner = this.getUserById(ownerId);
    if (!owner || owner.role !== 'owner') return false;
    
    this.updatePost(postId, {
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      deleteReason: undefined,
    });
    
    // 更新作者发帖数
    const post = this.getPostById(postId);
    if (post) {
      const author = this.getUserById(post.authorId);
      if (author) {
        this.updateUser(author.id, { postCount: author.postCount + 1 });
      }
    }
    
    return true;
  }

  // 物理删除帖子（仅站主）
  permanentlyDeletePost(postId: string, ownerId: string): boolean {
    const owner = this.getUserById(ownerId);
    if (!owner || owner.role !== 'owner') return false;
    
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    
    const filtered = posts.filter(p => p.id !== postId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    
    // 删除相关评论
    const comments = this.getComments().filter(c => c.postId !== postId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    return true;
  }

  likePost(postId: string, userId: string): boolean {
    const post = this.getPostById(postId);
    if (!post || post.isDeleted) return false;
    if (post.likedBy.includes(userId)) return false;
    
    post.likedBy.push(userId);
    post.likes += 1;
    this.updatePost(postId, post);
    
    // 更新作者获赞数
    const author = this.getUserById(post.authorId);
    if (author) {
      this.updateUser(author.id, { likeCount: author.likeCount + 1 });
    }
    
    return true;
  }

  unlikePost(postId: string, userId: string): boolean {
    const post = this.getPostById(postId);
    if (!post) return false;
    if (!post.likedBy.includes(userId)) return false;
    
    post.likedBy = post.likedBy.filter(id => id !== userId);
    post.likes = Math.max(0, post.likes - 1);
    this.updatePost(postId, post);
    
    // 更新作者获赞数
    const author = this.getUserById(post.authorId);
    if (author) {
      this.updateUser(author.id, { likeCount: Math.max(0, author.likeCount - 1) });
    }
    
    return true;
  }

  incrementViews(postId: string): void {
    const post = this.getPostById(postId);
    if (post && !post.isDeleted) {
      post.views += 1;
      this.updatePost(postId, post);
    }
  }

  // 评论相关
  getComments(): Comment[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  }

  getCommentsByPost(postId: string): Comment[] {
    return this.getComments().filter(c => c.postId === postId && !c.isDeleted);
  }

  createComment(comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'isDeleted'>): Comment | null {
    // 检查作者是否被禁言
    if (this.isUserBanned(comment.authorId)) {
      return null;
    }
    
    const comments = this.getComments();
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      isDeleted: false,
    };
    comments.push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    // 更新帖子评论数
    const post = this.getPostById(comment.postId);
    if (post) {
      this.updatePost(post.id, { comments: post.comments + 1 });
    }
    
    return newComment;
  }

  // 管理员删除评论
  deleteCommentByAdmin(commentId: string, adminId: string): boolean {
    const admin = this.getUserById(adminId);
    if (!admin || (admin.role !== 'owner' && admin.role !== 'admin')) return false;
    
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;
    
    comment.isDeleted = true;
    comment.deletedAt = new Date().toISOString();
    comment.deletedBy = adminId;
    
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    // 更新帖子评论数
    const post = this.getPostById(comment.postId);
    if (post) {
      this.updatePost(post.id, { comments: Math.max(0, post.comments - 1) });
    }
    
    return true;
  }

  // 用户删除自己的评论
  deleteCommentByUser(commentId: string, userId: string): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;
    
    // 只能删除自己的评论
    if (comment.authorId !== userId) return false;
    
    comment.isDeleted = true;
    comment.deletedAt = new Date().toISOString();
    comment.deletedBy = userId;
    
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    // 更新帖子评论数
    const post = this.getPostById(comment.postId);
    if (post) {
      this.updatePost(post.id, { comments: Math.max(0, post.comments - 1) });
    }
    
    return true;
  }

  // 物理删除评论
  permanentlyDeleteComment(commentId: string): boolean {
    const comments = this.getComments();
    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered));
    return true;
  }

  // 搜索功能
  searchPosts(params: {
    keyword?: string;
    tag?: TagType;
    visibility?: VisibilityLevel;
    currentUser?: User | null;
    includeDeleted?: boolean;
  }): Post[] {
    let posts = this.getPosts();
    
    // 默认不显示已删除帖子
    if (!params.includeDeleted) {
      posts = posts.filter(p => !p.isDeleted);
    }
    
    // 权限过滤
    if (params.currentUser) {
      posts = posts.filter(post => {
        if (post.visibility === 'school') return true;
        if (post.visibility === 'grade') return post.authorYear === params.currentUser?.enrollmentYear;
        if (post.visibility === 'class') {
          return post.authorYear === params.currentUser?.enrollmentYear && 
                 post.authorClass === params.currentUser?.classNumber;
        }
        return true;
      });
    } else {
      // 未登录只能看全校帖子
      posts = posts.filter(post => post.visibility === 'school');
    }
    
    // 关键词过滤
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(kw) || 
        post.content.toLowerCase().includes(kw)
      );
    }
    
    // 标签过滤
    if (params.tag) {
      posts = posts.filter(post => post.tag === params.tag);
    }
    
    // 权限级别过滤
    if (params.visibility) {
      posts = posts.filter(post => post.visibility === params.visibility);
    }
    
    return posts;
  }
}

export const store = new Store();
