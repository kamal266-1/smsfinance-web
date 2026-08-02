import { Transaction, Rule, Cheque, AppStats, Currency } from '../types';
import { DEFAULT_RULES } from '../data/bankTemplates';

const TRANSACTIONS_KEY = 'smsfinance_transactions_v1';
const RULES_KEY = 'smsfinance_rules_v1';
const CHEQUES_KEY = 'smsfinance_cheques_v1';
const CURRENCY_KEY = 'smsfinance_currency_v1';

export function getStoredCurrency(): Currency {
  return (localStorage.getItem(CURRENCY_KEY) as Currency) || 'IRT';
}

export function setStoredCurrency(curr: Currency): void {
  localStorage.setItem(CURRENCY_KEY, curr);
}

// Initial seed transactions
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    type: 'income',
    amount: 150000000, // 150M Rials = 15M Toman
    currency: 'IRT',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    category: 'حقوق & درآمد',
    counterparty: 'شرکت فناوری پیشرو',
    bankName: 'بانک سامان',
    cardLast4: '4567',
    balanceAfter: 240000000,
    originalSmsText: 'واریز به حساب 849-810-1234567-1\nمبلغ: 150,000,000 ریال\nمانده: 240,000,000 ریال\nاز: شرکت فناوری پیشرو',
    deduplicationHash: 'hash_seed_1',
    ruleMatchedId: 'rule-4',
    ruleMatchedName: 'درآمد و حقوق',
    isManual: false,
  },
  {
    id: 'tx_seed_2',
    type: 'expense',
    amount: 8500000, // 8.5M Rials = 850k Toman
    currency: 'IRT',
    date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    category: 'خرید روزمره & سوپرمارکت',
    counterparty: 'هایپرمارکت افق کوروش',
    bankName: 'بانک ملت',
    cardLast4: '1234',
    balanceAfter: 231500000,
    originalSmsText: 'برداشت از حساب: 61043378****1234\nمبلغ: 8,500,000 ریال\nموجودی: 231,500,000 ریال\nفروشگاه افق کوروش',
    deduplicationHash: 'hash_seed_2',
    ruleMatchedId: 'rule-1',
    ruleMatchedName: 'سوپرمارکت و خرید روزمره',
    isManual: false,
  },
  {
    id: 'tx_seed_3',
    type: 'expense',
    amount: 1200000, // 120k Toman
    currency: 'IRT',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'رستوران & کافه',
    counterparty: 'کافه ویونا',
    bankName: 'بلو بانک',
    cardLast4: '8821',
    balanceAfter: 230300000,
    originalSmsText: 'خرید با کارت\nمبلغ: 1,200,000 ریال\nفروشنده: کافه ویونا\nموجودی: 230,300,000 ریال',
    deduplicationHash: 'hash_seed_3',
    ruleMatchedId: 'rule-3',
    ruleMatchedName: 'کافه و رستوران',
    isManual: false,
  },
  {
    id: 'tx_seed_4',
    type: 'expense',
    amount: 4500000, // 450k Toman
    currency: 'IRT',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    category: 'حمل و نقل & بنزین',
    counterparty: 'اسنپ مارکت / سفر',
    bankName: 'بانک پاسارگاد',
    cardLast4: '9012',
    balanceAfter: 225800000,
    originalSmsText: 'برداشت 4,500,000 ریال از کارت 502229****9012\nپایانه: اسنپ مارکت',
    deduplicationHash: 'hash_seed_4',
    ruleMatchedId: 'rule-2',
    ruleMatchedName: 'بنزین و اسنپ',
    isManual: false,
  },
  {
    id: 'tx_seed_5',
    type: 'expense',
    amount: 25000000, // 2.5M Toman
    currency: 'IRT',
    date: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    category: 'اقساط & وام',
    counterparty: 'اقساط وام بانک مسکن',
    bankName: 'بانک مسکن',
    cardLast4: '3312',
    balanceAfter: 200800000,
    originalSmsText: 'برداشت پایا: 25,000,000 ریال\nبابت: قسط وام شماره 99182',
    deduplicationHash: 'hash_seed_5',
    ruleMatchedId: 'rule-5',
    ruleMatchedName: 'پرداخت اقساط',
    isManual: false,
  }
];

