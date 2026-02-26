import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ImagePlus, Tag as TagIcon, Eye } from 'lucide-react';
import type { User, TagType, VisibilityLevel } from '@/types';
import { TAG_CONFIG, VISIBILITY_CONFIG } from '@/types';
import { store } from '@/store';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: () => void;
}

const VISIBILITY_OPTIONS: VisibilityLevel[] = ['school', 'grade', 'class'];

export function CreatePostModal({ isOpen, onClose, currentUser, onSuccess }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [visibility, setVisibility] = useState<VisibilityLevel>('school');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 从store获取动态标签列表
  const TAGS = store.getTags() as TagType[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedTag) return;

    setIsSubmitting(true);

    store.createPost({
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorAvatar: currentUser.avatar,
      authorYear: currentUser.enrollmentYear,
      authorClass: currentUser.classNumber,
      title: title.trim(),
      content: content.trim(),
      images,
      tag: selectedTag,
      visibility,
    });

    setIsSubmitting(false);
    resetForm();
    onSuccess();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTag(null);
    setVisibility('school');
    setImages([]);
  };

  const handleImageUpload = () => {
    // 模拟图片上传
    const mockImages = [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setImages([...images, randomImage]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const isValid = title.trim() && content.trim() && selectedTag;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">发布帖子</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="写一个吸引人的标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
            />
            <div className="text-right text-xs text-slate-400">
              {title.length}/50
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              placeholder="分享你的想法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-right text-xs text-slate-400">
              {content.length}/1000
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>图片</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={image}
                    alt={`上传图片 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs mt-1">添加图片</span>
                </button>
              )}
            </div>
          </div>

          {/* Tag Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              选择标签
            </Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const config = TAG_CONFIG[tag];
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-1'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: config.bgColor,
                      color: config.color,
                      '--tw-ring-color': isSelected ? config.color : 'transparent',
                    } as React.CSSProperties}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              可见范围
            </Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as VisibilityLevel)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((level) => {
                  const config = VISIBILITY_CONFIG[level];
                  return (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                        <span className="text-slate-400 text-xs">
                          {level === 'school' && ' - 全校可见'}
                          {level === 'grade' && ` - ${currentUser.enrollmentYear}年级可见`}
                          {level === 'class' && ` - ${currentUser.enrollmentYear}级${currentUser.classNumber}班可见`}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? '发布中...' : '发布'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
