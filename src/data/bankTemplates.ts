import { BankTemplate, Rule } from '../types';

export const DEFAULT_CATEGORIES = [
  'خرید روزمره & سوپرمارکت', // Grocery
  'حمل و نقل & بنزین', // Transport
  'قبوض & خدمات', // Bills
  'رستوران & کافه', // Food & Dining
  'سلامت & درمان', // Health
  'پوشاک & آرایشی', // Shopping
  'حقوق & درآمد', // Salary & Income
  'انتقال کارت به کارت', // Card Transfer
  'اجاره & مسکن', // Rent
  'اقساط & وام', // Loan repayment
  'متفرقه', // Misc
];

export const BANK_TEMPLATES: BankTemplate[] = [
  {
    bankId: 'mellat',
    bankName: 'Bank Mellat',
    bankNameFa: 'بانک ملت',
    senderFilter: 'Mellat',
    sampleSms: 'برداشت از حساب: 61043378****1234\nمبلغ: 4,500,000 ریال\nموجودی: 82,300,000 ریال\nتاریخ: 1403/05/12 - 14:22\nفروشگاه کوروش',
  },
  {
    bankId: 'saman',
    bankName: 'Saman Bank',
    bankNameFa: 'بانک سامان',
    senderFilter: 'SAMAN',
    sampleSms: 'واریز به حساب 849-810-1234567-1\nمبلغ: 25,000,000 ریال\nمانده: 140,500,000 ریال\n1403/05/11 09:15\nاز: شرکت توسعه فناوری',
  },
  {
    bankId: 'pasargad',
    bankName: 'Pasargad Bank',
    bankNameFa: 'بانک پاسارگاد',
    senderFilter: 'Pasargad',
    sampleSms: 'برداشت 1,200,000 ریال از کارت 502229****8821\nپایانه: اسنپ مارکت\nمانده: 34,100,000 ریال\n1403/05/10 18:45',
  },
  {
    bankId: 'blubank',
    bankName: 'Blu Bank',
    bankNameFa: 'بلو بانک',
    senderFilter: 'blubank',
    sampleSms: 'خرید با کارت\nمبلغ: 850,000 ریال\nفروشنده: کافه ویونا\nموجودی: 19,450,000 ریال\n1403/05/09 16:30',
  },
  {
    bankId: 'melli',
    bankName: 'Bank Melli Iran',
    bankNameFa: 'بانک ملی ایران',
    senderFilter: 'B.Melli',
    sampleSms: 'واریز: 50,000,000 ریال\nبه حساب: 0102938475001\nموجودی: 210,000,000 ریال\n1403/05/08 11:00\nشبا/پایا: حقوق مردادماه',
  },
  {
    bankId: 'parsian',
    bankName: 'Parsian Bank',
    bankNameFa: 'بانک پارسیان',
    senderFilter: 'Parsian',
    sampleSms: 'برداشت: 3,400,000 ریال\nکارت: 622106****4411\nمانده: 12,900,000 ریال\n1403/05/07 20:10\nداروخانه دکتر راد',
  },
  {
    bankId: 'tejarat',
    bankName: 'Tejarat Bank',
    bankNameFa: 'بانک تجارت',
    senderFilter: 'Tejarat',
    sampleSms: 'برداشت پایا: 15,000,000 ریال\nاز حساب 10293847\nمانده: 45,000,000 ریال\n1403/05/06 13:00\nبابت: بابت قسط وام',
  },
  {
    bankId: 'keshavarzi',
    bankName: 'Keshavarzi Bank',
    bankNameFa: 'بانک کشاورزی',
    senderFilter: 'B.Keshavarzi',
    sampleSms: 'واریز کارت به کارت: 2,000,000 ریال\nاز: 603770****9922 (محمدی)\nموجودی: 18,300,000 ریال\n1403/05/05 17:40',
  },
  {
    bankId: 'saderat',
    bankName: 'Bank Saderat',
    bankNameFa: 'بانک صادرات',
    senderFilter: 'BSI',
    sampleSms: 'برداشت: 6,800,000 ریال\nاز حساب: 0304958671002\nمانده: 29,400,000 ریال\n1403/05/04 19:15\nفروشگاه افق کوروش',
  },
  {
    bankId: 'sepah',
    bankName: 'Bank Sepah',
    bankNameFa: 'بانک سپه',
    senderFilter: 'Sepah',
    sampleSms: 'برداشت: 950,000 ریال\nاز کارت: 589210****3312\nپایانه: پمپ بنزین شماره ۲\nموجودی: 8,100,000 ریال\n1403/05/03 08:30',
  },
  {
    bankId: 'shahr',
    bankName: 'City Bank (Shahr)',
    bankNameFa: 'بانک شهر',
    senderFilter: 'Shahr',
    sampleSms: 'برداشت: 2,100,000 ریال\nحساب: 70081234567\nموجودی: 31,500,000 ریال\n1403/05/02 21:05\nهایپرمارکت میثم',
  },
  {
    bankId: 'resalat',
    bankName: 'Resalat Bank',
    bankNameFa: 'بانک رسالت',
    senderFilter: 'Resalat',
    sampleSms: 'واریز: 12,000,000 ریال\nبه حساب: 10.887766.1\nموجودی: 64,000,000 ریال\n1403/05/01 10:20\nاز: سارا احمدی',
  },
  {
    bankId: 'ayandeh',
    bankName: 'Ayandeh Bank',
    bankNameFa: 'بانک آینده',
    senderFilter: 'Ayandeh',
    sampleSms: 'برداشت: 7,500,000 ریال\nکارت: 636214****9012\nمانده: 55,000,000 ریال\n1403/04/30 15:50\nمرکز خریدهایپراستار',
  },
  {
    bankId: 'khavarmianeh',
    bankName: 'Middle East Bank',
    bankNameFa: 'بانک خاورمیانه',
    senderFilter: 'MEBank',
    sampleSms: 'برداشت: 18,000,000 ریال\nحساب: 100-200-300\nموجودی: 120,000,000 ریال\n1403/04/29 12:10\nبابت: اجاره ماهانه',
  },
  {
    bankId: 'refah',
    bankName: 'Refah Bank',
    bankNameFa: 'بانک رفاه کارگران',
    senderFilter: 'Refah',
    sampleSms: 'واریز: 35,000,000 ریال\nبه حساب: 123456789\nموجودی: 98,000,000 ریال\n1403/04/28 14:00\nبابت: حقوق',
  },
  {
    bankId: 'usd_generic',
    bankName: 'International Bank (USD)',
    bankNameFa: 'حساب ارزی / بین‌المللی',
    senderFilter: 'CHASE',
    sampleSms: 'Debit card purchase of $45.50 at WHOLE FOODS MARKET. Available balance: $1,240.00. Date: 08/01/2026',
  }
];

