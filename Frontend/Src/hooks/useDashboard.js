import { useState, useEffect } from "react";
import { getDashboardDataOptimized } from "../Services/Dashboard";

// Hook personalizado para gerenciar dados do dashboard
export const useDashboard = () => {
    const [data, setData] = useState({
        stats: {
            totalUtilizadores: 0,
            totalDispositivos: 0,
            utilizadoresAtivos: 0,
            dispositivosOnline: 0,
            sistemasDesatualizados: 0,
            servidoresCriticos: 0,
            dispositivosOfflineCritico: 0,
            estatisticasSO: {
                windows11: 0,
                windows10: 0,
                windows8: 0,
                windows7: 0,
                windowsXP: 0,
                windowsServer2022: 0,
                windowsServer2019: 0,
                windowsServer2016: 0,
                windowsServer2012: 0,
                windowsServer2008: 0,
                outros: 0,
            },
        },
        utilizadores: [],
        dispositivos: [],
        dispositivosCriticos: [], // Adicionado para os dispositivos críticos
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getDashboardDataOptimized(); // Usando a função otimizada

            if (response.success) {
                setData(response.data);
                setLastUpdated(new Date());
            } else {
                setError(
                    response.message || "Erro ao carregar dados da dashboard"
                );
            }
        } catch (err) {
            setError("Erro inesperado ao carregar dados");
            console.error("Erro ao carregar dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        error,
        lastUpdated,
        refreshData,
    };
};
