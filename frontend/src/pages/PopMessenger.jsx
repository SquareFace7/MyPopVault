import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Sparkles, User, ArrowLeft, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import PrivateChatModal from '@/components/PrivateChatModal';
import BouncyButton from '@/components/BouncyButton';
import { getApiUrl, API_BASE_URL } from '@/lib/api';

export default function PopMessenger() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [localMuted, setLocalMuted] = useState(() => localStorage.getItem('messenger_muted') === 'true');
  
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setLocalMuted(localStorage.getItem('messenger_muted') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch active conversations list
  const fetchConversations = () => {
    setLoading(true);
    fetch(getApiUrl('/api/messages/private/conversations'), {
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve active chats.');
        return res.json();
      })
      .then(data => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('❌ Failed to load messenger inbox.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!currentUser || !currentUser.isLoggedIn) {
      navigate('/Login');
      return;
    }
    
    fetchConversations();

    // Establish socket connection for real-time inbox updates
    const socketUrl = API_BASE_URL || 'https://api.mypopvault.online';
    const socket = io(socketUrl);
    socketRef.current = socket;

    const username = currentUser.username || currentUser.email.split('@')[0];
    const userId = currentUser._id || currentUser.id;
    socket.emit('joinChat', { username, userId });

    socket.on('privateMessage', (newMsg) => {
      const msgSender = newMsg.sender?._id || newMsg.sender;
      const msgReceiver = newMsg.receiver?._id || newMsg.receiver;
      const myId = currentUser._id || currentUser.id;

      // Update conversations array locally on new message
      setConversations(prev => {
        const otherId = msgSender === myId ? msgReceiver : msgSender;
        const existsIdx = prev.findIndex(c => c.otherUser._id === otherId);

        if (existsIdx !== -1) {
          const updated = [...prev];
          updated[existsIdx] = {
            ...updated[existsIdx],
            latestMessage: newMsg.text,
            timestamp: newMsg.timestamp || new Date().toISOString()
          };
          // Move the active conversation to the top
          const [moved] = updated.splice(existsIdx, 1);
          return [moved, ...updated];
        } else {
          // Re-fetch conversation list to populate user details cleanly
          fetchConversations();
          return prev;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // Filter conversations by username search
  const filteredConversations = conversations.filter(convo =>
    convo.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-12 h-12 bg-gray-900 border-4 border-gray-800 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.85)] transition-colors hover:bg-gray-800"
            >
              <ArrowLeft className="w-6 h-6 text-pink-500" />
            </button>
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl border-4 border-gray-800 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-wider text-white leading-tight">PopMessenger</h1>
                {currentUser?.isLoggedIn && (
                  <button
                    onClick={() => {
                      const nextMuted = !localMuted;
                      setLocalMuted(nextMuted);
                      localStorage.setItem('messenger_muted', String(nextMuted));
                      window.dispatchEvent(new Event('storage'));
                      toast.success(nextMuted ? '🔇 Messages muted' : '🔊 Messages unmuted', {
                        style: {
                          border: '4px solid #1f2937',
                          padding: '10px 14px',
                          color: '#1f2937',
                          fontWeight: 'bold',
                          borderRadius: '16px',
                        }
                      });
                    }}
                    className="p-1.5 rounded-lg bg-gray-900 border-2 border-gray-800 text-gray-400 hover:text-white transition-colors"
                    title={localMuted ? "Unmute Notifications" : "Mute Notifications"}
                  >
                    {localMuted ? (
                      <VolumeX className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-green-500 fill-green-500" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-gray-400 font-bold text-xs">Direct 1-on-1 private messaging inbox for VIPs</p>
            </div>
          </div>

          <BouncyButton
            variant="primary"
            icon={ArrowUpRight}
            onClick={() => navigate('/CollectorSearch')}
            className="self-start md:self-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-black px-4 py-2 rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
          >
            Find Collectors
          </BouncyButton>
        </motion.div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search active chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-gray-900 border-4 border-gray-800 rounded-2xl font-bold text-xs text-white placeholder-gray-500 shadow-inner focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Conversations Container */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-lg font-black text-pink-500 animate-pulse uppercase tracking-widest">
              Opening Messages...
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <motion.div
            className="bg-gray-900 border-4 border-gray-805 rounded-3xl p-12 text-center shadow-[6px_6px_0px_rgba(0,0,0,0.85)] max-w-md mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-black uppercase text-white mb-2">No Active Conversations</h3>
            <p className="text-gray-400 font-bold text-xs mb-6">
              You haven't messaged anyone yet. Visit the Collector Vault to start a dialogue!
            </p>
            <BouncyButton
              variant="primary"
              onClick={() => navigate('/CollectorSearch')}
              className="w-full justify-center text-xs font-black border-4 border-gray-800 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
            >
              Start a Conversation
            </BouncyButton>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredConversations.map((convo, index) => {
                const date = new Date(convo.timestamp);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <motion.div
                    key={convo.otherUser._id}
                    onClick={() => setSelectedRecipient({
                      id: convo.otherUser._id,
                      username: convo.otherUser.username
                    })}
                    className="relative cursor-pointer group"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute inset-0 bg-black/35 rounded-2xl translate-x-1.5 translate-y-1.5" />
                    <div className="relative bg-gray-900 border-4 border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-colors group-hover:bg-gray-800/80">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 border-2 border-gray-850 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                        {convo.otherUser.avatar}
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-white text-sm truncate uppercase tracking-wide group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            {convo.otherUser.username}
                            {convo.unreadCount > 0 && (
                              <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping shrink-0" />
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            {convo.unreadCount > 0 && (
                              <span className="bg-pink-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center shrink-0">
                                {convo.unreadCount}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-gray-550 shrink-0">
                              {timeString}
                            </span>
                          </div>
                        </div>
                        <p className={`text-xs truncate mt-1 ${convo.unreadCount > 0 ? 'text-white font-black' : 'text-gray-400 font-bold'}`}>
                          {convo.latestMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Private Chatmodal Trigger */}
        {selectedRecipient && (
          <PrivateChatModal
            recipientId={selectedRecipient.id}
            recipientName={selectedRecipient.username}
            onClose={() => {
              setSelectedRecipient(null);
              // Re-fetch inboxes to pull updated snippet
              fetchConversations();
            }}
          />
        )}
      </div>
    </div>
  );
}
