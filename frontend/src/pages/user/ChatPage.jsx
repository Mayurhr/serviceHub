import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesAPI, bookingsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ProviderAvatar from '../../components/common/ProviderAvatar';
import { getInitials, avatarStyle } from '../../utils/avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const [b, m] = await Promise.all([
        bookingsAPI.getOne(bookingId),
        messagesAPI.get(bookingId),
      ]);
      setBooking(b.data);
      setMessages(m.data || []);
    } catch { toast.error('Failed to load chat'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const interval = setInterval(async () => {
      try { const m = await messagesAPI.get(bookingId); setMessages(m.data || []); } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const r = await messagesAPI.send(bookingId, { message: text, messageType: 'text' });
      setMessages(prev => [...prev, r.data]);
      setText('');
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading chat..." />;

  const provider = booking?.provider;
  const quickMessages = [
    'When will you arrive?',
    'I am at home, please come.',
    'How much will it cost?',
    'Please call me before coming.',
    'Can you bring extra materials?',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 flex items-center gap-3">
          <Link to={`/booking/${bookingId}`}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 font-bold shrink-0">
            ←
          </Link>

          {provider ? (
            <>
              <ProviderAvatar provider={provider} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{provider.name}</p>
                <p className="text-xs text-green-600 font-semibold">Provider</p>
              </div>
              <a href={`tel:${provider.phone}`}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-base shrink-0">
                📞
              </a>
            </>
          ) : (
            <div className="flex-1">
              <p className="font-bold text-slate-800">Chat</p>
              <p className="text-xs text-slate-500">Booking #{booking?.bookingId?.slice(-8)}</p>
            </div>
          )}
        </div>

        {/* Service strip */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-2xl">🔧</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{booking?.service?.name}</p>
            <p className="text-xs text-slate-500">
              {booking?.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''} · {booking?.timeSlot}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            booking?.status === 'completed' ? 'bg-green-100 text-green-700' :
            booking?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-orange-100 text-orange-700'}`}>
            {booking?.status?.replace('_', ' ')}
          </span>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mb-3">💬</div>
              <p className="text-slate-500 font-medium text-sm">No messages yet</p>
              <p className="text-slate-400 text-xs mt-1">Send a message to your provider</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.sender === 'user';
                const isSystem = msg.sender === 'system';
                if (isSystem) return (
                  <div key={i} className="flex justify-center">
                    <span className="bg-slate-100 text-slate-500 text-xs px-4 py-1.5 rounded-full">{msg.message}</span>
                  </div>
                );
                return (
                  <div key={i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && provider && (
                      <ProviderAvatar provider={provider} size="xs" className="mb-1 shrink-0" />
                    )}
                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}>
                      {!isMe && provider && (
                        <p className="text-[10px] font-bold mb-0.5 opacity-70">{provider.name}</p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-orange-200 text-right' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Quick messages */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {quickMessages.map(q => (
            <button key={q} onClick={() => setText(q)}
              className="bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={send} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={provider ? `Message ${provider.name}...` : 'Type a message...'}
            className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-200 border border-slate-200 focus:border-orange-300 transition-all"
            disabled={sending}
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-40 shrink-0">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
