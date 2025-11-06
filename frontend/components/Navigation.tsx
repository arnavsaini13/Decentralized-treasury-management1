"use client";

import { motion } from 'framer-motion';
import { Wallet, Menu, X, Home, LayoutDashboard, FileText, Plus, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWalletStore, TREASURY_WALLET } from '@/store/walletStore';
import { toast } from 'sonner';

interface NavigationProps {
  activeTab: 'home' | 'dashboard' | 'proposals' | 'create' | 'leaderboard';
  setActiveTab: (tab: 'home' | 'dashboard' | 'proposals' | 'create' | 'leaderboard') => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [freighterReady, setFreighterReady] = useState(false);
  const [showManualConnect, setShowManualConnect] = useState(false);
  const [manualPublicKey, setManualPublicKey] = useState('');
  const { publicKey, isConnected, disconnect, setPublicKey, setBalance, setNetwork } = useWalletStore();

  // Check for Freighter on component mount
  useEffect(() => {
    const checkFreighter = () => {
      // Check all possible ways Freighter might be available
      const freighter = (window as any).freighter;
      const freighterApi = (window as any).freighterApi;
      
      if (freighter || freighterApi) {
        console.log('✅ Freighter API detected!', { freighter: !!freighter, freighterApi: !!freighterApi });
        setFreighterReady(true);
        return true;
      }
      
      // Check if extension is in window at all
      const windowKeys = Object.keys(window).filter(k => k.toLowerCase().includes('freighter'));
      if (windowKeys.length > 0) {
        console.log('Found freighter-related keys:', windowKeys);
      }
      
      return false;
    };

    // Try immediately
    if (checkFreighter()) return;

    // If not found, wait for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkFreighter);
    }

    // Also wait for window load
    window.addEventListener('load', checkFreighter);

    // Polling as backup
    const interval = setInterval(() => {
      if (checkFreighter()) {
        clearInterval(interval);
      }
    }, 500);

    // Stop checking after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('⏱️ Stopped checking for Freighter after 15s');
      console.log('Window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('freighter')));
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.removeEventListener('DOMContentLoaded', checkFreighter);
      window.removeEventListener('load', checkFreighter);
    };
  }, []);

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
    // First try to detect Freighter automatically
    const freighter = (window as any).freighter;
    
    if (freighter && freighter.getPublicKey) {
      // Freighter is available! Try automatic connection
      try {
        toast.loading('Requesting access from Freighter...', { id: 'connect' });
        
        const publicKey = await freighter.getPublicKey();
        
        if (publicKey) {
          const network = await freighter.getNetwork();
          setPublicKey(publicKey);
          setNetwork(network);
          
          const balance = await fetchBalance(publicKey);
          toast.success(`Connected via Freighter! Balance: ${parseFloat(balance).toLocaleString()} XLM`, { id: 'connect' });
          setActiveTab('dashboard');
          return;
        }
      } catch (error: any) {
        console.error('Freighter connection error:', error);
        if (error.toString().includes('declined')) {
          toast.error('Connection declined. Please approve in Freighter.', { id: 'connect' });
          return;
        }
      }
    }
    
    // If Freighter not available or failed, show manual input modal
    console.log('Freighter not available, showing manual connection');
    setShowManualConnect(true);
  };

  const connectWithPublicKey = async () => {
    try {
      const keyToUse = manualPublicKey || TREASURY_WALLET.publicKey;
      
      // Validate public key format
      if (!keyToUse || keyToUse.length !== 56 || !keyToUse.startsWith('G')) {
        toast.error('Invalid public key. Must be 56 characters and start with G');
        return;
      }

      toast.loading('Connecting wallet...', { id: 'connect' });

      // Set the public key
      setPublicKey(keyToUse);
      setNetwork('TESTNET');

      // Fetch balance from Stellar
      const balance = await fetchBalance(keyToUse);
      
      toast.success(`Connected! Balance: ${parseFloat(balance).toLocaleString()} XLM`, { id: 'connect' });
      setShowManualConnect(false);
      setManualPublicKey('');
      setActiveTab('dashboard');
      
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      toast.error('Failed to connect. Please check your public key.', { id: 'connect' });
    }
  };
  
  // Auto-connect with treasury wallet on mount
  useEffect(() => {
    if (!publicKey && !isConnected) {
      const autoConnect = async () => {
        try {
          setPublicKey(TREASURY_WALLET.publicKey);
          setNetwork(TREASURY_WALLET.network);
          const balance = await fetchBalance(TREASURY_WALLET.publicKey);
          console.log('Auto-connected to treasury wallet:', TREASURY_WALLET.publicKey);
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      };
      autoConnect();
    }
  }, []);

  const handleDisconnect = () => {
    disconnect();
    setActiveTab('home');
    toast.success('Wallet disconnected');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'proposals', label: 'Proposals', icon: <FileText className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { id: 'create', label: 'Create', icon: <Plus className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="relative w-12 h-12">
              {/* Animated glow */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5] 
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-xl blur-md"
              />
              
              {/* Main logo with rotation */}
              <motion.div 
                animate={{ 
                  rotateY: [0, 360],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear" 
                }}
                className="relative w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <Wallet className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
              
              {/* Orbiting dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full -translate-x-1/2"></div>
              </motion.div>
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  DAO Treasury
                </span>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="w-1.5 h-1.5 bg-green-500 rounded-full"
                />
              </div>
              <div className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
                Smart Treasury • Stellar Chain
              </div>
            </div>
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
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-mono">
                      {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                    </span>
                  </div>
                  {/* Show OWNER badge if connected wallet is treasury owner */}
                  {publicKey === TREASURY_WALLET.publicKey && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-500/30 border border-purple-500/50 rounded text-purple-300 text-xs font-bold">
                      👑 OWNER
                    </span>
                  )}
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

      {/* Manual Connect Modal */}
      {showManualConnect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Enter your Stellar public key or use the treasury wallet</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Public Key (Starts with G)
                </label>
                <input
                  type="text"
                  value={manualPublicKey}
                  onChange={(e) => setManualPublicKey(e.target.value)}
                  placeholder={TREASURY_WALLET.publicKey}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm"
                  maxLength={56}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to use treasury wallet
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={connectWithPublicKey}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Connect
                </button>
                <button
                  onClick={() => {
                    setShowManualConnect(false);
                    setManualPublicKey('');
                  }}
                  className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
}
