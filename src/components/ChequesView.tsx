import React, { useState } from 'react';
import { Cheque, Currency, ChequeType, Transaction } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { 
  FileCheck2, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

interface ChequesViewProps {
  cheques: Cheque[];
  currency: Currency;
  onSaveCheque: (cheque: Cheque) => void;
  onDeleteCheque: (id: string) => void;
  onSettleCheque: (cheque: Cheque) => void;
}

export const ChequesView: React.FC<ChequesViewProps> = ({
  cheques,
  currency,
  onSaveCheque,
  onDeleteCheque,
  onSettleCheque,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form state
  const [type, setType] = useState<ChequeType>('payable');
  const [amountInput, setAmountInput] = useState<string>('');
  const [counterparty, setCounterparty] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0]);
  const [bankName, setBankName] = useState<string>('بانک صادرات');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseInt(amountInput.replace(/,/g, ''), 10);
    if (!rawVal || rawVal <= 0) return;

    const amountInRials = currency === 'IRT' ? rawVal * 10 : rawVal;

    const newCheque: Cheque = {
      id: `chq_${Date.now()}`,
      type,
      amount: amountInRials,
      counterparty: counterparty.trim() || 'طرف حساب چک',
      dueDate: new Date(dueDate).toISOString(),
      bankName: bankName || 'بانک',
      chequeNumber: chequeNumber.trim() || '---',
      status: 'pending',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveCheque(newCheque);
    setIsAdding(false);
    setAmountInput('');
    setCounterparty('');
    setChequeNumber('');
    setNotes('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Explanation Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800">مدیریت چک‌ها و تعهدات مالی</h2>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت چک جدید</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          ثبت چک به منزله «تعهد» است و تا زمان وصول یا پاس شدن، جزو تراکنش‌های نقدی اصلی محاسبه نمی‌شود. با کلیک بر روی دکمه «وصول / پاس شد»، تراکنش واقعی ثبت می‌گردد.
        </p>
      </div>

      {/* New Cheque Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border border-blue-200 rounded-lg p-4 space-y-3 shadow-xs animate-fade-in">
          <h3 className="text-xs font-bold text-blue-700 border-b border-slate-100 pb-2">ثبت تعهد چک جدید</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">نوع چک:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ChequeType)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="payable">پرداختی (باید پرداخت کنید)</option>
                <option value="receivable">دریافتی (طلب شما)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">مبلغ ({currency === 'IRT' ? 'تومان' : 'ریال'}):</label>
              <input
                type="number"
                required
                placeholder="مثلا 5000000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 dir-ltr text-right focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">طرف حساب (گیرنده/صادرکننده):</label>
              <input
                type="text"
                required
                placeholder="نام شخص یا شرکت..."
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">تاریخ سررسید:</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">شماره چک / صیادی:</label>
              <input
                type="text"
                placeholder="مثلا: 998124"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">نام بانک:</label>
              <input
                type="text"
                placeholder="مثلا: بانک صادرات"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded hover:bg-slate-200"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500"
            >
              ثبت تعهد
            </button>
          </div>
        </form>
      )}

      {/* Cheques List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {cheques.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            هیچ چکی ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cheques.map((c) => (
              <div key={c.id} className="p-3 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                    c.type === 'receivable'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {c.type === 'receivable' ? 'دریافتی' : 'پرداختی'}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{c.counterparty}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                        c.status === 'cleared'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {c.status === 'cleared' ? 'پاس شده (تسویه)' : 'در انتظار سررسید'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                      <span>بانک: {c.bankName}</span>
                      <span>•</span>
                      <span>شماره چک: {c.chequeNumber}</span>
                      <span>•</span>
                      <span>سررسید: {formatDate(c.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <div className="font-bold text-xs text-slate-900 dir-ltr">
                      {formatAmount(c.amount, currency)}
                    </div>
                  </div>

                  {c.status === 'pending' && (
                    <button
                      onClick={() => onSettleCheque(c)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors shadow-xs"
                    >
                      تسویه / تبدیل به تراکنش
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteCheque(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="حذف چک"
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