const SEED_CHEQUES: Cheque[] = [
  {
    id: 'chq-1',
    type: 'payable',
    amount: 45000000, // 4.5M Toman
    counterparty: 'آقای رضایی (اجاره مغازه/دفتر)',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    bankName: 'بانک صادرات',
    chequeNumber: '998241',
    status: 'pending',
    notes: 'چک صیادی بابت اجاره ماه جاری',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'chq-2',
    type: 'receivable',
    amount: 70000000, // 7M Toman
    counterparty: 'شرکت پارت تکنولوژی (تسویه پروژه)',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days
    bankName: 'بانک تجارت',
    chequeNumber: '104822',
    status: 'pending',
    notes: 'چک دریافتی بابت فاز اول طراحی',
    createdAt: new Date().toISOString(),
  }
];

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (!data) {
      saveTransactions(SEED_TRANSACTIONS);
      return SEED_TRANSACTIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading transactions:', err);
    return SEED_TRANSACTIONS;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
}

export function loadRules(): Rule[] {
  try {
    const data = localStorage.getItem(RULES_KEY);
    if (!data) {
      saveRules(DEFAULT_RULES);
      return DEFAULT_RULES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading rules:', err);
    return DEFAULT_RULES;
  }
}

export function saveRules(rules: Rule[]): void {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function loadCheques(): Cheque[] {
  try {
    const data = localStorage.getItem(CHEQUES_KEY);
    if (!data) {
      saveCheques(SEED_CHEQUES);
      return SEED_CHEQUES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading cheques:', err);
    return SEED_CHEQUES;
  }
}

export function saveCheques(cheques: Cheque[]): void {
  localStorage.setItem(CHEQUES_KEY, JSON.stringify(cheques));
}

export function calculateStats(txs: Transaction[], cheques: Cheque[]): AppStats {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalBalance = 0;
  let monthIncome = 0;
  let monthExpense = 0;

  // Use the latest balanceAfter if available, or compute sum
  const latestBalTx = txs.find(t => typeof t.balanceAfter === 'number' && t.balanceAfter > 0);
  if (latestBalTx && latestBalTx.balanceAfter) {
    totalBalance = latestBalTx.balanceAfter;
  } else {
    totalBalance = txs.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }

  txs.forEach(t => {
    const txDate = new Date(t.date);
    if (txDate >= firstDayOfMonth) {
      if (t.type === 'income') {
        monthIncome += t.amount;
      } else {
        monthExpense += t.amount;
      }
    }
  });

  const netCashFlow = monthIncome - monthExpense; // "سود/جریان مالی تقریبی این ماه"

  let pendingPayableCheques = 0;
  let pendingReceivableCheques = 0;

  cheques.forEach(c => {
    if (c.status === 'pending') {
      if (c.type === 'payable') pendingPayableCheques += c.amount;
      else pendingReceivableCheques += c.amount;
    }
  });

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    netCashFlow,
    pendingPayableCheques,
    pendingReceivableCheques,
    transactionCount: txs.length,
  };
}

export function exportAppDataJSON(): string {
  const data = {
    app: 'SmsFinance',
    version: '1.0',
    exportDate: new Date().toISOString(),
    transactions: loadTransactions(),
    rules: loadRules(),
    cheques: loadCheques(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAppDataJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (Array.isArray(data.rules)) {
      saveRules(data.rules);
    }
    if (Array.isArray(data.cheques)) {
      saveCheques(data.cheques);
    }
    return true;
  } catch (err) {
    console.error('Failed to import data:', err);
    return false;
  }
}
