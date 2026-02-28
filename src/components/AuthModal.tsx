import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, UserPlus, LogIn, AlertTriangle } from 'lucide-react';
import { store } from '@/store';
import type { User } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 获取系统设置
  const settings = store.getSettings();

  // 登录表单
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  // 注册表单
  const [registerData, setRegisterData] = useState({
    username: '',
    nickname: '',
    enrollmentYear: '',
    classNumber: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = store.getUserByUsername(loginData.username);
    if (!user || user.password !== loginData.password) {
      setError('用户名或密码错误');
      setLoading(false);
      return;
    }

    // 检查是否被禁言
    if (store.isUserBanned(user.id)) {
      setError('您的账号已被禁言，请联系管理员');
      setLoading(false);
      return;
    }

    store.setCurrentUser(user);
    onLogin(user);
    setLoading(false);
    onClose();
  };

  const validateRegister = (): boolean => {
    if (!registerData.username.trim()) {
      setError('请输入用户名');
      return false;
    }
    if (!registerData.nickname.trim()) {
      setError('请输入昵称');
      return false;
    }
    if (!registerData.enrollmentYear) {
      setError('请选择入学年份');
      return false;
    }
    if (!registerData.classNumber) {
      setError('请选择班级');
      return false;
    }
    if (!registerData.password || registerData.password.length < 6) {
      setError('密码长度至少6位');
      return false;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    return true;
  };

  const handleShowConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateRegister()) return;
    
    // 检查用户名是否已存在
    if (store.getUserByUsername(registerData.username)) {
      setError('用户名已被使用');
      return;
    }

    // 显示确认弹窗
    setShowConfirmDialog(true);
  };

  const handleRegister = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    // 创建用户
    const newUser = store.createUser({
      username: registerData.username,
      nickname: registerData.nickname || registerData.username,
      enrollmentYear: parseInt(registerData.enrollmentYear),
      classNumber: parseInt(registerData.classNumber),
      password: registerData.password,
      avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerData.username}`,
    });

    store.setCurrentUser(newUser);
    onLogin(newUser);
    setLoading(false);
    onClose();
  };

  const resetForm = () => {
    setLoginData({ username: '', password: '' });
    setRegisterData({
      username: '',
      nickname: '',
      enrollmentYear: '',
      classNumber: '',
      password: '',
      confirmPassword: '',
    });
    setAvatarUrl('');
    setError('');
    setShowConfirmDialog(false);
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
      setAvatarUrl(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-center text-xl font-bold text-slate-800">
            欢迎来到滨海小外初中论坛
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-6 w-[calc(100%-3rem)]">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              登录
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              注册
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="px-6 pb-6 pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">用户名</Label>
                <Input
                  id="login-username"
                  placeholder="请输入用户名"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">密码</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="px-6 pb-6 pt-2">
            <form onSubmit={handleShowConfirm} className="space-y-3">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-4">
                <Label className="mb-2">上传头像</Label>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md">
                    <span className="text-lg">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-username">用户名</Label>
                <Input
                  id="reg-username"
                  placeholder="设置用户名（唯一，注册后不可更改）"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-nickname">昵称</Label>
                <Input
                  id="reg-nickname"
                  placeholder="设置显示昵称"
                  value={registerData.nickname}
                  onChange={(e) => setRegisterData({ ...registerData, nickname: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>入学年份</Label>
                  <Select
                    value={registerData.enrollmentYear}
                    onValueChange={(value) => setRegisterData({ ...registerData, enrollmentYear: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择年份" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.enrollmentYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>班级</Label>
                  <Select
                    value={registerData.classNumber}
                    onValueChange={(value) => setRegisterData({ ...registerData, classNumber: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择班级" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.classNumbers.map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}班
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">密码</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="设置密码（至少6位，注册后不可更改）"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">确认密码</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="再次输入密码"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                下一步
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* 注册确认弹窗 */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
              <div className="flex items-center gap-2 text-amber-500 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-semibold text-lg">注册确认</h3>
              </div>
              
              <div className="space-y-3 text-sm text-slate-600 mb-6">
                <p>请仔细核对以下信息，<strong>注册后无法更改</strong>：</p>
                <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                  <p><span className="text-slate-400">用户名：</span>{registerData.username}</p>
                  <p><span className="text-slate-400">昵称：</span>{registerData.nickname}</p>
                  <p><span className="text-slate-400">入学年份：</span>{registerData.enrollmentYear}年</p>
                  <p><span className="text-slate-400">班级：</span>{registerData.classNumber}班</p>
                </div>
                <p className="text-red-500 text-xs">⚠️ 年级、班级、用户名、密码注册后均不可修改，请确认无误！</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  返回修改
                </Button>
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? '注册中...' : '确认注册'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
