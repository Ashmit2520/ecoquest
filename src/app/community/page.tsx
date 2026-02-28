'use client';

import { useState, useEffect, useRef } from 'react';
import { directMessages, Post, Thread, Comment } from '@/data/community';
import { useAuth } from '@/context/AuthContext';

// Single community channel
const communityChannel: Thread = {
  id: 'community-chat',
  name: 'Community Chat',
  icon: '🌱',
  unread: 0,
  lastMessage: '',
  isChannel: true,
};

// DM message type
interface DMMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
}

export default function CommunityPage() {
  const { user, lumaCoins, spendLumaCoins } = useAuth();
  const [activeThread, setActiveThread] = useState<string>('community-chat');
  const [showSidebar, setShowSidebar] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [dmMessages, setDmMessages] = useState<Record<string, DMMessage[]>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [lumaReactedPosts, setLumaReactedPosts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load posts and DMs from localStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('ecoquest_community_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Default posts
      setPosts([
        {
          id: '1',
          author: 'EcoChampion42',
          avatar: '🦊',
          content: 'Just completed the "Bike to Work Week" challenge! 🚴‍♀️ Saved 15kg of CO2 this week alone. Who else is crushing their commute goals?',
          timestamp: '2 hours ago',
          likes: 24,
          lumaReactions: 150,
          tags: ['biking', 'commute'],
          comments: [],
        },
        {
          id: '2',
          author: 'SustainableSteph',
          avatar: '🌻',
          content: 'Pro tip: Bring a reusable bag on your quest walks! I found 3 pieces of litter on my way to the recycling center quest today. Double impact! 💚',
          timestamp: '4 hours ago',
          likes: 42,
          lumaReactions: 200,
          tags: ['tips', 'recycling'],
          comments: [],
        },
      ]);
    }

    const savedDMs = localStorage.getItem('ecoquest_dm_messages');
    if (savedDMs) {
      setDmMessages(JSON.parse(savedDMs));
    }

    const savedLiked = localStorage.getItem('ecoquest_liked_posts');
    if (savedLiked) {
      setLikedPosts(new Set(JSON.parse(savedLiked)));
    }

    const savedLumaReacted = localStorage.getItem('ecoquest_luma_reacted_posts');
    if (savedLumaReacted) {
      setLumaReactedPosts(new Set(JSON.parse(savedLumaReacted)));
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('ecoquest_community_posts', JSON.stringify(posts));
    }
  }, [posts]);

  // Save DMs to localStorage
  useEffect(() => {
    if (Object.keys(dmMessages).length > 0) {
      localStorage.setItem('ecoquest_dm_messages', JSON.stringify(dmMessages));
    }
  }, [dmMessages]);

  // Save liked posts
  useEffect(() => {
    localStorage.setItem('ecoquest_liked_posts', JSON.stringify(Array.from(likedPosts)));
  }, [likedPosts]);

  // Save luma reacted posts
  useEffect(() => {
    localStorage.setItem('ecoquest_luma_reacted_posts', JSON.stringify(Array.from(lumaReactedPosts)));
  }, [lumaReactedPosts]);

  const handleLike = (postId: string) => {
    if (likedPosts.has(postId)) {
      setLikedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes - 1 } : p
      ));
    } else {
      setLikedPosts(prev => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
    }
  };

  const handleLumaReaction = (postId: string) => {
    if (lumaCoins >= 5 && !lumaReactedPosts.has(postId)) {
      spendLumaCoins(5);
      setLumaReactedPosts(prev => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, lumaReactions: p.lumaReactions + 5 } : p
      ));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (newPostContent.trim() || newImagePreview) {
      if (activeThread === 'community-chat') {
        // Post to community chat
        const newPost: Post = {
          id: Date.now().toString(),
          author: user?.username || 'Anonymous',
          avatar: '🦊',
          content: newPostContent,
          image: newImagePreview || undefined,
          timestamp: 'Just now',
          likes: 0,
          lumaReactions: 0,
          comments: [],
        };
        setPosts([newPost, ...posts]);
      } else {
        // Send DM
        const newMessage: DMMessage = {
          id: Date.now().toString(),
          author: user?.username || 'You',
          avatar: '🦊',
          content: newPostContent,
          image: newImagePreview || undefined,
          timestamp: 'Just now',
        };
        setDmMessages(prev => ({
          ...prev,
          [activeThread]: [...(prev[activeThread] || []), newMessage],
        }));
      }
      setNewPostContent('');
      setNewImagePreview(null);
    }
  };

  const getActiveThreadData = () => {
    if (activeThread === 'community-chat') {
      return communityChannel;
    }
    return directMessages.find(t => t.id === activeThread);
  };

  const activeThreadData = getActiveThreadData();

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-24 left-4 z-50 md:hidden w-12 h-12 bg-eco-green text-white rounded-full shadow-lg flex items-center justify-center"
      >
        {showSidebar ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 
        transform transition-transform md:transform-none
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <span className="text-xl">🌱</span>
            Community
          </h2>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Channels</h3>
            <ThreadItem
              thread={communityChannel}
              isActive={activeThread === 'community-chat'}
              onClick={() => {
                setActiveThread('community-chat');
                setShowSidebar(false);
              }}
            />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Direct Messages</h3>
            {directMessages.map((dm) => (
              <ThreadItem
                key={dm.id}
                thread={dm}
                isActive={activeThread === dm.id}
                onClick={() => {
                  setActiveThread(dm.id);
                  setShowSidebar(false);
                }}
              />
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-eco-green/10 flex items-center justify-center text-xl">
              🦊
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{user?.username || 'Guest'}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>🪙</span> {lumaCoins} Luma
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeThreadData?.icon}</span>
            <h3 className="font-semibold text-gray-900">{activeThreadData?.name}</h3>
            {activeThreadData?.isChannel && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {posts.length} posts
              </span>
            )}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Post/Message Composer */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-eco-green/10 flex items-center justify-center text-xl shrink-0">
                🦊
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={activeThread === 'community-chat' ? "Share your eco journey..." : "Type a message..."}
                  className="w-full resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-sm min-h-[60px]"
                />
                
                {/* Image Preview */}
                {newImagePreview && (
                  <div className="relative mt-2 mb-2">
                    <img 
                      src={newImagePreview} 
                      alt="Preview" 
                      className="max-h-48 rounded-xl object-cover"
                    />
                    <button
                      onClick={() => setNewImagePreview(null)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="Attach image"
                    >
                      📷
                    </button>
                    {activeThread === 'community-chat' && (
                      <>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                          🏷️
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                          📍
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPostContent.trim() && !newImagePreview}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      newPostContent.trim() || newImagePreview
                        ? 'bg-eco-green text-white hover:bg-eco-green-dark'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {activeThread === 'community-chat' ? 'Post' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content - either posts or DM messages */}
          {activeThread === 'community-chat' ? (
            // Community Posts
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPosts.has(post.id)}
                hasLumaReacted={lumaReactedPosts.has(post.id)}
                canAffordLuma={lumaCoins >= 5}
                onLike={() => handleLike(post.id)}
                onLumaReact={() => handleLumaReaction(post.id)}
                delay={index * 0.1}
              />
            ))
          ) : (
            // DM Messages
            <div className="space-y-3">
              {(dmMessages[activeThread] || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">💬</span>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              {(dmMessages[activeThread] || []).map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{msg.author}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    {msg.content && <p className="text-gray-800 text-sm">{msg.content}</p>}
                    {msg.image && (
                      <img src={msg.image} alt="Attachment" className="mt-2 max-h-48 rounded-xl object-cover" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadItem({ 
  thread, 
  isActive, 
  onClick 
}: { 
  thread: Thread; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
        isActive
          ? 'bg-eco-green/10 text-eco-green'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span className="text-lg">{thread.icon}</span>
      <span className="flex-1 text-left text-sm font-medium truncate">{thread.name}</span>
      {thread.unread > 0 && (
        <span className="bg-eco-green text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
          {thread.unread}
        </span>
      )}
    </button>
  );
}

function PostCard({
  post,
  isLiked,
  hasLumaReacted,
  canAffordLuma,
  onLike,
  onLumaReact,
  delay,
}: {
  post: Post;
  isLiked: boolean;
  hasLumaReacted: boolean;
  canAffordLuma: boolean;
  onLike: () => void;
  onLumaReact: () => void;
  delay: number;
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
            {post.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.author}</span>
              <span className="text-xs text-gray-500">{post.timestamp}</span>
            </div>
            <p className="text-gray-800 mt-1">{post.content}</p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-eco-green/10 text-eco-green px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="px-4 pb-4">
          <img 
            src={post.image} 
            alt="Post attachment" 
            className="w-full max-h-64 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-sm transition-all ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <span className={isLiked ? 'animate-[unlock-pop_0.3s_ease-out]' : ''}>
            {isLiked ? '❤️' : '🤍'}
          </span>
          <span>{post.likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-eco-green transition-colors"
        >
          <span>💬</span>
          <span>{post.comments.length}</span>
        </button>

        <button
          onClick={onLumaReact}
          disabled={hasLumaReacted || !canAffordLuma}
          className={`flex items-center gap-1.5 text-sm transition-all ${
            hasLumaReacted
              ? 'text-amber-500'
              : canAffordLuma
                ? 'text-gray-500 hover:text-amber-500'
                : 'text-gray-300 cursor-not-allowed'
          }`}
          title={hasLumaReacted ? 'You sent Luma!' : 'Send 5 Luma coins'}
        >
          <span className={hasLumaReacted ? 'animate-[coin-spin_0.5s_ease-out]' : ''}>🪙</span>
          <span>{post.lumaReactions}</span>
        </button>

        <button className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
          <span>⋯</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && post.comments.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-3">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
          
          {/* Comment Input */}
          <div className="flex items-center gap-2 pt-2">
            <div className="w-8 h-8 rounded-full bg-eco-green/10 flex items-center justify-center text-sm shrink-0">
              🦊
            </div>
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-eco-green"
            />
          </div>
        </div>
      )}
    </div>
  );
}
