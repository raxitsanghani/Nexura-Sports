import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/Database/firebase";
import ReactLoading from "react-loading";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requireAuth = true,
}) => {
  const [user, loading] = useAuthState(auth);

  if (loading)
    return (
      <div className="w-screen flex items-center justify-center h-screen -mt-24">
        <ReactLoading type={"bars"} height={30} width={30} color="black" />
      </div>
    );

  if (user && !requireAuth) return <Navigate to="/" />;
  if (!user && requireAuth) return <Navigate to="/login" />;

  return element;
};

export default ProtectedRoute;
