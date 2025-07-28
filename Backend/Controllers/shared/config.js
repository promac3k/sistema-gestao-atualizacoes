/**
 * Configurações compartilhadas entre controllers
 * Centraliza configurações comuns e constantes de aplicação
 */

// Configurações de cache
const CACHE_CONFIG = {
    DEFAULT_TTL: 30000, // 30 segundos
    RELATORIO_TTL: 60000, // 1 minuto para relatórios
    DISPOSITIVOS_TTL: 30000, // 30 segundos para dispositivos
    DASHBOARD_TTL: 15000, // 15 segundos para dashboard (mais dinâmico)
    UPDATES_TTL: 45000, // 45 segundos para updates
};

// Limites de paginação e dados
const DATA_LIMITS = {
    MAX_DEVICES_PER_REPORT: 5,
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 100,
    DEFAULT_SOFTWARE_LIMIT: 20,
    DEFAULT_UPDATES_LIMIT: 10,
};

// Mensagens padronizadas
const MESSAGES = {
    SUCCESS: {
        DATA_RETRIEVED: "dados obtidos com sucesso",
        REPORT_GENERATED: "relatório gerado com sucesso",
        PDF_GENERATED: "PDF gerado com sucesso",
        LOGIN_SUCCESS: "login realizado com sucesso",
        CACHE_HIT: "dados obtidos do cache",
    },
    ERROR: {
        INTERNAL_SERVER: "Erro interno do servidor",
        NOT_FOUND: "não encontrado",
        INVALID_PARAMETERS: "Parâmetros inválidos",
        UNAUTHORIZED: "Não autorizado",
        FORBIDDEN: "Acesso negado",
        DEVICE_LIMIT_EXCEEDED: "Máximo de dispositivos excedido",
        MISSING_REQUIRED_FIELDS: "Campos obrigatórios não fornecidos",
    },
};

// Códigos de status HTTP
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

// Configurações de validação
const VALIDATION_CONFIG = {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 50,
    MIN_PASSWORD_LENGTH: 6,
    MAX_DEVICE_NAME_LENGTH: 100,
    ALLOWED_REPORT_TYPES: ["individual", "geral", "criticos"],
    ALLOWED_FILE_FORMATS: ["pdf", "json"],
};

// Configurações de criticidade
const CRITICALITY_CONFIG = {
    SCORES: {
        OFFLINE: 25,
        OUTDATED_OS: 30,
        SERVER: 20,
        OLD_HARDWARE: 15,
        SECURITY_VULNERABILITY: 40,
    },
    LEVELS: {
        LOW: "BAIXO",
        MEDIUM: "MÉDIO",
        HIGH: "ALTO",
        CRITICAL: "CRÍTICO",
    },
    THRESHOLDS: {
        MEDIUM: 20,
        HIGH: 30,
        CRITICAL: 50,
    },
};

// Configurações de sistema operacional
const OS_CONFIG = {
    SUPPORTED_VERSIONS: {
        WINDOWS_11: "Windows 11",
        WINDOWS_10: "Windows 10",
        WINDOWS_8: "Windows 8",
        WINDOWS_7: "Windows 7",
        WINDOWS_XP: "Windows XP",
        SERVER_2022: "Windows Server 2022",
        SERVER_2019: "Windows Server 2019",
        SERVER_2016: "Windows Server 2016",
        SERVER_2012: "Windows Server 2012",
        SERVER_2008: "Windows Server 2008",
    },
    OUTDATED_VERSIONS: [
        "Windows 7",
        "Windows 8",
        "Windows XP",
        "Windows Server 2008",
        "Windows Server 2012",
    ],
};

module.exports = {
    CACHE_CONFIG,
    DATA_LIMITS,
    MESSAGES,
    HTTP_STATUS,
    VALIDATION_CONFIG,
    CRITICALITY_CONFIG,
    OS_CONFIG,
};
