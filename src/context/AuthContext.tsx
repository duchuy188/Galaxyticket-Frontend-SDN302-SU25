

import React, { useEffect, useState, createContext, useContext } from 'react';
import axios from 'axios';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, 'id' | 'role'> & { password: string }
  ) => Promise<boolean>;
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (res.data.success) {
        const userInfo: User = {
          id: res.data.user.id,
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          phone: res.data.user.phone,
          role: res.data.user.role,
        };

        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('token', res.data.token);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  // const register = async (
  //   userData: Omit<User, 'id' | 'role'> & { password: string }
  // ): Promise<boolean> => {
  //   try {
  //     const res = await axios.post('http://localhost:5000/api/auth/register', userData);

  //     if (res.data.success) {
  //       const userInfo: User = {
  //         id: res.data.user.id,
  //         fullName: res.data.user.fullName,
  //         email: res.data.user.email,
  //         phone: res.data.user.phone,
  //         role: res.data.user.role,
  //       };

  //       setUser(userInfo);
  //       localStorage.setItem('user', JSON.stringify(userInfo));
  //       localStorage.setItem('token', res.data.token);
  //       return true;
  //     }
  //     return false;
  //   } catch (err) {
  //     console.error('Register failed:', err);
  //     return false;
  //   }
  // };

  const register = async (
  userData: Omit<User, 'id' | 'role'> & { password: string }
): Promise<boolean> => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: userData.fullName, // map fullName -> name
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      
    });

    if (res.data.success && res.data.user) {
      const userInfo: User = {
        id: res.data.user.id,
        fullName: res.data.user.name, // lấy lại theo cách BE trả về
        email: res.data.user.email,
        phone: res.data.user.phone,
        role: res.data.user.role,
      };

      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', res.data.token);
      return true;
    }

    return false;
  } catch (err) {
    console.error('Register failed:', err);
    return false;
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
