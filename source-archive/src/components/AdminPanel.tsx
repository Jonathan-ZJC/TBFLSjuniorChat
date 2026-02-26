import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, Shield, Tag, Settings, Trash2, UserX, UserCheck, 
  Plus, AlertTriangle, Search, RefreshCw, Crown, Megaphone
} from 'lucide-react';
import type { User as UserType, TagType } from '@/types';
import { ROLE_CONFIG, TAG_CONFIG } from '@/types';
import { store } from '@/store';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onDataChange?: () => void;
}

export function AdminPanel({ isOpen, onClose, currentUser, onDataChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<UserType[]>([]);
  const [posts, setPosts] = useState<ReturnType<typeof store.getPosts>>([]);
  const [settings, setSettings] = useState<ReturnType<typeof store.getSettings>>(store.getSettings());
  const [announcements, setAnnouncements] = useState<ReturnType<typeof store.getAnnouncements>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTag, setNewTag] = useState('');
  const [banReason, setBanReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 公告表单
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
  });

  const isOwner = currentUser.role === 'owner';

  // 刷新数据
  const refreshData = useCallback(() => {
    setUsers(store.getUsers());
    setPosts(store.getPosts());
    setSettings(store.getSettings());
    setAnnouncements(store.getAnnouncements());
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  // 任命管理员（仅站主）
  const appointAdmin = (userId: string) => {
    if (!isOwner) return;
    store.appointAdmin(userId, currentUser.id);
    refreshData();
    onDataChange?.();
  };

  // 罢免管理员（仅站主）
  const removeAdmin = (userId: string) => {
    if (!isOwner) return;
    store.removeAdmin(userId, currentUser.id);
    refreshData();
    onDataChange?.();
  };

  // 禁言用户
  const banUser = (userId: string) => {
    store.banUser(userId, currentUser.id, banReason);
    setShowBanDialog(false);
    setBanReason('');
    setSelectedUser(null);
    refreshData();
    onDataChange?.();
  };

  // 解封用户
  const unbanUser = (userId: string) => {
    store.unbanUser(userId, currentUser.id);
    refreshData();
    onDataChange?.();
  };

  // 删除用户（仅站主）
  const deleteUser = (userId: string) => {
    if (!isOwner) return;
    store.deleteUser(userId, currentUser.id);
    setShowDeleteDialog(false);
    setSelectedUser(null);
    refreshData();
    onDataChange?.();
  };

  // 删除帖子
  const deletePost = (postId: string) => {
    if (!confirm('确定要删除这条帖子吗？')) return;
    store.deletePostByAdmin(postId, currentUser.id, '管理员删除');
    refreshData();
    onDataChange?.();
  };

  // 添加标签（仅站主）
  const addTag = () => {
    if (!isOwner || !newTag.trim()) return;
    store.addTag(newTag.trim());
    setNewTag('');
    refreshData();
    onDataChange?.();
  };

  // 删除标签（仅站主）
  const removeTag = (tag: string) => {
    if (!isOwner) return;
    if (!confirm(`确定要删除标签 "${tag}" 吗？`)) return;
    store.removeTag(tag);
    refreshData();
    onDataChange?.();
  };

  // 更新系统设置（仅站主）
  const updateSettings = (updates: Partial<ReturnType<typeof store.getSettings>>) => {
    if (!isOwner) return;
    const updated = store.updateSettings(updates);
    setSettings(updated);
    onDataChange?.();
  };

  // 发布公告
  const createAnnouncement = () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    store.createAnnouncement({
      title: announcementForm.title.trim(),
      content: announcementForm.content.trim(),
      createdBy: currentUser.id,
      createdByName: currentUser.nickname,
      isActive: true,
    });
    setAnnouncementForm({ title: '', content: '' });
    refreshData();
    onDataChange?.();
  };

  // 删除公告
  const deleteAnnouncement = (id: string) => {
    if (!confirm('确定要删除这条公告吗？')) return;
    store.deleteAnnouncement(id);
    refreshData();
    onDataChange?.();
  };

  // 过滤用户
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 过滤帖子
  const filteredPosts = posts.filter(p => 
    !p.isDeleted && (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const tags = store.getTags() as TagType[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            {isOwner ? '站主管理后台' : '管理员面板'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: isOwner ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)' }}>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-1" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="posts">
              <Trash2 className="w-4 h-4 mr-1" />
              帖子管理
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="tags">
                <Tag className="w-4 h-4 mr-1" />
                标签管理
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="announcements">
                <Megaphone className="w-4 h-4 mr-1" />
                公告管理
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-1" />
                系统设置
              </TabsTrigger>
            )}
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索用户..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={refreshData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredUsers.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                return (
                  <Card key={user.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.nickname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.nickname}</span>
                            <Badge className={roleConfig.badgeColor}>
                              {roleConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            @{user.username} · {user.enrollmentYear}级{user.classNumber}班 · 发帖{user.postCount}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* 站主功能：任命/罢免管理员 */}
                        {isOwner && user.role === 'user' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => appointAdmin(user.id)}
                            title="任命为管理员"
                          >
                            <Crown className="w-4 h-4 text-purple-500" />
                          </Button>
                        )}
                        {isOwner && user.role === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdmin(user.id)}
                            title="罢免管理员"
                          >
                            <UserX className="w-4 h-4 text-orange-500" />
                          </Button>
                        )}

                        {/* 禁言/解封 */}
                        {user.role !== 'owner' && user.id !== currentUser.id && (
                          user.role === 'banned' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unbanUser(user.id)}
                              title="解封用户"
                            >
                              <UserCheck className="w-4 h-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanDialog(true);
                              }}
                              title="禁言用户"
                            >
                              <UserX className="w-4 h-4 text-red-500" />
                            </Button>
                          )
                        )}

                        {/* 站主删除用户 */}
                        {isOwner && user.role !== 'owner' && user.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                            title="删除用户"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Posts Management */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索帖子..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={refreshData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 line-clamp-1">{post.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{post.authorName}</span>
                        <Badge variant="secondary" className="text-xs">{post.tag}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tags Management (Owner Only) */}
          {isOwner && (
            <TabsContent value="tags" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入新标签名称"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button onClick={addTag} disabled={!newTag.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const config = TAG_CONFIG[tag];
                  return (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: config?.bgColor || '#F3F4F6', color: config?.color || '#6B7280' }}
                    >
                      <span className="text-sm font-medium">{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:opacity-70"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          )}

          {/* Announcements Management (Owner Only) */}
          {isOwner && (
            <TabsContent value="announcements" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">发布新公告</h3>
                <div className="space-y-3">
                  <div>
                    <Label>标题</Label>
                    <Input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="公告标题"
                    />
                  </div>
                  <div>
                    <Label>内容</Label>
                    <Textarea
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      placeholder="公告内容"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={createAnnouncement}
                    disabled={!announcementForm.title.trim() || !announcementForm.content.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Megaphone className="w-4 h-4 mr-1" />
                    发布公告
                  </Button>
                </div>
              </Card>

              <div className="space-y-2">
                <h3 className="font-semibold">历史公告</h3>
                {announcements.map((ann) => (
                  <Card key={ann.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{ann.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{ann.content}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          发布者: {ann.createdByName} · {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteAnnouncement(ann.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Settings (Owner Only) */}
          {isOwner && (
            <TabsContent value="settings" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">年级班级设置</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>可选年级（用逗号分隔）</Label>
                    <Input
                      value={settings.enrollmentYears.join(', ')}
                      onChange={(e) => {
                        const years = e.target.value
                          .split(',')
                          .map(y => parseInt(y.trim()))
                          .filter(y => !isNaN(y));
                        updateSettings({ enrollmentYears: years });
                      }}
                      placeholder="例如: 2020, 2021, 2022, 2023, 2024"
                    />
                  </div>

                  <div>
                    <Label>可选班级（用逗号分隔）</Label>
                    <Input
                      value={settings.classNumbers.join(', ')}
                      onChange={(e) => {
                        const nums = e.target.value
                          .split(',')
                          .map(n => parseInt(n.trim()))
                          .filter(n => !isNaN(n));
                        updateSettings({ classNumbers: nums });
                      }}
                      placeholder="例如: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12"
                    />
                  </div>

                  <div>
                    <Label>站主用户名</Label>
                    <Input
                      value={settings.ownerUsername}
                      onChange={(e) => updateSettings({ ownerUsername: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      该用户名的用户将自动成为站主
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Ban Dialog */}
        {showBanDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-4 w-96">
              <div className="flex items-center gap-2 text-red-500 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">禁言用户</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                确定要禁言用户 "{selectedUser.nickname}" 吗？
              </p>
              <div className="space-y-2 mb-4">
                <Label>禁言原因（可选）</Label>
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="请输入禁言原因..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowBanDialog(false);
                    setSelectedUser(null);
                    setBanReason('');
                  }}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => banUser(selectedUser.id)}
                >
                  确认禁言
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete User Dialog */}
        {showDeleteDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-4 w-96">
              <div className="flex items-center gap-2 text-red-500 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">删除用户</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                确定要删除用户 "{selectedUser.nickname}" 吗？此操作将同时删除该用户的所有帖子和评论，且不可恢复！
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedUser(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => deleteUser(selectedUser.id)}
                >
                  确认删除
                </Button>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
