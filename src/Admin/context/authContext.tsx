// AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// Define the shape of the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    navigate("/admin"); // Redirect to the admin dashboard after login
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    console.log("called");
    setIsAuthenticated(false);
    navigate("/admin/auth/signin"); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
