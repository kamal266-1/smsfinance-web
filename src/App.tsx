import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  Rule, 
  Cheque, 
  Currency, 
  AppStats 
} from './types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadRules, 
  saveRules, 
  loadCheques, 
  saveCheques, 
  calculateStats,
  getStoredCurrency,
  setStoredCurrency 
} from './services/storage';

import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { RuleEngineView } from './components/RuleEngineView';
import { ChequesView } from './components/ChequesView';
import { QuickEntryModal } from './components/QuickEntryModal';
import { SmsImporterModal } from './components/SmsImporterModal';
import { DriveBackupModal } from './components/DriveBackupModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [currency, setCurrencyState] = useState<Currency>('IRT');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'rules' | 'cheques' | 'reports'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState<boolean>(false);
  const [quickEntryCategory, setQuickEntryCategory] = useState<string | undefined>(undefined);
  const [isSmsImporterOpen, setIsSmsImporterOpen] = useState<boolean>(false);
  const [isDriveBackupOpen, setIsDriveBackupOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Initial load
  useEffect(() => {
    setTransactions(loadTransactions());
    setRules(loadRules());
    setCheques(loadCheques());
    setCurrencyState(getStoredCurrency());
  }, []);

  const handleSetCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    setStoredCurrency(curr);
  };

  const refreshAllData = () => {
    setTransactions(loadTransactions());
    setRules(loadRules());
    setCheques(loadCheques());
  };

  // Transaction Handlers
  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleSaveQuickEntry = (txData: Omit<Transaction, 'id' | 'deduplicationHash'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      deduplicationHash: `manual_${Date.now()}`,
    };
    handleAddTransaction(newTx);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  // Rule Engine Handlers
  const handleSaveRule = (rule: Rule) => {
    const updated = [rule, ...rules];
    setRules(updated);
    saveRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    saveRules(updated);
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    setRules(updated);
    saveRules(updated);
  };

  // Cheque Handlers
  const handleSaveCheque = (cheque: Cheque) => {
    const updated = [cheque, ...cheques];
    setCheques(updated);
    saveCheques(updated);
  };

  const handleDeleteCheque = (id: string) => {
    const updated = cheques.filter(c => c.id !== id);
    setCheques(updated);
    saveCheques(updated);
  };

  const handleSettleCheque = (cheque: Cheque) => {
    // 1. Update cheque status
    const updatedCheques = cheques.map(c => c.id === cheque.id ? { ...c, status: 'cleared' as const } : c);
    setCheques(updatedCheques);
    saveCheques(updatedCheques);

    // 2. Create actual transaction for this cheque cash settlement
    const newTx: Transaction = {
      id: `tx_chq_${Date.now()}`,
      type: cheque.type === 'receivable' ? 'income' : 'expense',
      amount: cheque.amount,
      currency: 'IRT',
      date: new Date().toISOString(),
      category: cheque.type === 'receivable' ? 'حقوق & درآمد' : 'قبوض & خدمات',
      counterparty: cheque.counterparty,
      bankName: cheque.bankName,
      deduplicationHash: `chq_settle_${cheque.id}`,
      isManual: true,
      notes: `وصول چک شماره ${cheque.chequeNumber}`,
    };
    handleAddTransaction(newTx);
  };

  const stats: AppStats = calculateStats(transactions, cheques);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans dir-rtl" dir="rtl">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={handleSetCurrency}
        onOpenQuickEntry={() => {
          setQuickEntryCategory(undefined);
          setIsQuickEntryOpen(true);
        }}
        onOpenSmsImporter={() => setIsSmsImporterOpen(true)}
        onOpenDriveBackup={() => setIsDriveBackupOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            currency={currency}
            recentTransactions={transactions}
            rules={rules}
            onOpenQuickEntry={(cat) => {
              setQuickEntryCategory(cat);
              setIsQuickEntryOpen(true);
            }}
            onOpenSmsImporter={() => setIsSmsImporterOpen(true)}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            onViewAllTransactions={() => setActiveTab('transactions')}
            onViewRules={() => setActiveTab('rules')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            currency={currency}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenQuickEntry={() => {
              setQuickEntryCategory(undefined);
              setIsQuickEntryOpen(true);
            }}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'rules' && (
          <RuleEngineView
            rules={rules}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            onToggleRule={handleToggleRule}
          />
        )}

        {activeTab === 'cheques' && (
          <ChequesView
            cheques={cheques}
            currency={currency}
            onSaveCheque={handleSaveCheque}
            onDeleteCheque={handleDeleteCheque}
            onSettleCheque={handleSettleCheque}
          />
        )}
      </main>

      {/* Modals */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onSave={handleSaveQuickEntry}
        currency={currency}
        initialCategory={quickEntryCategory}
      />

      <SmsImporterModal
        isOpen={isSmsImporterOpen}
        onClose={() => setIsSmsImporterOpen(false)}
        transactions={transactions}
        rules={rules}
        onAddTransaction={handleAddTransaction}
        currency={currency}
      />

      <DriveBackupModal
        isOpen={isDriveBackupOpen}
        onClose={() => setIsDriveBackupOpen(false)}
        onRefreshData={refreshAllData}
      />

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        currency={currency}
        onDelete={handleDeleteTransaction}
      />

    </div>
  );
}
