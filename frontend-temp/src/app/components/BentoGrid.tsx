import React from 'react';
import styles from '../styles/Bento.module.css';

interface BentoGridProps {
  columns: 1 | 2 | 3 | 4 | 'auto-fit';
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  padding?: boolean;
}

export function BentoGrid({ 
  columns, 
  children, 
  className = "", 
  padding = true 
}: BentoGridProps) {
  const getColumnClass = () => {
    if (columns === 'auto-fit') return styles['bento-auto-fit'];
    return styles[`bento-${columns}col`];
  };

  const containerClass = [
    styles['bento-container'],
    getColumnClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} style={{ padding: padding ? undefined : '0' }}>
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'default' | 'featured' | 'no-border';
  clickable?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export function BentoCard({ 
  children, 
  className = "", 
  hover = true,
  padding = 'md',
  variant = 'default',
  clickable = false,
  loading = false,
  onClick
}: BentoCardProps) {
  const cardClass = [
    styles['bento-card'],
    !hover && styles['bento-card-no-hover'],
    padding === 'sm' && styles['bento-card-sm'],
    padding === 'lg' && styles['bento-card-lg'],
    padding === 'none' && styles['bento-card-no-padding'],
    variant === 'featured' && styles['bento-featured'],
    variant === 'no-border' && styles['bento-no-border'],
    clickable && styles['bento-clickable'],
    loading && styles['bento-loading'],
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClass} 
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {loading ? (
        <div className={styles['bento-loading']}></div>
      ) : (
        children
      )}
    </div>
  );
}

interface BentoLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  className?: string;
}

export function BentoLayout({ 
  children, 
  sidebar, 
  className = "" 
}: BentoLayoutProps) {
  if (!sidebar) {
    return (
      <div className={`${styles['bento-container']} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${styles['bento-container']} ${className}`}>
      <aside className={`${styles['bento-sidebar']}`}>
        {sidebar}
      </aside>
      <main className={`${styles['bento-main']}`}>
        {children}
      </main>
    </div>
  );
}

export default BentoGrid;
