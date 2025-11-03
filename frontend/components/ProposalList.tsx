"use client";

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, CheckCircle2, Clock, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { toast } from 'sonner';

const MINIMUM_BALANCE = 1; // Keep at least 1 XLM for account minimum
const TRANSACTION_FEE = 0.00001; // Stellar base fee

export default function ProposalList() {
  const { proposals, updateProposal, publicKey, balance, setBalance } = useWalletStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'executed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleVote = async (proposalId: number, approve: boolean) => {
    try {
      // In production, call smart contract here
      toast.success(`Vote ${approve ? 'approved' : 'rejected'} successfully!`);
      
      // Update local state
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal) {
        updateProposal(proposalId, {
          approvals: approve ? proposal.approvals + 1 : proposal.approvals,
          rejections: !approve ? proposal.rejections + 1 : proposal.rejections,
        });
      }
    } catch (error) {
      toast.error('Failed to submit vote');
    }
  };

  const handleExecute = async (proposalId: number) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      toast.error('Proposal not found');
      return;
    }

    try {
      // Safety checks
      if (!publicKey) {
        toast.error('Please connect your wallet first');
        return;
      }

      const currentBalance = parseFloat(balance);
      const transferAmount = parseFloat(proposal.amount);
      const totalCost = transferAmount + TRANSACTION_FEE;

      // Check if we have enough balance
      if (currentBalance < totalCost) {
        toast.error(`Insufficient balance. Need ${totalCost} XLM but only have ${currentBalance} XLM`);
        return;
      }

      // Check minimum balance protection
      if (currentBalance - totalCost < MINIMUM_BALANCE) {
        toast.error(`Transaction would leave balance below minimum (${MINIMUM_BALANCE} XLM). Please reduce the amount.`);
        return;
      }

      // Validate recipient address
      if (!proposal.recipient || proposal.recipient.length !== 56 || !proposal.recipient.startsWith('G')) {
        toast.error('Invalid recipient address. Please use a valid Stellar address.');
        return;
      }

      toast.loading('Preparing transaction...', { id: 'execute' });

      // Check if Freighter is available
      if (typeof window === 'undefined' || !(window as any).freighter) {
        toast.error('Freighter wallet not found', { id: 'execute' });
        return;
      }

      // Build the transaction using Stellar SDK
      const StellarSdk = await import('@stellar/stellar-sdk');
      
      // Use testnet
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      
      // Load source account
      const sourceAccount = await server.loadAccount(publicKey);
      
      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: proposal.recipient,
            asset: StellarSdk.Asset.native(),
            amount: proposal.amount,
          })
        )
        .addMemo(StellarSdk.Memo.text(`DAO Proposal #${proposal.id}`))
        .setTimeout(180)
        .build();

      toast.loading('Waiting for signature...', { id: 'execute' });

      // Sign with Freighter
      const { signTransaction } = (window as any).freighter;
      const signedXDR = await signTransaction(transaction.toXDR(), {
        network: 'TESTNET',
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });

      toast.loading('Submitting to Stellar network...', { id: 'execute' });

      // Submit transaction
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        StellarSdk.Networks.TESTNET
      );
      
      const result = await server.submitTransaction(signedTransaction as any);

      // Update UI
      updateProposal(proposalId, { executed: true });
      
      // Update balance
      const newBalance = currentBalance - totalCost;
      setBalance(newBalance.toString());

      toast.success(
        `✅ ${transferAmount} XLM transferred successfully!\nTransaction Hash: ${result.hash.slice(0, 8)}...`,
        { id: 'execute', duration: 5000 }
      );

    } catch (error: any) {
      console.error('Execution error:', error);
      
      if (error.message?.includes('user declined')) {
        toast.error('Transaction cancelled by user', { id: 'execute' });
      } else if (error.response?.data?.extras?.result_codes) {
        const codes = error.response.data.extras.result_codes;
        toast.error(`Transaction failed: ${codes.transaction || codes.operations?.[0]}`, { id: 'execute' });
      } else {
        toast.error(`Failed to execute: ${error.message || 'Unknown error'}`, { id: 'execute' });
      }
    }
  };

  const filteredProposals = proposals
    .filter(p => {
      if (filter === 'active') return !p.executed;
      if (filter === 'executed') return p.executed;
      return true;
    })
    .filter(p => 
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm)
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Proposals</h1>
        <p className="text-gray-400">Vote on active proposals or check execution status</p>
      </motion.div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'executed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'glass-effect text-gray-300 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-effect rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No proposals found</h3>
            <p className="text-gray-400">Try adjusting your filters or create a new proposal</p>
          </motion.div>
        ) : (
          filteredProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-semibold">
                      #{proposal.id}
                    </span>
                    {proposal.executed ? (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Executed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                        <Clock className="w-4 h-4" />
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{proposal.description}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>Amount: <span className="text-white font-semibold">{parseFloat(proposal.amount).toLocaleString()} XLM</span></span>
                    <span>Recipient: <span className="text-blue-400 font-mono">{proposal.recipient.slice(0, 8)}...{proposal.recipient.slice(-8)}</span></span>
                    <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Voting Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Approvals</span>
                    <ThumbsUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{proposal.approvals}</p>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(proposal.approvals / (proposal.approvals + proposal.rejections)) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Rejections</span>
                    <ThumbsDown className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{proposal.rejections}</p>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${(proposal.rejections / (proposal.approvals + proposal.rejections)) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!proposal.executed && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVote(proposal.id, true)}
                    className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-semibold hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVote(proposal.id, false)}
                    className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Reject
                  </motion.button>
                  {proposal.approvals > proposal.rejections && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExecute(proposal.id)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Execute
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
