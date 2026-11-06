import React from 'react';
import { CourseSettings } from '../types';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  Settings,
  Code2,
  Bell,
  Menu,
  X,
  CheckCircle2,
  CloudAlert,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'attendance'
  | 'recap'
  | 'settings'
  | 'gas';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  settings: CourseSettings;
  invoiceAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  settings,
  invoiceAlertCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance' as NavTab, label: 'Absen', icon: ClipboardCheck },
    {
      id: 'recap' as NavTab,
      label: 'Rekap Absen',
      icon: FileSpreadsheet,
      badge: invoiceAlertCount > 0 ? invoiceAlertCount : undefined,
    },
    { id: 'classes' as NavTab, label: 'Daftar Kelas', icon: BookOpen },
    { id: 'students' as NavTab, label: 'Daftar Siswa', icon: GraduationCap },
    { id: 'teachers' as NavTab, label: 'Daftar Guru', icon: Users },
    { id: 'gas' as NavTab, label: 'Code.gs & Sheet', icon: Code2 },
    { id: 'settings' as NavTab, label: 'Pengaturan', icon: Settings },
  ];

  const hasGasUrl = Boolean(settings.gasWebAppUrl && settings.gasWebAppUrl.trim().length > 10);

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentTab('dashboard')}
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo Kursus"
                className="h-10 w-10 object-contain rounded-lg border border-zinc-700/70 bg-[#141414]"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-lg shadow-sm border border-blue-500/30">
                PK
              </div>
            )}
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-tight">
                {settings.courseName || 'Presensi Kursus'}
              </div>
              <div className="text-xs text-zinc-400 font-normal truncate max-w-[200px] sm:max-w-xs">
                {settings.slogan || 'Sistem Absensi & Database'}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-amber-500 text-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('gas')}
              title={
                hasGasUrl
                  ? 'Google Apps Script Web App Terhubung'
                  : 'Google Apps Script belum disetel (klik untuk melihat Code.gs & panduan)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                hasGasUrl
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/50 hover:bg-amber-900/50'
              }`}
            >
              {hasGasUrl ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sheets Connected</span>
                </>
              ) : (
                <>
                  <CloudAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Setup Sheets</span>
                </>
              )}
            </button>

            {invoiceAlertCount > 0 && (
              <button
                onClick={() => setCurrentTab('recap')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60 transition-colors animate-pulse cursor-pointer"
                title={`${invoiceAlertCount} siswa telah mencapai ambang batas invoice (4x / 8 jam)`}
              >
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>{invoiceAlertCount} Tagihan Siap</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {invoiceAlertCount > 0 && (
              <button
                onClick={() => setCurrentTab('recap')}
                className="p-2 text-rose-400 bg-rose-950/60 border border-rose-800/50 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#121212] px-4 pt-3 pb-5 space-y-1 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
