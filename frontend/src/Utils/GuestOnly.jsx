import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const GuestOnly = () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    return <Navigate to="/project" replace />;
  }
  return <Outlet />;
};

export default GuestOnly;


