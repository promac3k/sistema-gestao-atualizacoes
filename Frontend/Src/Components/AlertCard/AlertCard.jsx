import React from "react";

const AlertCard = ({
    title,
    value,
    type = "info",
    icon,
    description,
    onClick,
}) => {
    const getCardStyles = () => {
        switch (type) {
            case "critical":
                return "bg-red-50 border-red-200 text-red-800";
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-800";
            case "success":
                return "bg-green-50 border-green-200 text-green-800";
            case "info":
            default:
                return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };

    const getIconColor = () => {
        switch (type) {
            case "critical":
                return "text-red-500";
            case "warning":
                return "text-yellow-500";
            case "success":
                return "text-green-500";
            case "info":
            default:
                return "text-blue-500";
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${getCardStyles()} ${
                onClick
                    ? "cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                    : ""
            }`}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {icon && (
                            <div className={`${getIconColor()}`}>{icon}</div>
                        )}
                        <h3 className="text-sm font-medium">{title}</h3>
                    </div>
                    <p className="text-3xl font-bold mb-1">{value}</p>
                    {description && (
                        <p className="text-xs opacity-75">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertCard;
