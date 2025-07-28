import { useState, useEffect } from "react";
import { getDispositivosUpdates } from "../Services/Update.js";

export const useUpdate = () => {
    const [data, setData] = useState({
        stats: {
            totalDispositivosComUpdates: 0,
            dispositivosNecessitamUpdates: 0,
            dispositivosNaoInstalados: 0,
            dispositivosNecessarios: 0,
            dispositivosComFalhas: 0,
            sistemasDesatualizados: 0,
            sistemasOffline: 0,
            totalDispositivos: 0,
        },
        dispositivos: [], // Lista completa
        dispositivosCriticos: [], // Apenas críticos
        totalRegistros: 0,
        lastUpdate: null,
    });
    // Estado para gerenciar o carregamento, erro e última atualização
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔄 useUpdate: Iniciando busca de dados...");
            const response = await getDispositivosUpdates();
            console.log("📦 useUpdate: Resposta recebida:", response);

            if (response.success) {
                console.log("✅ useUpdate: Dados processados com sucesso");
                console.log("📊 useUpdate: Stats:", response.data.stats);
                console.log(
                    "📋 useUpdate: Total dispositivos:",
                    response.data.dispositivos?.length || 0
                );
                setData(response.data);
                setLastUpdated(new Date());
            } else {
                console.error(
                    "❌ useUpdate: Erro na resposta:",
                    response.message
                );
                setError(
                    response.message || "Erro ao carregar dados de updates"
                );
            }
        } catch (err) {
            console.error("❌ useUpdate: Erro inesperado:", err);
            setError("Erro inesperado ao carregar dados");
            console.error("Erro ao carregar updates:", err);
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
