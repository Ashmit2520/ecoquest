'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [isNewUser, setIsNewUser] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [foxPosition, setFoxPosition] = useState<'center' | 'side'>('center');
  const { user, login, register, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // If returning user mode, fox starts on side
    if (!isNewUser) {
      setFoxPosition('side');
    } else {
      setFoxPosition('center');
    }
  }, [isNewUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isNewUser) {
      // Animate fox before registering
      setIsAnimating(true);
      setFoxPosition('side');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = await register(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('Username already exists');
        setFoxPosition('center');
        setIsAnimating(false);
      }
    } else {
      const success = await login(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-green-50 to-emerald-100">
        <div className="text-2xl text-eco-green animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-green-50 to-emerald-100 p-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🌿</div>
      <div className="absolute top-20 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🌱</div>
      <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🍃</div>
      
      {/* Fox Mascot - floating in background */}
      <div 
        className={`fixed z-10 pointer-events-none transition-all duration-1000 ease-out ${
          foxPosition === 'center' 
            ? 'bottom-20 right-8 md:right-20' 
            : 'bottom-32 right-4 md:right-16'
        }`}
      >
        <div className="relative">
          <div className={`text-7xl md:text-8xl transform scale-x-[-1] ${foxPosition === 'center' ? 'fox-float' : 'fox-idle'}`}>
            🦊
          </div>
          {/* Speech bubble */}
          {foxPosition === 'side' && !isNewUser && (
            <div className="absolute -top-14 -left-24 bg-white rounded-xl px-3 py-2 shadow-lg text-sm whitespace-nowrap animate-fade-in">
              <span>Hey there! 👋</span>
              <div className="absolute bottom-0 right-4 w-3 h-3 bg-white transform rotate-45 translate-y-1/2"></div>
            </div>
          )}
          {isNewUser && foxPosition === 'center' && (
            <div className="absolute -top-14 -left-20 bg-white rounded-xl px-3 py-2 shadow-lg text-sm whitespace-nowrap animate-fade-in">
              <span>Let&apos;s go! 🌱</span>
              <div className="absolute bottom-0 right-6 w-3 h-3 bg-white transform rotate-45 translate-y-1/2"></div>
            </div>
          )}
        </div>
      </div>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-eco-green to-eco-green-dark rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🌍</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-eco-green to-emerald-600 bg-clip-text text-transparent">
          EcoQuest
        </h1>
        <p className="text-gray-600 mt-2">Save the planet, one quest at a time</p>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {isNewUser ? 'Create your account' : `Welcome back${username ? `, ${username}` : ''}!`}
          </h2>
          <p className="text-gray-500 text-center mb-6">
            {isNewUser ? 'Start your eco-adventure today' : 'Ready to continue your journey?'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 outline-none transition-all bg-white/50"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 outline-none transition-all bg-white/50"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isAnimating}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-eco-green to-emerald-500 hover:from-eco-green-dark hover:to-emerald-600 shadow-lg shadow-eco-green/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none"
            >
              {isNewUser ? '🚀 Create Account' : '🌟 Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-eco-green hover:text-eco-green-dark font-medium transition-colors"
            >
              {isNewUser ? 'I already have an account' : "I'm new here"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-gray-500 text-sm">
        🌍 Together we can make a difference
      </p>

      <style jsx>{`
        @keyframes fox-float {
          0%, 100% { 
            transform: translateY(0) rotate(-3deg); 
          }
          25% {
            transform: translateY(-15px) rotate(0deg);
          }
          50% { 
            transform: translateY(-8px) rotate(3deg); 
          }
          75% {
            transform: translateY(-20px) rotate(0deg);
          }
        }
        
        @keyframes fox-idle {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fox-float {
          animation: fox-float 4s ease-in-out infinite;
        }
        
        .fox-idle {
          animation: fox-idle 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
