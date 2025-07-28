import React from "react";

export default function Label({ label, value, className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-600 min-w-[150px]">{label}:</span>
      <span className="text-base text-gray-900">{value || "—"}</span>
    </div>
  );
}