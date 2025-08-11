import React from 'react';

const FormContainer = ({ title, subtitle, children }) => (
  <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
    <div className="w-full max-w-md mx-auto transition-all duration-500 ease-in-out">
      <div className="bg-primary rounded-2xl shadow-2xl shadow-slate-300/40 p-8 md:p-12 space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default FormContainer;