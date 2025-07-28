import axios from "axios";
import API_CONFIG, { ENDPOINTS, DEFAULT_HEADERS } from "./config";

// Configuração da instância do axios
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: DEFAULT_HEADERS,
});

// Interceptor para logging das requisições
apiClient.interceptors.request.use(
    (config) => {
        console.log(
            `🚀 Fazendo requisição: ${config.method?.toUpperCase()} ${
                config.url
            }`
        );
        return config;
    },
    (error) => {
        console.error("❌ Erro na configuração da requisição:", error);
        return Promise.reject(error);
    }
);

// Interceptor para tratamento das respostas
apiClient.interceptors.response.use(
    (response) => {
        console.log(
            `✅ Resposta recebida: ${response.status} - ${response.config.url}`
        );
        return response;
    },
    (error) => {
        console.error(
            `❌ Erro na resposta: ${
                error.response?.status || "Network Error"
            } - ${error.config?.url}`
        );
        return Promise.reject(error);
    }
);

// Função para verificar se a API está disponível
export const checkApiHealth = async () => {
    try {
        console.log("🔍 Verificando saúde da API...");

        // Criar cliente específico para health check
        const healthClient = axios.create({
            baseURL: "http://localhost:3000",
            timeout: API_CONFIG.TIMEOUT,
            headers: DEFAULT_HEADERS,
        });

        // Usar o endpoint raiz que sabemos que funciona
        const response = await healthClient.get("/");

        // Verificar se recebemos uma resposta válida
        if (response.status === 200 && response.data) {
            console.log("✅ API Health Check: Sucesso");
            return {
                success: true,
                message: "API está funcionando corretamente",
                data: response.data,
            };
        } else {
            console.log("⚠️ API Health Check: Resposta inesperada");
            return {
                success: false,
                message: "API retornou resposta inesperada",
            };
        }
    } catch (error) {
        console.error("❌ API Health Check: Falhou", error.message);
        return {
            success: false,
            message: `API não está disponível: ${error.message}`,
        };
    }
};

// Função otimizada para obter todos os dados da página de dispositivos (NOVA - RECOMENDADA)
export const getDispositivosDataOptimized = async () => {
    try {
        console.log(
            "📊 Iniciando carregamento otimizado da página de dispositivos"
        );

        const response = await apiClient.get(
            ENDPOINTS.DISPOSITIVOS.DATA_OPTIMIZED
        );

        if (response.data && response.data.success) {
            console.log(
                "✅ Dados completos dos dispositivos carregados com sucesso (otimizado)"
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } else {
            return {
                success: false,
                message: response.data?.message || "Resposta inválida da API",
            };
        }
    } catch (error) {
        console.error(
            "❌ Erro ao buscar dados otimizados dos dispositivos:",
            error
        );

        // Tratamento específico de diferentes tipos de erro
        if (error.code === "ECONNREFUSED") {
            return {
                success: false,
                message:
                    "Servidor não está disponível. Verifique se o backend está rodando.",
            };
        } else if (error.code === "ETIMEDOUT") {
            return {
                success: false,
                message:
                    "Tempo limite da requisição excedido. Tente novamente.",
            };
        } else if (error.response) {
            return {
                success: false,
                message:
                    error.response.data?.message ||
                    `Erro ${error.response.status}: ${error.response.statusText}`,
            };
        } else {
            return {
                success: false,
                message: "Erro de rede. Verifique sua conexão com a internet.",
            };
        }
    }
};

// Função para obter dados detalhados de um dispositivo específico
export const getDispositivoById = async (dispositivoId) => {
    try {
        console.log(
            `🔍 Buscando detalhes do dispositivo por ID:`,
            dispositivoId
        );
        console.log(`🔍 Tipo do parâmetro:`, typeof dispositivoId);

        // Verificar se o parâmetro é válido
        if (
            !dispositivoId ||
            (typeof dispositivoId !== "string" &&
                typeof dispositivoId !== "number")
        ) {
            console.error(`❌ Parâmetro inválido:`, dispositivoId);
            return {
                success: false,
                data: null,
                message: "ID do dispositivo inválido",
            };
        }

        // Converter para string se for número e validar se é um ID válido
        const deviceId = String(dispositivoId);
        console.log(`🔄 ID do dispositivo:`, deviceId);

        // Construir a URL explicitamente e de forma segura
        const baseUrl = apiClient.defaults.baseURL || API_CONFIG.BASE_URL;
        const deviceEndpoint = `/dispositivos/${deviceId}`;
        const fullUrl = `${baseUrl}${deviceEndpoint}`;

        console.log(`📍 URL completa sendo usada: ${fullUrl}`);
        console.log(`📍 Endpoint relativo: ${deviceEndpoint}`);

        const response = await apiClient.get(deviceEndpoint);

        if (response.data && response.data.success) {
            console.log(
                "✅ Dados detalhados do dispositivo carregados com sucesso"
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } else {
            console.error("❌ Resposta da API sem sucesso:", response.data);
            return {
                success: false,
                data: null,
                message:
                    response.data?.message ||
                    "Falha ao carregar dados do dispositivo",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao buscar dados do dispositivo:", error);

        if (error.response) {
            // Erro da API
            return {
                success: false,
                data: null,
                message:
                    error.response.data?.message ||
                    `Erro ${error.response.status}: ${error.response.statusText}`,
            };
        } else if (error.request) {
            // Erro de rede
            return {
                success: false,
                data: null,
                message:
                    "Erro de conexão com o servidor. Verifique sua conexão.",
            };
        } else {
            // Outro erro
            return {
                success: false,
                data: null,
                message: "Erro de rede. Verifique sua conexão com a internet.",
            };
        }
    }
};