export const DEFAULT_RULES: Rule[] = [
  {
    id: 'rule-1',
    name: 'سوپرمارکت و خرید روزمره',
    conditionType: 'keyword',
    pattern: 'کوروش|هایپر|سوپر|میثم|افق',
    actionCategory: 'خرید روزمره & سوپرمارکت',
    actionType: 'expense',
    isActive: true,
    matchCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-2',
    name: 'بنزین و اسنپ',
    conditionType: 'keyword',
    pattern: 'پمپ بنزین|اسنپ|تپسی|بنزین',
    actionCategory: 'حمل و نقل & بنزین',
    actionType: 'expense',
    isActive: true,
    matchCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-3',
    name: 'کافه و رستوران',
    conditionType: 'keyword',
    pattern: 'کافه|رستوران|فست فود|پیتزا|ویونا',
    actionCategory: 'رستوران & کافه',
    actionType: 'expense',
    isActive: true,
    matchCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-4',
    name: 'درآمد و حقوق',
    conditionType: 'keyword',
    pattern: 'حقوق|دستمزد|Salary',
    actionCategory: 'حقوق & درآمد',
    actionType: 'income',
    isActive: true,
    matchCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-5',
    name: 'پرداخت اقساط',
    conditionType: 'keyword',
    pattern: 'قسط|وام|تسهیلات',
    actionCategory: 'اقساط & وام',
    actionType: 'expense',
    isActive: true,
    matchCount: 1,
    createdAt: new Date().toISOString(),
  }
];
