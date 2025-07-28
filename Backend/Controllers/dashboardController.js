/**
 * Dashboard Controller - Versão melhorada
 * Utiliza BaseController para eliminar código duplicado
 */

const BaseController = require("./shared/BaseController");
const {
    DASHBOARD_STATS_QUERY,
    DASHBOARD_USERS_QUERY,
    DASHBOARD_CRITICAL_DEVICES_QUERY,
} = require("./shared/queries");
const { createStandardResponse } = require("./shared/utils");

class DashboardController extends BaseController {
    constructor() {
        super("Dashboard");
    }

    /**
     * Obtém todos os dados do dashboard de forma otimizada
     */
    async getDashboardDataOptimized(req, res) {
        this.log("Iniciando carregamento de dados completos do dashboard");

        await this.getOrCache(
            "dashboard_complete_data",
            async () => {
                // Executar todas as queries em paralelo
                const [statsRows, utilizadoresRows, dispositivosCriticosRows] =
                    await this.executeParallelQueries([
                        {
                            query: DASHBOARD_STATS_QUERY,
                            description: "Estatísticas do dashboard",
                        },
                        {
                            query: DASHBOARD_USERS_QUERY,
                            description: "Usuários do dashboard",
                        },
                        {
                            query: DASHBOARD_CRITICAL_DEVICES_QUERY,
                            description: "Dispositivos críticos",
                        },
                    ]);

                // Verificar se temos dados estatísticos
                if (
                    this.checkDataNotFound(
                        statsRows,
                        res,
                        "Não foram encontrados dados estatísticos"
                    )
                ) {
                    return null;
                }

                const stats = statsRows[0];

                // Estruturar resposta usando função padronizada
                const dashboardData = createStandardResponse(
                    {
                        totalUtilizadores: stats.totalUtilizadores || 0,
                        totalDispositivos: stats.totalDispositivos || 0,
                        utilizadoresAtivos: stats.utilizadoresAtivos || 0,
                        dispositivosOnline: stats.dispositivosOnline || 0,
                        sistemasDesatualizados:
                            stats.sistemasDesatualizados || 0,
                        servidoresCriticos: stats.servidoresCriticos || 0,
                        dispositivosOfflineCritico:
                            stats.dispositivosOfflineCritico || 0,
                        estatisticasSO: {
                            windows11: stats.windows11 || 0,
                            windows10: stats.windows10 || 0,
                            windows8: stats.windows8 || 0,
                            windows7: stats.windows7 || 0,
                            windowsXP: stats.windowsXP || 0,
                            windowsServer2022: stats.windowsServer2022 || 0,
                            windowsServer2019: stats.windowsServer2019 || 0,
                            windowsServer2016: stats.windowsServer2016 || 0,
                            windowsServer2012: stats.windowsServer2012 || 0,
                            windowsServer2008: stats.windowsServer2008 || 0,
                            outros: stats.outros || 0,
                        },
                    },
                    utilizadoresRows,
                    dispositivosCriticosRows
                );

                // Renomear propriedades para manter compatibilidade com frontend
                dashboardData.utilizadores = dashboardData.items;
                dashboardData.dispositivosCriticos =
                    dashboardData.criticalItems;
                delete dashboardData.items;
                delete dashboardData.criticalItems;
                delete dashboardData.totalItems;
                delete dashboardData.totalCriticalItems;

                return dashboardData;
            },
            30000, // Cache por 30 segundos
            res,
            "Dados completos do dashboard obtidos com sucesso"
        );
    }
}

// Criar instância e exportar métodos
const dashboardController = new DashboardController();

module.exports = {
    getDashboardDataOptimized: dashboardController.asyncWrapper(
        dashboardController.getDashboardDataOptimized
    ),
};
