import React, { useEffect, useState, createContext, useContext } from 'react';
import axios from 'axios';

type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'manager' | 'member';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, 'id' | 'role'> & { password: string }
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User> & { name?: string }) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        // Map role from backend to frontend
        let mappedRole: 'admin' | 'staff' | 'manager' | 'member';
        const backendRole = res.data.user.role;
        
        console.log('Backend role received:', backendRole);
        
        switch (backendRole?.toLowerCase()) {
          case 'admin':
            mappedRole = 'admin';
            break;
          case 'staff':
            mappedRole = 'staff';
            break;
          case 'manager':
            mappedRole = 'manager';
            break;
          case 'member':
          case 'claimer':
          case 'user':
            mappedRole = 'member';
            break;
          default:
            console.warn('Unknown role from backend:', backendRole, 'defaulting to member');
            mappedRole = 'member';
        }

        console.log('Backend role:', backendRole);
        console.log('Mapped role:', mappedRole);

        const userInfo: User = {
          id: res.data.user.id,
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          phone: res.data.user.phone,
          role: mappedRole,
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

    if (res.data.success) {
      // Chỉ đăng ký thành công, không tự động đăng nhập
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

  const updateProfile = (userData: Partial<User> & { name?: string }) => {
    if (user) {
      // Handle the case where backend returns 'name' instead of 'fullName'
      const updatedUserData = {
        ...userData,
        fullName: userData.fullName || userData.name || user.fullName
      };
      
      const updatedUser = { ...user, ...updatedUserData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
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
