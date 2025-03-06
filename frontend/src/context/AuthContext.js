// import { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     const storedRole = localStorage.getItem("role");
//     if (storedToken && storedRole) {
//       setUser({
//         token: storedToken,
//         role: storedRole,
//       });
//     }
//   }, []);

//   const login = (userData) => {
//     const userInfo = {
//       id: userData.id,
//       token: userData.token,
//       role: userData.role,
//       email: userData.email,
//     };

//     setUser(userInfo);

//     localStorage.setItem("token", userData.token);
//     localStorage.setItem("role", userData.role);
//   };

//   const logout = () => {
//     setUser(null);

//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     navigate("/");
//   };

//   return (
//     <AuthContext.Provider value={{ setUser, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   return useContext(AuthContext);
// };






import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    const storedId = localStorage.getItem("id");

    if (storedToken && storedRole && storedEmail && storedId) {
      setUser({
        token: storedToken,
        role: storedRole,
        email: storedEmail,
        id: storedId,
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

    localStorage.setItem("token", userData.token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("id", userData.id);
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("id");

    navigate("/");
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
