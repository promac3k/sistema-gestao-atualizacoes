import { useState, useEffect, useCallback } from "react";
import {
    checkMultipleSoftwareVersions,
    getSoftwareStatistics,
} from "../Services/SoftwareVersionChecker";

/**
 * Hook customizado para verificar versões de software
 * @param {Array} softwareList - Lista de softwares para verificar
 * @param {boolean} autoStart - Se deve iniciar a verificação automaticamente
 */
export const useSoftwareVersionChecker = (
    softwareList = [],
    autoStart = false
) => {
    const [isChecking, setIsChecking] = useState(false);
    const [results, setResults] = useState([]);
    const [progress, setProgress] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [error, setError] = useState(null);
    const [lastChecked, setLastChecked] = useState(null);

    // Função para iniciar a verificação
    const startChecking = useCallback(async () => {
        if (!softwareList || softwareList.length === 0) {
            setError("Lista de software vazia");
            return;
        }

        setIsChecking(true);
        setError(null);
        setProgress(null);
        setResults([]);

        try {
            console.log(
                `🚀 Iniciando verificação de ${softwareList.length} softwares...`
            );

            const checkResults = await checkMultipleSoftwareVersions(
                softwareList,
                (progressInfo) => {
                    setProgress(progressInfo);
                }
            );

            setResults(checkResults);
            setStatistics(getSoftwareStatistics(checkResults));
            setLastChecked(new Date());
            setProgress(null);

            console.log(
                `✅ Verificação concluída: ${checkResults.length} resultados`
            );
        } catch (err) {
            console.error("❌ Erro durante a verificação:", err);
            setError(err.message || "Erro inesperado durante a verificação");
        } finally {
            setIsChecking(false);
        }
    }, [softwareList]);

    // Função para limpar os resultados
    const clearResults = useCallback(() => {
        setResults([]);
        setStatistics(null);
        setProgress(null);
        setError(null);
        setLastChecked(null);
    }, []);

    // Função para obter softwares desatualizados
    const getOutdatedSoftware = useCallback(() => {
        return results.filter((result) => result.status === "outdated");
    }, [results]);

    // Função para obter softwares atualizados
    const getUpToDateSoftware = useCallback(() => {
        return results.filter((result) => result.status === "up-to-date");
    }, [results]);

    // Função para obter softwares não encontrados
    const getNotFoundSoftware = useCallback(() => {
        return results.filter((result) => result.status === "not-found");
    }, [results]);

    // Função para obter softwares com erro
    const getErrorSoftware = useCallback(() => {
        return results.filter((result) => result.status === "error");
    }, [results]);

    // Auto-iniciar se especificado
    useEffect(() => {
        if (
            autoStart &&
            softwareList &&
            softwareList.length > 0 &&
            !isChecking &&
            results.length === 0
        ) {
            startChecking();
        }
    }, [autoStart, softwareList, isChecking, results.length, startChecking]);

    return {
        // Estados
        isChecking,
        results,
        progress,
        statistics,
        error,
        lastChecked,

        // Funções
        startChecking,
        clearResults,

        // Funções utilitárias
        getOutdatedSoftware,
        getUpToDateSoftware,
        getNotFoundSoftware,
        getErrorSoftware,

        // Estados computados
        hasResults: results.length > 0,
        hasError: !!error,
        progressPercentage: progress?.percentage || 0,
        currentSoftware: progress?.software || null,
    };
};

export default useSoftwareVersionChecker;
