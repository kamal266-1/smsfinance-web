import React from 'react';
import { Transaction, Currency } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { X, Tag, MessageSquare, CreditCard, Calendar, Building2, User, Trash2 } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  currency: Currency;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  currency,
  onDelete,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
              transaction.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}
            </div>
            <h3 className="text-sm font-bold text-slate-800">جزئیات تراکنش</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Big Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-center space-y-0.5">
          <div className="text-xs text-slate-500">مبلغ تراکنش:</div>
          <div className={`text-xl font-black dir-ltr ${
            transaction.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
          }`}>
            {transaction.type === 'income' ? '+' : ''}
            {formatAmount(transaction.amount, currency)}
          </div>
          {transaction.balanceAfter && (
            <div className="text-xs text-slate-500 dir-ltr">
              مانده پس از تراکنش: {formatAmount(transaction.balanceAfter, currency)}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              طرف حساب / فروشگاه:
            </span>
            <span className="font-bold text-slate-800">{transaction.counterparty}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              بانک:
            </span>
            <span className="font-bold text-slate-800">{transaction.bankName}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              دسته‌بندی:
            </span>
            <span className="font-bold text-blue-700">{transaction.category}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              زمان تراکنش:
            </span>
            <span className="font-medium text-slate-700">{formatDate(transaction.date)}</span>
          </div>

          {transaction.ruleMatchedName && (
            <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
              <span className="text-blue-900 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                منطق قانون هوشمند:
              </span>
              <span className="font-bold text-blue-700">{transaction.ruleMatchedName}</span>
            </div>
          )}
        </div>

        {/* Original Bank SMS Raw Box */}
        {transaction.originalSmsText && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              متن کامل پیامک اصلی بانک:
            </span>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {transaction.originalSmsText}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex justify-between items-center border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('آیا مطمئن هستید؟')) {
                onDelete(transaction.id);
                onClose();
              }
            }}
            className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف تراکنش</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
