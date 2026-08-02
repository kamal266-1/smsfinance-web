import React from 'react';
import { Transaction, AppStats, Currency, Rule } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Tag, 
  Zap, 
  MessageSquarePlus,
  ChevronLeft
} from 'lucide-react';

interface DashboardViewProps {
  stats: AppStats;
  currency: Currency;
  recentTransactions: Transaction[];
  rules: Rule[];
  onOpenQuickEntry: (category?: string) => void;
  onOpenSmsImporter: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onViewAllTransactions: () => void;
  onViewRules: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  currency,
  recentTransactions,
  rules,
  onOpenQuickEntry,
  onOpenSmsImporter,
  onSelectTransaction,
  onViewAllTransactions,
  onViewRules,
}) => {
  const isPositiveCashFlow = stats.netCashFlow >= 0;

  // Compute category totals
  const categoryTotals: Record<string, number> = {};
  recentTransactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalExpenseSum = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* 30-Second Financial Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-800">وضعیت مالی امروز در یک نگاه</h2>
          </div>
          <span className="text-[11px] text-slate-500">به‌روزرسانی خودکار پیامک‌ها</span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 1. Total Balance */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>موجودی کل (آخرین پیامک‌ها)</span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 dir-ltr text-right">
              {formatAmount(stats.totalBalance, currency)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">محاسبه‌شده بر اساس مانده بانک</p>
          </div>

          {/* 2. Estimated Net Cash Flow / Profit */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3 relative">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-700">سود/جریان مالی این ماه</span>
                <div className="group relative cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <div className="hidden group-hover:block absolute z-20 w-64 p-2 text-[11px] bg-slate-900 text-slate-200 rounded border border-slate-700 shadow-lg right-0 top-5">
                    این مقدار صرفاً از اختلاف ورودی و خروجی پول در این ماه محاسبه شده و معادل سود حسابداری یا مالیاتی نیست.
                  </div>
                </div>
              </div>
              {isPositiveCashFlow ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
            </div>
            <div className={`text-lg font-bold dir-ltr text-right ${isPositiveCashFlow ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPositiveCashFlow ? '+' : ''}{formatAmount(stats.netCashFlow, currency)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">خالص ورود و خروج نقدینگی</p>
          </div>

          {/* 3. Monthly Income vs Expense */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3">
            <div className="text-xs text-slate-500 mb-1">ورودی و خروجی ماه جاری</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700 flex items-center gap-1 font-medium">
                  <ArrowDownRight className="w-3.5 h-3.5" /> ورودی:
                </span>
                <span className="font-bold text-slate-800 dir-ltr">{formatAmount(stats.monthIncome, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-700 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" /> خروجی:
                </span>
                <span className="font-bold text-slate-800 dir-ltr">{formatAmount(stats.monthExpense, currency)}</span>
              </div>
            </div>
          </div>

          {/* 4. Pending Cheques / Commitments */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>تعهدات & چک‌های سررسید نشده</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-800 font-medium">چک پرداختی:</span>
                <span className="font-bold text-slate-800 dir-ltr">{formatAmount(stats.pendingPayableCheques, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">چک دریافتی:</span>
                <span className="font-bold text-slate-800 dir-ltr">{formatAmount(stats.pendingReceivableCheques, currency)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Fast Actions (<5 Second Entry Target) */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-800">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold">ثبت سریع خرید (کمتر از ۵ ثانیه):</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => onOpenQuickEntry('خرید روزمره & سوپرمارکت')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors"
          >
            🛒 سوپرمارکت
          </button>
          <button
            onClick={() => onOpenQuickEntry('حمل و نقل & بنزین')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors"
          >
            ⛽ بنزین / اسنپ
          </button>
          <button
            onClick={() => onOpenQuickEntry('رستوران & کافه')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors"
          >
            ☕ کافه / ناهار
          </button>
          <button
            onClick={onOpenSmsImporter}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded border border-blue-200 transition-colors flex items-center gap-1 mr-auto sm:mr-0"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>تست پیامک بانکی</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Recent Transactions List (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">آخرین تراکنش‌های پیامکی</h3>
            <button
              onClick={onViewAllTransactions}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {recentTransactions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                هیچ تراکنشی ثبت نشده است. از دکمه «ورود پیامک» یا «ثبت دستی» استفاده کنید.
              </div>
            ) : (
              recentTransactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="bg-white hover:bg-slate-50 border border-slate-100 rounded-md p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-xs">{tx.counterparty}</span>
                        {tx.ruleMatchedName && (
                          <span 
                            onClick={(e) => { e.stopPropagation(); onViewRules(); }}
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 flex items-center gap-1 font-medium"
                            title="مطابقت داده شده بر اساس قانون"
                          >
                            <Tag className="w-2.5 h-2.5 text-blue-600" />
                            {tx.ruleMatchedName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{tx.bankName}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div
                      className={`font-bold text-xs dir-ltr ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : ''}
                      {formatAmount(tx.amount, currency)}
                    </div>
                    {tx.balanceAfter && (
                      <div className="text-[10px] text-slate-400 mt-0.5 dir-ltr">
                        مانده: {formatAmount(tx.balanceAfter, currency)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Expenses & Rule engine stats (1 Col) */}
        <div className="space-y-4">
          
          {/* Expenses by Category */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">دسته‌بندی هزینه‌ها</h3>
            <div className="space-y-2.5">
              {sortedCategories.length === 0 ? (
                <p className="text-xs text-slate-400">هنوز هزینه‌ای ثبت نشده است.</p>
              ) : (
                sortedCategories.map(([cat, amt]) => {
                  const pct = Math.round((amt / totalExpenseSum) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-medium">{cat}</span>
                        <span className="text-slate-500 dir-ltr">{formatAmount(amt, currency)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rule Engine Widget */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">موتور قوانین هوشمند</h3>
              <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                {rules.filter(r => r.isActive).length} قانون فعال
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              پیامک‌های بانکی بدون مداخله دستی و طبق قوانین تعریف‌شده شفاف دسته‌بندی می‌شوند.
            </p>
            <button
              onClick={onViewRules}
              className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-200 transition-colors"
            >
              مدیریت و ویرایش قوانین پیامک
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
