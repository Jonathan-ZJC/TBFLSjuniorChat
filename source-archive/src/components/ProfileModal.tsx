import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MessageCircle, MapPin, Calendar, Heart, FileText, User as UserIcon, Edit, Save, X, Camera } from 'lucide-react';
import type { User as UserType, UserProfile } from '@/types';
import { ROLE_CONFIG, GENDER_OPTIONS, BIRTH_YEAR_OPTIONS, BIRTH_MONTH_OPTIONS, BIRTH_DAY_OPTIONS } from '@/types';
import { store } from '@/store';
import { formatDistanceToNow } from '@/lib/utils';

interface ProfileModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onProfileUpdate?: (user: UserType) => void;
}

export function ProfileModal({ user, isOpen, onClose, currentUser, onProfileUpdate }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState<UserProfile>({});
  const [userPosts, setUserPosts] = useState<ReturnType<typeof store.getPostsByAuthor>>([]);
  const [localAvatar, setLocalAvatar] = useState<string>('');

  const isOwnProfile = currentUser?.id === user?.id;
  const canEdit = isOwnProfile;

  // 刷新用户数据
  const refreshUserData = useCallback(() => {
    if (user) {
      const freshUser = store.getUserById(user.id);
      if (freshUser) {
        setProfile(freshUser.profile || {});
        setLocalAvatar(freshUser.avatar || '');
      }
      setUserPosts(store.getPostsByAuthor(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      refreshUserData();
    }
  }, [isOpen, refreshUserData]);

  // 解析生日
  const parseBirthday = (birthday?: string) => {
    if (!birthday) return { year: '', month: '', day: '' };
    const parts = birthday.split('-');
    return {
      year: parts[0] || '',
      month: parts[1] || '',
      day: parts[2] || '',
    };
  };

  const [birthdayParts, setBirthdayParts] = useState(parseBirthday(profile.birthday));

  useEffect(() => {
    setBirthdayParts(parseBirthday(profile.birthday));
  }, [profile.birthday]);

  const handleSave = () => {
    if (!user) return;
    
    // 组合生日
    const birthday = birthdayParts.year && birthdayParts.month && birthdayParts.day
      ? `${birthdayParts.year}-${birthdayParts.month}-${birthdayParts.day}`
      : undefined;
    
    const updatedProfile = { ...profile, birthday };
    
    const updated = store.updateUserProfile(user.id, updatedProfile);
    if (updated && onProfileUpdate) {
      onProfileUpdate(updated);
    }
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (user) {
        const updated = store.updateUserAvatar(user.id, imageUrl);
        if (updated) {
          setLocalAvatar(imageUrl);
          if (onProfileUpdate) {
            onProfileUpdate(updated);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    refreshUserData();
    setIsEditing(false);
  };

  if (!user) return null;

  const roleConfig = ROLE_CONFIG[user.role];
  const displayAvatar = localAvatar || user.avatar;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setIsEditing(false);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>个人主页</span>
            {canEdit && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-1" />
                编辑资料
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">基本信息</TabsTrigger>
            <TabsTrigger value="posts">TA的帖子 ({userPosts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Header */}
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-white shadow-lg">
                  <AvatarImage src={displayAvatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                    {user.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <h2 className="text-xl font-bold mt-4">{user.nickname}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={roleConfig.badgeColor}>
                  {roleConfig.label}
                </Badge>
                <span className="text-sm text-slate-500">
                  {user.enrollmentYear}级 {user.classNumber}班
                </span>
              </div>
              
              {!isEditing && profile.bio && (
                <p className="text-slate-600 text-center mt-3 max-w-sm">{profile.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{user.postCount}</p>
                <p className="text-xs text-slate-500">发帖</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-pink-500">{user.likeCount}</p>
                <p className="text-xs text-slate-500">获赞</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatDistanceToNow(user.createdAt).replace('前', '')}
                </p>
                <p className="text-xs text-slate-500">加入</p>
              </Card>
            </div>

            {/* Profile Details */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>个人简介</Label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="介绍一下自己..."
                    maxLength={200}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      性别
                    </Label>
                    <Select
                      value={profile.gender || 'other'}
                      onValueChange={(v) => setProfile({ ...profile, gender: v as 'male' | 'female' | 'other' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      所在地
                    </Label>
                    <Input
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="你在哪个城市？"
                    />
                  </div>
                </div>

                {/* 生日滚轮选择 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    生日
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={birthdayParts.year}
                      onValueChange={(v) => setBirthdayParts({ ...birthdayParts, year: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="年" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {BIRTH_YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={birthdayParts.month}
                      onValueChange={(v) => setBirthdayParts({ ...birthdayParts, month: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="月" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {BIRTH_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {parseInt(month)}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={birthdayParts.day}
                      onValueChange={(v) => setBirthdayParts({ ...birthdayParts, day: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="日" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {BIRTH_DAY_OPTIONS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {parseInt(day)}日
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    爱好（用逗号分隔）
                  </Label>
                  <Input
                    value={profile.hobbies?.join(', ') || ''}
                    onChange={(e) => setProfile({ ...profile, hobbies: e.target.value.split(',').map(h => h.trim()).filter(Boolean) })}
                    placeholder="例如：篮球, 音乐, 阅读"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    手机号
                  </Label>
                  <Input
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="你的手机号"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    微信号
                  </Label>
                  <Input
                    value={profile.wechat || ''}
                    onChange={(e) => setProfile({ ...profile, wechat: e.target.value })}
                    placeholder="你的微信号"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    邮箱
                  </Label>
                  <Input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="你的邮箱地址"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.gender && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">性别</p>
                      <p className="font-medium">
                        {GENDER_OPTIONS.find(g => g.value === profile.gender)?.label}
                      </p>
                    </div>
                  </div>
                )}

                {profile.birthday && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">生日</p>
                      <p className="font-medium">{profile.birthday}</p>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">所在地</p>
                      <p className="font-medium">{profile.location}</p>
                    </div>
                  </div>
                )}

                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Heart className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">爱好</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.hobbies.map((hobby, i) => (
                          <Badge key={i} variant="secondary">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Info - Only show to self or if explicitly allowed */}
                {(isOwnProfile || (profile.phone || profile.wechat || profile.email)) && (
                  <>
                    <div className="border-t border-slate-200 my-4" />
                    <h3 className="font-semibold text-slate-800 mb-3">联系方式</h3>
                    
                    {profile.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Phone className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">手机号</p>
                          <p className="font-medium">{profile.phone}</p>
                        </div>
                      </div>
                    )}

                    {profile.wechat && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">微信号</p>
                          <p className="font-medium">{profile.wechat}</p>
                        </div>
                      </div>
                    )}

                    {profile.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">邮箱</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts">
            <div className="space-y-3">
              {userPosts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>还没有发布过帖子</p>
                </div>
              ) : (
                userPosts.map((post) => (
                  <Card key={post.id} className="p-4 cursor-pointer hover:border-blue-400 transition-colors">
                    <h4 className="font-medium text-slate-800 line-clamp-1">{post.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{formatDistanceToNow(post.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {post.comments}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
