"use client";

import { motion } from 'framer-motion';
import { Trophy, Award, Medal, TrendingUp, Users } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useMemo } from 'react';

export default function Leaderboard() {
  const { proposals } = useWalletStore();

  // Calculate leaderboard statistics
  const leaderboardData = useMemo(() => {
    const stats: Record<string, { votes: number; proposals: number; address: string }> = {};

    proposals.forEach(proposal => {
      // Count proposal creators
      if (proposal.recipient) {
        if (!stats[proposal.recipient]) {
          stats[proposal.recipient] = { votes: 0, proposals: 0, address: proposal.recipient };
        }
        stats[proposal.recipient].proposals += 1;
      }

      // Count voters
      if (proposal.voters) {
        proposal.voters.forEach(voter => {
          if (!stats[voter]) {
            stats[voter] = { votes: 0, proposals: 0, address: voter };
          }
          stats[voter].votes += 1;
        });
      }
    });

    // Convert to array and calculate total score
    const leaderboard = Object.values(stats).map(user => ({
      ...user,
      totalScore: user.votes * 1 + user.proposals * 2, // Proposals worth 2x votes
    }));

    // Sort by total score
    return leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  }, [proposals]);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-md"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Trophy className="w-6 h-6 text-yellow-900" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full blur-md"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/50">
              <Award className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-md"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
              <Medal className="w-6 h-6 text-orange-900" />
            </div>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 font-bold">
            #{rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900";
      default:
        return "bg-white/10 border border-white/20 text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-gray-400">Top contributors to the DAO</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">{leaderboardData.length} Members</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-900" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Most Active</h3>
          <p className="text-2xl font-bold text-white">
            {leaderboardData[0]?.address.slice(0, 8)}...
          </p>
          <p className="text-green-400 text-sm mt-2">{leaderboardData[0]?.totalScore || 0} points</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Votes Cast</h3>
          <p className="text-2xl font-bold text-white">
            {leaderboardData.reduce((sum, user) => sum + user.votes, 0)}
          </p>
          <p className="text-green-400 text-sm mt-2">Across all proposals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Medal className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Proposals Created</h3>
          <p className="text-2xl font-bold text-white">
            {leaderboardData.reduce((sum, user) => sum + user.proposals, 0)}
          </p>
          <p className="text-green-400 text-sm mt-2">By community</p>
        </motion.div>
      </div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Top Contributors</h2>
        
        {leaderboardData.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No activity yet</p>
            <p className="text-gray-500 text-sm mt-2">Start voting and creating proposals to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboardData.map((user, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <motion.div
                  key={user.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isTopThree 
                      ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Rank/Medal */}
                  <div className="flex-shrink-0">
                    {getMedalIcon(rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-mono text-sm sm:text-base truncate">
                        {user.address.slice(0, 8)}...{user.address.slice(-8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRankBadge(rank)}`}>
                        {rank === 1 ? '🥇 1st' : rank === 2 ? '🥈 2nd' : rank === 3 ? '🥉 3rd' : `#${rank}`}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>✅ {user.votes} votes</span>
                      <span>📝 {user.proposals} proposals</span>
                      <span className="text-purple-400 font-semibold">⭐ {user.totalScore} pts</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-2xl font-bold ${
                      rank === 1 ? 'text-yellow-400' :
                      rank === 2 ? 'text-gray-300' :
                      rank === 3 ? 'text-orange-400' :
                      'text-white'
                    }`}>
                      {user.totalScore}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Scoring Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-white font-semibold mb-4">🏆 How Points Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div>
              <p className="text-white font-semibold">Vote on Proposal</p>
              <p className="text-gray-400 text-sm">+1 point</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-xl">📝</span>
            </div>
            <div>
              <p className="text-white font-semibold">Create Proposal</p>
              <p className="text-gray-400 text-sm">+2 points</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
