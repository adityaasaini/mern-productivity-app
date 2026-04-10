// File: src/components/Protected.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const Protected = ({ children }) => {
  // Check kar rahe hain ki local storage mein user ka data hai ya nahi
  // Pichli video mein humne signup/login pe user aur token save karwaya tha
  const user = localStorage.getItem('token'); 

  // Agar user nahi hai (null hai), toh zabardasti Login page par bhej do
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Agar user hai, toh usko wo page (children) dekhne do jo usne manga tha
  return children;
};

export default Protected;
