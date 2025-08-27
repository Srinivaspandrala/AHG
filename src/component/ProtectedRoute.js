import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Cookies.get("username"); // or your auth state

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
