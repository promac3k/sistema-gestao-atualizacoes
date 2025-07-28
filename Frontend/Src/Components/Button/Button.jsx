import React from 'react';

export default function Button({ children, ...props }) {
  return (
    <button
      className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      {...props}
    >
      {children}
    </button>
  );
}