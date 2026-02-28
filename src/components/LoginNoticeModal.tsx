import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, Clock } from 'lucide-react';
import type { Announcement } from '@/store';

interface LoginNoticeModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LoginNoticeModal({ announcement, isOpen, onClose }: LoginNoticeModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanClose(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || canClose) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, canClose]);

  if (!announcement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && canClose) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => {
        if (!canClose) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Megaphone className="w-5 h-5" />
            {announcement.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {announcement.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
            <span>发布者: {announcement.createdByName}</span>
            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            disabled={!canClose}
            className={`transition-all ${
              canClose 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {canClose ? (
              '我知道了'
            ) : (
              <>
                <Clock className="w-4 h-4 mr-1" />
                {countdown}秒后可关闭
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
