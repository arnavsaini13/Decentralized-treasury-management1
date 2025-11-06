"use client";

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, CheckCircle2, Clock, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { useWalletStore, TREASURY_WALLET } from '@/store/walletStore';
import { toast } from 'sonner';
import { executePaymentWithFallback } from '@/lib/stellarTransactionFallback';

// Freighter API type declarations
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
    };
  }
}

const MINIMUM_BALANCE = 1; // Keep at least 1 XLM for account minimum
const TRANSACTION_FEE = 0.00001; // Stellar base fee

export default function ProposalList() {
  const { proposals, updateProposal, publicKey, balance, setBalance, isConnected } = useWalletStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'executed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleVote = async (proposalId: number, approve: boolean) => {
    // Check if wallet is connected
    if (!publicKey) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    try {
      // Find the proposal
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) {
        toast.error('Proposal not found');
        return;
      }

      // Check if user has already voted
      if (proposal.voters && proposal.voters.includes(publicKey)) {
        toast.error('❌ You have already voted on this proposal!', {
          description: 'Each wallet can only vote once per proposal'
        });
        return;
      }

      // Add vote
      const newVoters = [...(proposal.voters || []), publicKey];
      
      updateProposal(proposalId, {
        approvals: approve ? proposal.approvals + 1 : proposal.approvals,
        rejections: !approve ? proposal.rejections + 1 : proposal.rejections,
        voters: newVoters,
      });

      toast.success(`✅ Vote ${approve ? 'approved' : 'rejected'} successfully!`, {
        description: `You can no longer vote on this proposal`
      });
      
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
      // Use treasury wallet public key for transactions
      const sourceKey = publicKey || TREASURY_WALLET.publicKey;
      
      // Check wallet connection
      if (!sourceKey) {
        toast.error('Wallet not connected. Please connect your wallet first.');
        return;
      }

      // 🔒 ADMIN CHECK: Only treasury owner can execute proposals
      if (sourceKey !== TREASURY_WALLET.publicKey) {
        toast.error('⛔ Access Denied: Only the treasury owner can execute proposals.', {
          description: `Treasury Owner: ${TREASURY_WALLET.publicKey.slice(0, 8)}...${TREASURY_WALLET.publicKey.slice(-8)}`
        });
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

      toast.loading('Preparing real transaction...', { id: 'execute' });
      
      // Execute REAL Stellar transaction with automatic Freighter/Secret Key fallback
      const result = await executePaymentWithFallback({
        sourcePublicKey: sourceKey,
        destinationPublicKey: proposal.recipient,
        amount: proposal.amount,
        memo: `DAO Proposal #${proposalId}`,
        network: 'testnet',
        secretKey: TREASURY_WALLET.secretKey || undefined // Use secret key if Freighter fails
      });

      if (result.success) {
        // Update UI
        updateProposal(proposalId, { executed: true });
        
        // Refresh balance from blockchain
        toast.loading('Refreshing balance...', { id: 'execute' });
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${sourceKey}`);
        if (response.ok) {
          const data = await response.json();
          const xlmBalance = data.balances.find((b: any) => b.asset_type === 'native');
          if (xlmBalance) {
            setBalance(xlmBalance.balance);
          }
        }

        toast.success(
          `✅ ${transferAmount} XLM transferred successfully!\n🔗 Hash: ${result.hash?.slice(0, 12)}...\n📊 Ledger: ${result.ledger}`,
          { id: 'execute', duration: 6000 }
        );
        
        // Show link to view transaction
        setTimeout(() => {
          toast.info(
            <div className="cursor-pointer" onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${result.hash}`, '_blank')}>
              Click to view transaction on Stellar Explorer →
            </div>,
            { duration: 8000 }
          );
        }, 1000);
        
      } else {
        toast.error(result.error || 'Transaction failed', { id: 'execute' });
      }

    } catch (error: any) {
      console.error('Execution error:', error);
      toast.error(`Failed to execute: ${error.message || 'Unknown error'}`, { id: 'execute' });
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
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-semibold">
                      #{proposal.id}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-semibold">
                      {proposal.category === 'Development' && '💻'}
                      {proposal.category === 'Marketing' && '📢'}
                      {proposal.category === 'Security' && '🔒'}
                      {proposal.category === 'Social' && '🤝'}
                      {proposal.category === 'Infrastructure' && '🏗️'}
                      {proposal.category === 'Other' && '📋'}
                      {' '}{proposal.category}
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
                <div className="space-y-3">
                  {/* Show if user has already voted */}
                  {publicKey && proposal.voters?.includes(publicKey) && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                      <p className="text-blue-400 text-sm font-semibold">
                        ✓ You have already voted on this proposal
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: publicKey && !proposal.voters?.includes(publicKey) ? 1.02 : 1 }}
                      whileTap={{ scale: publicKey && !proposal.voters?.includes(publicKey) ? 0.98 : 1 }}
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={!publicKey || proposal.voters?.includes(publicKey)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        !publicKey || proposal.voters?.includes(publicKey)
                          ? 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: publicKey && !proposal.voters?.includes(publicKey) ? 1.02 : 1 }}
                      whileTap={{ scale: publicKey && !proposal.voters?.includes(publicKey) ? 0.98 : 1 }}
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={!publicKey || proposal.voters?.includes(publicKey)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        !publicKey || proposal.voters?.includes(publicKey)
                          ? 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Reject
                    </motion.button>
                    {/* Only show Execute button to treasury owner */}
                    {proposal.approvals > proposal.rejections && publicKey === TREASURY_WALLET.publicKey && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleExecute(proposal.id)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Execute (Owner Only)
                      </motion.button>
                    )}
                    {/* Show message for non-owners */}
                    {proposal.approvals > proposal.rejections && publicKey !== TREASURY_WALLET.publicKey && (
                      <div className="px-6 py-3 bg-gray-500/20 border border-gray-500/30 rounded-xl text-gray-400 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Execution (Owner Only)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
