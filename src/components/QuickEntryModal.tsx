import React, { useState, useEffect } from 'react';
import { Transaction, Currency, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/bankTemplates';
import { X, Check, Zap } from 'lucide-react';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'deduplicationHash'>) => void;
  currency: Currency;
  initialCategory?: string;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  initialCategory,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountInput, setAmountInput] = useState<string>('');
  const [counterparty, setCounterparty] = useState<string>('');
  const [category, setCategory] = useState<string>(initialCategory || DEFAULT_CATEGORIES[0]);
  const [bankName, setBankName] = useState<string>('نقدی / کارت دستی');

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  if (!isOpen) return null;

  const handleAddQuickAmount = (val: number) => {
    const current = parseInt(amountInput || '0', 10);
    setAmountInput((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseInt(amountInput.replace(/,/g, ''), 10);
    if (!rawVal || rawVal <= 0) return;

    // Convert input to Rials if currency is IRT
    const amountInRials = currency === 'IRT' ? rawVal * 10 : rawVal;

    onSave({
      type,
      amount: amountInRials,
      currency,
      date: new Date().toISOString(),
      category: category || 'متفرقه',
      counterparty: counterparty.trim() || (type === 'expense' ? 'خرید نقدی' : 'درآمد نقدی'),
      bankName: bankName || 'نقدی',
      isManual: true,
    });

    // Reset
    setAmountInput('');
    setCounterparty('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">ثبت سریع تراکنش (زیر ۵ ثانیه)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Expense / Income Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded border border-slate-200">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-xs font-bold rounded transition-colors ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              هزینه (پرداخت)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-bold rounded transition-colors ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              درآمد (دریافت)
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              مبلغ ({currency === 'IRT' ? 'تومان' : 'ریال'}):
            </label>
            <div className="relative">
              <input
                type="number"
                required
                autoFocus
                placeholder="مثلا 150000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 dir-ltr text-right"
              />
            </div>
            {/* Quick addition chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[50000, 100000, 500000, 1000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium dir-ltr"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Counterparty / Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">طرف حساب / فروشگاه:</label>
            <input
              type="text"
              placeholder="مثلا: فروشگاه احمد، کافه، اسنپ..."
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">دسته‌بندی:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره فوری تراکنش</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
