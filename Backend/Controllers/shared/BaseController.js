/**
 * BaseController - Classe base para todos os controllers
 * Elimina duplicação de código e padroniza operações comuns
 */

const {
    handleError,
    handleSuccess,
    checkNotFound,
    validateAndRespond,
    executeQuerySafely,
    debugLog,
    measureQueryTime,
    extractQueryResults,
    globalCache,
} = require("./utils");

class BaseController {
    constructor(context) {
        this.context = context || "BaseController";
        this.connection = require("../../Services/DB");
    }

    /**
     * Executa uma query de forma segura com logging automático
     * @param {string} query - SQL query
     * @param {Array} params - Parâmetros da query
     * @param {string} description - Descrição da operação
     * @returns {Promise<Array>} - Resultados da query
     */
    async executeQuery(query, params = [], description = "Query") {
        return await measureQueryTime(
            this.context,
            async () => {
                const result = await this.connection.query(query, params);
                return extractQueryResults(result);
            },
            description
        );
    }

    /**
     * Executa múltiplas queries em paralelo
     * @param {Array} queries - Array de objetos {query, params, description}
     * @returns {Promise<Array>} - Array com resultados de cada query
     */
    async executeParallelQueries(queries) {
        return await measureQueryTime(
            this.context,
            async () => {
                const promises = queries.map(
                    ({ query, params = [], description }) =>
                        this.connection.query(query, params)
                );
                const results = await Promise.all(promises);
                return results.map((result) => extractQueryResults(result));
            },
            `${queries.length} queries paralelas`
        );
    }

    /**
     * Valida parâmetros e responde automaticamente se inválidos
     * @param {Object} params - Parâmetros para validar
     * @param {Array} requiredFields - Campos obrigatórios
     * @param {Response} res - Response object
     * @returns {boolean} - true se válido
     */
    validateParams(params, requiredFields, res) {
        return validateAndRespond(params, requiredFields, res, this.context);
    }

    /**
     * Verifica se dados existem e responde automaticamente se não encontrados
     * @param {any} data - Dados para verificar
     * @param {Response} res - Response object
     * @param {string} message - Mensagem personalizada
     * @returns {boolean} - true se dados não encontrados
     */
    checkDataNotFound(data, res, message) {
        return checkNotFound(data, res, message, this.context);
    }

    /**
     * Resposta de sucesso padronizada
     * @param {Response} res - Response object
     * @param {string} message - Mensagem de sucesso
     * @param {any} data - Dados da resposta
     */
    sendSuccess(res, message, data) {
        return handleSuccess(res, message, data, this.context);
    }

    /**
     * Resposta de erro padronizada
     * @param {Response} res - Response object
     * @param {number} statusCode - Código HTTP
     * @param {string} message - Mensagem de erro
     * @param {Error} error - Objeto de erro
     */
    sendError(res, statusCode, message, error = null) {
        return handleError(res, statusCode, message, error, this.context);
    }

    /**
     * Loga uma mensagem com contexto automático
     * @param {string} message - Mensagem
     * @param {any} data - Dados adicionais
     */
    log(message, data = null) {
        debugLog(this.context, message, data);
    }

    /**
     * Obtém dados do cache ou executa função se não existir
     * @param {string} cacheKey - Chave do cache
     * @param {Function} dataFunction - Função para obter dados se cache vazio
     * @param {number} ttl - Time to live do cache
     * @param {Response} res - Response object
     * @param {string} successMessage - Mensagem de sucesso
     * @returns {Promise} - Resposta ou null se erro
     */
    async getOrCache(cacheKey, dataFunction, ttl = 30000, res, successMessage) {
        try {
            // Verificar cache primeiro
            const cachedData = globalCache.get(cacheKey);
            if (cachedData) {
                this.log(`Dados obtidos do cache: ${cacheKey}`);
                return this.sendSuccess(
                    res,
                    `${successMessage} (cache)`,
                    cachedData
                );
            }

            // Executar função para obter dados
            const data = await dataFunction();

            if (!data) {
                return; // Erro já tratado na função
            }

            // Salvar no cache
            globalCache.set(cacheKey, data, ttl);

            return this.sendSuccess(res, successMessage, data);
        } catch (error) {
            return this.sendError(res, 500, "Erro interno do servidor", error);
        }
    }

    /**
     * Wrapper para controllers que automatiza try/catch
     * @param {Function} controllerFunction - Função do controller
     * @returns {Function} - Função wrapper
     */
    asyncWrapper(controllerFunction) {
        return async (req, res) => {
            try {
                await controllerFunction.call(this, req, res);
            } catch (error) {
                this.sendError(res, 500, "Erro interno do servidor", error);
            }
        };
    }

    /**
     * Processa parâmetros de paginação padrão
     * @param {Object} query - Query parameters da requisição
     * @returns {Object} - Objeto com limit, offset e page
     */
    getPaginationParams(query) {
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
        const offset = (page - 1) * limit;

        return { page, limit, offset };
    }

    /**
     * Estrutura resposta paginada
     * @param {Array} data - Dados da página atual
     * @param {number} totalItems - Total de items
     * @param {number} page - Página atual
     * @param {number} limit - Limite por página
     * @param {Object} additionalData - Dados adicionais
     * @returns {Object} - Resposta estruturada
     */
    createPaginatedResponse(
        data,
        totalItems,
        page,
        limit,
        additionalData = {}
    ) {
        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            timestamp: new Date().toISOString(),
            ...additionalData,
        };
    }
}

module.exports = BaseController;
