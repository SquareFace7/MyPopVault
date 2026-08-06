import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function PrivateChatModal({ recipientId, recipientName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { user: currentUser } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!recipientId || !currentUser) return;

    // Set active recipient ID globally so global notifications/sounds are skipped for this chat
    window.activeChatRecipientId = recipientId;

    // 1. Fetch message history
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/messages/private/chat/${recipientId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error fetching private chat history:', err);
      }
    };

    // Mark messages from this sender as read
    const markAsRead = async () => {
      try {
        await fetch(`/api/messages/private/read/${recipientId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
      } catch (err) {
        console.error('❌ Error marking messages as read:', err);
      }
    };

    fetchHistory();
    markAsRead();

    // 2. Establish Socket connection
    const socketUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    const socket = io(socketUrl);
    socketRef.current = socket;

    const username = currentUser?.username || currentUser?.email?.split('@')[0] || 'Collector';
    const userId = currentUser?._id || currentUser?.id;
    socket.emit('joinChat', { username, userId });

    // Listen for real-time private message broadcast events
    socket.on('privateMessage', (newMsg) => {
      const msgSender = newMsg.sender?._id || newMsg.sender;
      const msgReceiver = newMsg.receiver?._id || newMsg.receiver;
      const myId = currentUser?._id || currentUser?.id;

      if (
        (msgSender === recipientId && msgReceiver === myId) ||
        (msgSender === myId && msgReceiver === recipientId)
      ) {
        console.log('📥 [Socket IO Frontend] Received privateMessage broadcast:', newMsg);
        
        // If it's from the other person and we are actively looking at the chat, mark it as read immediately
        if (msgSender === recipientId) {
          markAsRead();
        }

        setMessages(prev => {
          // If we already have a temporary message with the same text at the end, replace it with the DB message
          const isOurMessage = msgSender === myId;
          if (isOurMessage && prev.length > 0) {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg._id.toString().startsWith('temp-') && lastMsg.text === newMsg.text) {
              return [...prev.slice(0, -1), newMsg];
            }
          }
          // Avoid duplicate keys
          if (prev.some(m => m._id === newMsg._id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    });

    return () => {
      window.activeChatRecipientId = null;
      socket.disconnect();
    };
  }, [recipientId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    const myId = currentUser?._id || currentUser?.id;
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      sender: myId,
      receiver: recipientId,
      text,
      createdAt: new Date().toISOString()
    };

    // Immediately render message locally for premium instant feedback
    setMessages(prev => [...prev, tempMessage]);

    console.log('📤 [REST API Frontend] POSTing private message:', { receiverId: recipientId, text });

    try {
      const response = await fetch('/api/messages/private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          receiverId: recipientId,
          text
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to send message over REST');
      }

      console.log('✅ [REST API Frontend] Message sent successfully & saved:', data);
    } catch (err) {
      console.error('❌ [REST API Frontend] Error sending message:', err);
      toast.error('Failed to deliver message.');
      // Remove temp message locally if it failed
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-900 border-4 border-gray-800 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col h-[480px]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-4 flex items-center justify-between border-b-4 border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="font-black text-white text-base">Chat with {recipientName}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 dark:bg-gray-950">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <Sparkles className="w-8 h-8 text-cyan-450 mb-2 animate-bounce" />
              <p className="text-xs text-gray-400 font-bold italic">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const msgSender = msg.sender?._id || msg.sender;
              const myId = currentUser?._id || currentUser?.id;
              const isOwn = msgSender === myId;
              
              return (
                <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl border-2 border-gray-800 font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,0.3)] ${
                    isOwn 
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-br-sm' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <form onSubmit={handleSend} className="p-3 border-t-4 border-gray-800 flex gap-2 bg-white dark:bg-gray-900 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-10 px-3 border-2 border-gray-800 rounded-xl font-bold text-xs dark:bg-gray-950 dark:text-white"
          />
          <button type="submit" className="px-4 bg-gradient-to-br from-cyan-500 to-blue-500 text-white border-2 border-gray-805 rounded-xl font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
            Send
          </button>
        </form>
      </motion.div>
    </div>
  );
}
