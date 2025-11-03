"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Vote, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Lock,
  Sparkles
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ProposalList from '@/components/ProposalList';
import CreateProposal from '@/components/CreateProposal';
import TreasuryStats from '@/components/TreasuryStats';
import { useWalletStore } from '@/store/walletStore';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'proposals' | 'create'>('home');
  const { publicKey } = useWalletStore();

  useEffect(() => {
    if (publicKey && activeTab === 'home') {
      setActiveTab('dashboard');
    }
  }, [publicKey, activeTab]);

  const features = [
    {
      icon: <Vote className="w-6 h-6" />,
      title: "Democratic Governance",
      description: "Every member has a voice. Vote on proposals and shape the future of your DAO."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Transparent",
      description: "Built on Stellar blockchain with smart contracts ensuring trustless execution."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Execute proposals instantly with Stellar's high-speed transaction processing."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track treasury performance, voting patterns, and financial health in real-time."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Empower your community to collectively manage funds and make decisions."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Multi-sig Security",
      description: "Enhanced security with majority voting requirements before fund disbursement."
    }
  ];

  const stats = [
    { value: "100%", label: "Transparent", icon: <Globe className="w-5 h-5" /> },
    { value: "$0", label: "Platform Fees", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "<3s", label: "Transaction Speed", icon: <Zap className="w-5 h-5" /> },
    { value: "∞", label: "Scalability", icon: <Sparkles className="w-5 h-5" /> }
  ];

  if (activeTab !== 'home') {
    return (
      <main className="min-h-screen">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'proposals' && <ProposalList />}
          {activeTab === 'create' && <CreateProposal />}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Powered by Stellar Soroban</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Decentralized</span>
              <br />
              <span className="text-gradient">Treasury Management</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Empower your DAO with transparent, secure, and democratic fund management. 
              Built on Stellar blockchain for lightning-fast transactions and unmatched reliability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('dashboard')}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Launch App
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass-effect rounded-xl font-semibold text-white hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="flex justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the best DAO treasury experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="glass-effect rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-effect rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your DAO?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join hundreds of DAOs already using our platform for transparent and efficient treasury management
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('dashboard')}
                className="px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg"></div>
              <span className="text-white font-bold text-lg">DAO Treasury</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 DAO Treasury. Built on Stellar Soroban. All rights reserved.
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
