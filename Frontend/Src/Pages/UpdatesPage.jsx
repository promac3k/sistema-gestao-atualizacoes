import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";
import Table from "../Components/Table/Table";
import SearchBar from "../Components/SearchBar/SearchBar";
import Dropdown from "../Components/Dropdown/Dropdown";
import Card from "../Components/Card/Card";
import ConnectionStatus from "../Components/ConnectionStatus/ConnectionStatus";
import { useUpdate } from "../hooks/useUpdate";

export default function UpdatesPage() {
    // Hook de navegação
    const navigate = useNavigate();

    // Hook para carregar dados dos updates
    const {
        data: updatesData,
        loading,
        error,
        lastUpdated,
        refreshData,
    } = useUpdate();

    // Estados locais para filtros
    const [query, setQuery] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("all");
    const [filtroCriticidade, setFiltroCriticidade] = useState("all");

    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Debug: Log dos dados recebidos
    React.useEffect(() => {
        console.log("🔍 UpdatesPage: updatesData alterado:", updatesData);
        console.log(
            "🔍 UpdatesPage: updatesData.dispositivos:",
            updatesData.dispositivos
        );
        console.log(
            "🔍 UpdatesPage: Tipo de dispositivos:",
            typeof updatesData.dispositivos,
            Array.isArray(updatesData.dispositivos)
        );
        if (updatesData.dispositivos && updatesData.dispositivos.length > 0) {
            console.log(
                "🔍 UpdatesPage: Primeiro dispositivo:",
                updatesData.dispositivos[0]
            );
        }
    }, [updatesData]);

    // Preparar dados para a tabela
    const columns = [
        "Nome",
        "Sistema",
        "Updates Necessários",
        "Não Instalados",
        "Com Falhas",
        "Estado",
        "Criticidade",
        "Última Verificação",
    ];

    // Converter dados dos dispositivos para o formato da tabela
    const data = useMemo(() => {
        console.log(
            "🔍 UpdatesPage: Mapeando dados dos dispositivos:",
            updatesData.dispositivos
        );

        return (updatesData.dispositivos || []).map((device) => {
            console.log("🔍 UpdatesPage: Dispositivo individual:", device);

            // Mapear os campos do backend para os campos esperados
            const isOnline = device.ClientStatus === 1;
            const statusUpdate = device.StatusUpdate || "Atualizado";
            const totalUpdates = device.TotalUpdates || 0;
            const updatesPendentes = device.UpdatesPendentes || 0;
            const updatesFalharam = device.UpdatesFalharam || 0;

            // Verificar se o sistema está desatualizado
            const isDesatualizado =
                device.OperatingSystem?.includes("Windows 7") ||
                device.OperatingSystem?.includes("Windows XP") ||
                device.OperatingSystem?.includes("Windows 8") ||
                device.OperatingSystem?.includes("Server 2008") ||
                device.OperatingSystem?.includes("Server 2012");

            // Determinar criticidade baseada no status
            let criticidade = "Normal";
            if (
                statusUpdate.includes("Crítico") ||
                statusUpdate === "Com Falhas" ||
                updatesFalharam > 0 ||
                isDesatualizado
            ) {
                criticidade = "Crítico";
            }

            // Determinar cor baseada no número de updates
            let updatesColor, updatesTextColor;
            if (totalUpdates === 0) {
                updatesColor = "bg-green-100";
                updatesTextColor = "text-green-800";
            } else if (totalUpdates <= 3) {
                updatesColor = "bg-yellow-100";
                updatesTextColor = "text-yellow-800";
            } else if (totalUpdates <= 10) {
                updatesColor = "bg-orange-100";
                updatesTextColor = "text-orange-800";
            } else {
                updatesColor = "bg-red-100";
                updatesTextColor = "text-red-800";
            }

            return {
                // Dados para exibição na tabela
                Nome: device.ComputerName || "N/A",
                Sistema: device.OperatingSystem || "N/A",
                "Updates Necessários": (
                    <div className="flex justify-center">
                        <div
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${updatesColor} ${updatesTextColor}`}
                        >
                            {totalUpdates}
                        </div>
                    </div>
                ),
                "Não Instalados": (
                    <div className="flex justify-center">
                        <span className="text-center font-medium">
                            {updatesPendentes}
                        </span>
                    </div>
                ),
                "Com Falhas": (
                    <div className="flex justify-center">
                        <span className="text-center font-medium">
                            {updatesFalharam}
                        </span>
                    </div>
                ),
                Estado: (
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-sm ${
                                isDesatualizado
                                    ? "bg-yellow-500"
                                    : isOnline
                                    ? "bg-green-500"
                                    : "bg-red-500"
                            }`}
                        />
                        <span
                            className={
                                isDesatualizado
                                    ? "text-yellow-700 font-medium"
                                    : isOnline
                                    ? "text-green-700 font-medium"
                                    : "text-red-700 font-medium"
                            }
                        >
                            {isDesatualizado
                                ? "Desatualizado"
                                : isOnline
                                ? "Online"
                                : "Offline"}
                        </span>
                    </div>
                ),
                Criticidade: (
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-sm ${
                                criticidade === "Crítico"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                            }`}
                        />
                        <span
                            className={
                                criticidade === "Crítico"
                                    ? "text-red-700 font-medium"
                                    : "text-green-700 font-medium"
                            }
                        >
                            {criticidade}
                        </span>
                    </div>
                ),
                "Última Verificação": device.UltimaVerificacao
                    ? new Date(device.UltimaVerificacao).toLocaleDateString(
                          "pt-PT"
                      )
                    : "N/A",

                // Dados brutos para filtros (não exibidos)
                rawData: {
                    nome: (device.ComputerName || "").toLowerCase(),
                    sistema: (device.OperatingSystem || "").toLowerCase(),
                    estado: isDesatualizado
                        ? "desatualizado"
                        : isOnline
                        ? "online"
                        : "offline",
                    criticidade: criticidade,
                    totalUpdates: totalUpdates,
                    updatesPendentes: updatesPendentes,
                    updatesFalharam: updatesFalharam,
                    isDesatualizado: isDesatualizado,
                },

                // Dados originais para navegação
                _originalData: device,
                _nomeOriginal: device.ComputerName,
                _dispositivoId: device.ResourceID,
            };
        });
    }, [updatesData.dispositivos]);

    // Aplicar filtros
    const filteredData = useMemo(() => {
        console.log(
            "🔍 UpdatesPage: Aplicando filtros. Data original:",
            data.length,
            "items"
        );
        let filtered = [...data];

        // Filtro de busca
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            console.log(
                "🔍 UpdatesPage: Aplicando filtro de busca:",
                searchTerm
            );
            filtered = filtered.filter(
                (item) =>
                    item.rawData.nome.includes(searchTerm) ||
                    item.rawData.sistema.includes(searchTerm)
            );
            console.log(
                "🔍 UpdatesPage: Após filtro de busca:",
                filtered.length,
                "items"
            );
        }

        // Filtro por estado de conexão e updates
        if (filtroEstado !== "all") {
            console.log(
                "🔍 UpdatesPage: Aplicando filtro de estado:",
                filtroEstado
            );
            filtered = filtered.filter((item) => {
                const { rawData } = item;
                switch (filtroEstado) {
                    case "online":
                        return rawData.estado === "online";
                    case "offline":
                        return rawData.estado === "offline";
                    case "desatualizado":
                        return rawData.estado === "desatualizado";
                    case "com-updates":
                        return rawData.totalUpdates > 0;
                    case "sem-updates":
                        return rawData.totalUpdates === 0;
                    case "com-falhas":
                        return rawData.updatesFalharam > 0;
                    case "nao-instalados":
                        return rawData.updatesPendentes > 0;
                    default:
                        return true;
                }
            });
            console.log(
                "🔍 UpdatesPage: Após filtro de estado:",
                filtered.length,
                "items"
            );
        }

        // Filtro por criticidade
        if (filtroCriticidade !== "all") {
            console.log(
                "🔍 UpdatesPage: Aplicando filtro de criticidade:",
                filtroCriticidade
            );
            filtered = filtered.filter(
                (item) => item.rawData.criticidade === filtroCriticidade
            );
            console.log(
                "🔍 UpdatesPage: Após filtro de criticidade:",
                filtered.length,
                "items"
            );
        }

        console.log(
            "🔍 UpdatesPage: Resultado final dos filtros:",
            filtered.length,
            "items"
        );
        return filtered;
    }, [data, query, filtroEstado, filtroCriticidade]);

    // Aplicar paginação
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset da página quando filtros mudam
    React.useEffect(() => {
        setCurrentPage(1);
    }, [query, filtroEstado, filtroCriticidade]);

    // Opções para os dropdowns com ícones
    const estadoOptions = [
        { value: "all", label: "Todos os estados", icon: "📋" },
        { value: "online", label: "Online", icon: "🟢" },
        { value: "offline", label: "Offline", icon: "🔴" },
        { value: "desatualizado", label: "Desatualizado", icon: "🟡" },
        { value: "com-updates", label: "Com updates necessários", icon: "🔄" },
        { value: "sem-updates", label: "Sem updates pendentes", icon: "✅" },
        { value: "com-falhas", label: "Com falhas", icon: "❌" },
        { value: "nao-instalados", label: "Com não instalados", icon: "⚠️" },
    ];

    const criticidadeOptions = [
        { value: "all", label: "Todas as criticidades", icon: "⚖️" },
        { value: "Crítico", label: "Crítico", icon: "🚨" },
        { value: "Normal", label: "Normal", icon: "✅" },
    ];

    // Função para lidar com o click na linha da tabela
    const handleRowClick = (row, index) => {
        console.log(`🖱️ Clique na linha ${index}:`, row);

        const dispositivoId = row._dispositivoId;
        const nomeDispositivo = row._nomeOriginal;

        console.log(`📍 ID do dispositivo extraído:`, dispositivoId);
        console.log(`📍 Nome do dispositivo extraído:`, nomeDispositivo);
        console.log(`📍 Tipo do ID:`, typeof dispositivoId);

        if (dispositivoId) {
            const targetUrl = `/dispositivos/${dispositivoId}?from=updates`;
            console.log(`📍 URL de destino:`, targetUrl);

            // Navegar para a página de detalhes passando o ID do dispositivo e indicando origem
            navigate(targetUrl);
        } else {
            console.error(`❌ ID do dispositivo não encontrado na linha:`, row);
        }
    };

    // Componente de loading
    if (loading) {
        return (
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Carregando dados de updates...
                        </p>
                        <div className="mt-4">
                            <ConnectionStatus />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Componente de erro
    if (error) {
        return (
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Erro ao carregar dados de updates
                        </h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refreshData}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100 overflow-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Gestão de Updates
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            {lastUpdated && (
                                <p className="text-sm text-gray-600">
                                    Última atualização:{" "}
                                    {lastUpdated.toLocaleString("pt-PT")}
                                </p>
                            )}
                            <ConnectionStatus />
                        </div>
                    </div>
                    <button
                        onClick={refreshData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        disabled={loading}
                    >
                        <svg
                            className={`w-4 h-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        {loading ? "Atualizando..." : "Atualizar"}
                    </button>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Primeira fila de cards */}
                    <Card
                        title="Dispositivos com Updates"
                        value={updatesData.stats.totalDispositivosComUpdates.toString()}
                        icon="📊"
                        iconSize="text-base"
                        className="border border-blue-400 text-blue-700"
                    />

                    <Card
                        title="Necessitam Updates"
                        value={updatesData.stats.dispositivosNecessitamUpdates.toString()}
                        icon="⚠️"
                        iconSize="text-base"
                        className="border border-orange-400 text-orange-700"
                    />

                    <Card
                        title="Não Instalados"
                        value={updatesData.stats.dispositivosNaoInstalados.toString()}
                        icon="🟡"
                        iconSize="text-base"
                        className="border border-yellow-400 text-yellow-700"
                    />

                    {/* Segunda fila de cards */}
                    <Card
                        title="Updates Necessários"
                        value={updatesData.stats.dispositivosNecessarios.toString()}
                        icon="🔄"
                        iconSize="text-base"
                        className="border border-purple-400 text-purple-700"
                    />

                    <Card
                        title="Com Falhas"
                        value={updatesData.stats.dispositivosComFalhas.toString()}
                        icon="❌"
                        iconSize="text-base"
                        className="border border-red-400 text-red-700"
                    />

                    <Card
                        title="Sistemas Desatualizados"
                        value={updatesData.stats.sistemasDesatualizados.toString()}
                        icon="🚨"
                        iconSize="text-base"
                        className="border border-red-400 text-red-700"
                    />
                </div>

                {/* Card com filtros melhorados */}
                <Card className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Filtros e Pesquisa
                    </h3>

                    {/* Primeira linha de filtros */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                        <div className="w-full lg:w-1/2 flex items-center">
                            <SearchBar
                                onChange={setQuery}
                                placeholder="Procurar por nome do dispositivo ou sistema..."
                                className="w-full"
                            />
                        </div>

                        <div className="w-full lg:w-1/4 flex items-center">
                            <Dropdown
                                label="Estado"
                                options={estadoOptions}
                                value={filtroEstado}
                                onChange={setFiltroEstado}
                                className="w-full"
                            />
                        </div>

                        <div className="w-full lg:w-1/4 flex items-center">
                            <Dropdown
                                label="Criticidade"
                                options={criticidadeOptions}
                                value={filtroCriticidade}
                                onChange={setFiltroCriticidade}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Linha de ações rápidas */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => setFiltroEstado("online")}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                        >
                            Apenas Online
                        </button>
                        <button
                            onClick={() => setFiltroEstado("offline")}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                        >
                            Apenas Offline
                        </button>
                        <button
                            onClick={() => setFiltroEstado("desatualizado")}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                        >
                            Apenas Desatualizados
                        </button>
                        <button
                            onClick={() => setFiltroEstado("com-updates")}
                            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition"
                        >
                            Com Updates
                        </button>
                        <button
                            onClick={() => setFiltroEstado("sem-updates")}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                        >
                            Sem Updates
                        </button>
                        <button
                            onClick={() => setFiltroEstado("com-falhas")}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                        >
                            Com Falhas
                        </button>
                        <button
                            onClick={() => setFiltroEstado("nao-instalados")}
                            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition"
                        >
                            Não Instalados
                        </button>
                        <button
                            onClick={() => setFiltroCriticidade("Crítico")}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                        >
                            Apenas Críticos
                        </button>
                        <button
                            onClick={() => {
                                setQuery("");
                                setFiltroEstado("all");
                                setFiltroCriticidade("all");
                                setCurrentPage(1);
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                        >
                            Limpar filtros
                        </button>
                    </div>
                </Card>

                {/* Card com tabela melhorada */}
                <Card className="flex-1 bg-white rounded-xl shadow">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                Dispositivos que Necessitam Updates
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>
                                    Atualizado{" "}
                                    {lastUpdated
                                        ? lastUpdated.toLocaleTimeString(
                                              "pt-PT"
                                          )
                                        : "agora"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 relative" style={{ minHeight: "45vh" }}>
                        {paginatedData.length > 0 ? (
                            <Table
                                columns={columns}
                                data={paginatedData}
                                maxHeight="45vh"
                                className="w-full"
                                onRowClick={handleRowClick}
                            />
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center h-full"
                                style={{ minHeight: "40vh" }}
                            >
                                <div className="text-gray-400 text-6xl mb-4">
                                    🔍
                                </div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    Nenhum dispositivo encontrado
                                </h3>
                                <p className="text-gray-500 text-center mb-4 max-w-md">
                                    {filteredData.length === 0 &&
                                    data.length > 0
                                        ? "Não foram encontrados dispositivos com os filtros aplicados. Tente ajustar os critérios de pesquisa."
                                        : "Não há dispositivos com updates pendentes no momento."}
                                </p>
                                {filteredData.length === 0 &&
                                    data.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setQuery("");
                                                setFiltroEstado("all");
                                                setFiltroCriticidade("all");
                                                setCurrentPage(1);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Limpar filtros
                                        </button>
                                    )}
                            </div>
                        )}
                    </div>

                    {/* Rodapé com informações adicionais e paginação melhorada */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                {filteredData.length > 0 && (
                                    <span>
                                        Mostrando{" "}
                                        {Math.min(
                                            (currentPage - 1) * itemsPerPage +
                                                1,
                                            filteredData.length
                                        )}{" "}
                                        a{" "}
                                        {Math.min(
                                            currentPage * itemsPerPage,
                                            filteredData.length
                                        )}{" "}
                                        de {filteredData.length} dispositivos
                                        {filteredData.length !== data.length &&
                                            ` (${data.length} total)`}
                                    </span>
                                )}
                            </div>
                            {filteredData.length > 0 && totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded transition-colors ${
                                            currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                        }`}
                                    >
                                        Anterior
                                    </button>

                                    {/* Números das páginas */}
                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            { length: Math.min(5, totalPages) },
                                            (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    currentPage >=
                                                    totalPages - 2
                                                ) {
                                                    pageNum =
                                                        totalPages - 4 + i;
                                                } else {
                                                    pageNum =
                                                        currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                pageNum
                                                            )
                                                        }
                                                        className={`px-2 py-1 rounded transition-colors ${
                                                            currentPage ===
                                                            pageNum
                                                                ? "bg-blue-500 text-white"
                                                                : "text-blue-600 hover:bg-blue-50"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded transition-colors ${
                                            currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                        }`}
                                    >
                                        Próximo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
