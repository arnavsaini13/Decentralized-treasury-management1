"use client";

import { motion } from 'framer-motion';
import { Wallet, Menu, X, Home, LayoutDashboard, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { toast } from 'sonner';

interface NavigationProps {
  activeTab: 'home' | 'dashboard' | 'proposals' | 'create';
  setActiveTab: (tab: 'home' | 'dashboard' | 'proposals' | 'create') => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { publicKey, isConnected, disconnect, setPublicKey, setBalance, setNetwork } = useWalletStore();

  const fetchBalance = async (publicKey: string) => {
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
      if (response.ok) {
        const data = await response.json();
        const xlmBalance = data.balances.find((b: any) => b.asset_type === 'native');
        if (xlmBalance) {
          setBalance(xlmBalance.balance);
          return xlmBalance.balance;
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
    return '0';
  };

  const connectWallet = async () => {
    try {
      // Check if Freighter is installed
      if (typeof window === 'undefined' || !(window as any).freighter) {
        toast.error('Please install Freighter wallet extension');
        window.open('https://www.freighter.app/', '_blank');
        return;
      }

      const { isConnected, getPublicKey, getNetwork } = (window as any).freighter;
      
      // Request connection
      const connected = await isConnected();
      
      if (!connected) {
        toast.error('Please unlock your Freighter wallet');
        return;
      }

      const publicKey = await getPublicKey();
      const network = await getNetwork();
      
      if (publicKey) {
        setPublicKey(publicKey);
        setNetwork(network);
        
        // Fetch actual balance from Stellar
        const balance = await fetchBalance(publicKey);
        
        toast.success(`Wallet connected! Balance: ${parseFloat(balance).toLocaleString()} XLM`);
        setActiveTab('dashboard');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setActiveTab('home');
    toast.success('Wallet disconnected');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'proposals', label: 'Proposals', icon: <FileText className="w-5 h-5" /> },
    { id: 'create', label: 'Create', icon: <Plus className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">DAO Treasury</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-mono">
                      {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Wallet className="w-5 h-5" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg"
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
