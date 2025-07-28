import { useState, useEffect } from "react";
import {
    getDispositivosParaRelatorio,
    gerarRelatorioIndividual,
    gerarRelatorioGeral,
    gerarRelatorioCriticos,
    gerarPDFIndividual,
    gerarPDFGeral,
    gerarPDFCriticos,
    previewRelatorio,
    validarDispositivosSelecionados,
    downloadPDF,
    abrirPDFNovaAba,
} from "../Services/Relatorio";

// Hook personalizado para gerenciar relatórios
export const useRelatorio = () => {
    // =============================================================================
    // ESTADOS PRINCIPAIS
    // =============================================================================

    const [dispositivos, setDispositivos] = useState([]);
    const [dispositivosSelecionados, setDispositivosSelecionados] = useState(
        []
    );
    const [tipoRelatorio, setTipoRelatorio] = useState("individual"); // 'individual', 'geral', 'criticos'

    // Estados de carregamento
    const [loading, setLoading] = useState(false);
    const [loadingDispositivos, setLoadingDispositivos] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Estados de dados
    const [dadosRelatorio, setDadosRelatorio] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [pdfData, setPdfData] = useState(null);

    // Estados de controle
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [dadosProcessados, setDadosProcessados] = useState(false); // Novo estado para controlar se dados foram processados

    // =============================================================================
    // FUNÇÕES PARA CARREGAR DISPOSITIVOS
    // =============================================================================

    const carregarDispositivos = async () => {
        setLoadingDispositivos(true);
        setError(null);

        try {
            console.log("🔄 Carregando lista de dispositivos...");

            const response = await getDispositivosParaRelatorio();

            if (response.success) {
                setDispositivos(response.data.dispositivos || []);
                setLastUpdated(new Date());
                console.log(
                    `✅ ${
                        response.data.dispositivos?.length || 0
                    } dispositivos carregados`
                );
            } else {
                setError(response.message || "Erro ao carregar dispositivos");
            }
        } catch (err) {
            setError("Erro inesperado ao carregar dispositivos");
            console.error("Erro ao carregar dispositivos:", err);
        } finally {
            setLoadingDispositivos(false);
        }
    };

    // =============================================================================
    // FUNÇÕES PARA SELEÇÃO DE DISPOSITIVOS
    // =============================================================================

    const selecionarDispositivo = (dispositivo) => {
        if (tipoRelatorio === "individual") {
            // Para relatório individual, apenas um dispositivo
            setDispositivosSelecionados([dispositivo]);
        } else if (tipoRelatorio === "geral") {
            // Para relatório geral, múltiplos dispositivos (máx 5)
            setDispositivosSelecionados((prev) => {
                const jaExiste = prev.find((d) => d.id === dispositivo.id);

                if (jaExiste) {
                    // Remove se já existe
                    return prev.filter((d) => d.id !== dispositivo.id);
                } else {
                    // Adiciona se não existe e não ultrapassou o limite
                    if (prev.length >= 5) {
                        setError(
                            "Máximo de 5 dispositivos permitidos para relatório geral"
                        );
                        return prev;
                    }
                    return [...prev, dispositivo];
                }
            });
        }
        setError(null);
    };

    const removerDispositivo = (dispositivoId) => {
        setDispositivosSelecionados((prev) =>
            prev.filter((d) => d.id !== dispositivoId)
        );
    };

    const limparSelecao = () => {
        setDispositivosSelecionados([]);
        setError(null);
    };

    // =============================================================================
    // FUNÇÕES PARA MUDANÇA DE TIPO DE RELATÓRIO
    // =============================================================================

    const alterarTipoRelatorio = (novoTipo) => {
        setTipoRelatorio(novoTipo);

        // Ajustar seleção baseada no novo tipo
        if (novoTipo === "individual" && dispositivosSelecionados.length > 1) {
            setDispositivosSelecionados([dispositivosSelecionados[0]]);
        } else if (novoTipo === "criticos") {
            setDispositivosSelecionados([]);
        }

        // Limpar dados anteriores - forçar novo processamento
        setDadosRelatorio(null);
        setPreviewData(null);
        setPdfData(null);
        setError(null);
        setSuccess(null);
        setDadosProcessados(false); // Resetar estado de dados processados

        console.log(
            `🔄 Tipo de relatório alterado para: ${novoTipo}. Dados limpos.`
        );
    };

    // =============================================================================
    // FUNÇÕES PARA GERAÇÃO DE RELATÓRIOS (DADOS)
    // =============================================================================

    const gerarDadosRelatorio = async () => {
        const validacao = validarSelecao();
        if (!validacao.valid) {
            setError(validacao.errors.join(", "));
            return false;
        }

        setLoading(true);
        setError(null);
        setDadosRelatorio(null);

        try {
            let response;

            if (tipoRelatorio === "individual") {
                response = await gerarRelatorioIndividual(
                    dispositivosSelecionados[0].id
                );
            } else if (tipoRelatorio === "geral") {
                const deviceIds = dispositivosSelecionados.map((d) => d.id);
                response = await gerarRelatorioGeral(deviceIds);
            } else if (tipoRelatorio === "criticos") {
                response = await gerarRelatorioCriticos();
            }

            if (response.success) {
                setDadosRelatorio(response.data);
                setDadosProcessados(true); // Marcar que dados foram processados
                setSuccess(
                    `Dados do relatório ${tipoRelatorio} gerados com sucesso`
                );
                setLastUpdated(new Date());
                return true;
            } else {
                setError(
                    response.message || "Erro ao gerar dados do relatório"
                );
                setDadosProcessados(false); // Garantir que estado seja falso em caso de erro
                return false;
            }
        } catch (err) {
            setError("Erro inesperado ao gerar relatório");
            setDadosProcessados(false); // Garantir que estado seja falso em caso de erro
            console.error("Erro ao gerar relatório:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // =============================================================================
    // FUNÇÕES PARA GERAÇÃO DE PDFs
    // =============================================================================

    const gerarPDF = async (abrirEm = "download") => {
        // Verifica se já temos dados processados localmente
        if (!dadosRelatorio) {
            setError(
                "Nenhum dado processado disponível. Execute 'Processar Dados' primeiro."
            );
            return false;
        }

        setLoadingPDF(true);
        setError(null);
        setPdfData(null);

        try {
            let response;

            // Usa os dados já processados para gerar o PDF
            if (tipoRelatorio === "individual") {
                response = await gerarPDFIndividual(
                    dispositivosSelecionados[0].id,
                    dadosRelatorio // Passa os dados já processados
                );
            } else if (tipoRelatorio === "geral") {
                const deviceIds = dispositivosSelecionados.map((d) => d.id);
                response = await gerarPDFGeral(
                    deviceIds,
                    dadosRelatorio // Passa os dados já processados
                );
            } else if (tipoRelatorio === "criticos") {
                response = await gerarPDFCriticos(
                    dadosRelatorio // Passa os dados já processados
                );
            }

            if (response.success) {
                setPdfData(response.data);
                setSuccess(
                    `PDF do relatório ${tipoRelatorio} gerado com sucesso`
                );

                // Ação baseada na preferência do usuário
                if (abrirEm === "download") {
                    downloadPDF(response.data);
                } else if (abrirEm === "nova-aba") {
                    abrirPDFNovaAba(response.data);
                }

                return true;
            } else {
                setError(response.message || "Erro ao gerar PDF");
                return false;
            }
        } catch (err) {
            setError("Erro inesperado ao gerar PDF");
            console.error("Erro ao gerar PDF:", err);
            return false;
        } finally {
            setLoadingPDF(false);
        }
    };

    // =============================================================================
    // FUNÇÕES PARA PREVIEW
    // =============================================================================

    const gerarPreview = async () => {
        // O preview agora usa os dados já processados localmente
        if (!dadosRelatorio) {
            setError(
                "Nenhum dado processado disponível. Execute 'Processar Dados' primeiro."
            );
            return false;
        }

        // Simplesmente confirma que temos dados para mostrar
        setSuccess(`Preview preparado usando dados já processados`);
        return true;
    };

    // =============================================================================
    // FUNÇÕES UTILITÁRIAS
    // =============================================================================

    const validarSelecao = () => {
        if (tipoRelatorio === "criticos") {
            return { valid: true, errors: [] };
        }

        return validarDispositivosSelecionados(
            dispositivosSelecionados,
            tipoRelatorio
        );
    };

    const limparTudo = () => {
        setDispositivosSelecionados([]);
        setDadosRelatorio(null);
        setPreviewData(null);
        setPdfData(null);
        setError(null);
        setSuccess(null);
        setDadosProcessados(false); // Resetar estado de dados processados
        console.log(
            "🗑️ Todos os dados foram limpos. Sistema pronto para novo relatório."
        );
    };

    const downloadPDFAtual = () => {
        if (pdfData) {
            return downloadPDF(pdfData);
        }
        return false;
    };

    const abrirPDFAtualNovaAba = () => {
        if (pdfData) {
            return abrirPDFNovaAba(pdfData);
        }
        return false;
    };

    // =============================================================================
    // EFEITOS
    // =============================================================================

    // Carregar dispositivos na inicialização
    useEffect(() => {
        carregarDispositivos();
    }, []);

    // Limpar mensagens após algum tempo
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // =============================================================================
    // COMPUTED VALUES
    // =============================================================================

    const canGenerate = () => {
        const validacao = validarSelecao();
        return (
            validacao.valid &&
            !loading &&
            !loadingPDF &&
            !loadingPreview &&
            !dadosProcessados
        ); // Não permitir processar se dados já foram processados
    };

    const getStatusSelecao = () => {
        if (tipoRelatorio === "criticos") {
            return {
                texto: "Relatório de dispositivos críticos (automático)",
                valido: true,
            };
        }

        const count = dispositivosSelecionados.length;

        if (tipoRelatorio === "individual") {
            return {
                texto:
                    count === 1
                        ? "1 dispositivo selecionado"
                        : "Selecione 1 dispositivo",
                valido: count === 1,
            };
        }

        if (tipoRelatorio === "geral") {
            return {
                texto: `${count} dispositivos selecionados (máx. 5)`,
                valido: count >= 2 && count <= 5,
            };
        }

        return { texto: "", valido: false };
    };

    // =============================================================================
    // RETORNO DO HOOK
    // =============================================================================

    return {
        // Estados
        dispositivos,
        dispositivosSelecionados,
        tipoRelatorio,
        dadosRelatorio,
        previewData,
        pdfData,

        // Estados de carregamento
        loading,
        loadingDispositivos,
        loadingPDF,
        loadingPreview,

        // Estados de controle
        error,
        success,
        lastUpdated,
        dadosProcessados, // Novo estado exposto

        // Funções principais
        carregarDispositivos,
        selecionarDispositivo,
        removerDispositivo,
        limparSelecao,
        alterarTipoRelatorio,
        gerarDadosRelatorio,
        gerarPDF,
        gerarPreview,

        // Funções utilitárias
        limparTudo,
        downloadPDFAtual,
        abrirPDFAtualNovaAba,
        validarSelecao,
        canGenerate,
        getStatusSelecao,
    };
};
