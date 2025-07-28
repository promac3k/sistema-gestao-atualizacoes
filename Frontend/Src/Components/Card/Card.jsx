// Components/Card/Card.jsx
import React from "react";

export default function Card({
    title,
    value,
    icon,
    iconSize = "text-lg",
    children,
    className = "",
}) {
    return (
        <div className={`bg-white rounded-xl shadow p-4 ${className}`}>
            {title && (
                <div className="flex items-center gap-2 mb-2">
                    {icon && <span className={iconSize}>{icon}</span>}
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
            )}
            {value && (
                <p className="text-2xl font-bold text-blue-600 mb-2">{value}</p>
            )}
            {children}
        </div>
    );
}
