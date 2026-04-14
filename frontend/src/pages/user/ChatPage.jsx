import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesAPI, bookingsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
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

  useEffect(() => {
    const load = async () => {
      try {
        const [b, m] = await Promise.all([bookingsAPI.getOne(bookingId), messagesAPI.get(bookingId)]);
        setBooking(b.data);
        setMessages(m.data);
      } catch { toast.error('Failed to load chat'); } finally { setLoading(false); }
    };
    load();
    const interval = setInterval(async () => {
      try { const m = await messagesAPI.get(bookingId); setMessages(m.data); } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e, type = 'text') => {
    e?.preventDefault();
    if (!text.trim() && type === 'text') return;
    setSending(true);
    try {
      const msg = type === 'consultation' ? text || 'I need help with my problem.' : text;
      const r = await messagesAPI.send(bookingId, { message: msg, messageType: type });
      setMessages(prev => [...prev, r.data]);
      setText('');
      if (type === 'consultation') {
        setTimeout(async () => {
          try { const m = await messagesAPI.get(bookingId); setMessages(m.data); } catch {}
        }, 1000);
      }
    } catch { toast.error('Failed to send'); } finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading chat..." />;

  const quickMessages = ['When will you arrive?', 'Can you bring extra materials?', 'How much will it cost?', 'Please call me before coming'];

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="card-flat p-4 mb-4 flex items-center gap-4">
          <Link to={`/track/${bookingId}`} className="btn-secondary py-2 px-3 text-sm shrink-0">← Track</Link>
          {booking?.provider ? (
            <div className="flex items-center gap-3 flex-1">
              <img src={booking.provider.avatar || `https://i.pravatar.cc/48?u=${booking.provider._id}`}
                className="w-12 h-12 rounded-xl object-cover"
                onError={e => e.target.src = `https://i.pravatar.cc/48?u=${booking.provider._id}`} />
              <div>
                <p className="font-bold text-ink-900">{booking.provider.name}</p>
                <p className="text-xs text-green-600 font-semibold">● Online</p>
              </div>
            </div>
          ) : (
            <div className="flex-1"><p className="font-bold text-ink-900">Chat</p><p className="text-xs text-ink-500">Booking #{booking?.bookingId}</p></div>
          )}
          {booking?.provider && (
            <a href={`tel:${booking.provider.phone}`} className="btn-primary py-2 px-3 text-sm shrink-0">📞 Call</a>
          )}
        </div>

        {/* Problem Help Banner */}
        {booking?.isProblemConsultation && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-violet-800 mb-1">💬 Problem Help Mode</h3>
            <p className="text-violet-700 text-sm mb-2">{booking.consultationNote || 'Describe your problem to get expert advice.'}</p>
            <button onClick={() => send(null, 'consultation')} className="btn-primary text-sm py-2 bg-violet-600 hover:bg-violet-700">
              🤝 Request Consultation
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="card-flat p-4 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-ink-500 font-medium">No messages yet</p>
              <p className="text-ink-400 text-sm mt-1">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';
                if (isSystem) return (
                  <div key={i} className="flex justify-center">
                    <span className="bg-ink-100 text-ink-600 text-xs px-4 py-2 rounded-full font-medium max-w-xs text-center">{msg.message}</span>
                  </div>
                );
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isUser ? 'bg-saffron-500 text-white rounded-2xl rounded-tr-sm' : 'bg-ink-100 text-ink-800 rounded-2xl rounded-tl-sm'} px-4 py-2.5`}>
                      {msg.messageType === 'consultation' && <p className="text-xs font-bold mb-1 opacity-70">📋 Consultation</p>}
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isUser ? 'text-saffron-100' : 'text-ink-400'}`}>
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

        {/* Quick Messages */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {quickMessages.map(q => (
            <button key={q} onClick={() => { setText(q); }}
              className="bg-ink-100 hover:bg-saffron-50 hover:text-saffron-600 text-ink-600 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border border-ink-200 hover:border-saffron-200">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={send} className="card-flat p-3 flex items-center gap-3">
          <input type="text" value={text} onChange={e => setText(e.target.value)}
            placeholder="Type a message..." className="input-field flex-1 py-2.5 text-sm"
            disabled={sending} />
          <button type="submit" disabled={!text.trim() || sending} className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50 shrink-0">
            {sending ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
