import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Sparkles, ArrowLeft, Crown, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import MessageBubble from '@/components/chat/MessageBubble';
import { useAuth } from '@/lib/AuthContext';
import { io } from 'socket.io-client';
import { toast as hotToast } from 'react-hot-toast';
import { getApiUrl, API_BASE_URL } from '@/lib/api';

// Patterns to detect and censor contact sharing
const PHONE_REGEX = /\b\d[\d\s\-().]{7,}\d\b/g;
const KEYWORD_REGEX = /\b(whatsapp|facebook|instagram|ig)\b/gi;

function filterMessage(text) {
  let censored = text.replace(PHONE_REGEX, '[CENSORED]');
  censored = censored.replace(KEYWORD_REGEX, '[CENSORED]');
  return { filtered: censored, wasCensored: censored !== text };
}

export default function CommunityChat() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const isVipOrAdmin = currentUser?.isLoggedIn && (currentUser?.role === 'vip' || currentUser?.role === 'admin');
  const isStandardUser = currentUser?.isLoggedIn && currentUser?.role === 'user';
  const isGuest = !currentUser?.isLoggedIn;

  // 1. Fetch chat history and establish socket connection on mount
  useEffect(() => {
    // Fetch past message log
    fetch(getApiUrl('/api/chat/history'))
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(err => {
        console.error('❌ Failed to fetch chat history:', err);
      });

    // Initialize Socket connection to server
    const socketUrl = API_BASE_URL || 'https://api.mypopvault.online';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    socketRef.current = socket;

    // Send join registration payload ONLY for logged-in users
    if (currentUser?.isLoggedIn) {
      const username = currentUser.username || currentUser.email?.split('@')[0];
      const userId = currentUser._id || currentUser.id;
      socket.emit('joinChat', { username, userId });
    }

    // Listen for incoming messages
    socket.on('message', (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    // Listen for online user updates (strictly filtering out guests/anonymous entries)
    socket.on('onlineUsers', (usersList) => {
      const activeCollectors = (Array.isArray(usersList) ? usersList : []).filter(name => {
        if (!name) return false;
        const lower = name.toLowerCase();
        return !lower.includes('guest') && !lower.includes('anonymous');
      });
      setOnlineUsers(activeCollectors);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // 2. Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    const { wasCensored } = filterMessage(text);
    if (wasCensored) {
      hotToast.error('🛡️ Content flag detected: Message flagged for community moderation.');
    }

    if (socketRef.current) {
      const username = currentUser?.username || currentUser?.email?.split('@')[0] || 'Anonymous';
      const userId = currentUser?._id || currentUser?.id || null;
      socketRef.current.emit('sendMessage', { text, senderName: username, senderId: userId });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Convert schema objects to matching bubble attributes
  const mapMessageForBubble = (msg) => {
    return {
      id: msg._id || Math.random().toString(),
      author_name: msg.senderName,
      author_email: `${msg.senderName}@mypopvault.com`,
      created_date: msg.timestamp,
      text: msg.text
    };
  };

  const getMyUsername = () => {
    return currentUser?.username || currentUser?.email?.split('@')[0] || '';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-colors overflow-hidden">
      {/* Header */}
      <motion.div
        className="bg-white dark:bg-gray-900 border-b-4 border-gray-800 px-6 py-4 flex items-center gap-4 shadow-[0_4px_0px_rgba(0,0,0,0.8)] shrink-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-gray-800 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)] shrink-0"
          whileHover={{ y: -2, boxShadow: '3px 5px 0px rgba(0,0,0,0.8)' }}
          whileTap={{ y: 0, boxShadow: '1px 1px 0px rgba(0,0,0,0.8)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-6 h-6 text-gray-850 dark:text-white" />
        </motion.button>
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl border-4 border-gray-800 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-805 dark:text-white flex items-center gap-2">
            Community Chat
            <motion.span
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </motion.span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">Talk with fellow collectors in real-time!</p>
        </div>
      </motion.div>

      {/* Top Mobile Pill Bar (Visible on mobile/tablet) */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b-2 border-gray-800 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="flex items-center gap-1 shrink-0 text-xs font-black text-gray-500 dark:text-gray-400 uppercase mr-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Active ({onlineUsers.length}):
        </span>
        <div className="flex gap-1.5">
          {onlineUsers.map((name, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-805 rounded-full text-[10px] font-black text-gray-800 dark:text-gray-300">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Body container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 max-w-4xl mx-auto w-full">
            {messages.length === 0 ? (
              <motion.div
                className="h-full flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MessageCircle className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-black text-gray-600 dark:text-gray-300 mb-2">No messages yet!</h3>
                <p className="text-gray-400 font-bold">Be the first to say something 👋</p>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg._id || idx}
                    message={mapMessageForBubble(msg)}
                    isOwn={msg.senderName === getMyUsername()}
                  />
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Panel */}
          <div className="border-t-4 border-gray-800 bg-white dark:bg-gray-900 p-4 shrink-0">
            {currentUser?.isLoggedIn ? (
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 h-12 border-4 border-gray-800 rounded-2xl font-bold text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:shadow-[3px_3px_0px_rgba(236,0,140,0.6)] focus:border-pink-500 transition-all dark:bg-gray-950 dark:text-white"
                />
                <motion.button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 border-4 border-gray-800 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </form>
            ) : (
              <div className="w-full flex justify-center py-2">
                <motion.button
                  onClick={() => navigate('/Login')}
                  className="w-full max-w-md py-3.5 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-black text-sm rounded-2xl border-4 border-gray-805 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  Login to join the conversation
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar for Online Users (Desktop only) */}
        <div className="hidden md:block w-64 border-l-4 border-gray-800 bg-white dark:bg-gray-900 p-4 shrink-0 overflow-y-auto">
          <h3 className="text-sm font-black text-gray-805 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            Online Collectors ({onlineUsers.length})
          </h3>
          <div className="space-y-2">
            {onlineUsers.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold italic">No one online</p>
            ) : (
              onlineUsers.map((name, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-805 rounded-xl border-2 border-gray-800 font-bold text-sm text-gray-800 dark:text-gray-300">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-cyan-500 text-white flex items-center justify-center text-[10px] font-black uppercase">
                    {name[0]}
                  </div>
                  <span className="truncate">{name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}