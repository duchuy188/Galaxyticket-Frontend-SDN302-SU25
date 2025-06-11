import React, { useEffect, useState, createContext, useContext } from 'react';
type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  avatar?: string;
};
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'role'> & {
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
};
const AuthContext = createContext<AuthContextType | null>(null);
// Mock users for demonstration
const mockUsers = [{
  id: '1',
  username: 'admin',
  password: '123',
  fullName: 'Admin User',
  email: 'admin@cinema.com',
  phone: '123-456-7890',
  role: 'admin' as const
}, {
  id: '2',
  username: 'manager',
  password: '123',
  fullName: 'Manager User',
  email: 'manager@cinema.com',
  phone: '123-456-7892',
  role: 'manager' as const
}, {
  id: '3',
  username: 'staff',
  password: '123',
  fullName: 'Staff User',
  email: 'staff@cinema.com',
  phone: '123-456-7891',
  role: 'staff' as const
}];
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Check mock users
    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    // Check local storage for registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const registeredUser = registeredUsers.find((u: any) => u.email === username && u.password === password);
    if (foundUser) {
      const userInfo = {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return true;
    } else if (registeredUser) {
      const userInfo = {
        id: registeredUser.id,
        fullName: registeredUser.fullName,
        email: registeredUser.email,
        phone: registeredUser.phone,
        role: 'user' as const
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return true;
    }
    return false;
  };
  const register = async (userData: Omit<User, 'id' | 'role'> & {
    password: string;
  }): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: 'user' as const
    };
    // Save to local storage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    // Log in the new user
    const userInfo = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    };
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return true;
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};