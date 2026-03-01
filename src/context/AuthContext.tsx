'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  username: string;
  createdAt: string;
  isNewUser: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  lumaCoins: number;
  addLumaCoins: (amount: number) => void;
  spendLumaCoins: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lumaCoins, setLumaCoins] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('ecoquest_user');
    const savedCoins = localStorage.getItem('ecoquest_luma_coins');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCoins) {
      setLumaCoins(parseInt(savedCoins));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('ecoquest_users') || '{}');
    
    if (users[username] && users[username].password === password) {
      const userData: User = {
        username,
        createdAt: users[username].createdAt,
        isNewUser: false
      };
      setUser(userData);
      localStorage.setItem('ecoquest_user', JSON.stringify(userData));
      
      // Load user's coins
      const userCoins = parseInt(localStorage.getItem(`ecoquest_coins_${username}`) || '100');
      setLumaCoins(userCoins);
      localStorage.setItem('ecoquest_luma_coins', String(userCoins));
      
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('ecoquest_users') || '{}');
    
    if (users[username]) {
      return false; // User already exists
    }

    const now = new Date().toISOString();
    users[username] = { password, createdAt: now };
    localStorage.setItem('ecoquest_users', JSON.stringify(users));

    const userData: User = {
      username,
      createdAt: now,
      isNewUser: true
    };
    setUser(userData);
    localStorage.setItem('ecoquest_user', JSON.stringify(userData));
    
    // Give new users starting coins
    const startingCoins = 100;
    setLumaCoins(startingCoins);
    localStorage.setItem('ecoquest_luma_coins', String(startingCoins));
    localStorage.setItem(`ecoquest_coins_${username}`, String(startingCoins));
    
    return true;
  };

  const logout = () => {
    if (user) {
      // Save user's coins before logout
      localStorage.setItem(`ecoquest_coins_${user.username}`, String(lumaCoins));
    }
    setUser(null);
    setLumaCoins(0);
    localStorage.removeItem('ecoquest_user');
    localStorage.removeItem('ecoquest_luma_coins');
    router.push('/login');
  };

  const addLumaCoins = (amount: number) => {
    const newBalance = lumaCoins + amount;
    setLumaCoins(newBalance);
    localStorage.setItem('ecoquest_luma_coins', String(newBalance));
    if (user) {
      localStorage.setItem(`ecoquest_coins_${user.username}`, String(newBalance));
    }
  };

  const spendLumaCoins = (amount: number): boolean => {
    if (lumaCoins >= amount) {
      const newBalance = lumaCoins - amount;
      setLumaCoins(newBalance);
      localStorage.setItem('ecoquest_luma_coins', String(newBalance));
      if (user) {
        localStorage.setItem(`ecoquest_coins_${user.username}`, String(newBalance));
      }
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      lumaCoins, 
      addLumaCoins, 
      spendLumaCoins 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
