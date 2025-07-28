/**
 * Funções utilitárias compartilhadas entre controllers
 * Reduz duplicação de código e padroniza operações comuns
 */

const debug = process.env.DEBUG;

/**
 * Extrai dados dos resultados de query do banco de dados
 * Padroniza o tratamento de diferentes estruturas de retorno
 * @param {Array|Object} result - Resultado da query
 * @returns {Array} - Array de dados extraídos
 */
const extractQueryResults = (result) => {
    if (!result) return [];

    // Se é um array com 2 elementos (rows, fields), pega o primeiro
    if (
        Array.isArray(result) &&
        result.length === 2 &&
        Array.isArray(result[0])
    ) {
        return result[0];
    }

    // Se já é um array direto
    if (Array.isArray(result)) {
        return result;
    }

    // Se é um objeto único, transforma em array
    return [result];
};

/**
 * Padroniza logs de debug com timestamp e contexto
 * @param {string} context - Contexto da operação (ex: "Dashboard", "Dispositivos")
 * @param {string} message - Mensagem a ser logada
 * @param {Object} data - Dados adicionais para log (opcional)
 */
const debugLog = (context, message, data = null) => {
    if (!debug) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] 📊 ${context}:`;

    if (data) {
        console.log(`${prefix} ${message}`, data);
    } else {
        console.log(`${prefix} ${message}`);
    }
};

/**
 * Mede o tempo de execução de queries e loga resultado
 * @param {string} context - Contexto da operação
 * @param {Function} queryFunction - Função que executa a query
 * @param {string} description - Descrição da operação
 * @returns {Promise} - Resultado da query
 */
const measureQueryTime = async (context, queryFunction, description) => {
    const startTime = Date.now();

    try {
        const result = await queryFunction();
        const executionTime = Date.now() - startTime;

        debugLog(context, `✅ ${description} executada em ${executionTime}ms`);

        return result;
    } catch (error) {
        const executionTime = Date.now() - startTime;
        debugLog(
            context,
            `❌ ${description} falhou após ${executionTime}ms`,
            error
        );
        throw error;
    }
};

/**
 * Valida parâmetros obrigatórios de requisição
 * @param {Object} params - Parâmetros a validar
 * @param {Array<string>} requiredFields - Campos obrigatórios
 * @returns {Object} - { isValid: boolean, missingFields: Array<string> }
 */
const validateRequiredParams = (params, requiredFields) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
        if (!params[field] || params[field] === "") {
            missingFields.push(field);
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};

/**
 * Estrutura padronizada de resposta com estatísticas
 * @param {Object} stats - Dados estatísticos
 * @param {Array} items - Lista de items (dispositivos, utilizadores, etc.)
 * @param {Array} criticalItems - Items críticos (opcional)
 * @param {Object} additionalData - Dados adicionais (opcional)
 * @returns {Object} - Estrutura padronizada
 */
const createStandardResponse = (
    stats,
    items = [],
    criticalItems = [],
    additionalData = {}
) => {
    return {
        stats: stats || {},
        items: items,
        criticalItems: criticalItems,
        totalItems: items.length,
        totalCriticalItems: criticalItems.length,
        lastUpdate: new Date().toISOString(),
        ...additionalData,
    };
};

/**
 * Calcula estatísticas básicas de um array de dados
 * @param {Array} data - Array de dados para análise
 * @param {string} field - Campo a ser analisado (opcional)
 * @returns {Object} - Estatísticas calculadas
 */
const calculateBasicStats = (data, field = null) => {
    if (!Array.isArray(data) || data.length === 0) {
        return {
            total: 0,
            average: 0,
            min: 0,
            max: 0,
        };
    }

    if (field) {
        const values = data.map((item) => parseFloat(item[field]) || 0);
        return {
            total: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
        };
    }

    return {
        total: data.length,
    };
};

/**
 * Filtra dispositivos críticos baseado em critérios padrão
 * @param {Array} devices - Lista de dispositivos
 * @returns {Array} - Dispositivos críticos
 */
const filterCriticalDevices = (devices) => {
    if (!Array.isArray(devices)) return [];

    return devices.filter((device) => {
        return (
            device.statusCriticidade === "Crítico" ||
            device.statusConexao === "Offline" ||
            device.statusSO === "Desatualizado" ||
            device.tipoDispositivo === "Servidor"
        );
    });
};

/**
 * Sanitiza parâmetros de entrada removendo caracteres perigosos
 * @param {string} input - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;

    // Remove caracteres que podem ser usados para SQL injection
    return input.replace(/[';\\x00\\n\\r\\b\\t\\x1a]/g, "");
};

/**
 * Formata números para exibição com casas decimais
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Valor formatado
 */
const formatNumber = (value, decimals = 2) => {
    if (isNaN(value)) return "0";
    return parseFloat(value).toFixed(decimals);
};

/**
 * Agrupa itens por uma propriedade específica
 * @param {Array} items - Array de itens
 * @param {string} property - Propriedade para agrupamento
 * @returns {Object} - Objeto com itens agrupados
 */
const groupBy = (items, property) => {
    if (!Array.isArray(items)) return {};

    return items.reduce((groups, item) => {
        const key = item[property];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
};

/**
 * Cache simples em memória para evitar chamadas desnecessárias
 */
class SimpleCache {
    constructor(defaultTTL = 30000) {
        // 30 segundos por padrão
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    set(key, data, ttl = null) {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expiry });
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

// Instância global do cache
const globalCache = new SimpleCache();

/**
 * Padroniza tratamento de erros HTTP
 * @param {Response} res - Response object
 * @param {number} statusCode - Código HTTP
 * @param {string} message - Mensagem de erro
 * @param {Object} error - Objeto de erro (opcional)
 * @param {string} context - Contexto para log (opcional)
 */
const handleError = (
    res,
    statusCode,
    message,
    error = null,
    context = null
) => {
    if (context && error) {
        console.error(`❌ [${context}] ${message}:`, error);
    } else if (error) {
        console.error(`❌ ${message}:`, error);
    }

    const string_json = require("../../Services/string_json");
    return string_json(res, statusCode, message, null);
};

/**
 * Padroniza respostas de sucesso
 * @param {Response} res - Response object
 * @param {string} message - Mensagem de sucesso
 * @param {Object} data - Dados da resposta
 * @param {string} context - Contexto para log (opcional)
 */
const handleSuccess = (res, message, data, context = null) => {
    if (context) {
        debugLog(context, message);
    }

    const string_json = require("../../Services/string_json");
    return string_json(res, 200, `✅ ${message}`, data);
};

/**
 * Padroniza verificação de dados não encontrados
 * @param {Array|Object} data - Dados a verificar
 * @param {Response} res - Response object
 * @param {string} message - Mensagem de erro personalizada
 * @param {string} context - Contexto para log (opcional)
 * @returns {boolean} - true se dados não foram encontrados
 */
const checkNotFound = (data, res, message, context = null) => {
    const isEmpty =
        !data ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === "object" && Object.keys(data).length === 0);

    if (isEmpty) {
        if (context) {
            debugLog(context, `Dados não encontrados: ${message}`);
        }
        handleError(res, 404, `❌ ${message}`);
        return true;
    }
    return false;
};

/**
 * Padroniza validação de parâmetros de requisição com resposta automática
 * @param {Object} params - Parâmetros a validar
 * @param {Array<string>} requiredFields - Campos obrigatórios
 * @param {Response} res - Response object
 * @param {string} context - Contexto para log (opcional)
 * @returns {boolean} - true se validação passou
 */
const validateAndRespond = (params, requiredFields, res, context = null) => {
    const validation = validateRequiredParams(params, requiredFields);

    if (!validation.isValid) {
        const message = `Campos obrigatórios não fornecidos: ${validation.missingFields.join(
            ", "
        )}`;
        if (context) {
            debugLog(context, message, validation.missingFields);
        }
        handleError(res, 400, `❌ ${message}`);
        return false;
    }
    return true;
};

/**
 * Wrapper para execução de queries com tratamento padronizado de erro
 * @param {Function} queryFunction - Função que executa a query
 * @param {Response} res - Response object
 * @param {string} context - Contexto para log
 * @param {string} operation - Descrição da operação
 * @returns {Promise<Object|null>} - Resultado da query ou null se erro
 */
const executeQuerySafely = async (queryFunction, res, context, operation) => {
    try {
        return await queryFunction();
    } catch (error) {
        handleError(
            res,
            500,
            `Erro interno do servidor ao ${operation}`,
            error,
            context
        );
        return null;
    }
};

/**
 * Validador de parâmetros específico para controllers
 * Adiciona validações customizadas além das básicas
 */
class ControllerValidator {
    /**
     * Valida ID de dispositivo
     * @param {string} id - ID do dispositivo
     * @returns {Object} - {isValid: boolean, error?: string}
     */
    static validateDeviceId(id) {
        if (!id || typeof id !== "string") {
            return {
                isValid: false,
                error: "ID do dispositivo é obrigatório e deve ser uma string",
            };
        }

        if (id.length > 50) {
            return { isValid: false, error: "ID do dispositivo muito longo" };
        }

        // Remover caracteres potencialmente perigosos
        const cleanId = id.replace(/[';\\x00\\n\\r\\b\\t\\x1a]/g, "");
        if (cleanId !== id) {
            return {
                isValid: false,
                error: "ID do dispositivo contém caracteres inválidos",
            };
        }

        return { isValid: true };
    }

    /**
     * Valida lista de IDs de dispositivos
     * @param {Array} deviceIds - Array de IDs
     * @returns {Object} - {isValid: boolean, error?: string, validIds?: Array}
     */
    static validateDeviceIds(deviceIds) {
        if (!Array.isArray(deviceIds)) {
            return {
                isValid: false,
                error: "Lista de dispositivos deve ser um array",
            };
        }

        if (deviceIds.length === 0) {
            return {
                isValid: false,
                error: "Lista de dispositivos não pode estar vazia",
            };
        }

        if (deviceIds.length > 100) {
            return {
                isValid: false,
                error: "Máximo de 100 dispositivos por relatório",
            };
        }

        const validIds = [];
        for (const id of deviceIds) {
            const validation = this.validateDeviceId(id);
            if (validation.isValid) {
                validIds.push(id);
            }
        }

        if (validIds.length === 0) {
            return {
                isValid: false,
                error: "Nenhum ID de dispositivo válido encontrado",
            };
        }

        return { isValid: true, validIds };
    }

    /**
     * Valida parâmetros de paginação
     * @param {Object} query - Query parameters
     * @returns {Object} - {isValid: boolean, params?: Object, error?: string}
     */
    static validatePagination(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;

        if (page < 1) {
            return { isValid: false, error: "Página deve ser maior que 0" };
        }

        if (limit < 1 || limit > 100) {
            return { isValid: false, error: "Limite deve estar entre 1 e 100" };
        }

        return {
            isValid: true,
            params: {
                page,
                limit,
                offset: (page - 1) * limit,
            },
        };
    }
}

module.exports = {
    extractQueryResults,
    debugLog,
    measureQueryTime,
    validateRequiredParams,
    createStandardResponse,
    calculateBasicStats,
    filterCriticalDevices,
    sanitizeInput,
    formatNumber,
    groupBy,
    SimpleCache,
    globalCache,
    // Novas funções utilitárias
    handleError,
    handleSuccess,
    checkNotFound,
    validateAndRespond,
    executeQuerySafely,
    ControllerValidator,
};
