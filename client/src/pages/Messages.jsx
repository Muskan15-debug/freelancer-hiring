import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { conversationsAPI } from '../api/index.js';

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef(null);

  useEffect(() => {
    const load = async () => {
      try { const { data } = await conversationsAPI.getAll(); setConversations(data.conversations); } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const load = async () => {
      try { const { data } = await conversationsAPI.getMessages(activeConv._id); setMessages(data.messages); } catch {}
    };
    load();
    if (socket) {
      socket.emit('joinConversation', activeConv._id);
      socket.on('newMessage', ({ message, conversationId }) => {
        if (conversationId === activeConv._id) setMessages(prev => [...prev, message]);
      });
      return () => { socket.emit('leaveConversation', activeConv._id); socket.off('newMessage'); };
    }
  }, [activeConv, socket]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    try {
      const { data } = await conversationsAPI.sendMessage(activeConv._id, newMsg.trim());
      setMessages(prev => [...prev, data.message]);
      setNewMsg('');
    } catch {}
  };

  const otherUser = (conv) => conv.participants?.find(p => p._id !== user?._id);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="messages-layout" style={{ margin: 'calc(-1 * var(--space-xl))', height: 'calc(100vh - var(--topbar-height))' }}>
      <div className="conversation-list">
        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border-color)' }}>
          <h3>Messages</h3>
        </div>
        {conversations.map(conv => {
          const other = otherUser(conv);
          return (
            <div key={conv._id} className={`conversation-item ${activeConv?._id === conv._id ? 'active' : ''}`} onClick={() => setActiveConv(conv)}>
              <div className="avatar avatar-sm">{other?.name?.[0]}</div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className="font-semibold text-sm truncate">{other?.name}</div>
                <div className="text-xs text-muted truncate">{conv.lastMessage?.text || 'No messages'}</div>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && <div className="empty-state" style={{ padding: 'var(--space-xl)' }}><div className="empty-state-title">No conversations</div></div>}
      </div>

      <div className="chat-window">
        {activeConv ? (
          <>
            <div className="chat-header">
              <div className="avatar avatar-sm">{otherUser(activeConv)?.name?.[0]}</div>
              <div className="font-semibold">{otherUser(activeConv)?.name}</div>
            </div>
            <div className="chat-messages">
              {messages.map(m => (
                <div key={m._id} className={`message-bubble ${m.sender?._id === user?._id ? 'sent' : 'received'}`}>
                  {m.text}
                  <div className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input className="form-input" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="loading-screen"><p className="text-muted">Select a conversation to start chatting</p></div>
        )}
      </div>
    </div>
  );
};

export default Messages;
