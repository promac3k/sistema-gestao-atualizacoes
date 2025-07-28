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

// Função otimizada para obter dados do dashboard (usando nova API unificada)
export const getDashboardDataOptimized = async () => {
    try {
        console.log(
            "📊 Iniciando carregamento otimizado dos dados do dashboard - NOVA API UNIFICADA"
        );

        // Usar o novo endpoint que retorna TODOS os dados necessários em uma única requisição
        const response = await apiClient.get(
            ENDPOINTS.DASHBOARD.DATA_OPTIMIZED
        );

        const data = response.data.data || {};

        console.log("📈 Dados completos carregados em uma única requisição:");
        console.log(
            `   - Estatísticas: ${
                Object.keys(data.stats || {}).length
            } métricas`
        );
        console.log(
            `   - Utilizadores: ${(data.utilizadores || []).length} registros`
        );
        console.log(
            `   - Dispositivos críticos: ${
                (data.dispositivosCriticos || []).length
            } dispositivos`
        );

        return {
            success: true,
            data: {
                stats: data.stats || {},
                utilizadores: data.utilizadores || [],
                dispositivosCriticos: data.dispositivosCriticos || [],
                dispositivos: [], // Mantido para compatibilidade, mas não usado
                lastUpdate: data.lastUpdate || new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error(
            "❌ Erro ao buscar dados otimizados do dashboard:",
            error
        );

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
                    error.response.data.message ||
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
