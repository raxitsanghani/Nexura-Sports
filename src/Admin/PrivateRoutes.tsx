import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "./context/authContext";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth/signin" replace />;
  }

  return children;
};

export default PrivateRoute;
