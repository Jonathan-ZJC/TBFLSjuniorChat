import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, Search, Plus, User, LogOut, X, Shield, UserCircle } from 'lucide-react';
import type { User as UserType } from '@/types';
import { ROLE_CONFIG } from '@/types';

interface NavbarProps {
  currentUser: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onCreatePost: () => void;
  onSearch: (keyword: string) => void;
  searchKeyword: string;
  onOpenAdmin?: () => void;
  onOpenProfile?: () => void;
}

export function Navbar({
  currentUser,
  onLoginClick,
  onLogout,
  onCreatePost,
  onSearch,
  searchKeyword,
  onOpenAdmin,
  onOpenProfile,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchKeyword);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLocalSearch(searchKeyword);
  }, [searchKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';
  const roleConfig = currentUser ? ROLE_CONFIG[currentUser.role] : null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-md'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block">
              滨海小外初中论坛
            </span>
          </div>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="搜索帖子、标签..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Create Post Button */}
            {currentUser && (
              <Button
                onClick={onCreatePost}
                className="hidden sm:flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                发布
              </Button>
            )}

            {/* Admin Button */}
            {isAdmin && onOpenAdmin && (
              <Button
                onClick={onOpenAdmin}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <Shield className="w-4 h-4" />
                管理
              </Button>
            )}

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          {currentUser.nickname[0]}
                        </AvatarFallback>
                      </Avatar>
                      {roleConfig && roleConfig.label !== '用户' && (
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${roleConfig.badgeColor}`} />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">
                      {currentUser.nickname}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{currentUser.nickname}</p>
                      {roleConfig && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${roleConfig.badgeColor}`}>
                          {roleConfig.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {currentUser.enrollmentYear}级 {currentUser.classNumber}班
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Profile */}
                  {onOpenProfile && (
                    <DropdownMenuItem onClick={onOpenProfile}>
                      <UserCircle className="w-4 h-4 mr-2" />
                      个人主页
                    </DropdownMenuItem>
                  )}
                  
                  {/* Admin Panel - Mobile */}
                  {isAdmin && onOpenAdmin && (
                    <DropdownMenuItem onClick={onOpenAdmin} className="text-purple-600">
                      <Shield className="w-4 h-4 mr-2" />
                      {currentUser.role === 'owner' ? '站主后台' : '管理面板'}
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onLoginClick}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                <User className="w-4 h-4 mr-1" />
                登录
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileMenuOpen && (
          <form onSubmit={handleSearch} className="md:hidden py-3 border-t border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="搜索帖子、标签..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
