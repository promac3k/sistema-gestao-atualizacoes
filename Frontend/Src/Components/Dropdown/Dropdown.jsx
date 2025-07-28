import React from "react";
export default function Dropdown({ label, options = [], value, onChange }) {
    return (
        <div className="w-full flex items-center gap-2">
            {label && (
                <label className="whitespace-nowrap text-sm font-medium min-w-fit">
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="flex-grow min-w-0 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.icon
                            ? `${option.icon} ${option.label}`
                            : option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
