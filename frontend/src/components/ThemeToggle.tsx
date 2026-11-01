'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme mode"
      className="p-2 rounded border border-[var(--border-dim)] bg-[var(--bg-card)] hover:border-[var(--border-bright)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-mono text-xs flex items-center gap-1.5"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline text-[10px]">LIGHT</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-cyan-600" />
          <span className="hidden sm:inline text-[10px]">DARK</span>
        </>
      )}
    </button>
  );
};
