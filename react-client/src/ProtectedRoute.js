import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth(); // Get the current user from AuthProvider

    // If user is not authenticated, redirect to login
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // If authenticated, render the requested route
    return children;
};

export default ProtectedRoute;
