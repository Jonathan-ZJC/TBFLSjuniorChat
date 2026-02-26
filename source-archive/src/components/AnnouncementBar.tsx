import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { store } from '@/store';

interface AnnouncementBarProps {
  onRefresh?: () => void;
}

export function AnnouncementBar({ onRefresh }: AnnouncementBarProps) {
  const [announcements, setAnnouncements] = useState<ReturnType<typeof store.getAnnouncements>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const loadAnnouncements = () => {
      const active = store.getActiveAnnouncements();
      setAnnouncements(active);
    };
    
    loadAnnouncements();
    
    // 定期刷新公告
    const interval = setInterval(loadAnnouncements, 5000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  // 自动轮播
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [announcements.length]);

  const handleDismiss = (id: string) => {
    setDismissed([...dismissed, id]);
  };

  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  const currentAnnouncement = visibleAnnouncements[currentIndex % visibleAnnouncements.length];

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Megaphone className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm">{currentAnnouncement.title}</span>
            <span className="text-sm text-white/90 ml-2">{currentAnnouncement.content}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {visibleAnnouncements.length > 1 && (
            <span className="text-xs text-white/70">
              {currentIndex + 1} / {visibleAnnouncements.length}
            </span>
          )}
          <button
            onClick={() => handleDismiss(currentAnnouncement.id)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
