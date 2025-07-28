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

// =============================================================================
// FUNÇÕES PARA LISTAGEM DE DISPOSITIVOS
// =============================================================================

// Função para listar dispositivos disponíveis para relatórios
export const getDispositivosParaRelatorio = async () => {
    try {
        console.log("📋 Carregando lista de dispositivos para relatório...");

        const response = await apiClient.get(
            ENDPOINTS.RELATORIOS.DATA_GETDISPOSITIVOS
        );

        if (response.data && response.data.success) {
            console.log(
                `✅ ${response.data.data.total} dispositivos carregados`
            );
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            console.log("⚠️ Resposta inesperada ao carregar dispositivos");
            return {
                success: false,
                message: "Resposta inesperada do servidor",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao carregar dispositivos:", error);
        return {
            success: false,
            message:
                error.response?.data?.message ||
                "Erro ao carregar dispositivos",
        };
    }
};

// =============================================================================
// FUNÇÕES PARA GERAÇÃO DE DADOS DE RELATÓRIOS
// =============================================================================

// Função para gerar dados do relatório individual
export const gerarRelatorioIndividual = async (deviceId) => {
    try {
        console.log(
            `📊 Gerando dados do relatório individual para dispositivo: ${deviceId}`
        );

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_GENERATE_INDIVIDUAL,
            {
                deviceId: deviceId,
            }
        );

        if (response.data && response.data.success) {
            console.log("✅ Dados do relatório individual gerados com sucesso");
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            console.log("⚠️ Erro ao gerar dados do relatório individual");
            return {
                success: false,
                message: response.data?.message || "Erro ao gerar relatório",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar relatório individual:", error);
        return {
            success: false,
            message:
                error.response?.data?.message || "Erro interno do servidor",
        };
    }
};

// Função para gerar dados do relatório geral
export const gerarRelatorioGeral = async (deviceIds) => {
    try {
        console.log(
            `📊 Gerando dados do relatório geral para ${deviceIds.length} dispositivos`
        );

        if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
            return {
                success: false,
                message: "Lista de dispositivos é obrigatória",
            };
        }

        if (deviceIds.length > 5) {
            return {
                success: false,
                message: "Máximo de 5 dispositivos permitidos",
            };
        }

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_GENERATE_GERAL,
            {
                deviceIds: deviceIds,
            }
        );

        if (response.data && response.data.success) {
            console.log("✅ Dados do relatório geral gerados com sucesso");
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            console.log("⚠️ Erro ao gerar dados do relatório geral");
            return {
                success: false,
                message: response.data?.message || "Erro ao gerar relatório",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar relatório geral:", error);
        return {
            success: false,
            message:
                error.response?.data?.message || "Erro interno do servidor",
        };
    }
};

// Função para gerar dados do relatório de críticos
export const gerarRelatorioCriticos = async () => {
    try {
        console.log("🚨 Gerando dados do relatório de dispositivos críticos");

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_GENERATE_CRITICOS
        );

        if (response.data && response.data.success) {
            console.log(
                "✅ Dados do relatório de críticos gerados com sucesso"
            );
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            console.log("⚠️ Erro ao gerar dados do relatório de críticos");
            return {
                success: false,
                message: response.data?.message || "Erro ao gerar relatório",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar relatório de críticos:", error);
        return {
            success: false,
            message:
                error.response?.data?.message || "Erro interno do servidor",
        };
    }
};

// =============================================================================
// FUNÇÕES PARA GERAÇÃO DE PDFs
// =============================================================================

// Função para gerar PDF do relatório individual
export const gerarPDFIndividual = async (deviceId, dadosProcessados = null) => {
    try {
        console.log(`📄 Gerando PDF individual para dispositivo: ${deviceId}`);

        const requestData = {
            deviceId: deviceId,
            ...(dadosProcessados && { dadosProcessados }),
        };

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_PDF_INDIVIDUAL,
            requestData,
            {
                responseType: "blob", // Importante para receber dados binários
                timeout: 30000, // 30 segundos para geração de PDF
            }
        );

        if (response.data) {
            console.log("✅ PDF individual gerado com sucesso");

            // Criar URL para download
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            return {
                success: true,
                data: {
                    blob: blob,
                    url: url,
                    filename: `relatorio_individual_${deviceId}_${
                        new Date().toISOString().split("T")[0]
                    }.pdf`,
                },
            };
        } else {
            return {
                success: false,
                message: "Erro ao gerar PDF",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar PDF individual:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Erro ao gerar PDF",
        };
    }
};

// Função para gerar PDF do relatório geral
export const gerarPDFGeral = async (deviceIds, dadosProcessados = null) => {
    try {
        console.log(
            `📄 Gerando PDF geral para ${deviceIds.length} dispositivos`
        );

        if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
            return {
                success: false,
                message: "Lista de dispositivos é obrigatória",
            };
        }

        const requestData = {
            deviceIds: deviceIds,
            ...(dadosProcessados && { dadosProcessados }),
        };

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_PDF_GERAL,
            requestData,
            {
                responseType: "blob",
                timeout: 45000, // 45 segundos para PDFs maiores
            }
        );

        if (response.data) {
            console.log("✅ PDF geral gerado com sucesso");

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            return {
                success: true,
                data: {
                    blob: blob,
                    url: url,
                    filename: `relatorio_geral_${
                        deviceIds.length
                    }dispositivos_${
                        new Date().toISOString().split("T")[0]
                    }.pdf`,
                },
            };
        } else {
            return {
                success: false,
                message: "Erro ao gerar PDF",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar PDF geral:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Erro ao gerar PDF",
        };
    }
};

// Função para gerar PDF do relatório de críticos
export const gerarPDFCriticos = async (dadosProcessados = null) => {
    try {
        console.log("📄 Gerando PDF de dispositivos críticos");

        const requestData = dadosProcessados ? { dadosProcessados } : {};

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_PDF_CRITICOS,
            requestData,
            {
                responseType: "blob",
                timeout: 30000,
            }
        );

        if (response.data) {
            console.log("✅ PDF de críticos gerado com sucesso");

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            return {
                success: true,
                data: {
                    blob: blob,
                    url: url,
                    filename: `relatorio_criticos_${
                        new Date().toISOString().split("T")[0]
                    }.pdf`,
                },
            };
        } else {
            return {
                success: false,
                message: "Erro ao gerar PDF",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar PDF de críticos:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Erro ao gerar PDF",
        };
    }
};

// =============================================================================
// FUNÇÕES PARA PREVIEW DE RELATÓRIOS
// =============================================================================

// Função para gerar preview dos dados do relatório (sem PDF)
export const previewRelatorio = async (
    tipo,
    deviceIds = null,
    deviceId = null
) => {
    try {
        console.log(`👁️ Gerando preview simplificado do relatório: ${tipo}`);

        let payload = { tipo: tipo };

        if (tipo === "individual" && deviceId) {
            payload.deviceId = deviceId;
        } else if (tipo === "geral" && deviceIds) {
            payload.deviceIds = deviceIds;
        }

        const response = await apiClient.post(
            ENDPOINTS.RELATORIOS.DATA_PREVIEW_SIMPLE,
            payload
        );

        if (response.data && response.data.success) {
            console.log("✅ Preview simplificado gerado com sucesso");
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            console.log("⚠️ Erro ao gerar preview simplificado");
            return {
                success: false,
                message: response.data?.message || "Erro ao gerar preview",
            };
        }
    } catch (error) {
        console.error("❌ Erro ao gerar preview simplificado:", error);
        return {
            success: false,
            message:
                error.response?.data?.message || "Erro interno do servidor",
        };
    }
};

// =============================================================================
// FUNÇÕES UTILITÁRIAS
// =============================================================================

// Função para download automático de PDF
export const downloadPDF = (pdfData, filename) => {
    try {
        if (!pdfData.url) {
            throw new Error("URL do PDF não disponível");
        }

        const link = document.createElement("a");
        link.href = pdfData.url;
        link.download = filename || pdfData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpar URL após download
        setTimeout(() => {
            window.URL.revokeObjectURL(pdfData.url);
        }, 1000);

        console.log(`✅ Download iniciado: ${filename || pdfData.filename}`);
        return true;
    } catch (error) {
        console.error("❌ Erro ao fazer download:", error);
        return false;
    }
};

// Função para abrir PDF em nova aba
export const abrirPDFNovaAba = (pdfData) => {
    try {
        if (!pdfData.url) {
            throw new Error("URL do PDF não disponível");
        }

        window.open(pdfData.url, "_blank");
        console.log("✅ PDF aberto em nova aba");
        return true;
    } catch (error) {
        console.error("❌ Erro ao abrir PDF:", error);
        return false;
    }
};

// Função para validar dispositivos selecionados
export const validarDispositivosSelecionados = (dispositivos, tipo) => {
    const errors = [];

    if (!dispositivos || dispositivos.length === 0) {
        errors.push("Nenhum dispositivo selecionado");
        return { valid: false, errors };
    }

    if (tipo === "individual" && dispositivos.length !== 1) {
        errors.push("Relatório individual requer exatamente 1 dispositivo");
    }

    if (tipo === "geral" && dispositivos.length > 5) {
        errors.push("Relatório geral suporta máximo 5 dispositivos");
    }

    if (tipo === "geral" && dispositivos.length < 2) {
        errors.push("Relatório geral requer pelo menos 2 dispositivos");
    }

    return {
        valid: errors.length === 0,
        errors: errors,
    };
};

// Função para formatar nível de criticidade
export const formatarNivelCriticidade = (nivel) => {
    const niveis = {
        CRITICO: { texto: "Crítico", cor: "#dc3545", emoji: "🚨" },
        ALTO: { texto: "Alto", cor: "#fd7e14", emoji: "⚠️" },
        MEDIO: { texto: "Médio", cor: "#ffc107", emoji: "⚡" },
        BAIXO: { texto: "Baixo", cor: "#20c997", emoji: "✅" },
        NORMAL: { texto: "Normal", cor: "#28a745", emoji: "✅" },
    };

    return niveis[nivel] || niveis["NORMAL"];
};
