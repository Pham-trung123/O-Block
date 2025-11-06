import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SimpleHeader() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-indigo-600">SecureMail</span>
        </div>
        
        <div className="flex space-x-6">
          <button 
            onClick={handleBack}
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            ← Quay lại Trang Chủ
          </button>
        </div>
      </nav>
    </header>
  );
}