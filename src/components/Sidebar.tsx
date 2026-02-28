
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';
import type { User, TagType, VisibilityLevel } from '@/types';
import { TAG_CONFIG, VISIBILITY_CONFIG } from '@/types';
import { store } from '@/store';
import { MessageSquare, Heart, TrendingUp, Filter, Eye } from 'lucide-react';

interface SidebarProps {
  currentUser: User | null;
  selectedTag: TagType | null;
  onSelectTag: (tag: TagType | null) => void;
  selectedVisibility: VisibilityLevel | null;
  onSelectVisibility: (visibility: VisibilityLevel | null) => void;
  onLoginClick: () => void;
}

export function Sidebar({
  currentUser,
  selectedTag,
  onSelectTag,
  selectedVisibility,
  onSelectVisibility,
  onLoginClick,
}: SidebarProps) {
  const posts = store.getPosts();
  // 从store获取动态标签列表
  const TAGS = store.getTags() as TagType[];
  
  // 统计各标签帖子数
  const tagCounts = TAGS.reduce((acc, tag) => {
    acc[tag] = posts.filter((p) => p.tag === tag).length;
    return acc;
  }, {} as Record<TagType, number>);

  // 热门帖子
  const hotPosts = [...posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* User Card */}
      {currentUser ? (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {currentUser.nickname[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-800">{currentUser.nickname}</h3>
              <p className="text-sm text-slate-500">
                {currentUser.enrollmentYear}级 {currentUser.classNumber}班
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-lg font-semibold text-blue-600">{currentUser.postCount}</p>
              <p className="text-xs text-slate-500">发帖</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-lg font-semibold text-pink-500">{currentUser.likeCount}</p>
              <p className="text-xs text-slate-500">获赞</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-slate-600 mb-3">登录后查看更多内容</p>
            <Button onClick={onLoginClick} className="w-full bg-blue-500 hover:bg-blue-600">
              立即登录
            </Button>
          </div>
        </Card>
      )}

      {/* Tag Filter */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          标签筛选
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectTag(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTag === null
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部
          </button>
          {TAGS.map((tag) => {
            const config = TAG_CONFIG[tag];
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'ring-2 ring-offset-1'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isSelected ? config.color : config.bgColor,
                  color: isSelected ? '#fff' : config.color,
                  '--tw-ring-color': config.color,
                } as React.CSSProperties}
              >
                {tag}
                <span className="text-xs opacity-70">({tagCounts[tag]})</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Visibility Filter */}
      {currentUser && (
        <Card className="p-4">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            可见范围
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onSelectVisibility(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedVisibility === null
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              全部范围
            </button>
            {(['school', 'grade', 'class'] as VisibilityLevel[]).map((level) => {
              const config = VISIBILITY_CONFIG[level];
              const isSelected = selectedVisibility === level;
              return (
                <button
                  key={level}
                  onClick={() => onSelectVisibility(isSelected ? null : level)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                  {level === 'grade' && currentUser && (
                    <span className="text-xs opacity-60">({currentUser.enrollmentYear}年级)</span>
                  )}
                  {level === 'class' && currentUser && (
                    <span className="text-xs opacity-60">({currentUser.classNumber}班)</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Hot Posts */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          热门帖子
        </h3>
        <div className="space-y-3">
          {hotPosts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded text-xs flex items-center justify-center font-medium text-slate-600">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 line-clamp-2">{post.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
