// Configurações da API
const API_CONFIG = {
    BASE_URL: "http://localhost:3000/api/v1",
    TIMEOUT: 60000, // 60 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 segundo
};

// Headers padrão para as requisições
export const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
};

// Endpoints da API
export const ENDPOINTS = {
    OUTROS: "/outros",
    DASHBOARD: {
        DATA_OPTIMIZED: "/dashboard/data-optimized",
    },
    DISPOSITIVOS: {
        DATA_OPTIMIZED: "/dispositivos/data-optimized",
        BY_ID: (id) => `/dispositivos/${id}`, // Endpoint para buscar dispositivo por ID ou nome
    },
    UPDATES: {
        DATA_OPTIMIZED: "/updates/data-optimized",
    },
    RELATORIOS: {
        DATA_GETDISPOSITIVOS: "/relatorio/dispositivos",
        DATA_GENERATE_INDIVIDUAL: "/relatorio/generate/individual",
        DATA_GENERATE_GERAL: "/relatorio/generate/geral",
        DATA_GENERATE_CRITICOS: "/relatorio/generate/criticos",
        DATA_PDF_INDIVIDUAL: "/relatorio/pdf/individual",
        DATA_PDF_GERAL: "/relatorio/pdf/geral",
        DATA_PDF_CRITICOS: "/relatorio/pdf/criticos",
        DATA_PREVIEW: "/relatorio/preview",
    },
};

export default API_CONFIG;
