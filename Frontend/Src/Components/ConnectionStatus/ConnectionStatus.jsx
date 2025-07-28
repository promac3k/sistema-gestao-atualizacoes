import React, { useState, useEffect } from "react";
import { checkApiHealth } from "../../Services/Dashboard";

const ConnectionStatus = () => {
    const [status, setStatus] = useState("checking"); // 'checking', 'online', 'offline'
    const [lastCheck, setLastCheck] = useState(null);

    const checkConnection = async () => {
        setStatus("checking");
        try {
            console.log(
                "🔍 ConnectionStatus: Verificando conexão com a API..."
            );
            const result = await checkApiHealth();
            console.log("🔍 ConnectionStatus: Resultado:", result);

            if (result.success) {
                setStatus("online");
                console.log("✅ ConnectionStatus: API está online");
            } else {
                setStatus("offline");
                console.log(
                    "❌ ConnectionStatus: API está offline -",
                    result.message
                );
            }
            setLastCheck(new Date());
        } catch (error) {
            console.error("❌ ConnectionStatus: Erro ao verificar API:", error);
            setStatus("offline");
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        checkConnection();
        // Verificar a cada 5 minutos (300000 ms)
        const interval = setInterval(checkConnection, 300000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "offline":
                return "bg-red-500";
            case "checking":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = () => {
        switch (status) {
            case "online":
                return "Online";
            case "offline":
                return "Offline";
            case "checking":
                return "Verificando...";
            default:
                return "Desconhecido";
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <div
                className={`w-3 h-3 rounded-full ${getStatusColor()} ${
                    status === "checking" ? "animate-pulse" : ""
                }`}
            ></div>
            <span className="text-gray-600">API: {getStatusText()}</span>
            {lastCheck && (
                <span className="text-xs text-gray-400">
                    (última verificação: {lastCheck.toLocaleTimeString("pt-PT")}
                    )
                </span>
            )}
        </div>
    );
};

export default ConnectionStatus;
