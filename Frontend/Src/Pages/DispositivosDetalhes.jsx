import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

// Componentes
import Sidebar from "../Components/Sidebar/Sidebar";
import Card from "../Components/Card/Card";
import Label from "../Components/Label/Label";
import ConnectionStatus from "../Components/ConnectionStatus/ConnectionStatus";
import SoftwareVersionChecker from "../Components/SoftwareVersionChecker/SoftwareVersionChecker";

// Hooks personalizados
import { useDispositivoDetalhes } from "../hooks/useDispositivoDetalhes";

/**
 * Componente para exibir o cabeçalho de uma seção
 * @param {string} icon - Emoji ou ícone da seção
 * @param {string} title - Título da seção
 * @param {string} description - Descrição da seção
 * @param {string} bgColor - Classe CSS para cor de fundo
 * @param {string} textColor - Classe CSS para cor do texto
 */
const SectionHeader = ({ icon, title, description, bgColor, textColor }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 ${bgColor} rounded-lg`}>
            <span className="text-white text-2xl">{icon}</span>
        </div>
        <div>
            <h2 className={`text-xl font-semibold ${textColor}`}>{title}</h2>
            <p className={`${textColor.replace("900", "600")} text-sm`}>
                {description}
            </p>
        </div>
    </div>
);

// Componente para estatísticas em cards
const StatCard = ({ value, label, color = "text-blue-600" }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 text-center">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
    </div>
);

// Componente para detalhes de processadores
const ProcessorDetails = ({ processadores }) => {
    if (!processadores?.lista?.length) return null;

    const totalCores = processadores.lista.reduce(
        (total, proc) => total + (parseInt(proc.nucleos) || 0),
        0
    );
    const totalThreads = processadores.lista.reduce(
        (total, proc) => total + (parseInt(proc.threads) || 0),
        0
    );
    const maxClock = processadores.lista.reduce(
        (max, proc) => Math.max(max, parseInt(proc.clockMaxMhz) || 0),
        0
    );

    return (
        <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-4">
                Informações Detalhadas dos Processadores (
                {processadores.total || processadores.lista.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <StatCard
                    value={totalCores}
                    label="Total de Núcleos"
                    color="text-cyan-600"
                />
                <StatCard
                    value={totalThreads}
                    label="Total de Threads"
                    color="text-blue-600"
                />
                <StatCard
                    value={`${maxClock} MHz`}
                    label="Clock Máximo"
                    color="text-purple-600"
                />
            </div>

            <div className="space-y-3">
                {processadores.lista.map((proc, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-green-200"
                    >
                        <h4 className="font-semibold text-gray-800 mb-3">
                            {proc.socket || `Processador ${index + 1}`}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Label
                                label="Nome"
                                value={proc.nomeProcessador || "N/A"}
                            />
                            <Label
                                label="Fabricante"
                                value={proc.fabricante || "N/A"}
                            />
                            <Label
                                label="Socket"
                                value={proc.socket || "N/A"}
                            />
                            <Label
                                label="Núcleos"
                                value={proc.nucleos || "N/A"}
                            />
                            <Label
                                label="Threads"
                                value={proc.threads || "N/A"}
                            />
                            <Label
                                label="Clock (Max/Atual)"
                                value={
                                    proc.clockMaxMhz && proc.clockAtualMhz
                                        ? `${proc.clockMaxMhz}/${proc.clockAtualMhz} MHz`
                                        : "N/A"
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Componente para seção de sistema
const SystemSection = ({ dispositivo }) => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <SectionHeader
            icon="🖥️"
            title="Sistema"
            description="Informações do sistema operacional e configuração"
            bgColor="bg-blue-500"
            textColor="text-blue-900"
        />
        <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Label
                    label="Nome do Dispositivo"
                    value={dispositivo.nome || "N/A"}
                />
                <Label
                    label="Sistema Operacional"
                    value={dispositivo.sistemaOperacional || "N/A"}
                />
                <Label label="Domínio" value={dispositivo.dominio || "N/A"} />
                <Label
                    label="Tipo de Dispositivo"
                    value={dispositivo.tipoDispositivo || "N/A"}
                />
                <Label
                    label="Tipo de Máquina"
                    value={dispositivo.tipoMaquina || "N/A"}
                />
                <Label label="Site AD" value={dispositivo.siteAD || "N/A"} />
                <Label
                    label="Versão do Cliente"
                    value={dispositivo.versaoCliente || "N/A"}
                />
                <Label
                    label="Status SO"
                    value={dispositivo.statusSO || "N/A"}
                />
            </div>
        </div>
    </Card>
);

// Componente para seção de utilizador
const UserSection = ({ dispositivo }) => (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
        <SectionHeader
            icon="👤"
            title="Utilizador"
            description="Informações do utilizador associado ao dispositivo"
            bgColor="bg-purple-500"
            textColor="text-purple-900"
        />
        <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Label
                    label="Nome de Utilizador"
                    value={dispositivo.utilizador || "N/A"}
                />
                <Label
                    label="Nome Completo"
                    value={dispositivo.nomeCompletoUtilizador || "N/A"}
                />
                <Label
                    label="Email"
                    value={dispositivo.emailUtilizador || "N/A"}
                />
            </div>
        </div>
    </Card>
);

// Componente para seção de hardware
const HardwareSection = ({ hardware, processadores, bios }) => (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <SectionHeader
            icon="🔧"
            title="Hardware"
            description="Especificações técnicas do dispositivo"
            bgColor="bg-green-500"
            textColor="text-green-900"
        />

        {hardware && Object.keys(hardware).length > 0 ? (
            <div>
                {/* Estatísticas de Hardware */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        value={hardware.ramGB ? `${hardware.ramGB} GB` : "N/A"}
                        label="Memória RAM"
                        color="text-green-600"
                    />
                    <StatCard
                        value={hardware.numeroProcessadores || "N/A"}
                        label="CPUs"
                        color="text-blue-600"
                    />
                    <StatCard
                        value={processadores?.lista?.[0]?.nucleos || "N/A"}
                        label="Núcleos"
                        color="text-purple-600"
                    />
                    <StatCard
                        value={processadores?.lista?.[0]?.threads || "N/A"}
                        label="Threads"
                        color="text-orange-600"
                    />
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-100">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        Detalhes do Hardware
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Label
                                label="Fabricante"
                                value={hardware.fabricante || "N/A"}
                            />
                            <Label
                                label="Modelo"
                                value={hardware.modelo || "N/A"}
                            />
                            <Label
                                label="Tipo Sistema"
                                value={hardware.tipoSistema || "N/A"}
                            />
                        </div>
                    </div>

                    {/* Informações detalhadas dos processadores */}
                    <ProcessorDetails processadores={processadores} />

                    {/* Informações da BIOS */}
                    {bios && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 mb-4">
                                Informações da BIOS
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 border border-green-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Label
                                        label="Fabricante da BIOS"
                                        value={bios.fabricanteBios || "N/A"}
                                    />
                                    <Label
                                        label="Versão da BIOS"
                                        value={bios.versaoBios || "N/A"}
                                    />
                                    <Label
                                        label="Versão SMBIOS"
                                        value={bios.versaoSmbios || "N/A"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-lg p-4 border border-green-100">
                <p className="text-gray-600">
                    ⚠️ Nenhum dado de hardware encontrado.
                </p>
            </div>
        )}
    </Card>
);

// Componente para seção de armazenamento
const StorageSection = ({ discos }) => (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
        <SectionHeader
            icon="💾"
            title="Armazenamento"
            description="Informações sobre discos e armazenamento"
            bgColor="bg-indigo-500"
            textColor="text-indigo-900"
        />

        {discos?.detalhes?.length > 0 ? (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard
                        value={discos.detalhes.length}
                        label="Discos"
                        color="text-indigo-600"
                    />
                    <StatCard
                        value={`${discos.detalhes
                            .reduce(
                                (total, disco) =>
                                    total +
                                    (parseFloat(disco.tamanhoTotalGB) || 0),
                                0
                            )
                            .toFixed(0)} GB`}
                        label="Capacidade Total"
                        color="text-green-600"
                    />
                    <StatCard
                        value={`${discos.detalhes
                            .reduce(
                                (total, disco) =>
                                    total +
                                    (parseFloat(disco.espacoLivreGB) || 0),
                                0
                            )
                            .toFixed(0)} GB`}
                        label="Espaço Livre"
                        color="text-red-600"
                    />
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        Discos Encontrados
                    </h3>
                    <div className="space-y-3">
                        {discos.detalhes.map((disco, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">
                                        {disco.letra || `Disco ${index + 1}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {disco.sistemaArquivos || "N/A"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">
                                        {disco.tamanhoTotalGB
                                            ? `${disco.tamanhoTotalGB} GB`
                                            : "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Livre:{" "}
                                        {disco.espacoLivreGB
                                            ? `${disco.espacoLivreGB} GB`
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-gray-600">
                    ⚠️ Nenhum dado de armazenamento encontrado.
                </p>
            </div>
        )}
    </Card>
);

// Componente para seção de software
const SoftwareSection = ({ software }) => (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
        <SectionHeader
            icon="📦"
            title="Software"
            description="Programas e aplicações instaladas"
            bgColor="bg-yellow-500"
            textColor="text-yellow-900"
        />

        {software?.lista?.length > 0 ? (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard
                        value={software.lista.length}
                        label="Programas Instalados"
                        color="text-yellow-600"
                    />
                    <StatCard
                        value={
                            software.lista.filter((app) =>
                                app.fabricante
                                    ?.toLowerCase()
                                    .includes("microsoft")
                            ).length
                        }
                        label="Microsoft"
                        color="text-blue-600"
                    />
                    <StatCard
                        value={
                            software.lista.filter((app) => app.versao).length
                        }
                        label="Com Versão"
                        color="text-green-600"
                    />
                </div>

                <div className="bg-white rounded-lg p-4 border border-yellow-100">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        Programas Instalados (Primeiros 10)
                    </h3>
                    <div className="space-y-2">
                        {software.lista.slice(0, 10).map((app, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-sm">
                                        {app.nome || "Nome não disponível"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {app.fabricante ||
                                            "Fabricante desconhecido"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-600">
                                        {app.versao || "Versão N/A"}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {software.lista.length > 10 && (
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-500">
                                    E mais {software.lista.length - 10}{" "}
                                    programas...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Verificador de Versões */}
                <div className="mt-6">
                    <SoftwareVersionChecker
                        softwareList={software.lista || []}
                    />
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-lg p-4 border border-yellow-100">
                <p className="text-gray-600">
                    ⚠️ Nenhum dado de software encontrado.
                </p>
            </div>
        )}
    </Card>
);

// Função utilitária para obter o status de um update
const getUpdateStatus = (update) => {
    if (
        update.status === 3 ||
        update.statusDescricao?.toLowerCase().includes("instalado")
    ) {
        return {
            color: "bg-green-100 text-green-800",
            text: update.statusDescricao || "Instalado",
        };
    }
    if (
        update.status === 2 ||
        update.statusDescricao?.toLowerCase().includes("não instalado")
    ) {
        return {
            color: "bg-yellow-100 text-yellow-800",
            text: update.statusDescricao || "Pendente",
        };
    }
    if (
        update.status === 4 ||
        update.statusDescricao?.toLowerCase().includes("falha")
    ) {
        return {
            color: "bg-red-100 text-red-800",
            text: update.statusDescricao || "Falha",
        };
    }
    if (
        update.status === 5 ||
        update.statusDescricao?.toLowerCase().includes("reinicialização")
    ) {
        return {
            color: "bg-orange-100 text-orange-800",
            text: update.statusDescricao || "Requer Reinicialização",
        };
    }
    if (
        update.status === 1 ||
        update.statusDescricao?.toLowerCase().includes("não aplicável")
    ) {
        return {
            color: "bg-blue-100 text-blue-800",
            text: update.statusDescricao || "Não Aplicável",
        };
    }
    return {
        color: "bg-gray-100 text-gray-800",
        text: update.statusDescricao || "Status N/A",
    };
};

// Componente para seção de updates
const UpdatesSection = ({ updates }) => (
    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
        <SectionHeader
            icon="🔄"
            title="Updates"
            description="Atualizações e patches do sistema"
            bgColor="bg-red-500"
            textColor="text-red-900"
        />

        {updates?.lista?.length > 0 ? (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        value={updates.lista.length}
                        label="Total de Updates"
                        color="text-red-600"
                    />
                    <StatCard
                        value={
                            updates.lista.filter(
                                (update) =>
                                    update.status === 3 ||
                                    update.statusDescricao
                                        ?.toLowerCase()
                                        .includes("instalado")
                            ).length
                        }
                        label="Instalados"
                        color="text-green-600"
                    />
                    <StatCard
                        value={
                            updates.lista.filter(
                                (update) =>
                                    update.status === 2 ||
                                    update.statusDescricao
                                        ?.toLowerCase()
                                        .includes("não instalado")
                            ).length
                        }
                        label="Pendentes"
                        color="text-yellow-600"
                    />
                    <StatCard
                        value={
                            updates.lista.filter(
                                (update) =>
                                    update.status === 4 ||
                                    update.statusDescricao
                                        ?.toLowerCase()
                                        .includes("falha")
                            ).length
                        }
                        label="Falhas"
                        color="text-red-600"
                    />
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-100">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        Updates Recentes (Primeiros 10)
                    </h3>
                    <div className="space-y-2">
                        {updates.lista.slice(0, 10).map((update, index) => {
                            const status = getUpdateStatus(update);
                            return (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            {update.titulo ||
                                                update.nome ||
                                                "Update sem título"}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {update.categoria ||
                                                "Categoria não especificada"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${status.color}`}
                                        >
                                            {status.text}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {updates.lista.length > 10 && (
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-500">
                                    E mais {updates.lista.length - 10}{" "}
                                    updates...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-lg p-4 border border-red-100">
                <p className="text-gray-600">
                    ⚠️ Nenhum dado de updates encontrado.
                </p>
            </div>
        )}
    </Card>
);

// Funções utilitárias
const getCriticalityStatus = (criticidade) => {
    switch (criticidade) {
        case "Crítico":
            return { icon: "⚠️", color: "border-red-500" };
        case "Atenção":
            return { icon: "⚡", color: "border-yellow-500" };
        default:
            return { icon: "✅", color: "border-green-500" };
    }
};

const getConnectionStatus = (status) => {
    return status === "Online"
        ? { icon: "🟢", color: "border-green-500" }
        : { icon: "🔴", color: "border-red-500" };
};

/**
 * Componente para exibir detalhes de um dispositivo específico
 * Inclui informações de sistema, hardware, software, armazenamento e updates
 */
export default function DispositivosDetalhes() {
    const { id } = useParams(); // ID do dispositivo vem da URL
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Obter o parâmetro 'from' para saber de onde o utilizador veio
    const fromPage = searchParams.get("from") || "dispositivos";

    console.log(`📍 ID do dispositivo recebido da URL:`, id);
    console.log(`📍 Tipo do parâmetro:`, typeof id);

    // Verificar se o ID é válido
    if (!id || id === "undefined" || id === "null") {
        console.error(`❌ ID inválido recebido da URL:`, id);
        return (
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600">
                            Erro: ID do dispositivo não encontrado na URL
                        </p>
                        <button
                            onClick={() =>
                                navigate(
                                    fromPage === "updates"
                                        ? "/update"
                                        : "/dispositivos"
                                )
                            }
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Voltar para{" "}
                            {fromPage === "updates"
                                ? "Updates"
                                : "Dispositivos"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Usar diretamente o ID da URL sem decodificar
    const dispositivoId = id;

    console.log(`📍 ID do dispositivo para busca:`, dispositivoId);
    console.log(`📍 Tipo do ID:`, typeof dispositivoId);

    const {
        data: dispositivoData,
        loading,
        error,
        lastUpdated,
        refreshData,
    } = useDispositivoDetalhes(dispositivoId);

    // Função para voltar à página anterior
    const handleGoBack = () => {
        // Navegar de volta para a página de origem
        if (fromPage === "updates") {
            navigate("/update");
        } else {
            navigate("/dispositivos");
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
                            Carregando dados do dispositivo...
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            ID: {dispositivoId}
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
                            Erro ao carregar dados do dispositivo
                        </h2>
                        <p className="text-gray-600 mb-2">{error}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Dispositivo ID: {dispositivoId}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={refreshData}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Tentar novamente
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Se não há dados (mas não há erro), o dispositivo pode não existir
    if (!dispositivoData) {
        return (
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Dispositivo não encontrado
                        </h2>
                        <p className="text-gray-600 mb-2">
                            O dispositivo com ID "{dispositivoId}" não foi
                            encontrado no sistema.
                        </p>
                        <button
                            onClick={handleGoBack}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Voltar para{" "}
                            {fromPage === "updates"
                                ? "Updates"
                                : "lista de dispositivos"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const dispositivo = dispositivoData.informacoesBasicas;
    const hardware = dispositivoData.hardware;
    const processadores = dispositivoData.processadores;
    const bios = dispositivoData.bios;
    const discos = dispositivoData.discos;
    const software = dispositivoData.software;
    const updates = dispositivoData.updates;

    /**
     * Componente para cards de estatísticas principais do dispositivo
     * @param {Object} dispositivo - Dados básicos do dispositivo
     */
    const MainStatsCards = ({ dispositivo }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card
                title="Status"
                value={dispositivo.statusConexao || "N/A"}
                icon={getConnectionStatus(dispositivo.statusConexao).icon}
                className={`border-l-4 ${
                    getConnectionStatus(dispositivo.statusConexao).color
                }`}
            />
            <Card
                title="Sistema"
                value={
                    dispositivo.sistemaOperacional
                        ? dispositivo.sistemaOperacional
                              .split(" ")
                              .slice(0, 2)
                              .join(" ")
                        : "N/A"
                }
                icon="🖥️"
                className="border-l-4 border-blue-500"
            />
            <Card
                title="Utilizador"
                value={dispositivo.utilizador || "N/A"}
                icon="👤"
                className="border-l-4 border-purple-500"
            />
            <Card
                title="Criticidade"
                value={dispositivo.statusCriticidade || "Normal"}
                icon={getCriticalityStatus(dispositivo.statusCriticidade).icon}
                className={`border-l-4 ${
                    getCriticalityStatus(dispositivo.statusCriticidade).color
                }`}
            />
        </div>
    );

    return (
        <div className="h-screen flex overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col p-6 bg-gray-100 overflow-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <button
                                onClick={handleGoBack}
                                className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Voltar
                            </button>
                        </div>
                        <h1 className="text-2xl font-bold">
                            Detalhes do Dispositivo: {dispositivo.nome}
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            {lastUpdated && (
                                <p className="text-sm text-gray-600 mt-1">
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

                {/* Cards de estatísticas principais */}
                <MainStatsCards dispositivo={dispositivo} />

                {/* Cards com informações detalhadas */}
                <div className="space-y-6">
                    {/* Informações do Sistema */}
                    <SystemSection dispositivo={dispositivo} />

                    {/* Informações do Utilizador */}
                    <UserSection dispositivo={dispositivo} />

                    {/* Hardware */}
                    <HardwareSection
                        hardware={hardware}
                        processadores={processadores}
                        bios={bios}
                    />

                    {/* Armazenamento */}
                    <StorageSection discos={discos} />

                    {/* Software */}
                    <SoftwareSection software={software} />

                    {/* Updates */}
                    <UpdatesSection updates={updates} />
                </div>
            </div>
        </div>
    );
}
