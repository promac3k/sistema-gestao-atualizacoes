/**
 * Dispositivos Controller - Versão melhorada
 * Utiliza BaseController para eliminar código duplicado
 */

const BaseController = require("./shared/BaseController");
const {
    DEVICES_STATS_QUERY,
    DEVICES_COMPLETE_QUERY,
    DEVICE_BY_ID_QUERY,
    DEVICE_MACHINE_ID_QUERY,
    DEVICE_HARDWARE_QUERY,
    DEVICE_PROCESSOR_QUERY,
    DEVICE_BIOS_QUERY,
    DEVICE_DISK_QUERY,
    DEVICE_SOFTWARE_QUERY,
    DEVICE_UPDATES_QUERY,
} = require("./shared/queries");
const { createStandardResponse, sanitizeInput } = require("./shared/utils");

class DispositivosController extends BaseController {
    constructor() {
        super("Dispositivos");
    }

    /**
     * Obtém dados completos dos dispositivos (stats + lista)
     */
    async getDispositivosDataOptimized(req, res) {
        this.log("Iniciando carregamento de dados completos dos dispositivos");

        await this.getOrCache(
            "dispositivos_complete_data",
            async () => {
                // Executar queries em paralelo
                const [statsRows, dispositivosRows] =
                    await this.executeParallelQueries([
                        {
                            query: DEVICES_STATS_QUERY,
                            description: "Estatísticas dos dispositivos",
                        },
                        {
                            query: DEVICES_COMPLETE_QUERY,
                            description: "Lista completa de dispositivos",
                        },
                    ]);

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

                // Filtrar dispositivos críticos
                const dispositivosCriticos = (dispositivosRows || []).filter(
                    (dispositivo) => dispositivo.statusCriticidade === "Crítico"
                );

                // Estruturar resposta
                const dispositivosData = createStandardResponse(
                    {
                        totalDispositivos: stats.totalDispositivos || 0,
                        dispositivosOnline: stats.dispositivosOnline || 0,
                        dispositivosOffline: stats.dispositivosOffline || 0,
                        sistemasDesatualizados:
                            stats.sistemasDesatualizados || 0,
                        dispositivosCriticos: stats.dispositivosCriticos || 0,
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
                        totalServidores: stats.totalServidores || 0,
                        totalWorkstations: stats.totalWorkstations || 0,
                    },
                    dispositivosRows,
                    dispositivosCriticos
                );

                // Renomear propriedades para compatibilidade
                dispositivosData.dispositivos = dispositivosData.items;
                dispositivosData.dispositivosCriticos =
                    dispositivosData.criticalItems;
                dispositivosData.totalRegistros = dispositivosData.totalItems;
                delete dispositivosData.items;
                delete dispositivosData.criticalItems;
                delete dispositivosData.totalItems;
                delete dispositivosData.totalCriticalItems;

                return dispositivosData;
            },
            30000, // Cache por 30 segundos
            res,
            "Dados completos dos dispositivos obtidos com sucesso"
        );
    }

