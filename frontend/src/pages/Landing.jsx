import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Package, TrendingUp, Shield, Star, Zap, ArrowRight, ChevronDown, MessageCircle, LogIn, LogOut, Crown, Search, Eye, MessageSquare, ArrowDownUp, CheckCircle, Sun, Moon } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import BouncyButton from '@/components/BouncyButton';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import Navbar from '@/components/Navbar';

export default function Landing() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const dashboardTarget = user?.isLoggedIn ? '/Dashboard' : '/Login';
  const collectionTarget = user?.isLoggedIn ? '/Collection' : '/Login';

  const features = [
    {
      icon: Package,
      title: "Track Your Collection",
      description: "Catalog every Pop with detailed info, images, and rarity levels",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Monitor Value",
      description: "Watch your collection's worth grow with real-time market valuations",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: Shield,
      title: "Protect Your Investment",
      description: "Keep detailed records for insurance and trading purposes",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Beautiful charts and stats to understand your collection better",
      color: "from-purple-400 to-indigo-500"
    }
  ];

  const floatingPops = [
    { x: '10%', y: '20%', delay: 0, size: 80 },
    { x: '85%', y: '15%', delay: 0.5, size: 60 },
    { x: '75%', y: '70%', delay: 1, size: 70 },
    { x: '15%', y: '75%', delay: 1.5, size: 50 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden text-gray-900 dark:text-white transition-colors duration-200">
      {/* Top Nav Bar */}
      <Navbar />

      {/* Hero Section */}
      <PopArtBackground>
        <section className="relative h-full flex flex-col items-center justify-center px-4 py-20 pt-28">
          {/* Floating Pop Shapes */}
          {floatingPops.map((pop, index) => (
            <motion.div
              key={index}
              className="absolute hidden md:block"
              style={{ left: pop.x, top: pop.y }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: pop.delay,
              }}
            >
              <div 
                className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-4 border-gray-400 dark:border-gray-650 shadow-xl"
                style={{ width: pop.size, height: pop.size * 1.3 }}
              >
                <div className="h-1/4 bg-gray-750 dark:bg-gray-900 rounded-t-xl flex items-center justify-center">
                  <span className="text-white text-xs font-bold">#{Math.floor(Math.random() * 999)}</span>
                </div>
                <div className="h-3/4 flex items-center justify-center">
                  <Sparkles className="text-pink-400" style={{ width: pop.size * 0.4 }} />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Main Content */}
          <motion.div
            className="text-center max-w-4xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-cyan-100 dark:from-pink-950/20 dark:to-cyan-950/20 px-4 py-2 rounded-full mb-6 border border-pink-200 dark:border-pink-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
            >
              <Star className="w-4 h-4 text-yellow-500" fill="#FFD700" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">The #1 Funko Pop Tracker</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
                MyPop
              </span>
              <span className="text-gray-850 dark:text-white">Vault</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Track, value, and showcase your Funko Pop collection like never before. 
              <span className="text-pink-505 font-bold"> It's time to unlock your vault!</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to={dashboardTarget}>
                <BouncyButton
                  variant="primary"
                  size="xl"
                  icon={Sparkles}
                >
                  Enter The Vault
                </BouncyButton>
              </Link>
              <Link to={collectionTarget}>
                <BouncyButton
                  variant="outline"
                  size="xl"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  View Collection
                </BouncyButton>
              </Link>
              <Link to="/CommunityChat">
                <BouncyButton
                  variant="secondary"
                  size="xl"
                  icon={MessageCircle}
                >
                  Community Chat
                </BouncyButton>
              </Link>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { value: '10K+', label: 'Pops Tracked' },
                { value: '$2M+', label: 'Value Managed' },
                { value: '5K+', label: 'Happy Collectors' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <p className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white">{stat.value}</p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </motion.div>
        </section>
      </PopArtBackground>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-4">
              Why <span className="text-pink-500">Collectors</span> Love Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage and grow your Funko Pop empire
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl"
                  style={{ background: `linear-gradient(to bottom right, ${feature.color.split(' ')[0].replace('from-', '')}20, ${feature.color.split(' ')[1].replace('to-', '')}20)` }}
                />
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-800 shadow-lg h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 border-4 border-gray-850 rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,0.85)] overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            {/* Comic dot pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Starburst decorations */}
            <motion.div
              className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full border-4 border-gray-850"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/20 rounded-full border-4 border-gray-850"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />

            <div className="relative z-10 p-8 md:p-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                <motion.div
                  className="w-20 h-20 bg-gray-800 rounded-3xl border-4 border-gray-900 flex items-center justify-center shadow-[5px_5px_0px_rgba(0,0,0,0.6)] shrink-0"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="w-10 h-10 text-yellow-400" />
                </motion.div>
                <div className="text-center md:text-left">
                  <div className="inline-block bg-gray-800 text-yellow-400 font-black text-xs px-3 py-1 rounded-full border-2 border-gray-900 mb-2 tracking-widest uppercase">
                    Exclusive Members Only
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight">
                    Go <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">VIP</span> Premium 👑
                  </h2>
                  <p className="text-gray-705 font-bold text-lg mt-1">Unlock the full collector experience</p>
                </div>
              </div>

              {/* Benefits grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: Search, title: 'Search Collectors', desc: 'Find & browse any collector in the community by series, rarity, or name.', path: '/CollectorSearch' },
                  { icon: Eye, title: 'View Public Vaults', desc: 'Browse other collectors\' full inventories and scout items you want.', path: '/CollectorSearch' },
                  { icon: MessageSquare, title: 'Private 1-on-1 Chat', desc: 'Message collectors directly to negotiate deals in private.', path: '/PopMessenger' },
                  { icon: ArrowDownUp, title: 'Send Trade Offers', desc: 'Propose trades directly from any public vault with a single click.', path: '/TradeManager' },
                ].map((benefit, i) => (
                  <Link key={i} to={benefit.path} className="block">
                    <motion.div
                      className="flex items-start gap-4 bg-white/70 border-4 border-gray-850 rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.7)] hover:bg-white/90 transition-colors"
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <div className="w-12 h-12 bg-gray-800 rounded-2xl border-2 border-gray-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                        <benefit.icon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <h3 className="font-black text-gray-950 text-base">{benefit.title}</h3>
                        </div>
                        <p className="text-gray-900 font-semibold text-sm mt-0.5">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Link to="/vip-upgrade">
                  <motion.div
                    className="inline-flex items-center gap-3 bg-gray-800 text-yellow-400 font-black text-xl px-10 py-5 rounded-3xl border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.7)] cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '8px 12px 0px rgba(0,0,0,0.7)', scale: 1.03 }}
                    whileTap={{ y: 0, boxShadow: '3px 3px 0px rgba(0,0,0,0.7)', scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                  >
                    <Crown className="w-7 h-7" />
                    Get VIP Access 👑
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Decorative elements */}
          <motion.div
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 left-4"
          >
            <Sparkles className="w-8 h-8 text-white/30" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 relative z-10">
            Ready to Start Collecting?
          </h2>
          <p className="text-white/90 text-xl mb-8 relative z-10">
            Join thousands of collectors managing their Funko Pop treasures
          </p>
          <Link to={dashboardTarget}>
            <BouncyButton variant="outline" size="xl" className="bg-white text-gray-800 border-white">
              Get Started Free
            </BouncyButton>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 dark:border-gray-850">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-500" />
            <span className="font-black text-xl">
              <span className="text-cyan-500">MyPop</span>
              <span className="text-gray-800 dark:text-white">Vault</span>
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} MyPopVault. Made with ❤️ for collectors.
          </p>
        </div>
      </footer>
    </div>
  );
}