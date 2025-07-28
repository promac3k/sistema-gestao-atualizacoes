/**
 * Arquivo de entrada para utilitários compartilhados
 * Centraliza todas as exportações dos módulos shared
 */

// Utilitários principais
const utils = require("./utils");
const constants = require("./constants");
const queries = require("./queries");
const config = require("./config");
const middleware = require("./middleware");
const BaseController = require("./BaseController");

// Re-exportar todas as funções e constantes mais usadas
const {
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
    handleError,
    handleSuccess,
    checkNotFound,
    validateAndRespond,
    executeQuerySafely,
} = utils;

const {
    SQL_CONDITIONS,
    SQL_CASE_FIELDS,
    SQL_COUNTERS,
    SQL_OS_STATS,
    UPDATE_STATUS,
    UPDATE_STATUS_DESCRIPTIONS,
    UPDATE_SEVERITY,
    UPDATE_SEVERITY_DESCRIPTIONS,
} = constants;

const {
    CACHE_CONFIG,
    DATA_LIMITS,
    MESSAGES,
    HTTP_STATUS,
    VALIDATION_CONFIG,
    CRITICALITY_CONFIG,
    OS_CONFIG,
} = config;

const {
    asyncHandler,
    validateParams,
    cacheMiddleware,
    sanitizeInputs,
    requestLogger,
    rateLimiter,
} = middleware;

// Exportar módulos completos e funções individuais
module.exports = {
    // Módulos completos
    utils,
    constants,
    queries,
    config,
    middleware,
    BaseController,

    // Funções utilitárias mais usadas (para imports diretos)
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
    handleError,
    handleSuccess,
    checkNotFound,
    validateAndRespond,
    executeQuerySafely,

    // Constantes mais usadas
    SQL_CONDITIONS,
    SQL_CASE_FIELDS,
    SQL_COUNTERS,
    SQL_OS_STATS,
    CACHE_CONFIG,
    DATA_LIMITS,
    MESSAGES,
    HTTP_STATUS,
    VALIDATION_CONFIG,
    CRITICALITY_CONFIG,
    OS_CONFIG,

    // Middleware mais usado
    asyncHandler,
    validateParams,
    cacheMiddleware,
    sanitizeInputs,
    requestLogger,
    rateLimiter,
};
