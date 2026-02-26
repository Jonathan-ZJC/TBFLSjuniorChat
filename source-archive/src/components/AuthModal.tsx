import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { store } from '@/store';
import type { User } from '@/types';
import { AvatarUpload } from './AvatarUpload';

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 验证
    if (registerData.password !== registerData.confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    // 检查用户名是否已存在
    if (store.getUserByUsername(registerData.username)) {
      setError('用户名已被使用');
      setLoading(false);
      return;
    }

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
            欢迎来到滨海小外论坛
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

              <div className="text-center text-xs text-slate-400 space-y-1">
                <p>演示账号: xiaoming2022 / 123456</p>
                <p>站主账号: ZJCjonathan25 / 123456</p>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register" className="px-6 pb-6 pt-2">
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-4">
                <Label className="mb-2">上传头像</Label>
                <AvatarUpload
                  currentAvatar={avatarUrl}
                  fallbackName={registerData.nickname || registerData.username || '?'}
                  onUpload={setAvatarUrl}
                  size="md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-username">用户名</Label>
                <Input
                  id="reg-username"
                  placeholder="设置用户名（唯一）"
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
                    placeholder="设置密码（至少6位）"
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
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
