import React, { useState } from 'react';
import { Rule, ConditionType, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/bankTemplates';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Tag, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Play
} from 'lucide-react';

interface RuleEngineViewProps {
  rules: Rule[];
  onSaveRule: (rule: Rule) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
}

export const RuleEngineView: React.FC<RuleEngineViewProps> = ({
  rules,
  onSaveRule,
  onDeleteRule,
  onToggleRule,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // New Rule Form State
  const [name, setName] = useState<string>('');
  const [conditionType, setConditionType] = useState<ConditionType>('keyword');
  const [pattern, setPattern] = useState<string>('');
  const [actionCategory, setActionCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [actionCounterparty, setActionCounterparty] = useState<string>('');
  const [actionType, setActionType] = useState<TransactionType>('expense');

  // Test Simulator State
  const [testText, setTestText] = useState<string>('');
  const [testMatchResult, setTestMatchResult] = useState<string | null>(null);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pattern.trim()) return;

    const newRule: Rule = {
      id: `rule_${Date.now()}`,
      name: name.trim(),
      conditionType,
      pattern: pattern.trim(),
      actionCategory,
      actionCounterparty: actionCounterparty.trim() || undefined,
      actionType,
      isActive: true,
      matchCount: 0,
      createdAt: new Date().toISOString(),
    };

    onSaveRule(newRule);
    
    // Reset Form
    setName('');
    setPattern('');
    setActionCounterparty('');
    setIsAdding(false);
  };

  const handleTestRule = () => {
    if (!testText.trim()) return;
    const lower = testText.toLowerCase();

    const matched = rules.find(r => {
      if (!r.isActive) return false;
      if (r.conditionType === 'keyword') {
        const keywords = r.pattern.split('|').map(k => k.trim().toLowerCase());
        return keywords.some(k => lower.includes(k));
      } else if (r.conditionType === 'card') {
        return lower.includes(r.pattern);
      }
      return false;
    });

    if (matched) {
      setTestMatchResult(`✅ منطبق شد با قانون: "${matched.name}" ➔ دسته‌بندی: ${matched.actionCategory}`);
    } else {
      setTestMatchResult('❌ هیچ قانونی با این پیامک تطبیق پیدا نکرد.');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Explanation Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">موتور قوانین هوشمند پیامک</h2>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تعریف قانون جدید</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          تمام قوانین به صورت ۱۰۰٪ قابل مشاهده، ویرایش و حذف هستند. هیچ تراکنش مالی به صورت کدر یا غیرقابل برگشت تغییر نمی‌کند.
        </p>
      </div>

      {/* Add New Rule Form */}
      {isAdding && (
        <form onSubmit={handleCreateRule} className="bg-white border border-blue-200 rounded-lg p-4 space-y-3 shadow-xs animate-fade-in">
          <h3 className="text-xs font-bold text-blue-700 border-b border-slate-100 pb-2">تعریف قانون اختصاصی جدید</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">عنوان قانون:</label>
              <input
                type="text"
                required
                placeholder="مثلا: خرید از سوپر مارکت محله"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">نوع شرط تطبیق:</label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value as ConditionType)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="keyword">کلمه یا عبارت در متن پیامک</option>
                <option value="sender">شماره فرستنده پیامک</option>
                <option value="card">۴ رقم آخر کارت</option>
                <option value="regex">عبارت باقاعده (Regex)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">الگو / کلمات کلیدی (جداکننده با |):</label>
              <input
                type="text"
                required
                placeholder="مثلا: افق|کوروش|جانبو"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 dir-ltr text-right"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">دسته‌بندی هدف:</label>
              <select
                value={actionCategory}
                onChange={(e) => setActionCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
              ذخیره قانون
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">قوانین تعریف شده ({rules.length})</h3>

        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`border rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors ${
                rule.isActive
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{rule.name}</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                    {rule.matchCount} منطبق شده
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span>نوع شرط: <strong className="text-slate-700">{rule.conditionType}</strong></span>
                  <span>•</span>
                  <span>الگو: <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded dir-ltr text-[11px] font-mono">{rule.pattern}</code></span>
                  <span>•</span>
                  <span>دسته‌بندی: <strong className="text-blue-700">{rule.actionCategory}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                    rule.isActive
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {rule.isActive ? 'فعال' : 'غیرفعال'}
                </button>

                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                  title="حذف قانون"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Quick Rule Tester */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">تست زنده تطبیق قانون</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="یک متن نمونه پیامک تایپ کنید تا قوانین بررسی شوند..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={handleTestRule}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>تست</span>
          </button>
        </div>
        {testMatchResult && (
          <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800 font-mono">
            {testMatchResult}
          </div>
        )}
      </div>

    </div>
  );
};
