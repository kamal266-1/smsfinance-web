import React from 'react';
import { 
  Wallet, 
  Plus, 
  MessageSquare, 
  Sliders, 
  HardDrive, 
  FileCheck2, 
  RefreshCw,
  Search
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'transactions' | 'rules' | 'cheques' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'rules' | 'cheques' | 'reports') => void;
  currency: 'IRT' | 'IRR';
  setCurrency: (curr: 'IRT' | 'IRR') => void;
  onOpenQuickEntry: () => void;
  onOpenSmsImporter: () => void;
  onOpenDriveBackup: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenQuickEntry,
  onOpenSmsImporter,
  onOpenDriveBackup,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="bg-[#0F172A] border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-inner">
              <Wallet className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">SmsFinance</h1>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
                  دفتر مالی پیامکی
                </span>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در تراکنش‌ها، بانک یا طرف حساب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-md pr-8 pl-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            
            {/* Currency Toggle */}
            <button
              onClick={() => setCurrency(currency === 'IRT' ? 'IRR' : 'IRT')}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 transition-colors flex items-center gap-1"
              title="تغییر واحد پول (تومان / ریال)"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{currency === 'IRT' ? 'تومان' : 'ریال'}</span>
            </button>

            {/* Google Drive Sync */}
            <button
              onClick={onOpenDriveBackup}
              className="p-1.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
              title="پشتیبان‌گیری گوگل درایو"
            >
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">درایو</span>
            </button>

            {/* SMS Simulator / Importer */}
            <button
              onClick={onOpenSmsImporter}
              className="px-2.5 py-1 text-xs font-medium rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">ورود پیامک</span>
            </button>

            {/* Quick Manual Entry */}
            <button
              onClick={onOpenQuickEntry}
              className="px-3 py-1 text-xs font-bold rounded bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت دستی</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 space-x-reverse overflow-x-auto py-1.5 border-t border-slate-800/80 no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            داشبورد ۳۰ ثانیه‌ای
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            لیست تراکنش‌ها
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>قوانین پیامک</span>
          </button>
          <button
            onClick={() => setActiveTab('cheques')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'cheques'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>چک و تعهدات</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
