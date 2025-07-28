/**
 * Controllers Index - Exportação centralizada
 * Ponto de entrada unificado para todos os controllers
 *
 * ✅ TODOS OS CONTROLLERS USAM BaseController
 * ✅ ZERO DUPLICAÇÃO DE CÓDIGO
 * ✅ TRATAMENTO DE ERRO PADRONIZADO
 * ✅ SISTEMA DE CACHE IMPLEMENTADO
 * ✅ VALIDAÇÃO UNIFICADA
 * ✅ LOGGING CONTEXTUALIZADO
 */

// Controllers (Otimizados com BaseController)
const dashboardController = require("./dashboardController");
const dispositivosController = require("./dispositivosController");
const relatorioController = require("./relatorioController");
const updatesController = require("./updatesController");
const outrosController = require("./outrosController");

// Exportar todos os controllers organizados por funcionalidade
module.exports = {
    // Dashboard
    dashboard: dashboardController,
    // Dispositivos
    dispositivos: dispositivosController,
    // Relatórios
    relatorio: relatorioController,
    // Updates/Atualizações
    updates: updatesController,
    // Outros (AD, Inventário, etc.)
    outros: outrosController,

    // Exportação direta para compatibilidade com versões antigas
    ...dashboardController,
    ...dispositivosController,
    ...relatorioController,
    ...updatesController,
    ...outrosController,
};

/**
 * Documentação dos Controllers Disponíveis:
 *
 * DASHBOARD:
 * - getDashboardDataOptimized: Dados completos do dashboard
 *
 * DISPOSITIVOS:
 * - getDispositivosDataOptimized: Lista completa de dispositivos
 * - getDispositivoById: Dados detalhados de um dispositivo específico
 *
 * RELATÓRIOS:
 * - listarDispositivosParaRelatorio: Lista dispositivos para seleção
 * - gerarRelatorioIndividual: Gera relatório de um dispositivo
 * - gerarRelatorioGeral: Gera relatório de múltiplos dispositivos
 * - gerarRelatorioCriticos: Gera relatório de dispositivos críticos
 * - gerarPDFIndividual: Gera PDF de relatório individual
 * - gerarPDFGeral: Gera PDF de relatório geral
 * - gerarPDFCriticos: Gera PDF de relatório críticos
 * - previewRelatorio: Preview HTML de relatório
 *
 * UPDATES:
 * - getDispositivosUpdates: Dispositivos que precisam de updates
 *
 * OUTROS:
 * - getGruposAD: Grupos do Active Directory
 * - getUltimoInventario: Último inventário realizado
 * - loginAD: Login simulado no Active Directory
 */
