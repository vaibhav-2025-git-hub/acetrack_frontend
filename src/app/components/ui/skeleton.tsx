import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
          <Skeleton width="80%" height={16} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton width="100%" height={12} />
        <Skeleton width="90%" height={12} />
        <Skeleton width="95%" height={12} />
      </div>
    </div>
  );
};

export const SkeletonSession: React.FC = () => {
  return (
    <div className="p-7 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-[26px] shadow-2xl border-2 border-white/60 space-y-4">
      <div className="flex items-start gap-5">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton width={80} height={28} className="rounded-xl" />
            <Skeleton width={80} height={28} className="rounded-xl" />
          </div>
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} />
          <Skeleton width="60%" height={16} />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton width="100%" height={48} className="rounded-2xl" />
        <Skeleton width="100%" height={48} className="rounded-2xl" />
      </div>
    </div>
  );
};
