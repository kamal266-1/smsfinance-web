import React, { useState } from 'react';
import { Transaction, Rule, Currency } from '../types';
import { BANK_TEMPLATES } from '../data/bankTemplates';
import { processIncomingSms } from '../services/smsEngine';
import { formatAmount } from '../utils/formatters';
import { 
  X, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Tag
} from 'lucide-react';

interface SmsImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  rules: Rule[];
  onAddTransaction: (tx: Transaction) => void;
  currency: Currency;
}

export const SmsImporterModal: React.FC<SmsImporterModalProps> = ({
  isOpen,
  onClose,
  transactions,
  rules,
  onAddTransaction,
  currency,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(BANK_TEMPLATES[0].bankId);
  const [smsText, setSmsText] = useState<string>(BANK_TEMPLATES[0].sampleSms);
  const [sender, setSender] = useState<string>(BANK_TEMPLATES[0].senderFilter);
  
  const [parsedPreview, setParsedPreview] = useState<Transaction | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [matchedRuleName, setMatchedRuleName] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectBankTemplate = (bankId: string) => {
    const tmpl = BANK_TEMPLATES.find(b => b.bankId === bankId);
    if (tmpl) {
      setSelectedBankId(bankId);
      setSmsText(tmpl.sampleSms);
      setSender(tmpl.senderFilter);
      setParsedPreview(null);
    }
  };

  const handleRunParser = async () => {
    if (!smsText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await processIncomingSms(smsText, sender, transactions, rules);
      setParsedPreview(res.transaction);
      setIsDuplicate(res.isDuplicate);
      setMatchedRuleName(res.matchedRule?.name);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (parsedPreview) {
      onAddTransaction(parsedPreview);
      setParsedPreview(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-4 space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">تست و ورود پیامک‌های بانکی</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bank Template Selector (15+ Iranian & Int'l Banks) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">انتخاب الگوی پیامک بانکی (۱۵+ بانک):</label>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded border border-slate-200">
            {BANK_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.bankId}
                type="button"
                onClick={() => handleSelectBankTemplate(tmpl.bankId)}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors font-medium ${
                  selectedBankId === tmpl.bankId
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tmpl.bankNameFa}
              </button>
            ))}
          </div>
        </div>

        {/* SMS Input Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>متن پیامک دریافت شده:</span>
            <input
              type="text"
              placeholder="فرستنده (مثلا Mellat)"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 w-32 focus:outline-none focus:border-blue-500"
            />
          </div>
          <textarea
            rows={4}
            value={smsText}
            onChange={(e) => {
              setSmsText(e.target.value);
              setParsedPreview(null);
            }}
            placeholder="متن پیامک بانکی را اینجا وارد یا پیست کنید..."
            className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
          ></textarea>
        </div>

        {/* Parse Action Button */}
        <button
          onClick={handleRunParser}
          disabled={isProcessing}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-blue-700 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
        >
          {isProcessing ? (
            <span>در حال تحلیل و بررسی قوانین...</span>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>پردازش پیامک و اعمال موتور قوانین</span>
            </>
          )}
        </button>

        {/* Parsing Preview Output */}
        {parsedPreview && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2.5 animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                نتیجه استخراج اطلاعات پیامک
              </span>
              {isDuplicate && (
                <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  پیامک تکراری (قبلاً ثبت شده)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <span className="text-slate-500 block">نوع تراکنش:</span>
                <span className={`font-bold ${parsedPreview.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {parsedPreview.type === 'income' ? 'واریز (درآمد)' : 'برداشت (هزینه)'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">مبلغ استخراجی:</span>
                <span className="font-bold text-slate-900 dir-ltr">
                  {formatAmount(parsedPreview.amount, currency)}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">نام بانک / کارت:</span>
                <span className="font-bold text-slate-800">{parsedPreview.bankName}</span>
              </div>

              <div>
                <span className="text-slate-500 block">طرف حساب / توضیحات:</span>
                <span className="font-bold text-slate-800">{parsedPreview.counterparty}</span>
              </div>

              <div>
                <span className="text-slate-500 block">دسته‌بندی:</span>
                <span className="font-bold text-blue-700">{parsedPreview.category}</span>
              </div>

              <div>
                <span className="text-slate-500 block">قانون منطبق:</span>
                {matchedRuleName ? (
                  <span className="text-blue-700 font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {matchedRuleName}
                  </span>
                ) : (
                  <span className="text-slate-500">الگوی استاندارد بانک</span>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={handleConfirmAdd}
                disabled={isDuplicate}
                className={`w-full py-2 rounded text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                  isDuplicate
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
                }`}
              >
                <span>{isDuplicate ? 'تکراری است - ثبت نمی‌شود' : 'تایید و ثبت نهایی در دفتر مالی'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
