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

// Função para obter dispositivos que necessitam de updates
export const getDispositivosUpdates = async () => {
    try {
        console.log("🔄 Obtendo dispositivos que necessitam de updates...");

        const response = await apiClient.get(ENDPOINTS.UPDATES.DATA_OPTIMIZED);

        console.log("📦 Update.js: Resposta completa:", response);
        console.log("📊 Update.js: Status:", response.status);
        console.log("📋 Update.js: Data:", response.data);

        if (response.status === 200) {
            console.log("✅ Dispositivos obtidos com sucesso");
            console.log("🔍 Update.js: Estrutura dos dados:", {
                success: response.data.success,
                hasStats: !!response.data.data?.stats,
                hasDispositivos: !!response.data.data?.dispositivos,
                totalDispositivos:
                    response.data.data?.dispositivos?.length || 0,
            });
            return response.data; // Retorna a resposta completa do backend
        } else {
            console.error(
                `⚠️ Erro ao obter dispositivos: ${response.statusText}`
            );
            return {
                success: false,
                message: `Erro HTTP: ${response.statusText}`,
                data: null,
            };
        }
    } catch (error) {
        console.error("❌ Erro ao obter dispositivos:", error);
        console.error("❌ Detalhes do erro:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Erro ao conectar com o servidor",
            data: null,
        };
    }
};
