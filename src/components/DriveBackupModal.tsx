import React, { useState } from 'react';
import { exportAppDataJSON, importAppDataJSON } from '../services/storage';
import { X, HardDrive, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface DriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const DriveBackupModal: React.FC<DriveBackupModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Google Drive Backup
  const handleDriveBackup = async () => {
    if (!accessToken.trim()) {
      setStatusMsg({ type: 'error', text: 'لطفاً کد دسترسی (Access Token) گوگل یا کلید فعال را وارد کنید.' });
      return;
    }
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const backupData = JSON.parse(exportAppDataJSON());
      const res = await fetch('/api/drive/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, backupData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: `نسخه پشتیبان با موفقیت در گوگل درایو ذخیره شد (${data.action}).` });
      } else {
        throw new Error(data.error || 'خطا در ذخیره نسخه پشتیبان در گوگل درایو');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'خطا در اتصال به گوگل درایو' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Drive Restore
  const handleDriveRestore = async () => {
    if (!accessToken.trim()) {
      setStatusMsg({ type: 'error', text: 'لطفاً کد دسترسی گوگل را وارد کنید.' });
      return;
    }
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/drive/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const success = importAppDataJSON(JSON.stringify(data.data));
        if (success) {
          onRefreshData();
          setStatusMsg({ type: 'success', text: 'اطلاعات با موفقیت از گوگل درایو بازگردانی شد.' });
        } else {
          throw new Error('فایل دانلود شده ساختار معتبری ندارد.');
        }
      } else {
        throw new Error(data.error || 'هیچ فایل پشتیبانی در گوگل درایو یافت نشد.');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'خطا در بازگردانی از گوگل درایو' });
    } finally {
      setIsLoading(false);
    }
  };

  // Local JSON Export
  const handleLocalExport = () => {
    const jsonStr = exportAppDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmsFinance_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'فایل پشتیبان محلی با موفقیت دانلود شد.' });
  };

  // Local JSON Import
  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAppDataJSON(content)) {
        onRefreshData();
        setStatusMsg({ type: 'success', text: 'اطلاعات با موفقیت از فایل محلی بازگردانی شد.' });
      } else {
        setStatusMsg({ type: 'error', text: 'ساختار فایل انتخابی نامعتبر است.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">پشتیبان‌گیری و همگام‌سازی</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div className={`p-2.5 rounded text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Section 1: Google Drive Sync */}
        <div className="space-y-2.5 bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            <span>همگام‌سازی ابری با گوگل درایو (Google Drive)</span>
          </h4>
          
          <div className="space-y-1">
            <label className="text-[11px] text-slate-700 font-medium">توکن دسترسی گوگل (OAuth Access Token):</label>
            <input
              type="password"
              placeholder="توکن OAuth گوگل..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={handleDriveBackup}
              disabled={isLoading}
              className="py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors shadow-xs"
            >
              ذخیره در گوگل درایو
            </button>
            <button
              onClick={handleDriveRestore}
              disabled={isLoading}
              className="py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded transition-colors"
            >
              بازیابی از درایو
            </button>
          </div>
        </div>

        {/* Section 2: Local File Backup */}
        <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800">پشتیبان‌گیری فایل محلی (آفلاین)</h4>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleLocalExport}
              className="py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 text-xs font-semibold rounded flex items-center justify-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>دانلود فایل JSON</span>
            </button>

            <label className="py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center justify-center gap-1 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>بارگذاری فایل</span>
              <input type="file" accept=".json" onChange={handleLocalImport} className="hidden" />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
