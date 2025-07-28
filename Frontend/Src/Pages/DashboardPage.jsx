import React from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import Card from "../Components/Card/Card";
import AlertCard from "../Components/AlertCard/AlertCard";
import Table from "../Components/Table/Table";
import ConnectionStatus from "../Components/ConnectionStatus/ConnectionStatus";
import OSDistributionChart from "../Components/OSDistributionChart/OSDistributionChart";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
    const {
        data: dashboardData,
        loading,
        error,
        lastUpdated,
        refreshData,
    } = useDashboard();

    // Preparar dados para a tabela de utilizadores
    const utilizadoresColumns = ["Nome Único", "Nome Completo"];
    const utilizadoresData = dashboardData.utilizadores.map((user) => ({
        "Nome Único": user.Unique_User_Name0 || "N/A",
        "Nome Completo": user.Full_User_Name0 || "N/A",
    }));

    // Preparar dados para a tabela de dispositivos críticos
    const dispositivosCriticosColumns = [
        "Nome",
        "Sistema Operacional",
    ];
    const dispositivosCriticosData = (
        dashboardData.dispositivosCriticos || []
    ).map((device) => ({
        Nome: device.Name0 || "N/A",
        "Sistema Operacional": device.Operating_System_Name_and0 || "N/A",
    }));

    // Componente de loading
    if (loading) {
        return (
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Carregando dados do dashboard...
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
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
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

                {/* Cards de Estatísticas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card
                        title="Total de Dispositivos"
                        value={dashboardData.stats.totalDispositivos.toString()}
                        icon="💻"
                    />
                    <Card
                        title="Dispositivos Online"
                        value={dashboardData.stats.dispositivosOnline.toString()}
                        icon="🟢"
                        iconSize="text-base"
                    />
                    <Card
                        title="Total de Utilizadores"
                        value={dashboardData.stats.totalUtilizadores.toString()}
                        icon="👥"
                        iconSize="text-xl"
                    />
                    <Card
                        title="Utilizadores Ativos"
                        value={dashboardData.stats.utilizadoresAtivos.toString()}
                        icon="👤"
                    />
                </div>

                {/* Cards de Alertas e Atenção */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <AlertCard
                        title="Sistemas Desatualizados"
                        value={dashboardData.stats.sistemasDesatualizados}
                        type="warning"
                        description="Windows 7/8/XP e Servers antigos"
                        icon={
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        }
                    />

                    <AlertCard
                        title="Servidores Críticos"
                        value={dashboardData.stats.servidoresCriticos}
                        type="critical"
                        description="Windows Server que precisam monitorização"
                        icon={
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        }
                    />

                    <AlertCard
                        title="Dispositivos Offline"
                        value={dashboardData.stats.dispositivosOfflineCritico}
                        type={
                            dashboardData.stats.dispositivosOfflineCritico > 10
                                ? "warning"
                                : "info"
                        }
                        description="Dispositivos que não comunicam"
                        icon={
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Tabela de Utilizadores */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Utilizadores Recentes
                        </h2>
                        {utilizadoresData.length > 0 ? (
                            <Table
                                columns={utilizadoresColumns}
                                data={utilizadoresData}
                                maxHeight="350px"
                            />
                        ) : (
                            <div className="text-center py-8">
                                <svg
                                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                    />
                                </svg>
                                <p className="text-gray-500">
                                    Nenhum utilizador encontrado
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Dispositivos Críticos */}
                    <div className="bg-red-50 border border-red-200 rounded-xl shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">
                            Dispositivos Críticos
                        </h2>
                        {dispositivosCriticosData.length > 0 ? (
                            <Table
                                columns={dispositivosCriticosColumns}
                                data={dispositivosCriticosData}
                                maxHeight="350px"
                            />
                        ) : (
                            <div className="text-center py-8">
                                <svg
                                    className="w-12 h-12 text-green-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-green-500">
                                    Nenhum dispositivo crítico encontrado
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Distribuição de Sistemas Operacionais */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <OSDistributionChart stats={dashboardData.stats} />
                    </div>

                    {/* Resumo dos Dispositivos */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Status dos Dispositivos
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Dispositivos Online
                                </span>
                                <span className="font-semibold text-green-600">
                                    {dashboardData.stats.dispositivosOnline}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Dispositivos Offline
                                </span>
                                <span className="font-semibold text-red-600">
                                    {dashboardData.stats.totalDispositivos -
                                        dashboardData.stats.dispositivosOnline}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Sistemas Desatualizados
                                </span>
                                <span className="font-semibold text-orange-600">
                                    {dashboardData.stats.sistemasDesatualizados}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-4">
                                <span className="text-gray-600 font-medium">
                                    Total
                                </span>
                                <span className="font-bold text-blue-600">
                                    {dashboardData.stats.totalDispositivos}
                                </span>
                            </div>

                            {dashboardData.stats.totalDispositivos > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        Taxa de dispositivos online
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${
                                                    (dashboardData.stats
                                                        .dispositivosOnline /
                                                        dashboardData.stats
                                                            .totalDispositivos) *
                                                    100
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {Math.round(
                                            (dashboardData.stats
                                                .dispositivosOnline /
                                                dashboardData.stats
                                                    .totalDispositivos) *
                                                100
                                        )}
                                        % online
                                    </div>
                                </div>
                            )}

                            {/* Alerta de Sistemas Críticos */}
                            {dashboardData.stats.sistemasDesatualizados > 0 && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4 text-red-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium text-red-800">
                                            Atenção:{" "}
                                            {
                                                dashboardData.stats
                                                    .sistemasDesatualizados
                                            }{" "}
                                            sistema(s) precisam de atualização
                                            urgente
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
