// src/Pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../Components/LoginForm/LoginForm';

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
