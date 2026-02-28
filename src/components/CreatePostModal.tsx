import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ImagePlus, Tag as TagIcon, Eye, Loader2 } from 'lucide-react';
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

// 图片压缩配置
const IMAGE_CONFIG = {
  maxWidth: 1200,        // 最大宽度
  maxHeight: 1200,       // 最大高度
  quality: 0.8,          // 压缩质量
  maxSizeMB: 2,          // 最大文件大小(MB)
};

/**
 * 压缩图片
 * @param file 原始图片文件
 * @returns 压缩后的base64图片
 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 计算压缩后的尺寸
        let width = img.width;
        let height = img.height;
        
        if (width > IMAGE_CONFIG.maxWidth) {
          height = (height * IMAGE_CONFIG.maxWidth) / width;
          width = IMAGE_CONFIG.maxWidth;
        }
        if (height > IMAGE_CONFIG.maxHeight) {
          width = (width * IMAGE_CONFIG.maxHeight) / height;
          height = IMAGE_CONFIG.maxHeight;
        }
        
        // 创建canvas进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', IMAGE_CONFIG.quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export function CreatePostModal({ isOpen, onClose, currentUser, onSuccess }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [visibility, setVisibility] = useState<VisibilityLevel>('school');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 检查总图片数限制
    if (images.length + files.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }

    setIsCompressing(true);

    try {
      const newImages: string[] = [];
      
      for (const file of Array.from(files)) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} 不是图片文件，已跳过`);
          continue;
        }

        // 验证文件大小（原始文件不能超过10MB）
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} 超过10MB，已跳过`);
          continue;
        }

        // 压缩图片
        const compressed = await compressImage(file);
        
        // 检查压缩后的大小
        const sizeInMB = (compressed.length * 0.75) / (1024 * 1024);
        if (sizeInMB > IMAGE_CONFIG.maxSizeMB) {
          alert(`${file.name} 压缩后仍超过${IMAGE_CONFIG.maxSizeMB}MB，已跳过`);
          continue;
        }

        newImages.push(compressed);
      }

      setImages([...images, ...newImages]);
    } catch (error) {
      console.error('图片处理失败:', error);
      alert('图片处理失败，请重试');
    } finally {
      setIsCompressing(false);
      // 清空input，允许重复选择相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            <Label>图片（最多4张，每张不超过10MB）</Label>
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
                <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                  {isCompressing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs mt-1">添加图片</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    disabled={isCompressing}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-400">
              支持 JPG、PNG 格式，单张最大10MB，上传后自动压缩至2MB以内
            </p>
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
              disabled={!isValid || isSubmitting || isCompressing}
            >
              {isSubmitting ? '发布中...' : '发布'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
