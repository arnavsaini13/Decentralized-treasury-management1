"use client";

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, FileText, Download, Eye, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWalletStore, ProposalCategory } from '@/store/walletStore';
import TreasuryStats from './TreasuryStats';
import TransactionHistory from './TransactionHistory';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DashboardProps {
  setActiveTab: (tab: 'home' | 'dashboard' | 'proposals' | 'create' | 'leaderboard') => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { publicKey, balance, proposals, setBalance, setProposals } = useWalletStore();
  const [activeProposals, setActiveProposals] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  const refreshBalance = async () => {
    if (!publicKey) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
      if (response.ok) {
        const data = await response.json();
        const xlmBalance = data.balances.find((b: any) => b.asset_type === 'native');
        if (xlmBalance) {
          setBalance(xlmBalance.balance);
          toast.success('Balance refreshed!');
        }
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load mock proposals for demo
    if (publicKey && proposals.length === 0) {
      const mockProposals = [
        {
          id: 1,
          description: "Fund community hackathon prize pool",
          recipient: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          amount: "5000",
          category: "Social" as const,
          approvals: 8,
          rejections: 2,
          voters: [], // Empty voters array for mock data
          executed: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          description: "Marketing campaign for Q1 2025",
          recipient: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          amount: "3500",
          category: "Marketing" as const,
          approvals: 12,
          rejections: 1,
          voters: [], // Empty voters array for mock data
          executed: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 3,
          description: "Development team monthly salary",
          recipient: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          amount: "8000",
          category: "Development" as const,
          approvals: 5,
          rejections: 3,
          voters: [], // Empty voters array for mock data
          executed: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];
      setProposals(mockProposals);
    }

    const active = proposals.filter(p => !p.executed).length;
    const votes = proposals.reduce((sum, p) => sum + p.approvals + p.rejections, 0);
    setActiveProposals(active);
    setTotalVotes(votes);
  }, [publicKey, proposals, setProposals]);

  // Prepare category data for pie chart
  const categoryData = proposals.reduce((acc, proposal) => {
    const category = proposal.category || 'Other';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += 1;
      existing.amount += parseFloat(proposal.amount) || 0;
    } else {
      acc.push({ 
        name: category, 
        value: 1,
        amount: parseFloat(proposal.amount) || 0
      });
    }
    return acc;
  }, [] as { name: string; value: number; amount: number }[]);

  const COLORS = {
    'Development': '#8b5cf6',
    'Marketing': '#ec4899',
    'Security': '#f59e0b',
    'Social': '#10b981',
    'Infrastructure': '#3b82f6',
    'Other': '#6b7280'
  };

  const stats = [
    {
      title: "Treasury Balance",
      value: `${parseFloat(balance).toLocaleString()} XLM`,
      change: "+12.5%",
      positive: true,
      icon: <Wallet className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Active Proposals",
      value: activeProposals.toString(),
      change: "+3 this week",
      positive: true,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Total Members",
      value: "47",
      change: "+5 this month",
      positive: true,
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Total Votes Cast",
      value: totalVotes.toString(),
      change: "+18 today",
      positive: true,
      icon: <Clock className="w-6 h-6" />,
      color: "from-orange-500 to-red-500"
    },
  ];

  const recentActivity = [
    { type: 'vote', user: 'Member #23', action: 'voted on', proposal: 'Proposal #1', time: '2 minutes ago' },
    { type: 'create', user: 'Member #15', action: 'created', proposal: 'Proposal #3', time: '1 hour ago' },
    { type: 'execute', user: 'System', action: 'executed', proposal: 'Proposal #2', time: '5 hours ago' },
    { type: 'vote', user: 'Member #8', action: 'voted on', proposal: 'Proposal #1', time: '1 day ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 relative overflow-hidden"
      >
        {/* Stellar Logo */}
        <div className="absolute top-4 right-4 w-24 h-24">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "linear" 
            }}
            className="w-full h-full"
          >
            <img 
              src="https://i.pinimg.com/736x/10/28/65/1028656f82a346ea796b213946aa5d7f.jpg" 
              alt="Stellar Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your DAO treasury today
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-mono">
                  {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
                </span>
              </div>
              <button
                onClick={refreshBalance}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Treasury Stats Chart */}
      <TreasuryStats />

      {/* Proposal Categories Pie Chart */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Proposals by Category</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as ProposalCategory] || COLORS.Other} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Category breakdown */}
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[category.name as ProposalCategory] || COLORS.Other }}
                      />
                      <span className="text-white font-semibold">{category.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{category.value} proposal{category.value !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-green-400 text-sm ml-5">
                    Total: {category.amount.toLocaleString()} XLM
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'vote' ? 'bg-blue-500/20 text-blue-400' :
                  activity.type === 'create' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {activity.type === 'vote' ? '✓' : activity.type === 'create' ? '+' : '⚡'}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                    <span className="text-blue-400">{activity.proposal}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab('create')}
              className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                <span>Create New Proposal</span>
              </div>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button 
              onClick={() => setActiveTab('proposals')}
              className="w-full p-4 glass-effect rounded-xl text-white font-semibold hover:bg-white/15 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span>View All Proposals</span>
              </div>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                if (publicKey) {
                  window.open(`https://stellar.expert/explorer/testnet/account/${publicKey}`, '_blank');
                  toast.success('Opening Stellar Explorer...');
                } else {
                  toast.error('Please connect wallet first');
                }
              }}
              className="w-full p-4 glass-effect rounded-xl text-white font-semibold hover:bg-white/15 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                <span>View on Explorer</span>
              </div>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button 
              onClick={() => setShowTransactionHistory(true)}
              className="w-full p-4 glass-effect rounded-xl text-white font-semibold hover:bg-white/15 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" />
                <span>Transaction History</span>
              </div>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const data = {
                  treasury: balance,
                  proposals: proposals.length,
                  active: activeProposals,
                  votes: totalVotes,
                  address: publicKey,
                  exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dao-treasury-report-${Date.now()}.json`;
                a.click();
                toast.success('Report downloaded!');
              }}
              className="w-full p-4 glass-effect rounded-xl text-white font-semibold hover:bg-white/15 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5" />
                <span>Export Report</span>
              </div>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Transaction History Panel */}
      <TransactionHistory 
        isOpen={showTransactionHistory} 
        onClose={() => setShowTransactionHistory(false)} 
      />
    </div>
  );
}
