/**
 * Controllers Configuration
 * Configuração e versionamento dos controllers
 */

module.exports = {
    // Versões ativas dos controllers (recomendadas para uso)
    activeVersions: {
        dashboard: "current", // dashboardController.js (migrado para BaseController)
        dispositivos: "current", // dispositivosController.js (migrado para BaseController)
        relatorio: "current", // relatorioController.js (migrado para BaseController)
        updates: "current", // updatesController.js (migrado para BaseController)
        outros: "current", // outrosController.js (migrado para BaseController)
    },

    // Status de migração
    migrationStatus: {
        dashboard: "✅ COMPLETO - Migrado para BaseController",
        dispositivos: "✅ COMPLETO - Migrado para BaseController",
        relatorio: "✅ COMPLETO - Migrado para BaseController",
        updates: "✅ COMPLETO - Migrado para BaseController",
        outros: "✅ COMPLETO - Migrado para BaseController",
    },

    // Funcionalidades por controller
    features: {
        dashboard: [
            "getDashboardDataOptimized - Dados completos do dashboard com cache",
        ],
        dispositivos: [
            "getDispositivosDataOptimized - Lista completa com estatísticas",
            "getDispositivoById - Detalhes completos de um dispositivo",
        ],
        relatorio: [
            "listarDispositivosParaRelatorio - Lista para seleção",
            "gerarRelatorioIndividual - Relatório de um dispositivo",
            "gerarRelatorioGeral - Relatório de múltiplos dispositivos",
            "gerarRelatorioCriticos - Relatório de dispositivos críticos",
            "gerarPDFIndividual - PDF individual",
            "gerarPDFGeral - PDF geral",
            "gerarPDFCriticos - PDF críticos",
            "previewRelatorio - Preview HTML",
        ],
        updates: [
            "getDispositivosUpdates - Dispositivos que precisam de updates",
        ],
        outros: [
            "getGruposAD - Grupos do Active Directory",
            "getUltimoInventario - Último inventário",
            "loginAD - Login simulado no AD",
        ],
    },

    // Padrões de qualidade implementados
    qualityStandards: {
        baseController: "✅ Todos os controllers usam BaseController",
        errorHandling: "✅ Tratamento de erro padronizado",
        caching: "✅ Sistema de cache implementado",
        validation: "✅ Validação de parâmetros padronizada",
        logging: "✅ Sistema de logging unificado",
        asyncWrapper: "✅ Wrapper automático para try/catch",
        parallelQueries: "✅ Queries paralelas quando possível",
        sanitization: "✅ Sanitização de inputs implementada",
        documentation: "✅ Documentação completa e guias de referência",
        performance: "✅ Otimizações de performance implementadas",
    },

    // Arquitetura compartilhada (pasta shared/)
    sharedComponents: {
        baseController:
            "BaseController.js - Controller base com funcionalidades comuns",
        queries: "queries.js - Queries SQL padronizadas",
        utils: "utils.js - Utilitários compartilhados",
        middleware: "middleware.js - Middlewares compartilhados",
        constants: "constants.js - Constantes do sistema",
        config: "config.js - Configurações compartilhadas",
        index: "index.js - Exportação centralizada dos componentes shared",
    },

    // Arquivos de documentação e referência
    documentation: {
        mainReadme: "README.md - Documentação principal do projeto",
        configFile: "controllers.config.js - Este arquivo de configuração",
        indexFile: "index.js - Exportação centralizada dos controllers",
        baseController:
            "shared/BaseController.js - Controller base com funcionalidades comuns",
    },
};
