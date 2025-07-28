import React, { useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import ConnectionStatus from "../Components/ConnectionStatus/ConnectionStatus";
import Relatorio from "../Components/Relatorio/Relatorio";
import { useRelatorio } from "../hooks/useRelatorio";

export default function RelatorioPage() {
    const {
        loading,
        loadingDispositivos,
        error,
        lastUpdated,
        carregarDispositivos,
    } = useRelatorio();

    // Estado para controlar a visibilidade das instruções
    const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

    // Componente de loading quando carregando dados iniciais
    if (loadingDispositivos) {
        return (
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Carregando sistema de relatórios...
                        </p>
                        <div className="mt-4">
                            <ConnectionStatus />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Componente de erro crítico
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
                            onClick={carregarDispositivos}
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
            <div className="flex-1 overflow-auto bg-gray-50">
                <div className="bg-white shadow-sm border-b border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">
                                            📊
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Relatórios SCCM
                                    </h1>
                                    <p className="text-gray-500">
                                        Gere relatórios detalhados da sua
                                        infraestrutura
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                            {/* Informação de Última Atualização */}
                            {lastUpdated && (
                                <div className="text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <span>🕒</span>
                                        <span>
                                            Última atualização:{" "}
                                            {lastUpdated.toLocaleTimeString(
                                                "pt-PT"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {/* Status da Conexão */}
                            <ConnectionStatus />

                            {/* Botão de Atualizar */}
                            <button
                                onClick={carregarDispositivos}
                                disabled={loadingDispositivos}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg
                                    className={`w-4 h-4 ${
                                        loadingDispositivos
                                            ? "animate-spin"
                                            : ""
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
                                {loadingDispositivos
                                    ? "Atualizando..."
                                    : "Atualizar"}
                            </button>
                        </div>
                    </div>
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

                {/* Cards de Informação Rápida */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                        {/* Card Individual */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                            <span className="text-blue-600 text-lg">
                                                📋
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Relatório Individual
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                Análise Detalhada
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600">
                                        Análise completa de um dispositivo
                                        específico
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Geral */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                            <span className="text-green-600 text-lg">
                                                📊
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Relatório Geral
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                Múltiplos Dispositivos
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600">
                                        Compare até 5 dispositivos
                                        simultaneamente
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Críticos */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                            <span className="text-red-600 text-lg">
                                                🚨
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Dispositivos Críticos
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                Ação Imediata
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600">
                                        Dispositivos que requerem atenção
                                        urgente
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Status */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                            <span className="text-purple-600 text-lg">
                                                📈
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Sistema Ativo
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {loading
                                                    ? "Processando..."
                                                    : "Pronto"}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600">
                                        Estado atual do sistema de relatórios
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Área de Instruções */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">
                                            💡
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Como usar o Sistema de Relatórios
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setMostrarInstrucoes(!mostrarInstrucoes)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                                {mostrarInstrucoes ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>

                        {mostrarInstrucoes && (
                            <div className="mt-4 text-sm text-blue-700">
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>
                                        <strong>Selecione o tipo:</strong>{" "}
                                        Individual (1 dispositivo), Geral (2-5
                                        dispositivos) ou Críticos (automático)
                                    </li>
                                    <li>
                                        <strong>Escolha dispositivos:</strong>{" "}
                                        Selecione os dispositivos desejados
                                    </li>
                                    <li>
                                        <strong>Processar Dados:</strong> Clique
                                        para buscar e processar os dados do
                                        Dispositivo
                                    </li>
                                    <li>
                                        <strong>Pré-visualizar:</strong>{" "}
                                        Visualize o relatório usando os dados já
                                        processados
                                    </li>
                                    <li>
                                        <strong>Baixar PDF:</strong> Gere o PDF
                                        usando os dados já processados
                                    </li>
                                    <li>
                                        <strong>Limpar Tudo:</strong> Remove
                                        dados armazenados para gerar novo
                                        relatório
                                    </li>
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Componente Principal de Relatórios */}
                    <div className="bg-white rounded-lg shadow">
                        <Relatorio />
                    </div>
                </div>
            </div>
        </div>
    );
}
