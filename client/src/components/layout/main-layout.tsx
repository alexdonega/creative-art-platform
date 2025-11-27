import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './app-sidebar';
import { WebSocketStatus } from '../websocket-status';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });
  
  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('sidebar-collapsed');
      setIsCollapsed(stored ? JSON.parse(stored) : false);
    };
    
    // Check for changes every 100ms
    const interval = setInterval(handleStorageChange, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <main className={`min-h-screen transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <WebSocketStatus />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
