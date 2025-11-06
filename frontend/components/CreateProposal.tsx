"use client";

import { motion } from 'framer-motion';
import { Send, Wallet, FileText, User, Tag } from 'lucide-react';
import { useState } from 'react';
import { useWalletStore, ProposalCategory } from '@/store/walletStore';
import { toast } from 'sonner';

export default function CreateProposal() {
  const { addProposal, proposals } = useWalletStore();
  const [formData, setFormData] = useState({
    description: '',
    recipient: '',
    amount: '',
    category: 'Development' as ProposalCategory,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.recipient || !formData.amount || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, call smart contract here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      const newProposal = {
        id: proposals.length + 1,
        description: formData.description,
        recipient: formData.recipient,
        amount: formData.amount,
        category: formData.category,
        approvals: 0,
        rejections: 0,
        voters: [], // Initialize empty voters array
        executed: false,
        createdAt: new Date(),
      };

      addProposal(newProposal);
      toast.success('Proposal created successfully!');
      
      // Reset form
      setFormData({
        description: '',
        recipient: '',
        amount: '',
        category: 'Development',
      });
    } catch (error) {
      toast.error('Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Create New Proposal</h1>
        <p className="text-gray-400">Submit a proposal for community voting</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-effect rounded-2xl p-8 space-y-6"
      >
        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-white font-semibold mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
            Proposal Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your proposal in detail..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <p className="text-gray-500 text-sm mt-2">
            Be clear and specific about what you're proposing and why it benefits the DAO
          </p>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="flex items-center gap-2 text-white font-semibold mb-3">
            <User className="w-5 h-5 text-blue-400" />
            Recipient Address
          </label>
          <input
            type="text"
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-gray-500 text-sm mt-2">
            Enter the Stellar address that will receive the funds
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="flex items-center gap-2 text-white font-semibold mb-3">
            <Wallet className="w-5 h-5 text-green-400" />
            Amount (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
              XLM
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Specify the amount to be transferred if the proposal is approved
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-white font-semibold mb-3">
            <Tag className="w-5 h-5 text-purple-400" />
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProposalCategory })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="Development" className="bg-gray-900">💻 Development</option>
            <option value="Marketing" className="bg-gray-900">📢 Marketing</option>
            <option value="Security" className="bg-gray-900">🔒 Security</option>
            <option value="Social" className="bg-gray-900">🤝 Social</option>
            <option value="Infrastructure" className="bg-gray-900">🏗️ Infrastructure</option>
            <option value="Other" className="bg-gray-900">📋 Other</option>
          </select>
          <p className="text-gray-500 text-sm mt-2">
            Select the category that best describes this proposal
          </p>
        </div>

        {/* Preview */}
        {(formData.description || formData.recipient || formData.amount) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Preview
            </h3>
            <div className="space-y-3 text-sm">
              {formData.description && (
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="text-white mt-1">{formData.description}</p>
                </div>
              )}
              {formData.category && (
                <div>
                  <span className="text-gray-400">Category:</span>
                  <p className="text-purple-400 font-semibold mt-1">{formData.category}</p>
                </div>
              )}
              {formData.recipient && (
                <div>
                  <span className="text-gray-400">Recipient:</span>
                  <p className="text-blue-400 font-mono mt-1">{formData.recipient}</p>
                </div>
              )}
              {formData.amount && (
                <div>
                  <span className="text-gray-400">Amount:</span>
                  <p className="text-green-400 font-semibold mt-1">{formData.amount} XLM</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Proposal...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Proposal
            </>
          )}
        </motion.button>

        <p className="text-center text-gray-500 text-sm">
          Once submitted, your proposal will be visible to all DAO members for voting
        </p>
      </motion.form>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-white font-semibold mb-4">💡 Tips for a successful proposal</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Clearly explain the purpose and expected outcomes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Provide detailed budget breakdown if applicable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Double-check the recipient address to avoid errors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Engage with community feedback before submitting</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
