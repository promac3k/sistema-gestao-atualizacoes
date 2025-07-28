/**
 * Middleware centralizado para tratamento de erros
 * Padroniza as respostas de erro em toda a aplicação
 */

const { debugLog, handleError } = require("./utils");
const { HTTP_STATUS, MESSAGES } = require("./config");

/**
 * Wrapper para controllers que automatiza tratamento de erros
 * @param {Function} controllerFunction - Função do controller a ser executada
 * @param {string} context - Contexto para logs
 * @returns {Function} - Middleware function
 */
const asyncHandler = (controllerFunction, context = "Controller") => {
    return async (req, res, next) => {
        try {
            await controllerFunction(req, res, next);
        } catch (error) {
            handleError(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                MESSAGES.ERROR.INTERNAL_SERVER,
                error,
                context
            );
        }
    };
};

/**
 * Middleware para validação de parâmetros de rota
 * @param {Array<string>} requiredParams - Parâmetros obrigatórios
 * @param {string} source - Fonte dos parâmetros ('params', 'body', 'query')
 * @returns {Function} - Middleware function
 */
const validateParams = (requiredParams, source = "body") => {
    return (req, res, next) => {
        const { validateAndRespond } = require("./utils");

        let params;
        switch (source) {
            case "params":
                params = req.params;
                break;
            case "query":
                params = req.query;
                break;
            default:
                params = req.body;
        }

        if (!validateAndRespond(params, requiredParams, res, "Validation")) {
            return;
        }

        next();
    };
};

/**
 * Middleware para cache response
 * @param {string} cacheKey - Chave do cache
 * @param {number} ttl - Time to live em milliseconds
 * @returns {Function} - Middleware function
 */
const cacheMiddleware = (cacheKey, ttl = 30000) => {
    return (req, res, next) => {
        const { globalCache, handleSuccess } = require("./utils");

        // Verificar se existe dados em cache
        const cachedData = globalCache.get(cacheKey);

        if (cachedData) {
            debugLog("Cache", `Cache hit para: ${cacheKey}`);
            return handleSuccess(
                res,
                MESSAGES.SUCCESS.CACHE_HIT,
                cachedData,
                "Cache"
            );
        }

        // Interceptar o método de resposta para salvar no cache
        const originalSend = res.send;
        res.send = function (body) {
            // Salvar apenas respostas de sucesso
            if (res.statusCode === HTTP_STATUS.OK) {
                try {
                    const data = JSON.parse(body);
                    if (data && data.dados) {
                        globalCache.set(cacheKey, data.dados, ttl);
                        debugLog("Cache", `Dados salvos no cache: ${cacheKey}`);
                    }
                } catch (error) {
                    // Ignorar erros de parsing silenciosamente
                }
            }
            originalSend.call(this, body);
        };

        next();
    };
};

/**
 * Middleware para sanitização de inputs
 * @param {Array<string>} fields - Campos a serem sanitizados
 * @param {string} source - Fonte dos dados ('body', 'params', 'query')
 * @returns {Function} - Middleware function
 */
const sanitizeInputs = (fields, source = "body") => {
    return (req, res, next) => {
        const { sanitizeInput } = require("./utils");

        let targetObject;
        switch (source) {
            case "params":
                targetObject = req.params;
                break;
            case "query":
                targetObject = req.query;
                break;
            default:
                targetObject = req.body;
        }

        fields.forEach((field) => {
            if (targetObject[field]) {
                targetObject[field] = sanitizeInput(targetObject[field]);
            }
        });

        next();
    };
};

/**
 * Middleware para logging de requisições
 * @param {string} context - Contexto da operação
 * @returns {Function} - Middleware function
 */
const requestLogger = (context) => {
    return (req, res, next) => {
        const startTime = Date.now();

        debugLog(context, `${req.method} ${req.path} - Início`, {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            body: req.method !== "GET" ? req.body : undefined,
            query: req.query,
        });

        // Interceptar resposta para log de finalização
        const originalSend = res.send;
        res.send = function (body) {
            const duration = Date.now() - startTime;
            const status = res.statusCode;

            debugLog(
                context,
                `${req.method} ${req.path} - ${status} (${duration}ms)`
            );
            originalSend.call(this, body);
        };

        next();
    };
};

/**
 * Middleware para rate limiting simples
 * @param {number} maxRequests - Máximo de requisições
 * @param {number} windowMs - Janela de tempo em milliseconds
 * @returns {Function} - Middleware function
 */
const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();

        // Limpar entradas antigas
        requests.forEach((value, ip) => {
            if (now - value.firstRequest > windowMs) {
                requests.delete(ip);
            }
        });

        if (!requests.has(key)) {
            requests.set(key, {
                count: 1,
                firstRequest: now,
            });
        } else {
            const requestInfo = requests.get(key);
            requestInfo.count++;

            if (requestInfo.count > maxRequests) {
                return handleError(
                    res,
                    429,
                    "Muitas requisições. Tente novamente mais tarde."
                );
            }
        }

        next();
    };
};

module.exports = {
    asyncHandler,
    validateParams,
    cacheMiddleware,
    sanitizeInputs,
    requestLogger,
    rateLimiter,
};
