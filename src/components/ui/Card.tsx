import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand/25 dark:hover:border-brand/30 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
