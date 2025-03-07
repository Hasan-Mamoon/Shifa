import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || null;
    const storedRole = localStorage.getItem('role') || null;
    const storedId = localStorage.getItem('id') || null;
    const storedEmail = localStorage.getItem('email') || null;

    if (storedToken && storedRole && storedId) {
      setUser({
        id: storedId,
        token: storedToken,
        role: storedRole,
        email: storedEmail,
      });
    }
    setLoading(false); // ✅ Set loading to false after checking storage
  }, []);

  const login = (userData) => {
    const userInfo = {
      id: userData.id,
      token: userData.token,
      role: userData.role,
      email: userData.email,
    };

    setUser(userInfo);

    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('id', userData.id);
    localStorage.setItem('email', userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('email');

    setTimeout(() => {
      window.location.href = '/'; // Ensure proper redirection
    }, 0);
  };

  return (
    <AuthContext.Provider value={{ setUser, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
