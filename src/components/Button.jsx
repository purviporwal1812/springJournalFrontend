import React from 'react';
const Button = ({ children, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled}
    className={`
      w-full py-3 px-4 rounded-lg font-semibold text-white
      bg-teal-500 hover:bg-teal-600 focus:outline-none
      focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
      transition-all duration-300 transform hover:scale-105
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}
    `}
  >
    {children}
  </button>
);

export default Button;