import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Eye, Trash2 } from 'lucide-react';
import type { Post, User } from '@/types';
import { TAG_CONFIG, VISIBILITY_CONFIG, ROLE_CONFIG } from '@/types';
import { store } from '@/store';
import { formatDistanceToNow, getGradeLabel } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onClick: () => void;
  onLikeChange?: () => void;
  onDelete?: () => void;
  onAuthorClick?: (userId: string) => void;
}

export function PostCard({ post, currentUser, onClick, onLikeChange, onDelete, onAuthorClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(currentUser ? post.likedBy.includes(currentUser.id) : false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const tagConfig = TAG_CONFIG[post.tag];
  const visibilityConfig = VISIBILITY_CONFIG[post.visibility];

  // 检查当前用户是否可以删除此帖子
  const canDelete = currentUser && (
    currentUser.role === 'owner' || 
    currentUser.role === 'admin' || 
    currentUser.id === post.authorId
  );

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    if (isLiked) {
      store.unlikePost(post.id, currentUser.id);
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      store.likePost(post.id, currentUser.id);
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 300);
    }

    onLikeChange?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这条帖子吗？')) return;
    
    if (!currentUser) return;
    
    if (currentUser.role === 'owner' || currentUser.role === 'admin') {
      store.deletePostByAdmin(post.id, currentUser.id, '管理员删除');
    } else if (currentUser.id === post.authorId) {
      // 用户删除自己的帖子
      store.deletePostByUser(post.id, currentUser.id);
    }
    onDelete?.();
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAuthorClick?.(post.authorId);
  };

  // 获取作者信息
  const author = store.getUserById(post.authorId);
  const authorRoleConfig = author ? ROLE_CONFIG[author.role] : null;

  return (
    <Card
      className="p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative" onClick={handleAuthorClick}>
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {post.authorName[0]}
              </AvatarFallback>
            </Avatar>
            {authorRoleConfig && authorRoleConfig.label !== '用户' && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${authorRoleConfig.badgeColor}`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p 
                className="font-medium text-slate-800 text-sm cursor-pointer hover:text-blue-600"
                onClick={handleAuthorClick}
              >
                {post.authorName}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 border border-blue-200">
                {getGradeLabel(post.authorYear)}
              </span>
              {authorRoleConfig && authorRoleConfig.label !== '用户' && (
                <span className={`text-[10px] px-1 py-0.5 rounded text-white ${authorRoleConfig.badgeColor}`}>
                  {authorRoleConfig.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {post.authorYear}级 {post.authorClass}班 · {formatDistanceToNow(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            style={{
              backgroundColor: tagConfig.bgColor,
              color: tagConfig.color,
              border: 'none',
            }}
            className="text-xs font-medium"
          >
            {post.tag}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs flex items-center gap-1"
            style={{
              borderColor: visibilityConfig.color,
              color: visibilityConfig.color,
            }}
          >
            <span>{visibilityConfig.icon}</span>
            <span className="hidden sm:inline">{visibilityConfig.label}</span>
          </Badge>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h3 className="font-semibold text-slate-800 mb-2 line-clamp-1">{post.title}</h3>
        <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {post.images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden bg-slate-100"
            >
              <img
                src={image}
                alt={`图片 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {post.images.length > 4 && (
            <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
              +{post.images.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 sm:gap-2 ${
              isLiked ? 'text-red-500' : 'text-slate-500'
            }`}
            onClick={handleLike}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLikeAnimating ? 'scale-150' : ''
              } ${isLiked ? 'fill-current' : ''}`}
            />
            <span className="text-xs sm:text-sm">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-slate-500"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs sm:text-sm">{post.comments}</span>
          </Button>

        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Eye className="w-4 h-4" />
          <span className="text-xs">{post.views}</span>
        </div>
      </div>
    </Card>
  );
}
