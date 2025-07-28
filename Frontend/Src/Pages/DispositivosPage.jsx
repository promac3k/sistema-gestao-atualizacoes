import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";
import Table from "../Components/Table/Table";
import SearchBar from "../Components/SearchBar/SearchBar";
import Dropdown from "../Components/Dropdown/Dropdown";
import Card from "../Components/Card/Card";
import ConnectionStatus from "../Components/ConnectionStatus/ConnectionStatus";
import { useDispositivos } from "../hooks/useDispositivos";

export default function DispositivosPage() {
    // Hook de navegação
    const navigate = useNavigate();

    // Hook para carregar dados dos dispositivos
    const {
        data: dispositivosData,
        loading,
        error,
        lastUpdated,
        refreshData,
    } = useDispositivos();

    // Estados locais para filtros
    const [query, setQuery] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("all");
    const [filtroEstado, setFiltroEstado] = useState("all");
    const [filtroSistema, setFiltroSistema] = useState("all");

    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Preparar dados para a tabela
    const columns = [
        "Nome",
        "Utilizador",
        "Sistema",
        "Estado",
        "Domínio",
        "Tipo",
        "Criticidade",
        "Última Atividade",
    ];

    // Converter dados dos dispositivos para o formato da tabela
    const data = useMemo(() => {
        return (dispositivosData.dispositivos || []).map((device) => {
            const isOnline =
                device.statusConexao === "Online" || device.online === 1;

            // Verificar se o sistema está desatualizado
            const isDesatualizado =
                device.sistemaOperacional?.includes("Windows 7") ||
                device.sistemaOperacional?.includes("Windows XP") ||
                device.sistemaOperacional?.includes("Windows 8") ||
                device.sistemaOperacional?.includes("Server 2008") ||
                device.sistemaOperacional?.includes("Server 2012");

            // Determinar o estado prioritário
            let estado, statusColor, textColor;
            if (isDesatualizado) {
                estado = "Desatualizado";
                statusColor = "bg-yellow-500";
                textColor = "text-yellow-700 font-medium";
            } else if (isOnline) {
                estado = "Online";
                statusColor = "bg-green-500";
                textColor = "text-green-700 font-medium";
            } else {
                estado = "Offline";
                statusColor = "bg-red-500";
                textColor = "text-red-700 font-medium";
            }

            const criticidade = device.statusCriticidade || "Normal";

            return {
                // Dados para exibição na tabela
                Nome: device.nome || "N/A",
                Utilizador: device.utilizador || "N/A",
                Sistema: device.sistemaOperacional || "N/A",
                Estado: (
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${statusColor}`} />
                        <span className={textColor}>{estado}</span>
                    </div>
                ),
                Domínio: device.dominio || "N/A",
                Tipo: device.tipoDispositivo || "N/A",
                Criticidade: (
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-sm ${
                                criticidade === "Crítico"
                                    ? "bg-red-500"
                                    : criticidade === "Atenção"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                        />
                        <span
                            className={
                                criticidade === "Crítico"
                                    ? "text-red-700 font-medium"
                                    : criticidade === "Atenção"
                                    ? "text-yellow-700 font-medium"
                                    : "text-green-700 font-medium"
                            }
                        >
                            {criticidade}
                        </span>
                    </div>
                ),
                "Última Atividade": device.ultimoLogin
                    ? new Date(device.ultimoLogin).toLocaleDateString("pt-PT")
                    : "N/A",
                // Dados originais para navegação e filtros
                _originalData: device,
                _nomeOriginal: device.nome, // Nome original para navegação
                _dispositivoId: device.ResourceID, // ID do dispositivo para navegação
            };
        });
    }, [dispositivosData.dispositivos]);

    // Aplicar filtros aos dados
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filtro de pesquisa por texto
        if (query) {
            filtered = filtered.filter(
                (device) =>
                    device.Nome.toLowerCase().includes(query.toLowerCase()) ||
                    device.Utilizador.toLowerCase().includes(
                        query.toLowerCase()
                    ) ||
                    device.Domínio.toLowerCase().includes(
                        query.toLowerCase()
                    ) ||
                    device.Tipo.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Filtro por estado
        if (filtroEstado !== "all") {
            filtered = filtered.filter((device) => {
                const originalDevice = device._originalData;
                const isOnline =
                    originalDevice?.statusConexao === "Online" ||
                    originalDevice?.online === 1;

                // Verificar se o sistema está desatualizado
                const isDesatualizado =
                    originalDevice?.sistemaOperacional?.includes("Windows 7") ||
                    originalDevice?.sistemaOperacional?.includes(
                        "Windows XP"
                    ) ||
                    originalDevice?.sistemaOperacional?.includes("Windows 8") ||
                    originalDevice?.sistemaOperacional?.includes(
                        "Server 2008"
                    ) ||
                    originalDevice?.sistemaOperacional?.includes("Server 2012");

                switch (filtroEstado) {
                    case "online":
                        return isOnline && !isDesatualizado;
                    case "offline":
                        return !isOnline && !isDesatualizado;
                    case "desatualizado":
                        return isDesatualizado;
                    case "critico":
                        return originalDevice?.statusCriticidade === "Crítico";
                    default:
                        return true;
                }
            });
        }

        // Filtro por sistema
        if (filtroSistema !== "all") {
            switch (filtroSistema) {
                case "windows11":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Windows 11")
                    );
                    break;
                case "windows10":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Windows 10")
                    );
                    break;
                case "windows8":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Windows 8")
                    );
                    break;
                case "windows7":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Windows 7")
                    );
                    break;
                case "windowsxp":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Windows XP")
                    );
                    break;
                case "server2022":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Server 2022")
                    );
                    break;
                case "server2019":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Server 2019")
                    );
                    break;
                case "server2016":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Server 2016")
                    );
                    break;
                case "server2012":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Server 2012")
                    );
                    break;
                case "server2008":
                    filtered = filtered.filter((device) =>
                        device.Sistema.includes("Server 2008")
                    );
                    break;
                case "outros":
                    filtered = filtered.filter(
                        (device) =>
                            !device.Sistema.includes("Windows") &&
                            !device.Sistema.includes("Server")
                    );
                    break;
            }
        }

        // Filtro por tipo de dispositivo (usando o campo filtroTipo para tipos de dispositivo)
        if (filtroTipo !== "all") {
            switch (filtroTipo) {
                case "workstation":
                    filtered = filtered.filter((device) => {
                        const tipo = device.Tipo.toLowerCase();
                        return (
                            tipo.includes("workstation") ||
                            tipo.includes("estação") ||
                            tipo.includes("estacao")
                        );
                    });
                    break;
                case "server":
                    filtered = filtered.filter((device) => {
                        const tipo = device.Tipo.toLowerCase();
                        return (
                            tipo.includes("server") || tipo.includes("servidor")
                        );
                    });
                    break;
                case "laptop":
                    filtered = filtered.filter((device) => {
                        const tipo = device.Tipo.toLowerCase();
                        return (
                            tipo.includes("laptop") ||
                            tipo.includes("portátil") ||
                            tipo.includes("portatil")
                        );
                    });
                    break;
                case "mobile":
                    filtered = filtered.filter((device) => {
                        const tipo = device.Tipo.toLowerCase();
                        return (
                            tipo.includes("mobile") ||
                            tipo.includes("móvel") ||
                            tipo.includes("movel") ||
                            tipo.includes("telemóvel") ||
                            tipo.includes("telemovel")
                        );
                    });
                    break;
            }
        }

        return filtered;
    }, [data, query, filtroEstado, filtroSistema, filtroTipo]);

    // Dados paginados
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    // Calcular número total de páginas
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset da página quando filtros mudam
    React.useEffect(() => {
        setCurrentPage(1);
    }, [query, filtroEstado, filtroSistema, filtroTipo]);

    // Estatísticas calculadas dos dados reais
    const stats = useMemo(() => {
        return {
            total: dispositivosData.stats?.totalDispositivos || 0,
            online: dispositivosData.stats?.dispositivosOnline || 0,
            offline: dispositivosData.stats?.dispositivosOffline || 0,
            manutencao: dispositivosData.stats?.sistemasDesatualizados || 0,
            critico: dispositivosData.stats?.dispositivosCriticos || 0,
            ...(dispositivosData.stats?.estatisticasSO || {}),
        };
    }, [dispositivosData.stats]);

    // Funções para os botões de ação rápida
    const handleFiltroRapido = (estado = null, sistema = null) => {
        if (estado) setFiltroEstado(estado);
        if (sistema) setFiltroSistema(sistema);
    };

    const limparFiltros = () => {
        setQuery("");
        setFiltroTipo("all");
        setFiltroEstado("all");
        setFiltroSistema("all");
        setCurrentPage(1);
    };

    // Função para lidar com o click na linha da tabela
    const handleRowClick = (row, index) => {
        console.log(`🖱️ Clique na linha ${index}:`, row);

        const dispositivoId = row._dispositivoId;
        const nomeDispositivo = row._nomeOriginal;

        console.log(`📍 ID do dispositivo extraído:`, dispositivoId);
        console.log(`📍 Nome do dispositivo extraído:`, nomeDispositivo);
        console.log(`📍 Tipo do ID:`, typeof dispositivoId);

        if (dispositivoId) {
            const targetUrl = `/dispositivos/${dispositivoId}?from=dispositivos`;
            console.log(`📍 URL de destino:`, targetUrl);

            // Navegar para a página de detalhes passando o ID do dispositivo e indicando origem
            navigate(targetUrl);
        } else {
            console.error(`❌ ID do dispositivo não encontrado na linha:`, row);
        }
    };

    // Funções de navegação da paginação
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
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
                            Carregando dados dos dispositivos...
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
                            Erro ao carregar dados
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
            {/* Sidebar fixa à esquerda */}
            <Sidebar />

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col p-6 bg-gray-100 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Dispositivos</h1>
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

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <strong>Erro:</strong> {error}
                        </div>
                    </div>
                )}

                {/* Cards de estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Card
                        title="Total Dispositivos"
                        value={stats.total.toString()}
                        icon="💻"
                        className="border border-blue-400 text-blue-700"
                    />
                    <Card
                        title="Online"
                        value={stats.online.toString()}
                        icon="🟢"
                        iconSize="text-base"
                        className="border border-green-400 text-green-700"
                    />
                    <Card
                        title="Offline"
                        value={stats.offline.toString()}
                        icon="🔴"
                        iconSize="text-base"
                        className="border border-red-400 text-red-700"
                    />
                    <Card
                        title="Desatualizados"
                        value={stats.manutencao.toString()}
                        icon="🟡"
                        iconSize="text-base"
                        className="border border-yellow-400 text-yellow-700"
                    />
                    <Card
                        title="Críticos"
                        value={stats.critico.toString()}
                        icon="⚠️"
                        iconSize="text-base"
                        className="border border-orange-400 text-orange-700"
                    />
                </div>

                {/* Card com filtros melhorados */}
                <Card className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Filtros e Pesquisa
                    </h3>

                    {/* Primeira linha de filtros */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                        <div className="w-full lg:w-2/5 flex items-center">
                            <SearchBar
                                onChange={setQuery}
                                placeholder="Procurar por nome, utilizador, domínio ou tipo..."
                                className="w-full"
                            />
                        </div>

                        <div className="w-full lg:w-1/5 flex items-center">
                            <Dropdown
                                label="Estado"
                                options={[
                                    { label: "Todos", value: "all" },
                                    { label: "Online", value: "online" },
                                    { label: "Offline", value: "offline" },
                                    {
                                        label: "Desatualizado",
                                        value: "desatualizado",
                                    },
                                    {
                                        label: "Crítico",
                                        value: "critico",
                                    },
                                ]}
                                value={filtroEstado}
                                onChange={setFiltroEstado}
                                className="w-full"
                            />
                        </div>

                        <div className="w-full lg:w-1/5 flex items-center">
                            <Dropdown
                                label="Sistema"
                                options={[
                                    { label: "Todos", value: "all" },
                                    { label: "Windows 11", value: "windows11" },
                                    { label: "Windows 10", value: "windows10" },
                                    { label: "Windows 8", value: "windows8" },
                                    { label: "Windows 7", value: "windows7" },
                                    { label: "Windows XP", value: "windowsxp" },
                                    {
                                        label: "Server 2022",
                                        value: "server2022",
                                    },
                                    {
                                        label: "Server 2019",
                                        value: "server2019",
                                    },
                                    {
                                        label: "Server 2016",
                                        value: "server2016",
                                    },
                                    {
                                        label: "Server 2012",
                                        value: "server2012",
                                    },
                                    {
                                        label: "Server 2008",
                                        value: "server2008",
                                    },
                                    { label: "Outros", value: "outros" },
                                ]}
                                value={filtroSistema}
                                onChange={setFiltroSistema}
                                className="w-full"
                            />
                        </div>

                        <div className="w-full lg:w-1/5 flex items-center">
                            <Dropdown
                                label="Tipo"
                                options={[
                                    { label: "Todos", value: "all" },
                                    {
                                        label: "Workstation",
                                        value: "workstation",
                                    },
                                    {
                                        label: "Servidor",
                                        value: "server",
                                    },
                                    {
                                        label: "Laptop",
                                        value: "laptop",
                                    },
                                    {
                                        label: "Mobile",
                                        value: "mobile",
                                    },
                                ]}
                                value={filtroTipo}
                                onChange={setFiltroTipo}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Linha de ações rápidas */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => handleFiltroRapido("online")}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                        >
                            Apenas Online
                        </button>
                        <button
                            onClick={() => handleFiltroRapido("offline")}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                        >
                            Apenas Offline
                        </button>
                        <button
                            onClick={() => handleFiltroRapido("desatualizado")}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                        >
                            Apenas Desatualizados
                        </button>
                        <button
                            onClick={() => handleFiltroRapido("critico")}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                        >
                            Apenas Críticos
                        </button>
                        <button
                            onClick={() =>
                                handleFiltroRapido(null, "windows11")
                            }
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                        >
                            Windows 11
                        </button>
                        <button
                            onClick={() =>
                                handleFiltroRapido(null, "windows10")
                            }
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                        >
                            Windows 10
                        </button>
                        <button
                            onClick={() =>
                                handleFiltroRapido(null, "server2022")
                            }
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
                        >
                            Server 2022
                        </button>
                        <button
                            onClick={() => setFiltroTipo("workstation")}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                        >
                            Workstations
                        </button>
                        <button
                            onClick={() => setFiltroTipo("server")}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
                        >
                            Servidores
                        </button>
                        <button
                            onClick={limparFiltros}
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
                                Lista de Dispositivos
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
                                        : "Não há dispositivos disponíveis no momento."}
                                </p>
                                {filteredData.length === 0 &&
                                    data.length > 0 && (
                                        <button
                                            onClick={limparFiltros}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Limpar filtros
                                        </button>
                                    )}
                            </div>
                        )}
                    </div>

                    {/* Rodapé com informações adicionais e paginação */}
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
                                        onClick={goToPrevious}
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
                                                            goToPage(pageNum)
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
                                        onClick={goToNext}
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
