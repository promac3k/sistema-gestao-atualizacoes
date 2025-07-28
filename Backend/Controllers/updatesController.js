/**
 * Updates Controller - Versão otimizada
 * Migrado para usar BaseController para padronização
 */

const BaseController = require("./shared/BaseController");
const { updateQueries } = require("./shared/queries");
const { createStandardResponse } = require("./shared/utils");

class UpdatesController extends BaseController {
    constructor() {
        super("Updates");
    }

    /**
     * Obtém dispositivos que precisam de updates (desatualizados ou críticos)
     */
    async getDispositivosUpdates(req, res) {
        this.log("Iniciando carregamento de dados de updates");

        await this.getOrCache(
            "updates_complete_data",
            async () => {
                // Executar todas as queries em paralelo
                const [statsRows, dispositivosRows, dispositivosCriticosRows] =
                    await this.executeParallelQueries([
                        {
                            query: updateQueries.updateStats,
                            description: "Estatísticas de updates",
                        },
                        {
                            query: updateQueries.devicesWithUpdates,
                            description: "Dispositivos com updates",
                        },
                        {
                            query: updateQueries.criticalDevices,
                            description: "Dispositivos críticos",
                        },
                    ]);

                this.log("Resultados extraídos", {
                    stats: statsRows.length,
                    dispositivos: dispositivosRows.length,
                    dispositivosCriticos: dispositivosCriticosRows.length,
                });

                // Validar se há dados de estatísticas
                if (
                    this.checkDataNotFound(
                        statsRows,
                        res,
                        "Não foram encontrados dados de updates"
                    )
                ) {
                    return null;
                }

                const stats = statsRows[0];

                // Verificar dispositivos com MachineID para debug
                if (
                    Array.isArray(dispositivosRows) &&
                    dispositivosRows.length > 0
                ) {
                    const dispositivosComMachineId = dispositivosRows.filter(
                        (d) => d.MachineID
                    );
                    const dispositivosSemMachineId = dispositivosRows.filter(
                        (d) => !d.MachineID
                    );

                    this.log("Verificando MachineIDs", {
                        comMachineID: `${dispositivosComMachineId.length}/${dispositivosRows.length}`,
                        semMachineID: `${dispositivosSemMachineId.length}/${dispositivosRows.length}`,
                    });
                }

                // Estruturar resposta usando função padronizada
                const updatesData = createStandardResponse(
                    {
                        totalDispositivosComUpdates:
                            stats.totalDispositivosComUpdates || 0,
                        dispositivosNecessitamUpdates:
                            stats.dispositivosNecessitamUpdates || 0,
                        dispositivosNaoInstalados:
                            stats.dispositivosNaoInstalados || 0,
                        dispositivosNecessarios:
                            stats.dispositivosNecessarios || 0,
                        dispositivosComFalhas: stats.dispositivosComFalhas || 0,
                        sistemasDesatualizados:
                            stats.sistemasDesatualizados || 0,
                        sistemasOffline: stats.sistemasOffline || 0,
                        totalDispositivos: stats.totalDispositivos || 0,
                    },
                    dispositivosRows,
                    dispositivosCriticosRows
                );

                // Renomear propriedades para manter compatibilidade com frontend
                updatesData.dispositivos = updatesData.items;
                updatesData.dispositivosCriticos = updatesData.criticalItems;
                updatesData.totalRegistros = updatesData.totalItems;
                delete updatesData.items;
                delete updatesData.criticalItems;
                delete updatesData.totalItems;
                delete updatesData.totalCriticalItems;

                return updatesData;
            },
            30000, // Cache por 30 segundos
            res,
            "Dados de updates obtidos com sucesso"
        );
    }
}

// Criar instância e exportar métodos
const updatesController = new UpdatesController();

module.exports = {
    getDispositivosUpdates: updatesController.asyncWrapper(
        updatesController.getDispositivosUpdates
    ),
};
