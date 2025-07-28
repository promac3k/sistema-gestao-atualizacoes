import { useState, useEffect } from "react";
import {getDispositivosDataOptimized} from "../Services/Dispositivos";

// Hook personalizado para gerenciar dados do dashboard
export const useDispositivos = () => {
    const [data, setData] = useState({
        stats: {
            totalDispositivos: 0,
            dispositivosOnline: 0,
            dispositivosOffline: 0,
            sistemasDesatualizados: 0,
            dispositivosCriticos: 0,
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
        dispositivos: [],
        dispositivosCriticos: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Função para carregar dados
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔄 Carregando dados dos dispositivos...");

            const response = await getDispositivosDataOptimized();

            if (response.success) {
                setData(response.data);
                setLastUpdated(new Date());
            } else {
                setError(
                    response.message || "Erro ao carregar dados do dashboard"
                );
            }

        } catch (err) {
            setError("Erro inesperado ao carregar dados");
            console.error("Erro ao carregar Dispositivos:", err);
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
