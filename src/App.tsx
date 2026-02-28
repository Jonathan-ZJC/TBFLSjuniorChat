import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { PostCard } from '@/components/PostCard';
import { AuthModal } from '@/components/AuthModal';
import { CreatePostModal } from '@/components/CreatePostModal';
import { PostDetailModal } from '@/components/PostDetailModal';
import { ProfileModal } from '@/components/ProfileModal';
import { AdminPanel } from '@/components/AdminPanel';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { LoginNoticeModal } from '@/components/LoginNoticeModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { User, Post, TagType, VisibilityLevel } from '@/types';
import { store, type Announcement } from '@/store';
import { Toaster, toast } from 'sonner';

function App() {
  // 状态
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 登录公告弹窗状态
  const [loginNotice, setLoginNotice] = useState<Announcement | null>(null);
  const [isLoginNoticeOpen, setIsLoginNoticeOpen] = useState(false);

  // 初始化
  useEffect(() => {
    // 检查是否已登录
    const savedUser = store.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    
    // 加载帖子
    loadPosts();
    setIsLoading(false);
  }, []);

  // 加载帖子
  const loadPosts = useCallback(() => {
    const loadedPosts = store.searchPosts({
      keyword: searchKeyword || undefined,
      tag: selectedTag || undefined,
      visibility: selectedVisibility || undefined,
      currentUser,
    });
    setPosts(loadedPosts);
  }, [searchKeyword, selectedTag, selectedVisibility, currentUser]);

  // 当筛选条件变化时重新加载
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 全局刷新
  const handleGlobalRefresh = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

  // 处理登录
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    toast.success(`欢迎回来，${user.nickname}！`);
    
    // 检查是否有登录公告需要显示
    const announcements = store.getAnnouncements();
    const activeAnnouncement = announcements.find(a => a.isActive);
    if (activeAnnouncement) {
      setLoginNotice(activeAnnouncement);
      setIsLoginNoticeOpen(true);
    }
  };

  // 处理登出
  const handleLogout = () => {
    store.setCurrentUser(null);
    setCurrentUser(null);
    toast.success('已退出登录');
  };

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  // 处理发帖成功
  const handlePostCreated = () => {
    loadPosts();
    toast.success('帖子发布成功！');
  };

  // 打开帖子详情
  const openPostDetail = (post: Post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  // 打开用户主页
  const openUserProfile = (userId: string) => {
    const user = store.getUserById(userId);
    if (user) {
      setProfileUser(user);
      setIsProfileModalOpen(true);
    }
  };

  // 打开当前用户主页
  const openCurrentUserProfile = () => {
    if (currentUser) {
      const freshUser = store.getUserById(currentUser.id);
      if (freshUser) {
        setProfileUser(freshUser);
        setIsProfileModalOpen(true);
      }
    }
  };

  // 处理个人资料更新
  const handleProfileUpdate = (updatedUser: User) => {
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      store.setCurrentUser(updatedUser);
    }
    // 刷新帖子列表以更新作者信息
    handleGlobalRefresh();
  };

  // 清空筛选
  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedTag(null);
    setSelectedVisibility(null);
  };

  // 是否有筛选条件
  const hasFilters = searchKeyword || selectedTag || selectedVisibility;

  // 检查是否是管理员
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      
      {/* Announcement Bar */}
      <div className="pt-14">
        <AnnouncementBar />
      </div>

      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onCreatePost={() => setIsCreateModalOpen(true)}
        onSearch={handleSearch}
        searchKeyword={searchKeyword}
        onOpenAdmin={isAdmin ? () => setIsAdminPanelOpen(true) : undefined}
        onOpenProfile={openCurrentUserProfile}
      />

      {/* Main Content */}
      <main className="pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20">
                <Sidebar
                  currentUser={currentUser}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                  selectedVisibility={selectedVisibility}
                  onSelectVisibility={setSelectedVisibility}
                  onLoginClick={() => setIsAuthModalOpen(true)}
                />
              </div>
            </aside>

            {/* Main Feed */}
            <div className="flex-1 min-w-0">
              {/* Filters Info */}
              {hasFilters && (
                <div className="mb-4 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>筛选条件:</span>
                    {searchKeyword && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                        关键词: {searchKeyword}
                      </span>
                    )}
                    {selectedTag && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                        标签: {selectedTag}
                      </span>
                    )}
                    {selectedVisibility && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                        范围: {selectedVisibility === 'school' ? '全校' : selectedVisibility === 'grade' ? '年级' : '班级'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    清空筛选
                  </button>
                </div>
              )}

              {/* Posts List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {hasFilters ? '没有找到相关帖子' : '还没有帖子'}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {hasFilters 
                      ? '试试调整筛选条件' 
                      : currentUser 
                        ? '来做第一个发帖的人吧！' 
                        : '登录后查看更多精彩内容'}
                  </p>
                  {currentUser ? (
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      发布帖子
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      立即登录
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onClick={() => openPostDetail(post)}
                      onLikeChange={handleGlobalRefresh}
                      onDelete={handleGlobalRefresh}
                      onAuthorClick={openUserProfile}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                {/* Quick Stats */}
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <h3 className="font-semibold text-slate-800 mb-3">论坛统计</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">总帖子</span>
                      <span className="font-medium">{store.getPosts().filter(p => !p.isDeleted).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">总用户</span>
                      <span className="font-medium">{store.getUsers().length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">今日活跃</span>
                      <span className="font-medium text-green-600">128</span>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">💡 发帖小贴士</h3>
                  <ul className="text-sm space-y-1 text-blue-100">
                    <li>• 选择合适的标签让更多人看到</li>
                    <li>• 设置正确的可见范围保护隐私</li>
                    <li>• 友善交流，共建和谐社区</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Floating Action Button - Mobile */}
      {currentUser && (
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg lg:hidden"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {currentUser && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          onSuccess={handlePostCreated}
        />
      )}

      <PostDetailModal
        post={selectedPost}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPost(null);
        }}
        currentUser={currentUser}
        onCommentAdded={handleGlobalRefresh}
      />

      <ProfileModal
        user={profileUser}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setProfileUser(null);
        }}
        currentUser={currentUser}
        onProfileUpdate={handleProfileUpdate}
        onViewPost={(post) => {
          setIsProfileModalOpen(false);
          setSelectedPost(post);
          setIsDetailModalOpen(true);
        }}
      />

      {isAdmin && currentUser && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          currentUser={currentUser}
          onDataChange={handleGlobalRefresh}
        />
      )}

      {/* 登录公告弹窗 */}
      <LoginNoticeModal
        announcement={loginNotice}
        isOpen={isLoginNoticeOpen}
        onClose={() => setIsLoginNoticeOpen(false)}
      />
    </div>
  );
}

export default App;
