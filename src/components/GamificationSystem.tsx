import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award, Zap, TrendingUp } from 'lucide-react';

const GamificationSystem = () => {
  const userProfile = {
    name: "राम कुमार",
    role: "Retailer",
    level: 5,
    xp: 2340,
    nextLevelXp: 3000,
    rating: 4.8,
    badges: ["Monthly Buyer", "5-Week Streak", "Top Rated"],
    achievements: [
      { title: "Monthly Buyer", description: "3+ orders per month", icon: Trophy, color: "bg-[#FFC947]" },
      { title: "Streak Master", description: "Ordered 5 weeks in a row", icon: Target, color: "bg-[#5DAE49]" },
      { title: "Top Rated", description: "4.5+ star rating", icon: Star, color: "bg-purple-500" }
    ]
  };

  const milestones = [
    { role: "Vehicle Owner", title: "100 Deliveries Completed", xp: 500, icon: Trophy },
    { role: "Vehicle Owner", title: "Fastest Delivery of Week", xp: 200, icon: Zap },
    { role: "Retailer", title: "Monthly Buyer Achievement", xp: 300, icon: Award }
  ];

  const xpProgress = (userProfile.xp / userProfile.nextLevelXp) * 100;

  return (
    <section className="py-20 bg-gradient-to-br from-[#0D1B2A] to-[#1a2332] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gamification & Rewards
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Earn XP, unlock badges, and climb the leaderboard as you grow your business
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">R</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{userProfile.name}</h3>
                <p className="text-gray-300">{userProfile.role}</p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Level {userProfile.level}</span>
                <span className="text-sm text-gray-300">{userProfile.xp}/{userProfile.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] h-3 rounded-full"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-6">
              <Star className="h-5 w-5 text-[#FFC947] fill-current" />
              <span className="text-lg font-semibold">{userProfile.rating}</span>
              <span className="text-gray-300">Rating</span>
            </div>

            {/* Badges */}
            <div>
              <h4 className="font-semibold mb-3">Active Badges</h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#5DAE49] rounded-full text-sm font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold mb-6">Recent Achievements</h3>
            {userProfile.achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center space-x-4"
              >
                <div className={`w-12 h-12 ${achievement.color} rounded-lg flex items-center justify-center`}>
                  <achievement.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">{achievement.title}</h4>
                  <p className="text-gray-300 text-sm">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Milestones Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Latest Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#5DAE49]/20 to-[#FFC947]/20 rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-full flex items-center justify-center mx-auto mb-4">
                  <milestone.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">{milestone.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{milestone.role}</p>
                <div className="bg-[#FFC947] text-[#0D1B2A] px-3 py-1 rounded-full text-sm font-bold">
                  +{milestone.xp} XP
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-2xl p-8 text-center"
        >
          <TrendingUp className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Climb the Leaderboard</h3>
          <p className="text-lg opacity-90 mb-6">
            Complete more orders, maintain high ratings, and unlock exclusive rewards
          </p>
          <button className="bg-white text-[#0D1B2A] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            View Full Leaderboard
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GamificationSystem;