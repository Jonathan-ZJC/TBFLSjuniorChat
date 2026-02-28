import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Heart, MessageCircle, Eye, Send, Trash2 } from 'lucide-react';
import type { Post, Comment, User } from '@/types';
import { TAG_CONFIG, VISIBILITY_CONFIG } from '@/types';
import { store } from '@/store';
import { formatDistanceToNow } from '@/lib/utils';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onCommentAdded?: () => void;
}

export function PostDetailModal({ post, isOpen, onClose, currentUser, onCommentAdded }: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post && isOpen) {
      // 增加浏览量
      store.incrementViews(post.id);
      
      // 加载评论
      const postComments = store.getCommentsByPost(post.id);
      setComments(postComments);
      
      // 设置点赞状态
      setIsLiked(currentUser ? post.likedBy.includes(currentUser.id) : false);
      setLikeCount(post.likes);
    }
  }, [post, isOpen, currentUser]);

  const handleLike = () => {
    if (!currentUser || !post) return;

    if (isLiked) {
      store.unlikePost(post.id, currentUser.id);
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      store.likePost(post.id, currentUser.id);
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !post || !newComment.trim()) return;

    setIsSubmitting(true);

    const comment = store.createComment({
      postId: post.id,
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorAvatar: currentUser.avatar,
      content: newComment.trim(),
    });

    if (!comment) {
      setIsSubmitting(false);
      return;
    }

    setComments([...comments, comment]);
    setNewComment('');
    setIsSubmitting(false);
    onCommentAdded?.();
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    // 用户只能删除自己的评论，管理员/站主可以删除任意评论
    const canDelete = currentUser.id === comment.authorId || 
                      currentUser.role === 'admin' || 
                      currentUser.role === 'owner';
    
    if (!canDelete) return;
    
    if (confirm('确定要删除这条评论吗？')) {
      if (currentUser.role === 'admin' || currentUser.role === 'owner') {
        store.deleteCommentByAdmin(commentId, currentUser.id);
      } else {
        store.deleteCommentByUser(commentId, currentUser.id);
      }
      // 刷新评论列表
      if (post) {
        setComments(store.getCommentsByPost(post.id));
      }
      onCommentAdded?.();
    }
  };

  if (!post) return null;

  const tagConfig = TAG_CONFIG[post.tag];
  const visibilityConfig = VISIBILITY_CONFIG[post.visibility];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              {/* Author Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {post.authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800">{post.authorName}</p>
                    <p className="text-sm text-slate-500">
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
                  >
                    {post.tag}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1"
                    style={{
                      borderColor: visibilityConfig.color,
                      color: visibilityConfig.color,
                    }}
                  >
                    <span>{visibilityConfig.icon}</span>
                    {visibilityConfig.label}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* Post Content */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-3">{post.title}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Images */}
            {post.images.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-3">
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-100"
                  >
                    <img
                      src={image}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between py-4 border-y border-slate-100 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-slate-500'}`}
                  onClick={handleLike}
                  disabled={!currentUser}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </Button>

                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-slate-500">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </Button>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <Eye className="w-4 h-4" />
                <span>{post.views + 1}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">
                评论 ({comments.length})
              </h3>

              {/* Comment Input */}
              {currentUser ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {currentUser.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="写下你的评论..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="resize-none mb-2"
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                          {newComment.length}/500
                        </span>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                          disabled={!newComment.trim() || isSubmitting}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          发送
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 text-center mb-6">
                  <p className="text-slate-500 mb-2">登录后参与评论</p>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                    立即登录
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无评论，来说两句吧~</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {comment.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-slate-800">
                              {comment.authorName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">
                                {formatDistanceToNow(comment.createdAt)}
                              </span>
                              {/* 删除评论按钮 - 用户可删自己的，管理员/站主可删任意 */}
                              {currentUser && (
                                (currentUser.id === comment.authorId || 
                                 currentUser.role === 'admin' || 
                                 currentUser.role === 'owner') && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="删除评论"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
