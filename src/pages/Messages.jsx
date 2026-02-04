import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Trash2, User } from 'lucide-react';
import Chat from '../components/Chat';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    const conv = conversations.find(c => c._id === id);
    if (conv) {
      setSelectedConversation(conv);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages/${conversation._id}`, { replace: true });
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/messages/conversations/${conversationId}`);
        await fetchConversations();
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(null);
          navigate('/messages', { replace: true });
        }
      } catch (err) {
        console.error('Error deleting conversation:', err);
        alert('Failed to delete conversation');
      }
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user?.id);
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 150px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Messages
                </h1>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                    <p className="text-gray-600 text-sm">
                      Start a conversation with a seller from any product page
                    </p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conversation) => {
                      const otherUser = getOtherParticipant(conversation);
                      const isSelected = selectedConversation?._id === conversation._id;

                      return (
                        <div
                          key={conversation._id}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {otherUser?.name || 'Unknown User'}
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {formatDate(conversation.updatedAt)}
                                </span>
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.lastMessage.sender === user?.id ? 'You: ' : ''}
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              <button
                                onClick={(e) => handleDeleteConversation(conversation._id, e)}
                                className="text-gray-400 hover:text-red-600 transition p-1"
                                title="Delete conversation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-2 h-full">
              {selectedConversation ? (
                <Chat
                  conversation={selectedConversation}
                  onUpdate={fetchConversations}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a Conversation
                    </h2>
                    <p className="text-gray-600">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
