import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function SearchBar({ placeholder = "Pesquisar...", onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
    </div>
  );
}