    /**
     * Obtém dados detalhados de um dispositivo específico
     */
    async getDispositivoById(req, res) {
        const { id } = req.params;

        this.log(`Iniciando busca de dados detalhados do dispositivo: ${id}`);

        // Validar parâmetros
        if (!this.validateParams({ id }, ["id"], res)) {
            return;
        }

        // Validar se o ID é numérico
        if (!/^\d+$/.test(id)) {
            return this.sendError(res, 400, `ID deve ser numérico: ${id}`);
        }

        const deviceId = parseInt(id, 10);
        this.log(`Buscando dispositivo por ItemKey: ${deviceId}`);

        try {
            // Buscar dispositivo por ItemKey apenas
            const dispositivosRows = await this.executeQuery(
                DEVICE_BY_ID_QUERY.replace(
                    "AND (sys.ItemKey = ? OR sys.Name0 = ?)",
                    "AND sys.ItemKey = ?"
                ),
                [deviceId],
                "Busca dispositivo por ItemKey"
            );

            if (
                this.checkDataNotFound(
                    dispositivosRows,
                    res,
                    `Dispositivo não encontrado com ID: ${deviceId}`
                )
            ) {
                return;
            }

            const dispositivo = dispositivosRows[0];

            this.log(`Dispositivo encontrado:`, {
                idBuscado: deviceId,
                nomeEncontrado: dispositivo.nome,
                resourceId: dispositivo.ResourceID,
            });

            if (!dispositivo?.ResourceID) {
                this.log("Dados do dispositivo inválidos", dispositivo);
                return this.sendError(
                    res,
                    404,
                    `Dados do dispositivo inválidos para ID: ${deviceId}`
                );
            }

            const resourceId = dispositivo.ResourceID;
            this.log(
                `Dispositivo encontrado: ${dispositivo.nome} (ResourceID: ${resourceId})`
            );

            // Buscar MachineID
            const machineIdRows = await this.executeQuery(
                DEVICE_MACHINE_ID_QUERY,
                [resourceId],
                "Busca MachineID"
            );

            if (
                this.checkDataNotFound(
                    machineIdRows,
                    res,
                    `MachineID não encontrado para o dispositivo ID: ${deviceId}`
                )
            ) {
                return;
            }

            const machineId = machineIdRows[0].MachineID;
            this.log(`MachineID encontrado: ${machineId}`);

            // Executar queries de detalhes em paralelo
            const [
                hardwareRows,
                processadorRows,
                biosRows,
                discoRows,
                softwareRows,
                updatesRows,
            ] = await this.executeParallelQueries([
                {
                    query: DEVICE_HARDWARE_QUERY,
                    params: [machineId],
                    description: "Hardware do dispositivo",
                },
                {
                    query: DEVICE_PROCESSOR_QUERY,
                    params: [machineId],
                    description: "Processadores",
                },
                {
                    query: DEVICE_BIOS_QUERY,
                    params: [machineId],
                    description: "BIOS",
                },
                {
                    query: DEVICE_DISK_QUERY,
                    params: [machineId],
                    description: "Discos",
                },
                {
                    query: DEVICE_SOFTWARE_QUERY,
                    params: [machineId, 20],
                    description: "Software instalado",
                },
                {
                    query: DEVICE_UPDATES_QUERY,
                    params: [machineId, 10],
                    description: "Updates",
                },
            ]);

            // Processar resultados
            const hardware = hardwareRows[0] || null;
            const bios = biosRows[0] || null;
            const discos = discoRows || [];
            const software = softwareRows || [];
            const updates = updatesRows || [];

            // Calcular estatísticas dos updates
            const updateStats = this.calculateUpdateStats(updates);
            const discoStats = this.calculateDiskStats(discos);

            // Estruturar resposta completa
            const dispositivoCompleto = {
                informacoesBasicas: dispositivo,
                hardware: hardware,
                processadores: {
                    total: processadorRows.length,
                    lista: processadorRows,
                },
                bios: bios,
                discos: {
                    estatisticas: discoStats,
                    detalhes: discos,
                },
                software: {
                    total: software.length,
                    lista: software,
                },
                updates: {
                    estatisticas: updateStats,
                    lista: updates,
                },
                lastUpdate: new Date().toISOString(),
            };

            return this.sendSuccess(
                res,
                `Dados detalhados do dispositivo ${dispositivo.nome} obtidos com sucesso`,
                dispositivoCompleto
            );
        } catch (error) {
            return this.sendError(
                res,
                500,
                `Erro ao obter dados do dispositivo ID: ${deviceId}`,
                error
            );
        }
    }

    /**
     * Calcula estatísticas dos updates
     */
    calculateUpdateStats(updates) {
        return {
            total: updates.length,
            instalados: updates.filter((u) => u.status === 3).length,
            naoInstalados: updates.filter((u) => u.status === 2).length,
            falhas: updates.filter((u) => u.status === 4).length,
            requerReinicio: updates.filter((u) => u.status === 5).length,
        };
    }

    /**
     * Calcula estatísticas dos discos
     */
    calculateDiskStats(discos) {
        if (discos.length === 0) return null;

        return {
            totalDiscos: discos.length,
            espacoTotalGB: discos.reduce(
                (sum, disco) => sum + (parseFloat(disco.tamanhoTotalGB) || 0),
                0
            ),
            espacoUsadoGB: discos.reduce(
                (sum, disco) => sum + (parseFloat(disco.espacoUsadoGB) || 0),
                0
            ),
            espacoLivreGB: discos.reduce(
                (sum, disco) => sum + (parseFloat(disco.espacoLivreGB) || 0),
                0
            ),
            percentualUsadoMedio: (
                discos.reduce(
                    (sum, disco) =>
                        sum + (parseFloat(disco.percentualUsado) || 0),
                    0
                ) / discos.length
            ).toFixed(2),
        };
    }
}

// Criar instância e exportar métodos
const dispositivosController = new DispositivosController();

module.exports = {
    getDispositivosDataOptimized: dispositivosController.asyncWrapper(
        dispositivosController.getDispositivosDataOptimized
    ),
    getDispositivoById: dispositivosController.asyncWrapper(
        dispositivosController.getDispositivoById
    ),
};
