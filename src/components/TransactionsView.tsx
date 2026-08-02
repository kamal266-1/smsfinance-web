import React, { useState } from 'react';
import { Transaction, Currency, FilterState } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { DEFAULT_CATEGORIES } from '../data/bankTemplates';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Search, 
  MessageSquare, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  currency: Currency;
  onDeleteTransaction: (id: string) => void;
  onOpenQuickEntry: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  currency,
  onDeleteTransaction,
  onOpenQuickEntry,
  onSelectTransaction,
  searchQuery,
  setSearchQuery,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBank, setFilterBank] = useState<string>('all');

  // Unique bank names
  const bankNames = Array.from(new Set(transactions.map(t => t.bankName))).filter(Boolean);

  // Filter transactions
  const filteredTxs = transactions.filter(t => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.counterparty.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.bankName.toLowerCase().includes(q) ||
        (t.originalSmsText && t.originalSmsText.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // Type filter
    if (filterType !== 'all' && t.type !== filterType) return false;

    // Category filter
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;

    // Bank filter
    if (filterBank !== 'all' && t.bankName !== filterBank) return false;

    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Top Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>مدیریت تراکنش‌های مالی</span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-semibold">
              {filteredTxs.length} تراکنش
            </span>
          </h2>
          <button
            onClick={onOpenQuickEntry}
            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت تراکنش جدید</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو نام، پیامک، بانک..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pr-8 pl-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">همه انواع (ورودی & خروجی)</option>
            <option value="expense">فقط هزینه‌ها (خروجی)</option>
            <option value="income">فقط درآمدها (ورودی)</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {DEFAULT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Bank Filter */}
          <select
            value={filterBank}
            onChange={(e) => setFilterBank(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">همه بانک‌ها</option>
            {bankNames.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {filteredTxs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs space-y-2">
            <p>هیچ تراکنشی منطبق با فیلترهای انتخاب شده یافت نشد.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTxs.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-3 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{tx.counterparty}</span>
                      
                      {tx.ruleMatchedName && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 font-medium">
                          <Tag className="w-2.5 h-2.5 text-blue-600" />
                          قانون: {tx.ruleMatchedName}
                        </span>
                      )}

                      {tx.isManual && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                          ثبت دستی
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="text-slate-700 font-medium">{tx.bankName}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>

                    {tx.originalSmsText && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded p-1.5 mt-1 flex items-start gap-1 max-w-xl">
                        <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{tx.originalSmsText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <div
                      className={`font-bold text-sm dir-ltr ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : ''}
                      {formatAmount(tx.amount, currency)}
                    </div>
                    {tx.balanceAfter && (
                      <div className="text-[10px] text-slate-400 dir-ltr">
                        مانده: {formatAmount(tx.balanceAfter, currency)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                    title="حذف تراکنش"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
