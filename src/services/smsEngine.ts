import { Rule, Transaction, TransactionType } from '../types';
import { BANK_TEMPLATES } from '../data/bankTemplates';

// Convert Persian/Arabic digits to ASCII digits
export function parseDigits(input: string): string {
  if (!input) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    result = result.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return result;
}

// Generate simple deterministic hash for SMS deduplication
export function generateDeduplicationHash(smsText: string, sender: string = ''): string {
  const normalized = parseDigits(smsText).toLowerCase().replace(/\s+/g, '');
  const raw = `${sender.toLowerCase()}_${normalized}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

export interface ParsedSmsResult {
  amount: number;
  type: TransactionType;
  counterparty: string;
  bankName: string;
  cardLast4?: string;
  balanceAfter?: number;
  dateStr: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
  category: string;
  confidence: 'rule' | 'regex' | 'ai' | 'fallback';
}

// Local fast Regex parser for major Iranian & global bank SMS formats
export function parseSmsWithRegex(smsText: string, sender: string = ''): Partial<ParsedSmsResult> | null {
  const text = parseDigits(smsText);

  // Determine Bank
  let bankName = 'بانک';
  for (const template of BANK_TEMPLATES) {
    if (
      sender.toLowerCase().includes(template.senderFilter.toLowerCase()) ||
      smsText.includes(template.bankNameFa) ||
      smsText.toLowerCase().includes(template.bankName.toLowerCase())
    ) {
      bankName = template.bankNameFa;
      break;
    }
  }

  // Determine Type (Expense vs Income)
  let type: TransactionType = 'expense';
  if (
    text.includes('واریز') ||
    text.includes('افزایش') ||
    text.includes('ورودی') ||
    text.toLowerCase().includes('credit') ||
    text.toLowerCase().includes('deposit')
  ) {
    type = 'income';
  } else if (
    text.includes('برداشت') ||
    text.includes('خرید') ||
    text.includes('کاهش') ||
    text.toLowerCase().includes('debit') ||
    text.toLowerCase().includes('paid')
  ) {
    type = 'expense';
  }

  // Extract Amount (look for number before 'ریال', 'تومان', '$', or after 'مبلغ' / 'مبلغ:')
  let amount = 0;
  
  // Pattern 1: مبلغ: 4,500,000 یا مبلغ 4500000
  const amountMatch1 = text.match(/(?:مبلغ|واریز|برداشت|خرید|مبلغ:)\s*([0-9,]{3,15})/i);
  // Pattern 2: $45.50 or 4,500,000 ریال
  const amountMatch2 = text.match(/([0-9,]{3,15})\s*(?:ریال|تومان|Rials|TOMAN|\$)?/i);
  
  if (amountMatch1 && amountMatch1[1]) {
    const rawNum = amountMatch1[1].replace(/,/g, '');
    amount = parseInt(rawNum, 10) || 0;
  } else if (amountMatch2 && amountMatch2[1]) {
    const rawNum = amountMatch2[1].replace(/,/g, '');
    amount = parseInt(rawNum, 10) || 0;
  }

  // Extract Balance
  let balanceAfter: number | undefined;
  const balanceMatch = text.match(/(?:موجودی|مانده|موجودی:)\s*([0-9,]{3,15})/i);
  if (balanceMatch && balanceMatch[1]) {
    const rawBal = balanceMatch[1].replace(/,/g, '');
    balanceAfter = parseInt(rawBal, 10);
  }

  // Extract Card Last 4
  let cardLast4: string | undefined;
  const cardMatch = text.match(/(?:کارت|حساب|کارت:)\s*([0-9\*]{4,16})/i);
  if (cardMatch && cardMatch[1]) {
    const digitsOnly = cardMatch[1].replace(/\*/g, '');
    cardLast4 = digitsOnly.slice(-4);
  }

  // Extract Counterparty / Description lines
  let counterparty = bankName;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Look for lines containing store name or description (e.g., فروشگاه..., از: ..., پایانه: ...)
  for (const line of lines) {
    if (line.match(/(?:فروشگاه|پایانه|فروشنده|کافه|از|به|بابت|شرکت|مرکز|هایپر):?\s*(.+)/i)) {
      const match = line.match(/(?:فروشگاه|پایانه|فروشنده|کافه|از|به|بابت|شرکت|مرکز|هایپر):?\s*(.+)/i);
      if (match && match[1]) {
        counterparty = match[1].trim();
        break;
      }
    }
  }

  if (amount > 0) {
    return {
      amount,
      type,
      counterparty,
      bankName,
      cardLast4,
      balanceAfter,
      dateStr: new Date().toISOString(),
      category: type === 'income' ? 'حقوق & درآمد' : 'خرید روزمره & سوپرمارکت',
      confidence: 'regex',
    };
  }

  return null;
}

// Rule Engine Evaluator: Matches SMS against user rules
export function evaluateRules(
  smsText: string,
  sender: string,
  rules: Rule[]
): { matchedRule?: Rule; updatedCategory?: string; updatedCounterparty?: string; updatedType?: TransactionType } {
  const text = parseDigits(smsText).toLowerCase();
  const senderNorm = sender.toLowerCase();

  for (const rule of rules) {
    if (!rule.isActive) continue;

    let isMatch = false;

    if (rule.conditionType === 'keyword') {
      const keywords = rule.pattern.split('|').map(k => k.trim().toLowerCase()).filter(Boolean);
      isMatch = keywords.some(k => text.includes(k));
    } else if (rule.conditionType === 'sender') {
      isMatch = senderNorm.includes(rule.pattern.toLowerCase());
    } else if (rule.conditionType === 'card') {
      isMatch = text.includes(rule.pattern);
    } else if (rule.conditionType === 'regex') {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        isMatch = regex.test(text);
      } catch (e) {
        isMatch = false;
      }
    }

    if (isMatch) {
      return {
        matchedRule: rule,
        updatedCategory: rule.actionCategory,
        updatedCounterparty: rule.actionCounterparty,
        updatedType: rule.actionType,
      };
    }
  }

  return {};
}

// Complete Processing Flow (Deduplication -> Rules -> Regex -> AI Fallback)
export async function processIncomingSms(
  smsText: string,
  sender: string = '',
  existingTransactions: Transaction[],
  rules: Rule[]
): Promise<{ transaction: Transaction; isDuplicate: boolean; matchedRule?: Rule }> {
  const hash = generateDeduplicationHash(smsText, sender);
  
  // Check deduplication
  const existing = existingTransactions.find(t => t.deduplicationHash === hash);
  if (existing) {
    return { transaction: existing, isDuplicate: true };
  }

  // 1. Regex parse base values
  const regexResult = parseSmsWithRegex(smsText, sender);

  // 2. Evaluate Rule Engine
  const { matchedRule, updatedCategory, updatedCounterparty, updatedType } = evaluateRules(smsText, sender, rules);

  let amount = regexResult?.amount || 0;
  let type = updatedType || regexResult?.type || 'expense';
  let counterparty = updatedCounterparty || regexResult?.counterparty || (sender || 'بانک');
  let category = updatedCategory || regexResult?.category || 'متفرقه';
  let bankName = regexResult?.bankName || 'بانک';
  let cardLast4 = regexResult?.cardLast4;
  let balanceAfter = regexResult?.balanceAfter;

  // 3. AI Fallback if amount is 0 (unrecognized SMS format)
  if (amount === 0) {
    try {
      const response = await fetch('/api/parse-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsText, sender }),
      });
      if (response.ok) {
        const aiData = await response.json();
        if (aiData.amount && aiData.amount > 0) {
          amount = aiData.amount;
          type = aiData.type || type;
          counterparty = updatedCounterparty || aiData.counterparty || counterparty;
          category = updatedCategory || aiData.category || category;
          bankName = aiData.bankName || bankName;
          cardLast4 = aiData.cardLast4 || cardLast4;
          balanceAfter = aiData.balanceAfter || balanceAfter;
        }
      }
    } catch (err) {
      console.warn('AI SMS parsing fallback skipped:', err);
    }
  }

  // Fallback default amount if still zero to allow user manual edit
  if (amount === 0) amount = 100000;

  const newTransaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type,
    amount,
    currency: 'IRT', // Standard display preference
    date: new Date().toISOString(),
    category,
    counterparty,
    bankName,
    cardLast4,
    balanceAfter,
    originalSmsText: smsText,
    deduplicationHash: hash,
    ruleMatchedId: matchedRule?.id,
    ruleMatchedName: matchedRule?.name,
    isManual: false,
  };

  return { transaction: newTransaction, isDuplicate: false, matchedRule };
}
