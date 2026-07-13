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
      className={`bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-xl shadow-sm overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
