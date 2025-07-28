/**
 * Outros Controller - Versão otimizada
 * Funcionalidades auxiliares: Active Directory, Inventário, etc.
 */

const BaseController = require("./shared/BaseController");
const { createStandardResponse, sanitizeInput } = require("./shared/utils");

class OutrosController extends BaseController {
    constructor() {
        super("Outros");
    }

    /**
     * Obtém todos os grupos do Active Directory
     */
    async getGruposAD(req, res) {
        this.log("Iniciando busca de grupos do Active Directory");

        await this.getOrCache(
            "grupos_ad",
            async () => {
                const query = `
                    SELECT 
                        ResourceID, 
                        System_Group_Name0
                    FROM v_RA_System_SystemGroupName
                `;

                const rows = await this.executeQuery(
                    query,
                    [],
                    "Busca grupos do Active Directory"
                );

                if (
                    this.checkDataNotFound(
                        rows,
                        res,
                        "Não foram encontrados grupos do Active Directory"
                    )
                ) {
                    return null;
                }

                return createStandardResponse({}, rows);
            },
            60000, // Cache por 1 minuto
            res,
            "Grupos do Active Directory encontrados com sucesso"
        );
    }

    /**
     * Obtém o último inventário
     */
    async getUltimoInventario(req, res) {
        this.log("Iniciando busca do último inventário");

        await this.getOrCache(
            "ultimo_inventario",
            async () => {
                const query = `
                    SELECT 
                        ResourceID, 
                        LastScanTime
                    FROM v_GS_LAST_SUCCESSFUL_SCAN
                `;

                const rows = await this.executeQuery(
                    query,
                    [],
                    "Busca último inventário"
                );

                if (
                    this.checkDataNotFound(
                        rows,
                        res,
                        "Não foi encontrado o último inventário"
                    )
                ) {
                    return null;
                }

                return createStandardResponse({}, rows);
            },
            30000, // Cache por 30 segundos
            res,
            "Último inventário encontrado com sucesso"
        );
    }

    /**
     * Login no Active Directory
     */
    async loginAD(req, res) {
        this.log("Tentativa de login no Active Directory");

        // Validar parâmetros obrigatórios
        if (!this.validateParams(req.body, ["username", "password"], res)) {
            return;
        }

        const { username, password } = req.body;
        const sanitizedUsername = sanitizeInput(username);

        this.log(`Tentando login para usuário: ${sanitizedUsername}`);

        try {
            // TODO: Implementar integração real com Active Directory
            // Por enquanto, simulação para desenvolvimento
            if (sanitizedUsername && password) {
                this.log(
                    `Login simulado com sucesso para: ${sanitizedUsername}`
                );

                return this.sendSuccess(
                    res,
                    "Login simulado com sucesso no Active Directory",
                    {
                        username: sanitizedUsername,
                        authenticated: true,
                        method: "simulation",
                    }
                );
            } else {
                return this.sendError(res, 401, "Usuário ou senha inválidos");
            }
        } catch (error) {
            return this.sendError(
                res,
                500,
                "Erro interno ao processar login",
                error
            );
        }
    }
}

// Criar instância e exportar métodos
const outrosController = new OutrosController();

module.exports = {
    getGruposAD: outrosController.asyncWrapper(outrosController.getGruposAD),
    getUltimoInventario: outrosController.asyncWrapper(
        outrosController.getUltimoInventario
    ),
    loginAD: outrosController.asyncWrapper(outrosController.loginAD),
};
