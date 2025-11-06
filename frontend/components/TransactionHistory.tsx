"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  from: string;
  to: string;
  memo?: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { publicKey } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && publicKey) {
      fetchTransactions();
    }
  }, [isOpen, publicKey]);

  const fetchTransactions = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${publicKey}/transactions?limit=10&order=desc`
      );
      
      if (response.ok) {
        const data = await response.json();
        const txs: Transaction[] = data._embedded.records.map((record: any) => ({
          id: record.id,
          type: record.source_account === publicKey ? 'sent' : 'received',
          amount: '0', // Would need to parse operations for exact amount
          from: record.source_account,
          to: record.account || 'N/A',
          memo: record.memo || '',
          timestamp: new Date(record.created_at),
          status: record.successful ? 'success' : 'failed'
        }));
        setTransactions(txs);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-purple-500/30 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                  <p className="text-gray-400 text-sm mt-1">Recent blockchain activity</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Transactions List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        window.open(`https://stellar.expert/explorer/testnet/tx/${tx.id}`, '_blank');
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'sent' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {tx.type === 'sent' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">
                              {tx.type === 'sent' ? 'Sent' : 'Received'}
                            </span>
                            <span className={`text-sm font-mono ${
                              tx.type === 'sent' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {tx.type === 'sent' ? '-' : '+'}{tx.amount || '...'} XLM
                            </span>
                          </div>
                          
                          {tx.memo && (
                            <p className="text-sm text-gray-400 mb-2">{tx.memo}</p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{tx.timestamp.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{tx.timestamp.toLocaleTimeString()}</span>
                            {tx.status === 'success' && (
                              <>
                                <span>•</span>
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
