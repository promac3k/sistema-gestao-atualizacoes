import React, { useState, useEffect } from "react";
import { useRelatorio } from "../../hooks/useRelatorio";
import { formatarNivelCriticidade } from "../../Services/Relatorio";

const Relatorio = () => {
    const {
        // Estados
        dispositivos,
        dispositivosSelecionados,
        tipoRelatorio,
        dadosRelatorio,

        // Estados de carregamento
        loading,
        loadingDispositivos,
        loadingPDF,
        loadingPreview,

        // Estados de controle
        error,
        success,
        lastUpdated,
        dadosProcessados, // Novo estado para controlar se dados foram processados

        // Funções principais
        selecionarDispositivo,
        removerDispositivo,
        limparSelecao,
        alterarTipoRelatorio,
        gerarDadosRelatorio,
        gerarPDF,

        // Funções utilitárias
        limparTudo,
        canGenerate,
        getStatusSelecao,
    } = useRelatorio();

    const [filtroDispositivos, setFiltroDispositivos] = useState("");

    // Filtrar dispositivos baseado na pesquisa
    const dispositivosFiltrados = dispositivos.filter((dispositivo) =>
        dispositivo.nome
            .toLowerCase()
            .includes(filtroDispositivos.toLowerCase())
    );

    const statusSelecao = getStatusSelecao();

    const handleProcessarDados = async () => {
        const sucesso = await gerarDadosRelatorio();
        if (sucesso) {
            console.log(
                "Dados do relatório processados e armazenados localmente."
            );
        }
    };

    const handleGerarPDF = async (acao = "download") => {
        // Usa os dados já processados e armazenados localmente
        if (!dadosRelatorio) {
            setError(
                "Erro: Nenhum dado processado. Clique primeiro em 'Processar Dados'."
            );
            return;
        }

        // Gera PDF usando os dados já carregados, sem chamar o back-end novamente
        await gerarPDF(acao);
    };

    const handlePreview = async () => {
        // Usa os dados já processados para abrir o PDF numa nova aba
        if (!dadosRelatorio) {
            setError(
                "Erro: Nenhum dado processado. Clique primeiro em 'Processar Dados'."
            );
            return;
        }

        // Abre o PDF diretamente numa nova aba
        await gerarPDF("nova-aba");
    };

    return (
        <div className="p-6">
            {/* Mensagens de Estado */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <strong>Erro:</strong> {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <strong>Sucesso:</strong> {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Painel de Configuração */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Configuração do Relatório
                        </h2>

                        {/* Seleção do Tipo */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Relatório
                            </label>
                            <select
                                value={tipoRelatorio}
                                onChange={(e) =>
                                    alterarTipoRelatorio(e.target.value)
                                }
                                disabled={dadosProcessados} // Desabilitar quando dados estão processados
                                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    dadosProcessados
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                <option value="individual">
                                    📋 Individual
                                </option>
                                <option value="geral">
                                    📊 Geral (Múltiplos)
                                </option>
                                <option value="criticos">
                                    🚨 Dispositivos Críticos
                                </option>
                            </select>
                            {dadosProcessados && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Para alterar o tipo, clique em "Limpar Tudo"
                                </p>
                            )}
                        </div>

                        {/* Status da Seleção */}
                        <div className="mb-6">
                            <div
                                className={`p-3 rounded-md ${
                                    dadosProcessados
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : statusSelecao.valido
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                            >
                                <p className="text-sm font-medium">
                                    {dadosProcessados
                                        ? "✅ Dados processados com sucesso! Use os botões abaixo para gerar PDF."
                                        : statusSelecao.texto}
                                </p>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="space-y-3">
                            {/* Botão Principal: Processar Dados */}
                            <div>
                                <button
                                    onClick={handleProcessarDados}
                                    disabled={
                                        !canGenerate() ||
                                        loading ||
                                        dadosProcessados
                                    }
                                    className={`w-full py-3 px-4 rounded-md transition-colors font-medium ${
                                        dadosProcessados
                                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                            : !canGenerate() || loading
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {loading
                                        ? "🔄 Processando Dados..."
                                        : dadosProcessados
                                        ? "✅ Dados Processados"
                                        : "⚡ Processar Dados"}
                                </button>
                                <p className="text-xs text-gray-600 mt-1 px-2">
                                    {dadosProcessados
                                        ? "Dados já processados - Use 'Limpar Tudo' para processar novamente"
                                        : "Busca e processa todos os dados do Dispositivo"}
                                </p>
                            </div>

                            {/* Separador visual */}
                            {dadosProcessados && (
                                <div className="border-t border-gray-300 my-4 pt-3">
                                    <p className="text-xs text-green-600 text-center font-medium mb-3">
                                        ✅ Dados processados - Botões
                                        desbloqueados
                                    </p>
                                </div>
                            )}

                            {/* Botão: Pré-visualizar */}
                            <div>
                                <button
                                    onClick={handlePreview}
                                    disabled={
                                        !dadosProcessados || loadingPreview
                                    }
                                    className={`w-full py-3 px-4 rounded-md transition-colors ${
                                        dadosProcessados
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {loadingPreview
                                        ? "🔄 Carregando Preview..."
                                        : "🔗 Abrir PDF"}
                                </button>
                                <p className="text-xs text-gray-600 mt-1 px-2">
                                    {dadosProcessados
                                        ? "Abre o PDF numa nova aba do navegador"
                                        : "Requer dados processados"}
                                </p>
                            </div>

                            {/* Botão: Baixar PDF */}
                            <div>
                                <button
                                    onClick={() => handleGerarPDF("download")}
                                    disabled={!dadosProcessados || loadingPDF}
                                    className={`w-full py-3 px-4 rounded-md transition-colors ${
                                        dadosProcessados
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {loadingPDF
                                        ? "🔄 Gerando PDF..."
                                        : "📄 Baixar PDF"}
                                </button>
                                <p className="text-xs text-gray-600 mt-1 px-2">
                                    {dadosProcessados
                                        ? "Gera PDF com os dados já processados"
                                        : "Requer dados processados"}
                                </p>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200 my-4"></div>

                            {/* Botão: Limpar Tudo */}
                            <button
                                onClick={limparTudo}
                                className={`w-full py-3 px-4 rounded-md transition-colors ${
                                    dadosProcessados
                                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                        : "bg-gray-500 text-white hover:bg-gray-600"
                                }`}
                            >
                                🗑️ Limpar Tudo
                            </button>
                            <p className="text-xs text-gray-600 mt-1 px-2 text-center">
                                {dadosProcessados
                                    ? "Limpa dados processados e permite nova configuração"
                                    : "Remove os dados armazenados e permite novo relatório"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Painel de Seleção de Dispositivos */}
                <div className="lg:col-span-2">
                    {tipoRelatorio !== "criticos" && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            {dadosProcessados && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm text-blue-800 font-medium">
                                        🔒 Seleção de dispositivos bloqueada
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Os dados já foram processados. Para
                                        alterar a seleção, clique em "Limpar
                                        Tudo".
                                    </p>
                                </div>
                            )}
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold">
                                    Dispositivos Disponíveis
                                </h2>
                            </div>

                            {/* Filtro de Pesquisa */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="🔍 Pesquisar dispositivos..."
                                    value={filtroDispositivos}
                                    onChange={(e) => {
                                        if (!dadosProcessados) {
                                            setFiltroDispositivos(
                                                e.target.value
                                            );
                                        }
                                    }}
                                    disabled={dadosProcessados}
                                    className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        dadosProcessados
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            : ""
                                    }`}
                                />
                                {dadosProcessados && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Seleção bloqueada - dados já processados
                                    </p>
                                )}
                            </div>

                            {/* Lista de Dispositivos */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {loadingDispositivos ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-600">
                                            Carregando dispositivos...
                                        </p>
                                    </div>
                                ) : dispositivosFiltrados.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Nenhum dispositivo encontrado</p>
                                    </div>
                                ) : (
                                    dispositivosFiltrados.map((dispositivo) => {
                                        const selecionado =
                                            dispositivosSelecionados.find(
                                                (d) => d.id === dispositivo.id
                                            );
                                        return (
                                            <div
                                                key={dispositivo.id}
                                                onClick={() => {
                                                    if (!dadosProcessados) {
                                                        selecionarDispositivo(
                                                            dispositivo
                                                        );
                                                    }
                                                }}
                                                className={`p-3 border rounded-md transition-colors ${
                                                    dadosProcessados
                                                        ? "cursor-not-allowed bg-gray-100 border-gray-200"
                                                        : selecionado
                                                        ? "border-blue-500 bg-blue-50 cursor-pointer"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p
                                                            className={`font-medium ${
                                                                dadosProcessados
                                                                    ? "text-gray-500"
                                                                    : "text-gray-800"
                                                            }`}
                                                        >
                                                            {dispositivo.nome}
                                                        </p>
                                                        <p
                                                            className={`text-sm ${
                                                                dadosProcessados
                                                                    ? "text-gray-400"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            ID: {dispositivo.id}
                                                        </p>
                                                    </div>
                                                    {selecionado && (
                                                        <div
                                                            className={`${
                                                                dadosProcessados
                                                                    ? "text-gray-400"
                                                                    : "text-blue-600"
                                                            }`}
                                                        >
                                                            ✅
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Dispositivos Selecionados */}
                            {dispositivosSelecionados.length > 0 && (
                                <div className="mt-6 p-4 bg-white rounded-md border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">
                                            Selecionados (
                                            {dispositivosSelecionados.length})
                                        </h3>
                                        <button
                                            onClick={limparSelecao}
                                            disabled={dadosProcessados}
                                            className={`text-sm ${
                                                dadosProcessados
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-red-600 hover:text-red-800"
                                            }`}
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {dispositivosSelecionados.map(
                                            (dispositivo) => (
                                                <div
                                                    key={dispositivo.id}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span
                                                        className={`text-sm ${
                                                            dadosProcessados
                                                                ? "text-gray-500"
                                                                : "text-gray-800"
                                                        }`}
                                                    >
                                                        {dispositivo.nome}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                !dadosProcessados
                                                            ) {
                                                                removerDispositivo(
                                                                    dispositivo.id
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            dadosProcessados
                                                        }
                                                        className={`${
                                                            dadosProcessados
                                                                ? "text-gray-400 cursor-not-allowed"
                                                                : "text-red-500 hover:text-red-700"
                                                        }`}
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Painel de Informações para Relatório de Críticos */}
                    {tipoRelatorio === "criticos" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="text-center">
                                <div className="text-red-600 text-4xl mb-4">
                                    🚨
                                </div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">
                                    Relatório de Dispositivos Críticos
                                </h3>
                                <p className="text-red-700 mb-4">
                                    Este relatório será gerado automaticamente
                                    com todos os dispositivos que apresentam
                                    problemas críticos na infraestrutura.
                                </p>
                                <div className="bg-red-100 rounded-md p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>Critérios:</strong> Dispositivos
                                        offline, com SO desatualizado,
                                        atualizações críticas pendentes, ou com
                                        score de criticidade ≥ 50 pontos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Relatorio;
