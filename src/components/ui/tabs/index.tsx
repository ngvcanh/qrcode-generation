import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  mode?: 'filled' | 'outlined' | 'mix' | 'top';
  className?: string;
  tabClassName?: string;
  variant?: 'default' | 'compact';
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  mode = 'filled',
  className,
  tabClassName,
  variant = 'default'
}: TabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll availability
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [tabs]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  const getTabStyles = (isActive: boolean) => {
    const baseStyles = cn(
      'relative px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 flex-shrink-0 whitespace-nowrap',
      variant === 'compact' && 'px-3 py-2 text-sm',
      tabClassName
    );

    switch (mode) {
      case 'filled':
        return cn(
          baseStyles,
          isActive
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-300'
        );
      
      case 'outlined':
        return cn(
          baseStyles,
          'rounded-none px-6 py-4',
          variant === 'compact' && 'px-4 py-3',
          isActive
            ? 'text-blue-400'
            : 'text-slate-400 hover:text-slate-300'
        );

      case 'top':
        return cn(
          baseStyles,
          'rounded-none px-6 py-4',
          variant === 'compact' && 'px-4 py-3',
          isActive
            ? 'text-blue-400'
            : 'text-slate-400 hover:text-slate-300'
        );
      
      case 'mix':
        return cn(
          baseStyles,
          isActive
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-300'
        );
      
      default:
        return baseStyles;
    }
  };

  const getIndicatorStyles = () => {
    switch (mode) {
      case 'filled':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg';
      
      case 'outlined':
        return 'bg-blue-500 h-0.5 bottom-0 rounded-none';

      case 'top':
        return 'bg-blue-500 h-0.5 top-0 rounded-none';
      
      case 'mix':
        return 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-b-2 border-blue-400 rounded-lg';
      
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg';
    }
  };

  const containerStyles = cn(
    'relative flex overflow-x-auto scrollbar-hide flex-1 min-w-0',
    (mode === 'outlined' || mode === 'top') ? '' : 'bg-slate-800 rounded-xl p-1',
    mode === 'mix' && 'bg-slate-800 rounded-xl p-1 border-b border-slate-700'
  );

  // Determine which modes use background indicators vs per-tab indicators
  const useBackgroundIndicator = mode === 'filled' || mode === 'mix';
  const usePerTabIndicator = mode === 'outlined' || mode === 'top';

  return (
    <div className={cn("relative flex items-center max-w-full", className)}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="flex-shrink-0 p-1.5 mr-2 bg-slate-700/80 hover:bg-slate-600 rounded-full shadow-lg backdrop-blur-sm transition-colors z-20"
        >
          <ChevronLeft className="w-4 h-4 text-slate-300" />
        </button>
      )}

      {/* Tabs container */}
      <div 
        ref={scrollContainerRef}
        className={containerStyles}
        onScroll={checkScroll}
      >
        {/* Tab buttons */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative z-10 flex-shrink-0',
                useBackgroundIndicator ? 'text-center' : '',
                getTabStyles(isActive)
              )}
            >
              {/* Background indicator for filled and mix modes - per tab */}
              {useBackgroundIndicator && isActive && (
                <motion.div
                  className={cn('absolute inset-0 z-0', getIndicatorStyles())}
                  layoutId={`backgroundIndicator-${mode}`}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}

              <div className="relative z-10 flex items-center gap-2">
                {Icon && (
                  <Icon className={cn(
                    'w-4 h-4 flex-shrink-0',
                    variant === 'compact' && 'w-3.5 h-3.5'
                  )} />
                )}
                <span>{tab.label}</span>
              </div>
              
              {/* Individual indicator for outlined and top modes */}
              {usePerTabIndicator && isActive && (
                <motion.div
                  className={cn(
                    'absolute left-0 right-0',
                    mode === 'outlined' ? 'bottom-0 h-0.5 bg-blue-500' : '',
                    mode === 'top' ? 'top-0 h-0.5 bg-blue-500' : ''
                  )}
                  layoutId={`activeTab-${mode}`}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="flex-shrink-0 p-1.5 ml-2 bg-slate-700/80 hover:bg-slate-600 rounded-full shadow-lg backdrop-blur-sm transition-colors z-20"
        >
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      )}
    </div>
  );
}
