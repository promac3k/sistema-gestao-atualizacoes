import { useState, useEffect } from "react";
import { getDispositivoById } from "../Services/Dispositivos";

export const useDispositivoDetalhes = (dispositivoId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        if (!dispositivoId) {
            setError("ID do dispositivo não fornecido");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log(
                `🔄 Carregando detalhes do dispositivo por ID:`,
                dispositivoId
            );
            console.log(`🔄 Tipo do parâmetro:`, typeof dispositivoId);

            const result = await getDispositivoById(dispositivoId);

            if (result.success) {
                setData(result.data);
                setLastUpdated(new Date());
                setError(null);
                console.log("✅ Dados dos detalhes carregados:", result.data);
            } else {
                setError(result.message);
                setData(null);
                console.error("❌ Erro ao carregar detalhes:", result.message);
            }
        } catch (err) {
            console.error("❌ Erro inesperado ao carregar detalhes:", err);
            setError("Erro inesperado ao carregar dados do dispositivo");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    // Carregar dados quando o componente monta ou quando o ID muda
    useEffect(() => {
        if (dispositivoId) {
            fetchData();
        }
    }, [dispositivoId]);

    // Função para recarregar dados manualmente
    const refreshData = () => {
        fetchData();
    };

    return {
        data,
        loading,
        error,
        lastUpdated,
        refreshData,
    };
};
