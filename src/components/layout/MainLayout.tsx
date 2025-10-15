import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Video,
  Brain,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export type TabId = 'dashboard' | 'recordings' | 'insights';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recordings', label: 'Recordings', icon: Video },
  { id: 'insights', label: 'AI Insights', icon: Brain },
];

interface MainLayoutProps {
  children: ReactNode;
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  sidebar?: ReactNode;
  isSyncing?: boolean;
  onSync?: () => void;
}

export default function MainLayout({
  children,
  currentTab,
  onTabChange,
  sidebar,
  isSyncing = false,
  onSync,
}: MainLayoutProps) {
  const { userEmail, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hidden sm:block">
                  MeetingHub Pro
                </h1>
              </div>

              <nav className="hidden lg:flex items-center gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        'relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                        isActive
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                  )}
                />
                <span className="text-sm text-gray-600 hidden sm:block">
                  {isSyncing ? 'Syncing...' : 'Synced'}
                </span>
              </div>

              {onSync && (
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh calendar"
                >
                  <RefreshCw className={cn('w-5 h-5 text-gray-600', isSyncing && 'animate-spin')} />
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {userEmail?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-700 hidden md:block">{userEmail}</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <nav className="flex lg:hidden items-center gap-1 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-sm',
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="max-w-[1920px] mx-auto flex">
        {sidebar && (
          <>
            <aside
              className={cn(
                'hidden xl:block bg-white border-r border-gray-200 transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto',
                sidebarCollapsed ? 'w-16' : 'w-80'
              )}
            >
              <div className="p-4">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="w-full flex items-center justify-end p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {!sidebarCollapsed && sidebar}
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
