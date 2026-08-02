export type TransactionType = 'expense' | 'income';
export type Currency = 'IRT' | 'IRR' | 'USD';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Stored in IRR or base unit, formatted according to currency preference
  currency: Currency;
  date: string; // ISO string
  category: string;
  counterparty: string; // Bank, store, person name (طرف حساب)
  bankName: string;
  cardLast4?: string;
  balanceAfter?: number;
  originalSmsText?: string;
  deduplicationHash: string;
  ruleMatchedId?: string;
  ruleMatchedName?: string;
  isManual: boolean;
  notes?: string;
}

export type ConditionType = 'keyword' | 'sender' | 'card' | 'regex';

export interface Rule {
  id: string;
  name: string;
  conditionType: ConditionType;
  pattern: string; // keyword or pattern to match
  actionCategory: string;
  actionCounterparty?: string;
  actionType?: TransactionType;
  isActive: boolean;
  matchCount: number;
  createdAt: string;
}

export type ChequeStatus = 'pending' | 'cleared' | 'bounced' | 'cancelled';
export type ChequeType = 'payable' | 'receivable';

export interface Cheque {
  id: string;
  type: ChequeType;
  amount: number;
  counterparty: string;
  dueDate: string; // ISO string
  bankName: string;
  chequeNumber: string;
  status: ChequeStatus;
  notes?: string;
  createdAt: string;
}

export interface BankTemplate {
  bankId: string;
  bankName: string;
  bankNameFa: string;
  sampleSms: string;
  senderFilter: string;
}

export interface FilterState {
  search: string;
  category: string;
  bank: string;
  type: 'all' | 'expense' | 'income';
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
}

export interface AppStats {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  netCashFlow: number; // "سود/جریان مالی تقریبی این ماه"
  pendingPayableCheques: number;
  pendingReceivableCheques: number;
  transactionCount: number;
}
