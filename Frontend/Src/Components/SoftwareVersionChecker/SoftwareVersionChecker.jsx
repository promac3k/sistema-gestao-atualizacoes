import React from "react";
import { useSoftwareVersionChecker } from "../../hooks/useSoftwareVersionChecker";

/**
 * Componente para exibir o status de uma verificação individual
 */
const SoftwareVersionStatus = ({ result }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case "up-to-date":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Atualizado
                    </span>
                );
            case "outdated":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ Desatualizado
                    </span>
                );
            case "newer":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🔄 Mais recente
                    </span>
                );
            case "not-found":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ❓ Não encontrado
                    </span>
                );
            case "error":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⚠️ Erro
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ❓ Desconhecido
                    </span>
                );
        }
    };

    const getVersionInfo = () => {
        if (result.latestVersion) {
            return (
                <div className="text-xs text-gray-600 mt-1">
                    <div>Atual: {result.currentVersion || "N/A"}</div>
                    <div>Mais recente: {result.latestVersion.version}</div>
                    {result.latestVersion.source && (
                        <div className="text-blue-600">
                            Fonte:{" "}
                            {result.latestVersion.source === "winget"
                                ? "WinGet"
                                : result.latestVersion.source === "chocolatey"
                                ? "Chocolatey"
                                : "GitHub"}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="text-xs text-gray-600 mt-1">
                Versão atual: {result.currentVersion || "N/A"}
            </div>
        );
    };

    return (
        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">
                        {result.software.nome}
                    </h4>
                    {result.software.fabricante && (
                        <p className="text-xs text-gray-500">
                            {result.software.fabricante}
                        </p>
                    )}
                </div>
                <div className="ml-3">{getStatusBadge(result.status)}</div>
            </div>

            {getVersionInfo()}

            {result.message && (
                <div className="text-xs text-gray-600 mt-2 italic">
                    {result.message}
                </div>
            )}

            {result.latestVersion?.projectUrl && (
                <div className="mt-2">
                    <a
                        href={result.latestVersion.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                        🔗 Ver projeto
                    </a>
                </div>
            )}
        </div>
    );
};

/**
 * Componente para exibir estatísticas da verificação
 */
const SoftwareStatistics = ({ statistics }) => {
    if (!statistics) return null;

    const StatCard = ({ value, label, color, icon }) => (
        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center">
            <div
                className={`text-lg font-bold ${color} flex items-center justify-center gap-1`}
            >
                <span>{icon}</span>
                <span>{value}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <StatCard
                value={statistics.total}
                label="Total"
                color="text-gray-600"
                icon="📦"
            />
            <StatCard
                value={statistics.upToDate}
                label="Atualizados"
                color="text-green-600"
                icon="✅"
            />
            <StatCard
                value={statistics.outdated}
                label="Desatualizados"
                color="text-red-600"
                icon="⚠️"
            />
            <StatCard
                value={statistics.notFound}
                label="Não encontrados"
                color="text-gray-600"
                icon="❓"
            />
            <StatCard
                value={statistics.errors}
                label="Erros"
                color="text-yellow-600"
                icon="⚠️"
            />
        </div>
    );
};

/**
 * Componente para exibir o progresso da verificação
 */
const ProgressBar = ({ progress }) => {
    if (!progress) return null;

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                    Verificando: {progress.software}
                </span>
                <span className="text-sm text-gray-600">
                    {progress.current}/{progress.total} ({progress.percentage}%)
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                />
            </div>
        </div>
    );
};

/**
 * Componente principal do verificador de versões de software
 */
const SoftwareVersionChecker = ({ softwareList = [] }) => {
    const [filter, setFilter] = React.useState("all"); // 'all', 'outdated', 'up-to-date', 'not-found', 'error'
    const [showAllResults, setShowAllResults] = React.useState(false);

    const {
        isChecking,
        results,
        progress,
        statistics,
        error,
        lastChecked,
        startChecking,
        clearResults,
        getOutdatedSoftware,
        getUpToDateSoftware,
        getNotFoundSoftware,
        getErrorSoftware,
        hasResults,
    } = useSoftwareVersionChecker(softwareList);

    const outdatedSoftware = getOutdatedSoftware();
    const upToDateSoftware = getUpToDateSoftware();
    const notFoundSoftware = getNotFoundSoftware();
    const errorSoftware = getErrorSoftware();

    // Filtrar resultados baseado no filtro selecionado
    const getFilteredResults = () => {
        switch (filter) {
            case "outdated":
                return outdatedSoftware;
            case "up-to-date":
                return upToDateSoftware;
            case "not-found":
                return notFoundSoftware;
            case "error":
                return errorSoftware;
            default:
                return results;
        }
    };

    const filteredResults = getFilteredResults();

    if (!softwareList || softwareList.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                    ⚠️ Nenhum software disponível para verificação.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 border border-yellow-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">
                    Verificador de Versões
                </h3>
                <div className="flex gap-2">
                    {hasResults && (
                        <button
                            onClick={clearResults}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            disabled={isChecking}
                        >
                            Limpar
                        </button>
                    )}
                    <button
                        onClick={startChecking}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={isChecking}
                    >
                        {isChecking ? "Verificando..." : "Verificar Versões"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">❌ {error}</p>
                </div>
            )}

            {isChecking && <ProgressBar progress={progress} />}

            {lastChecked && (
                <div className="text-xs text-gray-500 mb-4">
                    Última verificação: {lastChecked.toLocaleString("pt-PT")}
                </div>
            )}

            {statistics && <SoftwareStatistics statistics={statistics} />}

            {hasResults && (
                <div>
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1 text-sm rounded ${
                                filter === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Todos ({results.length})
                        </button>
                        <button
                            onClick={() => setFilter("outdated")}
                            className={`px-3 py-1 text-sm rounded ${
                                filter === "outdated"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Desatualizados ({outdatedSoftware.length})
                        </button>
                        <button
                            onClick={() => setFilter("up-to-date")}
                            className={`px-3 py-1 text-sm rounded ${
                                filter === "up-to-date"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Atualizados ({upToDateSoftware.length})
                        </button>
                        <button
                            onClick={() => setFilter("not-found")}
                            className={`px-3 py-1 text-sm rounded ${
                                filter === "not-found"
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Não encontrados ({notFoundSoftware.length})
                        </button>
                        <button
                            onClick={() => setFilter("error")}
                            className={`px-3 py-1 text-sm rounded ${
                                filter === "error"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Erros ({errorSoftware.length})
                        </button>
                    </div>

                    {/* Mostrar aviso especial para software desatualizado */}
                    {filter === "all" && outdatedSoftware.length > 0 && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                <span>⚠️</span>
                                Atenção: {outdatedSoftware.length} software(s)
                                desatualizado(s)
                            </h4>
                            <p className="text-red-700 text-sm mb-3">
                                Recomenda-se atualizar estes programas para
                                manter a segurança e funcionalidade.
                            </p>
                            <button
                                onClick={() => setFilter("outdated")}
                                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                                Ver apenas desatualizados
                            </button>
                        </div>
                    )}

                    {/* Resultados */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-800">
                                {filter === "all"
                                    ? `Todos os Resultados`
                                    : filter === "outdated"
                                    ? "Software Desatualizado"
                                    : filter === "up-to-date"
                                    ? "Software Atualizado"
                                    : filter === "not-found"
                                    ? "Software Não Encontrado"
                                    : "Software com Erros"}{" "}
                                ({filteredResults.length})
                            </h4>
                            {filteredResults.length > 6 && (
                                <button
                                    onClick={() =>
                                        setShowAllResults(!showAllResults)
                                    }
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {showAllResults
                                        ? "Mostrar menos"
                                        : "Mostrar todos"}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(showAllResults
                                ? filteredResults
                                : filteredResults.slice(0, 6)
                            ).map((result, index) => (
                                <SoftwareVersionStatus
                                    key={index}
                                    result={result}
                                />
                            ))}
                        </div>

                        {!showAllResults && filteredResults.length > 6 && (
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">
                                    E mais {filteredResults.length - 6}{" "}
                                    resultado(s)...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!hasResults && !isChecking && !error && (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-lg font-medium mb-2">
                        Verificar Versões de Software
                    </p>
                    <p className="text-sm">
                        Clique em "Verificar Versões" para verificar se há
                        atualizações disponíveis
                    </p>
                    <p className="text-sm mt-2 text-gray-400">
                        Serão verificados {softwareList.length} programas usando
                        APIs do WinGet, Chocolatey e GitHub
                    </p>
                </div>
            )}
        </div>
    );
};

export default SoftwareVersionChecker;
