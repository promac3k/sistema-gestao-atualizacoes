const fs = require("fs").promises;
const path = require("path");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");

const debug = process.env.DEBUG || true; // Forçar debug temporariamente para diagnóstico

//Serviço para geração de PDFs de relatórios SCCM
class PDFGenerator {
    constructor() {
        this.templatePaths = {
            individual: path.join(
                __dirname,
                "../Templates/relatorio-Individual-template.html"
            ),
            geral: path.join(
                __dirname,
                "../Templates/relatorio-geral-template.html"
            ),
            criticos: path.join(
                __dirname,
                "../Templates/relatorio-critico-template.html"
            ),
        };
        this.browser = null;
    }

    //Inicializa o browser do Puppeteer (reutilizável)
    async initBrowser() {
        if (!this.browser) {
            if (debug)
                console.log("🚀 Inicializando browser para geração de PDF...");

            this.browser = await puppeteer.launch({
                headless: "new",
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            });
        }
        return this.browser;
    }

    //Fecha o browser
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            if (debug) console.log("🔒 Browser fechado");
        }
    }

    //Carrega e compila o template HTML
    async loadTemplate(templateType = "individual") {
        try {
            if (debug)
                console.log(`📄 Carregando template HTML: ${templateType}...`);

            const templatePath = this.templatePaths[templateType];
            if (!templatePath) {
                throw new Error(`Template não encontrado: ${templateType}`);
            }

            let templateContent;
            try {
                templateContent = await fs.readFile(templatePath, "utf8");
            } catch (error) {
                // Se o template específico não existe, usar template padrão
                if (debug)
                    console.log(
                        `⚠️ Template ${templateType} não encontrado, usando template padrão`
                    );
                templateContent = await this.getDefaultTemplate(templateType);
            }

            return handlebars.compile(templateContent);
        } catch (error) {
            console.error("❌ Erro ao carregar template:", error);
            throw new Error("Falha ao carregar template HTML");
        }
    }

    //Gera template padrão se não existir
    async getDefaultTemplate(templateType) {
        const templates = {
            individual: this.getIndividualTemplate(),
            geral: this.getGeralTemplate(),
            criticos: this.getCriticosTemplate(),
        };

        return templates[templateType] || templates.individual;
    }

    //Formata os dados para o template
    formatDataForTemplate(relatorioData, tipoRelatorio = null) {
        const tipo = tipoRelatorio || relatorioData.tipo || "individual";

        if (debug) {
            console.log(`🔄 Formatando dados para template tipo: ${tipo}`);
        }

        try {
            if (tipo === "individual") {
                return this.formatIndividualData(relatorioData);
            } else if (tipo === "geral") {
                return this.formatGeralData(relatorioData);
            } else if (tipo === "criticos") {
                return this.formatCriticosData(relatorioData);
            }

            return this.formatIndividualData(relatorioData);
        } catch (error) {
            console.error(
                `❌ Erro ao formatar dados para template ${tipo}:`,
                error
            );
            throw error;
        }
    }

    //Formata dados para relatório individual
    formatIndividualData(relatorioData) {
        const { dispositivo } = relatorioData;

        if (!dispositivo) {
            throw new Error("Dados do dispositivo não fornecidos");
        }

        const dataGeracao = new Date().toLocaleString("pt-PT");
        const { informacoesBasicas, analises, criticidade, dadosDetalhados } =
            dispositivo;

        // Processar problemas identificados - incluir detalhes específicos de software
        const problemasBase = criticidade.problemasIdentificados;
        const softwareDesatualizadoCount =
            dadosDetalhados.softwareComAtualizacoes.filter(
                (s) => s.status === "outdated"
            ).length;

        // Substituir problema genérico de software por detalhes específicos
        const problemasDetalhados = [];

        problemasBase.forEach((problema, index) => {
            if (problema.includes("software(s) com atualizações disponíveis")) {
                // Adicionar problema para cada software desatualizado
                dadosDetalhados.softwareComAtualizacoes
                    .filter((s) => s.status === "outdated")
                    .forEach((software, softwareIndex) => {
                        problemasDetalhados.push({
                            id: problemasDetalhados.length + 1,
                            descricao: `${
                                software.software?.nome || "Software"
                            } precisa de atualização (versão atual: ${
                                software.software?.versao || "N/A"
                            })`,
                            criticidade:
                                this.determinarCriticidadeProblema(problema),
                            recomendacao: `Atualizar ${
                                software.software?.nome || "software"
                            } para a versão mais recente`,
                        });
                    });
            } else {
                problemasDetalhados.push({
                    id: problemasDetalhados.length + 1,
                    descricao: problema,
                    criticidade: this.determinarCriticidadeProblema(problema),
                    recomendacao: this.gerarRecomendacaoProblema(problema),
                });
            }
        });

        const problemas = problemasDetalhados;

        // Processar atualizações problemáticas
        const atualizacoes = dadosDetalhados.updatesProblematicos.map(
            (update) => ({
                titulo: update.titulo || "Atualização sem título",
                artigo: update.artigo,
                severidade: update.severidadeDescricao,
                status: update.statusDescricao,
                criticidade: this.mapearSeveridadeParaCriticidade(
                    update.severidade
                ),
            })
        );

        // Processar software crítico - incluir TODOS os softwares que precisam de atualização
        const softwareComAtualizacoesDisponiveis =
            dadosDetalhados.softwareComAtualizacoes.filter(
                (s) => s.status === "outdated"
            );

        // Combinar software crítico com software que precisa de atualização
        const todosSoftwareRelevante = [
            ...dadosDetalhados.softwareCritico,
            ...softwareComAtualizacoesDisponiveis
                .map((s) => s.software)
                .filter(Boolean),
        ];

        // Remover duplicatas baseado no nome
        const softwareUnico = todosSoftwareRelevante.reduce((acc, software) => {
            const existe = acc.find((s) => s.nome === software.nome);
            if (!existe) {
                acc.push(software);
            }
            return acc;
        }, []);

        const softwareCritico = softwareUnico.map((software) => ({
            nome: software.nome,
            versao: software.versao,
            fabricante: software.fabricante,
            precisaAtualizacao: dadosDetalhados.softwareComAtualizacoes.some(
                (s) =>
                    s.software &&
                    s.software.nome === software.nome &&
                    s.status === "outdated"
            ),
        }));

        return {
            // Metadata
            tipoRelatorio: "RELATÓRIO INDIVIDUAL",
            dataGeracao,
            nomeDispositivo: informacoesBasicas.nome,

            // Informações básicas
            dispositivo: {
                nome: informacoesBasicas.nome,
                utilizador: informacoesBasicas.utilizador || "N/A",
                nomeCompleto:
                    informacoesBasicas.nomeCompletoUtilizador || "N/A",
                dominio: informacoesBasicas.dominio || "N/A",
                tipo: informacoesBasicas.tipoDispositivo || "N/A",
            },

            // Status geral
            statusGeral: this.determinarStatusGeral(criticidade.nivel),
            nivelCriticidade: criticidade.nivel,
            scoreCriticidade: criticidade.score,
            corCriticidade: this.getCriticidadeCor(criticidade.nivel),

            // Análises
            sistemaOperacional: {
                nome: analises.sistemaOperacional.sistemaOperacional,
                status: analises.sistemaOperacional.statusSO,
                isCritico: analises.sistemaOperacional.isCritico,
                recomendacao: analises.sistemaOperacional.recomendacao,
            },

            conectividade: {
                status: analises.conectividade.statusConexao,
                isProblematico: analises.conectividade.isProblematico,
                recomendacao: analises.conectividade.recomendacao,
            },

            // Estatísticas - Corrigir contagens
            totalProblemas: problemas.length,
            totalAtualizacoes: dadosDetalhados.updatesProblematicos.length,
            totalSoftware: dadosDetalhados.todosSoftwares.length,
            softwareComAtualizacoes:
                dadosDetalhados.softwareComAtualizacoes.filter(
                    (s) => s.status === "outdated"
                ).length,

            // Dados processados
            problemas,
            atualizacoes,
            softwareCritico,

            // Espaço em disco
            espacoDisco: {
                temProblemas: analises.espacoDisco.temProblemas,
                discosProblematicos: analises.espacoDisco.discosProblematicos,
                detalhes: dadosDetalhados.discosProblematicos,
            },

            // Recomendações
            recomendacoes: this.gerarRecomendacoes(analises, criticidade),

            // Configurações
            incluirGraficos: true,
            timestamp: relatorioData.geradoEm,
        };
    }

    //Agrupa problemas por nível de criticidade
    agruparProblemasPorCriticidade(problemas) {
        const grupos = {
            critico: [],
            alto: [],
            medio: [],
            baixo: [],
        };

        problemas.forEach((problema) => {
            const criticidade = problema.criticidade || "medio";
            if (grupos[criticidade]) {
                grupos[criticidade].push(problema);
            }
        });

        return Object.entries(grupos)
            .filter(([_, problemas]) => problemas.length > 0)
            .map(([criticidade, problemas]) => ({
                criticidade,
                titulo: this.getCriticidadeTitulo(criticidade),
                quantidade: problemas.length,
                descricao: this.getCriticidadeDescricao(criticidade),
                dispositivos: problemas
                    .map((p) => p.dispositivo || p.nome)
                    .filter(Boolean),
            }));
    }

    //Gera o PDF a partir dos dados do relatório
    async generatePDF(relatorioData, options = {}) {
        try {
            if (debug) console.log("📊 Iniciando geração de PDF...");

            const tipoRelatorio = relatorioData.tipo || "individual";

            if (debug) {
                console.log(`📋 Tipo de relatório: ${tipoRelatorio}`);
                console.log(
                    "📄 Estrutura dos dados recebidos:",
                    JSON.stringify(Object.keys(relatorioData), null, 2)
                );
            }

            // Carregar template apropriado
            const template = await this.loadTemplate(tipoRelatorio);

            // Formatar dados
            const templateData = this.formatDataForTemplate(
                relatorioData,
                tipoRelatorio
            );

            if (debug) {
                console.log("✅ Dados formatados com sucesso para o template");
            }

            // Gerar HTML
            const html = template(templateData);

            // Inicializar browser
            const browser = await this.initBrowser();
            const page = await browser.newPage();

            // Configurar página
            await page.setContent(html, {
                waitUntil: "networkidle0",
                timeout: 30000,
            });

            // Opções padrão do PDF
            const pdfOptions = {
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20mm",
                    right: "15mm",
                    bottom: "20mm",
                    left: "15mm",
                },
                displayHeaderFooter: true,
                headerTemplate: "<div></div>",
                footerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
                    </div>
                `,
                ...options,
            };

            // Gerar PDF
            if (debug) console.log("🖨️ Gerando PDF...");
            const pdfBuffer = await page.pdf(pdfOptions);

            await page.close();

            if (debug) console.log("✅ PDF gerado com sucesso");
            return pdfBuffer;
        } catch (error) {
            console.error("❌ Erro ao gerar PDF:", error);
            console.error("📊 Contexto do erro:", {
                tipoRelatorio: relatorioData?.tipo || "undefined",
                temRelatorioData: !!relatorioData,
                estruturaRelatorioData: relatorioData
                    ? Object.keys(relatorioData)
                    : "N/A",
            });

            // Fechar o browser se foi inicializado
            if (this.browser) {
                try {
                    await this.closeBrowser();
                } catch (browserError) {
                    console.error("❌ Erro ao fechar browser:", browserError);
                }
            }

            throw new Error(`Falha na geração do PDF: ${error.message}`);
        }
    }

    //Gera PDF e salva em arquivo
    async generatePDFFile(relatorioData, outputPath, options = {}) {
        try {
            const pdfBuffer = await this.generatePDF(relatorioData, options);
            await fs.writeFile(outputPath, pdfBuffer);

            if (debug) console.log(`💾 PDF salvo em: ${outputPath}`);
            return outputPath;
        } catch (error) {
            console.error("❌ Erro ao salvar PDF:", error);
            throw error;
        }
    }

    // MÉTODOS AUXILIARES DE FORMATAÇÃO

    getTipoRelatorioTexto(tipo) {
        const tipos = {
            individual: "DISPOSITIVO INDIVIDUAL",
            geral: "RELATÓRIO GERAL",
            criticos: "DISPOSITIVOS CRÍTICOS",
        };
        return tipos[tipo] || "RELATÓRIO PERSONALIZADO";
    }

    formatPeriodo(periodo) {
        if (periodo.inicio && periodo.fim) {
            const inicio = new Date(periodo.inicio).toLocaleDateString("pt-BR");
            const fim = new Date(periodo.fim).toLocaleDateString("pt-BR");
            return `${inicio} - ${fim}`;
        }
        if (periodo.dias) {
            return `Últimos ${periodo.dias} dias`;
        }
        return "Período não especificado";
    }

    getStatusTexto(status) {
        const statusMap = {
            online: "Online",
            offline: "Offline",
            critico: "Crítico",
            desconhecido: "Desconhecido",
        };
        return statusMap[status] || status;
    }

    getCriticidadeTexto(criticidade) {
        const criticidadeMap = {
            critico: "Crítica",
            alto: "Alta",
            medio: "Média",
            baixo: "Baixa",
        };
        return criticidadeMap[criticidade] || criticidade;
    }

    getCriticidadeTitulo(criticidade) {
        const titulos = {
            critico: "Problemas Críticos",
            alto: "Problemas de Alta Prioridade",
            medio: "Problemas de Média Prioridade",
            baixo: "Problemas de Baixa Prioridade",
        };
        return titulos[criticidade] || "Outros Problemas";
    }

    getCriticidadeDescricao(criticidade) {
        const descricoes = {
            critico:
                "Requerem ação imediata para evitar impactos significativos.",
            alto: "Devem ser resolvidos prioritariamente.",
            medio: "Recomenda-se resolução em prazo moderado.",
            baixo: "Podem ser resolvidos quando possível.",
        };
        return descricoes[criticidade] || "";
    }

    getPrazoTexto(prazo) {
        const prazos = {
            imediato: "Imediato (hoje)",
            semana: "Esta semana",
            mes: "Este mês",
            trimestre: "Este trimestre",
        };
        return prazos[prazo] || prazo;
    }

    //Formata dados para relatório geral
    formatGeralData(relatorioData) {
        const { dispositivos, estatisticasGerais, resumoGeral } = relatorioData;
        const dataGeracao = new Date().toLocaleString("pt-PT");

        // Debug: Verificar dados recebidos
        if (debug) {
            console.log("🔍 Debug formatGeralData:");
            console.log(
                "  - Dispositivos válidos:",
                dispositivos?.filter((d) => !d.erro)?.length || 0
            );
            console.log("  - EstatisticasGerais:", estatisticasGerais);
            console.log("  - ResumoGeral:", resumoGeral);
        }

        // Filtrar apenas dispositivos válidos (sem erro)
        const dispositivosValidos = dispositivos.filter((d) => !d.erro);

        const dispositivosFormatados = dispositivosValidos.map((item) => {
            const dispositivo = item.dispositivo; // Acessar o objeto dispositivo dentro do item
            return {
                nome: dispositivo.informacoesBasicas?.nome || "N/A",
                utilizador: dispositivo.informacoesBasicas?.utilizador || "N/A",
                criticidade: dispositivo.criticidade?.nivel || "NORMAL",
                score: dispositivo.criticidade?.score || 0,
                problemas:
                    dispositivo.criticidade?.problemasIdentificados?.join(
                        ", "
                    ) || "Nenhum problema identificado",
                cor: this.getCriticidadeCor(
                    dispositivo.criticidade?.nivel || "NORMAL"
                ),
            };
        });

        // Calcular contagens corretas localmente
        let totalSoftwareDesatualizadoDispositivos = 0;
        let totalSODesatualizadoDispositivos = 0;
        let totalEspacoCriticoDispositivos = 0;

        dispositivosValidos.forEach((item) => {
            const dispositivo = item.dispositivo;

            // Contar dispositivos com software desatualizado
            const softwareDesatualizado =
                dispositivo.dadosDetalhados?.softwareComAtualizacoes?.filter(
                    (s) => s.status === "outdated"
                ) || [];
            if (softwareDesatualizado.length > 0) {
                totalSoftwareDesatualizadoDispositivos++;
                if (debug) {
                    console.log(
                        `📱 Dispositivo ${dispositivo.informacoesBasicas?.nome} tem ${softwareDesatualizado.length} software(s) desatualizado(s):`
                    );
                    softwareDesatualizado.forEach((soft, index) => {
                        console.log(
                            `   ${index + 1}. ${
                                soft.software?.nome || "Nome N/A"
                            } - Status: ${soft.status}`
                        );
                    });
                }
            }

            // Contar dispositivos com SO desatualizado
            if (dispositivo.analises?.sistemaOperacional?.isCritico) {
                totalSODesatualizadoDispositivos++;
            }

            // Contar dispositivos com espaço crítico
            if (dispositivo.analises?.espacoDisco?.temProblemas) {
                totalEspacoCriticoDispositivos++;
            }
        });

        // Mapear estatísticas para o formato esperado pelo template
        const estatisticasFormatadas = {
            total: resumoGeral?.totalDispositivos || dispositivosValidos.length,
            online:
                (resumoGeral?.totalDispositivos || dispositivosValidos.length) -
                (estatisticasGerais?.dispositivosOffline || 0),
            criticos: dispositivosValidos.filter(
                (item) => item.dispositivo?.criticidade?.nivel === "CRÍTICO"
            ).length,
            comUpdatesProblematicos:
                estatisticasGerais?.dispositivosComUpdatesProblematicos || 0,
            comSoftwareDesatualizado: totalSoftwareDesatualizadoDispositivos,
            comSODesatualizado: totalSODesatualizadoDispositivos,
            comEspacoCritico: totalEspacoCriticoDispositivos,
        };

        // Debug: Verificar estatísticas formatadas
        if (debug) {
            console.log("📊 Estatísticas formatadas:", estatisticasFormatadas);
        }

        // Calcular análise geral do ambiente
        const tiposDispositivos = {
            workstations: 0,
            servidores: 0,
            outros: 0,
        };

        let totalUpdatesCriticos = 0;
        let totalUpdatesImportantes = 0;
        let totalSoftwareDesatualizadoCount = 0; // Total de softwares desatualizados (não dispositivos)
        let errosVerificacao = 0;

        dispositivosValidos.forEach((item) => {
            const dispositivo = item.dispositivo;
            const tipo = dispositivo.informacoesBasicas?.tipoDispositivo;

            if (tipo === "Workstation") {
                tiposDispositivos.workstations++;
            } else if (tipo === "Servidor") {
                tiposDispositivos.servidores++;
            } else {
                tiposDispositivos.outros++;
            }

            // Somar estatísticas detalhadas
            if (dispositivo.analises?.atualizacoes) {
                totalUpdatesCriticos +=
                    dispositivo.analises.atualizacoes.detalhePorSeveridade
                        ?.criticos || 0;
                totalUpdatesImportantes +=
                    dispositivo.analises.atualizacoes.detalhePorSeveridade
                        ?.importantes || 0;
            }

            // Contar total de softwares desatualizados (não dispositivos)
            if (dispositivo.dadosDetalhados?.softwareComAtualizacoes) {
                const softwareDesatualizadoCount =
                    dispositivo.dadosDetalhados.softwareComAtualizacoes.filter(
                        (s) => s.status === "outdated"
                    ).length;
                totalSoftwareDesatualizadoCount += softwareDesatualizadoCount;

                if (debug && softwareDesatualizadoCount > 0) {
                    console.log(
                        `📊 Dispositivo ${dispositivo.informacoesBasicas?.nome}: ${softwareDesatualizadoCount} softwares desatualizados. Total acumulado: ${totalSoftwareDesatualizadoCount}`
                    );
                }
            }

            if (dispositivo.analises?.software) {
                errosVerificacao +=
                    dispositivo.analises.software.errosVerificacao || 0;
            }
        });

        const analiseGeral = {
            totalDispositivos: dispositivosValidos.length,
            tiposDispositivos: tiposDispositivos,
            totalUpdatesProblematicos:
                estatisticasGerais?.totalUpdatesProblematicos || 0,
            updatesCriticos: totalUpdatesCriticos,
            updatesImportantes: totalUpdatesImportantes,
            dispositivosComUpdates:
                estatisticasGerais?.dispositivosComUpdatesProblematicos || 0,
            totalSoftwareVerificado:
                estatisticasGerais?.totalSoftwareVerificado || 0,
            totalSoftwareDesatualizado: totalSoftwareDesatualizadoCount,
            dispositivosComSoftwareDesatualizado:
                totalSoftwareDesatualizadoDispositivos,
            errosVerificacao: errosVerificacao,
            taxaConformidadeSoftware:
                estatisticasGerais?.totalSoftwareVerificado > 0
                    ? Math.round(
                          ((estatisticasGerais.totalSoftwareVerificado -
                              totalSoftwareDesatualizadoCount) /
                              estatisticasGerais.totalSoftwareVerificado) *
                              100
                      )
                    : 100,
            dispositivosOffline: estatisticasGerais?.dispositivosOffline || 0,
            dispositivosSODesatualizado: totalSODesatualizadoDispositivos,
            dispositivosEspacoCritico: totalEspacoCriticoDispositivos,
            scoreMedio: resumoGeral?.scoreMedioCriticidade || 0,
        };

        // Consolidar updates detalhados de todos os dispositivos
        const updatesDetalhados = [];
        dispositivosValidos.forEach((item) => {
            const dispositivo = item.dispositivo;
            const updates =
                dispositivo.dadosDetalhados?.updatesProblematicos || [];

            updates.slice(0, 5).forEach((update) => {
                // Limitar a 5 por dispositivo
                updatesDetalhados.push({
                    dispositivo: dispositivo.informacoesBasicas?.nome || "N/A",
                    titulo: update.titulo || "Atualização sem título",
                    artigo: update.artigo || "N/A",
                    severidade: this.mapearSeveridadeParaTexto(
                        update.severidade
                    ),
                    status: this.mapearStatusParaTexto(update.status),
                    isCritico: update.severidade === 4,
                    isImportante: update.severidade === 3,
                });
            });
        });

        // Consolidar software problemático
        const softwareProblematico = [];
        dispositivosValidos.forEach((item) => {
            const dispositivo = item.dispositivo;
            const softwares =
                dispositivo.dadosDetalhados?.softwareComAtualizacoes || [];

            softwares
                .filter((s) => s.status === "outdated")
                .slice(0, 3)
                .forEach((software) => {
                    if (software.software) {
                        softwareProblematico.push({
                            dispositivo:
                                dispositivo.informacoesBasicas?.nome || "N/A",
                            nome: software.software.nome || "N/A",
                            versaoAtual: software.software.versao || "N/A",
                            versaoMaisRecente:
                                software.latestVersion || "Disponível",
                            status: "Desatualizado",
                            isDesatualizado: true,
                        });
                    }
                });
        });

        // Consolidar problemas de espaço
        const problemasEspaco = [];
        dispositivosValidos.forEach((item) => {
            const dispositivo = item.dispositivo;
            const discos =
                dispositivo.dadosDetalhados?.discosProblematicos || [];

            discos.forEach((disco) => {
                problemasEspaco.push({
                    dispositivo: dispositivo.informacoesBasicas?.nome || "N/A",
                    drive: disco.letra || "N/A",
                    tamanhoTotal: disco.tamanhoTotalGB || 0,
                    espacoLivre: disco.espacoLivreGB || 0,
                    percentualUsado: disco.percentualUsado || 0,
                    isCritico: (disco.percentualUsado || 0) >= 90,
                });
            });
        });

        // Gerar recomendações prioritárias
        const recomendacoes = [];

        if (estatisticasGerais?.dispositivosOffline > 0) {
            recomendacoes.push({
                prioridade: "CRÍTICA",
                titulo: "Verificar Dispositivos Offline",
                dispositivosAfetados: estatisticasGerais.dispositivosOffline,
                descricao:
                    "Existem dispositivos sem conectividade que precisam de verificação",
                prazo: "Imediato",
                cor: this.getCriticidadeCor("CRÍTICO"),
            });
        }

        if (totalSODesatualizadoDispositivos > 0) {
            recomendacoes.push({
                prioridade: "ALTA",
                titulo: "Atualizar Sistemas Operacionais",
                dispositivosAfetados: totalSODesatualizadoDispositivos,
                descricao:
                    "Dispositivos com sistemas operacionais desatualizados representam risco de segurança",
                prazo: "1 semana",
                cor: this.getCriticidadeCor("ALTO"),
            });
        }

        if (totalUpdatesCriticos > 0) {
            recomendacoes.push({
                prioridade: "ALTA",
                titulo: "Instalar Updates Críticos",
                dispositivosAfetados: `${totalUpdatesCriticos} updates`,
                descricao:
                    "Atualizações críticas pendentes precisam ser instaladas",
                prazo: "3 dias",
                cor: this.getCriticidadeCor("ALTO"),
            });
        }

        if (totalSoftwareDesatualizadoCount > 0) {
            recomendacoes.push({
                prioridade: "MÉDIA",
                titulo: "Atualizar Software",
                dispositivosAfetados: `${totalSoftwareDesatualizadoDispositivos} dispositivos (${totalSoftwareDesatualizadoCount} softwares)`,
                descricao: "Software desatualizado pode ter vulnerabilidades",
                prazo: "2 semanas",
                cor: this.getCriticidadeCor("MÉDIO"),
            });
        }

        // Debug: Verificar contagens finais
        if (debug) {
            console.log("🔍 Contagens finais:");
            console.log(
                `  - Dispositivos com software desatualizado: ${totalSoftwareDesatualizadoDispositivos}`
            );
            console.log(
                `  - Total de softwares desatualizados: ${totalSoftwareDesatualizadoCount}`
            );
            console.log(
                `  - Dispositivos com SO desatualizado: ${totalSODesatualizadoDispositivos}`
            );
            console.log(
                `  - Dispositivos com espaço crítico: ${totalEspacoCriticoDispositivos}`
            );
            console.log(`  - Estatísticas do backend:`, estatisticasGerais);
        }

        return {
            tipoRelatorio: "RELATÓRIO GERAL",
            dataGeracao,
            totalDispositivos: dispositivosValidos.length,
            dispositivos: dispositivosFormatados,
            estatisticas: estatisticasFormatadas,
            analiseGeral: analiseGeral,
            updatesDetalhados: updatesDetalhados.slice(0, 20), // Limitar a 20 total
            softwareProblematico: softwareProblematico.slice(0, 15), // Limitar a 15 total
            problemasEspaco: problemasEspaco,
            recomendacoes: recomendacoes,
            timestamp: relatorioData.geradoEm,
            versaoSistema: "SCCM v2.0.1",
        };
    }

    //Formata dados para relatório de críticos
    formatCriticosData(relatorioData) {
        if (debug) {
            console.log("🔄 Formatando dados para relatório de críticos...");
            console.log(
                "📊 Estrutura dos dados recebidos:",
                Object.keys(relatorioData)
            );
        }

        // Verificar se os dados existem na estrutura correta
        const dispositivosCriticos =
            relatorioData.top10DispositivosCriticos ||
            relatorioData.dispositivosCriticos ||
            [];
        const dataGeracao = new Date().toLocaleString("pt-PT");

        if (debug) {
            console.log(
                `📋 Encontrados ${
                    Array.isArray(dispositivosCriticos)
                        ? dispositivosCriticos.length
                        : 0
                } dispositivos críticos`
            );
            console.log("📊 Dados dos dispositivos críticos:", {
                temTop10: !!relatorioData.top10DispositivosCriticos,
                temDispositivosCriticos: !!relatorioData.dispositivosCriticos,
                arrayValido: Array.isArray(dispositivosCriticos),
                tamanho: dispositivosCriticos.length,
            });
        }

        if (!Array.isArray(dispositivosCriticos)) {
            console.error(
                "❌ Dados de dispositivos críticos não são um array:",
                dispositivosCriticos
            );
            throw new Error(
                "Dados de dispositivos críticos inválidos - esperado array, recebido: " +
                    typeof dispositivosCriticos
            );
        }

        if (dispositivosCriticos.length === 0) {
            console.warn(
                "⚠️ Nenhum dispositivo crítico encontrado para relatório"
            );
            // Retornar estrutura válida mesmo sem dispositivos
            return {
                tipoRelatorio: "DISPOSITIVOS CRÍTICOS",
                dataGeracao,
                totalCriticos: 0,
                dispositivos: [],
                timestamp: relatorioData.geradoEm || new Date().toISOString(),
                resumoExecutivo: relatorioData.resumoExecutivo || {},
                estatisticasGerais: relatorioData.estatisticasGerais || {},
                distribuicaoPorNivel: relatorioData.distribuicaoPorNivel || {},
            };
        }

        const criticosFormatados = dispositivosCriticos
            .map((item, index) => {
                try {
                    if (debug) {
                        console.log(`🔍 Processando item ${index}:`, {
                            temDispositivo: !!item.dispositivo,
                            chaves: Object.keys(item),
                            estruturaDispositivo: item.dispositivo
                                ? Object.keys(item.dispositivo)
                                : "N/A",
                        });
                    }

                    // A estrutura vem como { dispositivo: { informacoesBasicas, criticidade, ... } }
                    const dispositivoData = item.dispositivo || item;

                    if (!dispositivoData) {
                        console.error(
                            `❌ Dispositivo não encontrado no item ${index}:`,
                            item
                        );
                        return null;
                    }

                    // Extrair informações da estrutura correta
                    let nome, score, problemas, criticidade;

                    if (
                        dispositivoData.informacoesBasicas &&
                        dispositivoData.criticidade
                    ) {
                        // Estrutura completa com informacoesBasicas e criticidade
                        nome = dispositivoData.informacoesBasicas.nome;
                        score = dispositivoData.criticidade.score || 0;
                        criticidade =
                            dispositivoData.criticidade.nivel || "BAIXO";
                        problemas =
                            dispositivoData.criticidade
                                .problemasIdentificados || [];

                        if (debug) {
                            console.log(
                                `✅ Dispositivo ${index} estruturado: ${nome}, score: ${score}, nível: ${criticidade}`
                            );
                        }
                    } else if (dispositivoData.nome) {
                        // Estrutura simples direta
                        nome = dispositivoData.nome;
                        score = dispositivoData.score || 0;
                        criticidade =
                            dispositivoData.nivelCriticidade ||
                            dispositivoData.criticidade ||
                            "BAIXO";
                        problemas =
                            dispositivoData.problemasIdentificados || [];

                        if (debug) {
                            console.log(
                                `✅ Dispositivo ${index} simples: ${nome}, score: ${score}, nível: ${criticidade}`
                            );
                        }
                    } else {
                        console.error(
                            `❌ Estrutura de dispositivo desconhecida no item ${index}:`,
                            dispositivoData
                        );
                        return null;
                    }

                    return {
                        nome: nome || "Dispositivo sem nome",
                        score: score,
                        problemas: Array.isArray(problemas)
                            ? problemas.join(", ")
                            : problemas || "Nenhum problema identificado",
                        criticidade: criticidade,
                        cor: this.getCriticidadeCor(criticidade),
                    };
                } catch (error) {
                    console.error(
                        `❌ Erro ao processar dispositivo ${index}:`,
                        error
                    );
                    return null;
                }
            })
            .filter((item) => item !== null); // Remove itens nulos

        if (debug) {
            console.log(
                `✅ Formatação concluída: ${criticosFormatados.length} dispositivos processados`
            );
        }

        const resultado = {
            tipoRelatorio: "DISPOSITIVOS CRÍTICOS",
            dataGeracao,
            totalCriticos: criticosFormatados.length,
            dispositivos: criticosFormatados,
            timestamp: relatorioData.geradoEm || new Date().toISOString(),

            // Dados do resumo executivo
            resumoExecutivo: relatorioData.resumoExecutivo || {},
            estatisticasGerais: relatorioData.estatisticasGerais || {},
            distribuicaoPorNivel: relatorioData.distribuicaoPorNivel || {},

            // Variáveis adicionais para o template melhorado
            periodoAnalise: this.gerarPeriodoAnalise(),
            totalDispositivos:
                relatorioData.estatisticasGerais?.totalAnalisados ||
                relatorioData.resumoExecutivo?.totalDispositivosAnalisados ||
                criticosFormatados.length,
            scoreMediaCriticidade:
                relatorioData.resumoExecutivo?.pontuacaoMediaCriticidade ||
                this.calcularScoreMedia(criticosFormatados),
            dispositivosOffline:
                relatorioData.estatisticasGerais?.dispositivosOffline ||
                this.contarDispositivosOffline(criticosFormatados),
            atualizacoesPendentes:
                relatorioData.estatisticasGerais
                    ?.dispositivosComUpdatesProblematicos ||
                this.contarAtualizacoesPendentes(criticosFormatados),
            sistemaDesatualizados:
                relatorioData.estatisticasGerais
                    ?.dispositivosComSODesatualizado ||
                this.contarSistemasDesatualizados(criticosFormatados),
            nivelCritico:
                relatorioData.distribuicaoPorNivel?.critico ||
                this.contarPorNivel(criticosFormatados, "CRÍTICO"),
            nivelAlto:
                relatorioData.distribuicaoPorNivel?.alto ||
                this.contarPorNivel(criticosFormatados, "ALTO"),
            nivelMedio:
                relatorioData.distribuicaoPorNivel?.medio ||
                this.contarPorNivel(criticosFormatados, "MÉDIO"),
            tempoMedioOffline: this.calcularTempoMedioOffline(),
            turnoResponsavel: this.obterTurnoAtual(),
        };

        if (debug) {
            console.log("📋 Resultado final do formatCriticosData:", {
                totalCriticos: resultado.totalCriticos,
                temDispositivos: resultado.dispositivos.length > 0,
                temResumo: !!resultado.resumoExecutivo,
                temEstatisticas: !!resultado.estatisticasGerais,
            });
        }

        return resultado;
    }

    //Determina criticidade de um problema específico
    determinarCriticidadeProblema(problema) {
        const problemaLower = problema.toLowerCase();

        if (
            problemaLower.includes("offline") ||
            problemaLower.includes("desatualizado")
        ) {
            return "CRÍTICO";
        } else if (problemaLower.includes("críticas pendentes")) {
            return "ALTO";
        } else if (problemaLower.includes("importantes pendentes")) {
            return "MÉDIO";
        } else {
            return "BAIXO";
        }
    }

    //Gera recomendação para um problema
    gerarRecomendacaoProblema(problema) {
        const problemaLower = problema.toLowerCase();

        if (problemaLower.includes("offline")) {
            return "Verificar conectividade de rede e status do dispositivo";
        } else if (
            problemaLower.includes("sistema operacional desatualizado")
        ) {
            return "Atualizar sistema operacional para versão suportada";
        } else if (problemaLower.includes("críticas pendentes")) {
            return "Instalar atualizações críticas imediatamente";
        } else if (problemaLower.includes("importantes pendentes")) {
            return "Programar instalação das atualizações importantes";
        } else if (
            problemaLower.includes("software") &&
            problemaLower.includes("atualizações")
        ) {
            return "Atualizar softwares para versões mais recentes";
        } else if (problemaLower.includes("espaço crítico")) {
            return "Liberar espaço em disco ou expandir armazenamento";
        }

        return "Analisar problema e tomar ação apropriada";
    }

    //Mapeia severidade numérica para texto
    mapearSeveridadeParaTexto(severidade) {
        switch (severidade) {
            case 4:
                return "Crítica";
            case 3:
                return "Importante";
            case 2:
                return "Moderada";
            case 1:
                return "Baixa";
            default:
                return "Desconhecida";
        }
    }

    //Mapeia status numérico para texto
    mapearStatusParaTexto(status) {
        switch (status) {
            case 0:
                return "Desconhecido";
            case 1:
                return "Não Aplicável";
            case 2:
                return "Não Instalado";
            case 3:
                return "Instalado";
            case 4:
                return "Falha";
            case 5:
                return "Requer Reinicialização";
            default:
                return "Outro";
        }
    }

    //Mapeia severidade numérica para texto de criticidade
    mapearSeveridadeParaCriticidade(severidade) {
        switch (severidade) {
            case 4:
                return "CRÍTICO";
            case 3:
                return "ALTO";
            case 2:
                return "MÉDIO";
            case 1:
                return "BAIXO";
            default:
                return "DESCONHECIDO";
        }
    }

    //Determina status geral baseado no nível de criticidade
    determinarStatusGeral(nivel) {
        switch (nivel) {
            case "CRÍTICO":
                return "REQUER AÇÃO IMEDIATA";
            case "ALTO":
                return "REQUER ATENÇÃO PRIORITÁRIA";
            case "MÉDIO":
                return "REQUER MONITORAMENTO";
            case "BAIXO":
                return "FUNCIONAMENTO ADEQUADO";
            case "NORMAL":
                return "FUNCIONAMENTO NORMAL";
            default:
                return "EM ANÁLISE";
        }
    }

    //Obtém cor baseada no nível de criticidade
    getCriticidadeCor(nivel) {
        switch (nivel) {
            case "CRÍTICO":
                return "#dc3545"; // Vermelho
            case "ALTO":
                return "#fd7e14"; // Laranja
            case "MÉDIO":
                return "#ffc107"; // Amarelo
            case "BAIXO":
                return "#20c997"; // Verde claro
            case "NORMAL":
                return "#28a745"; // Verde
            default:
                return "#6c757d"; // Cinza
        }
    }

    //Gera recomendações baseadas nas análises
    gerarRecomendacoes(analises, criticidade) {
        const recomendacoes = [];

        if (analises.sistemaOperacional.isCritico) {
            recomendacoes.push({
                prioridade: 1,
                titulo: "Atualizar Sistema Operacional",
                descricao: analises.sistemaOperacional.recomendacao,
                prazo: "IMEDIATO",
            });
        }

        if (analises.conectividade.isProblematico) {
            recomendacoes.push({
                prioridade: 2,
                titulo: "Resolver Problemas de Conectividade",
                descricao: analises.conectividade.recomendacao,
                prazo: "IMEDIATO",
            });
        }

        if (analises.atualizacoes.riscoCritico) {
            recomendacoes.push({
                prioridade: 3,
                titulo: "Instalar Atualizações Críticas",
                descricao: `${analises.atualizacoes.detalhePorSeveridade.criticos} atualizações críticas pendentes`,
                prazo: "ESTA SEMANA",
            });
        }

        if (analises.software.softwareComAtualizacoes > 0) {
            recomendacoes.push({
                prioridade: 4,
                titulo: "Atualizar Software",
                descricao: `${analises.software.softwareComAtualizacoes} software(s) com atualizações disponíveis`,
                prazo: "ESTE MÊS",
            });
        }

        if (analises.espacoDisco.temProblemas) {
            recomendacoes.push({
                prioridade: 5,
                titulo: "Gerenciar Espaço em Disco",
                descricao: analises.espacoDisco.recomendacao,
                prazo: "ESTE MÊS",
            });
        }

        return recomendacoes;
    }

    //Template HTML para relatório individual
    getIndividualTemplate() {
        return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{tipoRelatorio}} - {{nomeDispositivo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #007bff; margin: 0; }
        .header p { margin: 5px 0; color: #666; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .info-box h3 { margin-top: 0; color: #007bff; }
        
        .status-badge { 
            display: inline-block; padding: 5px 15px; border-radius: 20px; 
            color: white; font-weight: bold; text-align: center;
            background-color: {{corCriticidade}};
        }
        
        .section { margin-bottom: 30px; }
        .section h2 { color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        
        .problema-critico { background-color: #fff5f5; border-left: 4px solid #dc3545; }
        .problema-alto { background-color: #fff8f0; border-left: 4px solid #fd7e14; }
        .problema-medio { background-color: #fffbf0; border-left: 4px solid #ffc107; }
        .problema-baixo { background-color: #f0fff4; border-left: 4px solid #20c997; }
        
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{tipoRelatorio}}</h1>
        <p><strong>Dispositivo:</strong> {{dispositivo.nome}}</p>
        <p><strong>Data de Geração:</strong> {{dataGeracao}}</p>
        <div class="status-badge">{{nivelCriticidade}} ({{scoreCriticidade}} pontos)</div>
    </div>

    <div class="info-grid">
        <div class="info-box">
            <h3>Informações do Dispositivo</h3>
            <p><strong>Nome:</strong> {{dispositivo.nome}}</p>
            <p><strong>Utilizador:</strong> {{dispositivo.utilizador}}</p>
            <p><strong>Domínio:</strong> {{dispositivo.dominio}}</p>
            <p><strong>Tipo:</strong> {{dispositivo.tipo}}</p>
        </div>
        
        <div class="info-box">
            <h3>Status do Sistema</h3>
            <p><strong>SO:</strong> {{sistemaOperacional.nome}}</p>
            <p><strong>Status SO:</strong> {{sistemaOperacional.status}}</p>
            <p><strong>Conectividade:</strong> {{conectividade.status}}</p>
            <p><strong>Status Geral:</strong> {{statusGeral}}</p>
        </div>
    </div>

    <div class="section">
        <h2>Resumo Executivo</h2>
        <div class="info-grid">
            <div>
                <p><strong>Total de Problemas:</strong> {{totalProblemas}}</p>
                <p><strong>Atualizações Pendentes:</strong> {{totalAtualizacoes}}</p>
            </div>
            <div>
                <p><strong>Software Instalado:</strong> {{totalSoftware}}</p>
                <p><strong>Software c/ Atualizações:</strong> {{softwareComAtualizacoes}}</p>
            </div>
        </div>
    </div>

    {{#if problemas}}
    <div class="section">
        <h2>Problemas Identificados</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Problema</th>
                    <th>Criticidade</th>
                    <th>Recomendação</th>
                </tr>
            </thead>
            <tbody>
                {{#each problemas}}
                <tr class="problema-{{criticidade}}">
                    <td>{{id}}</td>
                    <td>{{descricao}}</td>
                    <td>{{criticidade}}</td>
                    <td>{{recomendacao}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    {{#if atualizacoes}}
    <div class="section">
        <h2>Atualizações Pendentes</h2>
        <table>
            <thead>
                <tr>
                    <th>Atualização</th>
                    <th>Artigo</th>
                    <th>Severidade</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {{#each atualizacoes}}
                <tr>
                    <td>{{titulo}}</td>
                    <td>{{artigo}}</td>
                    <td>{{severidade}}</td>
                    <td>{{status}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    {{#if softwareCritico}}
    <div class="section">
        <h2>Software Crítico</h2>
        <table>
            <thead>
                <tr>
                    <th>Software</th>
                    <th>Versão</th>
                    <th>Fabricante</th>
                    <th>Precisa Atualização</th>
                </tr>
            </thead>
            <tbody>
                {{#each softwareCritico}}
                <tr>
                    <td>{{nome}}</td>
                    <td>{{versao}}</td>
                    <td>{{fabricante}}</td>
                    <td>{{#if precisaAtualizacao}}SIM{{else}}NÃO{{/if}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    {{#if recomendacoes}}
    <div class="section">
        <h2>Recomendações de Ação</h2>
        <table>
            <thead>
                <tr>
                    <th>Prioridade</th>
                    <th>Ação</th>
                    <th>Descrição</th>
                    <th>Prazo</th>
                </tr>
            </thead>
            <tbody>
                {{#each recomendacoes}}
                <tr>
                    <td>{{prioridade}}</td>
                    <td>{{titulo}}</td>
                    <td>{{descricao}}</td>
                    <td>{{prazo}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema SCCM - {{timestamp}}</p>
    </div>
</body>
</html>`;
    }

    //Template HTML para relatório geral
    getGeralTemplate() {
        return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{tipoRelatorio}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }

        .summary-card {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
        }

        .summary-card h3 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: bold;
        }

        .summary-card p {
            margin: 0;
            font-size: 12px;
            opacity: 0.9;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #007bff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .info-box h3 {
            margin-top: 0;
            color: #007bff;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .info-box p {
            margin: 8px 0;
            font-size: 14px;
        }

        .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
        }

        .section h2 {
            color: #007bff;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
            font-size: 22px;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background: white;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            font-size: 13px;
        }

        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }

        tr:hover {
            background-color: #f8f9fa;
        }

        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }

        @media print {
            body {
                margin: 0;
                padding: 15px;
                font-size: 12px;
            }
            .summary-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .info-grid {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            .section {
                page-break-inside: avoid;
            }
            .header {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{tipoRelatorio}}</h1>
        <p><strong>Data de Geração:</strong> {{dataGeracao}}</p>
        <p>
            <strong>Total de Dispositivos Analisados:</strong>
            {{totalDispositivos}}
        </p>
    </div>

    {{#if estatisticas}}
    <div class="summary-grid">
        <div class="summary-card">
            <h3>{{estatisticas.total}}</h3>
            <p>Total Dispositivos</p>
        </div>
        <div
            class="summary-card"
            style="background: linear-gradient(135deg, #28a745, #20c997)"
        >
            <h3>{{estatisticas.online}}</h3>
            <p>Dispositivos Online</p>
        </div>
        <div
            class="summary-card"
            style="background: linear-gradient(135deg, #dc3545, #c82333)"
        >
            <h3>{{estatisticas.criticos}}</h3>
            <p>Dispositivos Críticos</p>
        </div>
        <div
            class="summary-card"
            style="background: linear-gradient(135deg, #ffc107, #e0a800)"
        >
            <h3>{{estatisticas.comUpdatesProblematicos}}</h3>
            <p>Com Updates Pendentes</p>
        </div>
    </div>

    <!-- Estatísticas Detalhadas -->
    <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
        <div class="summary-card" style="background: linear-gradient(135deg, #6f42c1, #5a2d91)">
            <h3>{{analiseGeral.totalSoftwareDesatualizado}}</h3>
            <p>Softwares Desatualizados</p>
            <p style="font-size: 10px; margin-top: 2px;">{{estatisticas.comSoftwareDesatualizado}} dispositivo(s)</p>
        </div>
        <div class="summary-card" style="background: linear-gradient(135deg, #fd7e14, #e65100)">
            <h3>{{estatisticas.comSODesatualizado}}</h3>
            <p>SO Desatualizado</p>
        </div>
        <div class="summary-card" style="background: linear-gradient(135deg, #20c997, #17a2b8)">
            <h3>{{estatisticas.comEspacoCritico}}</h3>
            <p>Espaço Crítico</p>
        </div>
    </div>
    {{/if}}

    <div class="section">
        <h2>📊 Dispositivos Analisados</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%">Nome do Dispositivo</th>
                    <th style="width: 15%">Utilizador</th>
                    <th style="width: 15%">Nível de Criticidade</th>
                    <th style="width: 10%">Score</th>
                    <th style="width: 35%">Principais Problemas</th>
                </tr>
            </thead>
            <tbody>
                {{#each dispositivos}}
                <tr style="border-left: 4px solid {{cor}};">
                    <td><strong>{{nome}}</strong></td>
                    <td>{{utilizador}}</td>
                    <td style="color: {{cor}}; font-weight: bold;">
                        {{criticidade}}
                    </td>
                    <td><strong>{{score}}</strong></td>
                    <td>{{problemas}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>

    {{#if analiseGeral}}
    <div class="section">
        <h2>📈 Análise Geral do Ambiente</h2>
        <div class="info-grid">
            <div class="info-box">
                <h3>🖥️ Sistemas Operacionais</h3>
                <p><strong>Total de Dispositivos:</strong> {{analiseGeral.totalDispositivos}}</p>
                <p><strong>Workstations:</strong> {{analiseGeral.tiposDispositivos.workstations}}</p>
                <p><strong>Servidores:</strong> {{analiseGeral.tiposDispositivos.servidores}}</p>
                <p><strong>Outros:</strong> {{analiseGeral.tiposDispositivos.outros}}</p>
            </div>
            
            <div class="info-box">
                <h3>🔄 Updates e Atualizações</h3>
                <p><strong>Total Updates Problemáticos:</strong> {{analiseGeral.totalUpdatesProblematicos}}</p>
                <p><strong>Updates Críticos:</strong> {{analiseGeral.updatesCriticos}}</p>
                <p><strong>Updates Importantes:</strong> {{analiseGeral.updatesImportantes}}</p>
                <p><strong>Dispositivos Afetados:</strong> {{analiseGeral.dispositivosComUpdates}}</p>
            </div>

            <div class="info-box">
                <h3>💻 Software</h3>
                <p><strong>Total Software Verificado:</strong> {{analiseGeral.totalSoftwareVerificado}}</p>
                <p><strong>Dispositivos c/ Software Desatualizado:</strong> {{analiseGeral.dispositivosComSoftwareDesatualizado}}</p>
                <p><strong>Total Softwares Desatualizados:</strong> {{analiseGeral.totalSoftwareDesatualizado}}</p>
                <p><strong>Taxa de Conformidade:</strong> {{analiseGeral.taxaConformidadeSoftware}}%</p>
            </div>

            <div class="info-box">
                <h3>⚠️ Riscos Identificados</h3>
                <p><strong>Dispositivos Offline:</strong> {{analiseGeral.dispositivosOffline}}</p>
                <p><strong>SO Desatualizados:</strong> {{analiseGeral.dispositivosSODesatualizado}}</p>
                <p><strong>Espaço Crítico:</strong> {{analiseGeral.dispositivosEspacoCritico}}</p>
                <p><strong>Score Médio:</strong> {{analiseGeral.scoreMedio}}</p>
            </div>
        </div>
    </div>
    {{/if}}

    {{#if updatesDetalhados}}
    <div class="section">
        <h2>🔄 Atualizações Pendentes Críticas</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%">Dispositivo</th>
                    <th style="width: 35%">Atualização</th>
                    <th style="width: 15%">Artigo</th>
                    <th style="width: 15%">Severidade</th>
                    <th style="width: 10%">Status</th>
                </tr>
            </thead>
            <tbody>
                {{#each updatesDetalhados}}
                <tr style="background-color: {{#if isCritico}}#fff5f5{{else if isImportante}}#fff8f0{{else}}#fffbf0{{/if}};">
                    <td><strong>{{dispositivo}}</strong></td>
                    <td>{{titulo}}</td>
                    <td>{{artigo}}</td>
                    <td style="color: {{#if isCritico}}#dc3545{{else if isImportante}}#fd7e14{{else}}#ffc107{{/if}}; font-weight: bold;">
                        {{severidade}}
                    </td>
                    <td>{{status}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    {{#if softwareProblematico}}
    <div class="section">
        <h2>💾 Software que Requer Atenção</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%">Dispositivo</th>
                    <th style="width: 40%">Software</th>
                    <th style="width: 15%">Versão Atual</th>
                    <th style="width: 15%">Status</th>
                </tr>
            </thead>
            <tbody>
                {{#each softwareProblematico}}
                <tr>
                    <td><strong>{{dispositivo}}</strong></td>
                    <td>{{nome}}</td>
                    <td>{{versaoAtual}}</td>
                    <td style="color: {{#if isDesatualizado}}#dc3545{{else}}#ffc107{{/if}}; font-weight: bold;">
                        {{status}}
                    </td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    {{#if problemasEspaco}}
    <div class="section">
        <h2>💾 Problemas de Espaço em Disco</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%">Dispositivo</th>
                    <th style="width: 15%">Drive</th>
                    <th style="width: 20%">Tamanho Total</th>
                    <th style="width: 20%">Espaço Livre</th>
                    <th style="width: 15%">% Usado</th>
                </tr>
            </thead>
            <tbody>
                {{#each problemasEspaco}}
                <tr style="background-color: {{#if isCritico}}#fff5f5{{else}}#fff8f0{{/if}};">
                    <td><strong>{{dispositivo}}</strong></td>
                    <td><strong>{{drive}}</strong></td>
                    <td>{{tamanhoTotal}} GB</td>
                    <td>{{espacoLivre}} GB</td>
                    <td style="color: {{#if isCritico}}#dc3545{{else}}#fd7e14{{/if}}; font-weight: bold;">
                        {{percentualUsado}}%
                    </td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    {{#if recomendacoes}}
    <div class="section">
        <h2>📋 Recomendações Prioritárias</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 10%">Prioridade</th>
                    <th style="width: 25%">Ação Recomendada</th>
                    <th style="width: 25%">Dispositivos Afetados</th>
                    <th style="width: 25%">Descrição</th>
                    <th style="width: 15%">Prazo</th>
                </tr>
            </thead>
            <tbody>
                {{#each recomendacoes}}
                <tr style="border-left: 4px solid {{cor}};">
                    <td style="color: {{cor}}; font-weight: bold;">{{prioridade}}</td>
                    <td><strong>{{titulo}}</strong></td>
                    <td>{{dispositivosAfetados}}</td>
                    <td>{{descricao}}</td>
                    <td style="font-weight: bold;">{{prazo}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}

    <div class="footer">
        <p>
            <strong>Relatório Geral gerado automaticamente pelo Sistema SCCM</strong>
        </p>
        <p>
            Este relatório fornece uma visão consolidada de {{totalDispositivos}} dispositivo(s) analisado(s)
        </p>
        <p style="margin-top: 15px; font-size: 11px; color: #888;">
            <strong>Legenda de Criticidade:</strong> 
            CRÍTICO (&gt;=50 pts) | ALTO (30-49 pts) | MÉDIO (15-29 pts) | BAIXO (1-14 pts) | NORMAL (0 pts)
        </p>
        <p style="font-size: 11px; color: #888;">
            Gerado em: {{dataGeracao}} | Versão do Sistema: {{versaoSistema}}
        </p>
    </div>
</body>
</html>`;
    }

    //Template HTML para relatório de críticos
    getCriticosTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="pt-PT">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{{tipoRelatorio}}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                        line-height: 1.6;
                    }

                    .header {
                        text-align: center;
                        border-bottom: 3px solid #dc3545;
                        padding-bottom: 25px;
                        margin-bottom: 40px;
                        background: linear-gradient(135deg, #fff5f5, #ffebee);
                    }

                    .header h1 {
                        color: #dc3545;
                        margin: 0;
                        font-size: 28px;
                    }

                    .alert {
                        background-color: #f8d7da;
                        color: #721c24;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        border-left: 5px solid #dc3545;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }

                    .alert h3 {
                        margin-top: 0;
                        color: #721c24;
                    }

                    .section {
                        margin-bottom: 45px;
                        page-break-inside: avoid;
                    }

                    .section h2 {
                        color: #dc3545;
                        border-bottom: 2px solid #ddd;
                        padding-bottom: 8px;
                        font-size: 22px;
                        margin-bottom: 20px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background: white;
                    }

                    th,
                    td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                        font-size: 13px;
                    }

                    th {
                        background-color: #f8d7da;
                        font-weight: bold;
                        color: #721c24;
                        border-bottom: 2px solid #dc3545;
                    }

                    tr:hover {
                        background-color: #fff5f5;
                    }

                    .critico-row {
                        background-color: #fff5f5;
                        border-left: 4px solid #dc3545;
                    }

                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }

                    .summary-stats {
                        background: linear-gradient(135deg, #dc3545, #c82333);
                        color: white;
                        padding: 25px;
                        border-radius: 12px;
                        text-align: center;
                        margin-bottom: 40px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }

                    .summary-stats h3 {
                        margin: 0 0 10px 0;
                        font-size: 32px;
                    }

                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 25px;
                        margin-bottom: 40px;
                    }

                    .info-card {
                        background: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        border-left: 5px solid #dc3545;
                        transition: transform 0.2s ease;
                        margin-bottom: 15px;
                    }

                    .info-card:hover {
                        transform: translateY(-2px);
                    }

                    .info-card h4 {
                        color: #dc3545;
                        margin: 0 0 10px 0;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .info-card .value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        margin: 5px 0;
                    }

                    .info-card .description {
                        font-size: 13px;
                        color: #666;
                        margin: 0;
                    }

                    .severity-indicator {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }

                    .severity-critico {
                        background-color: #dc3545;
                        color: white;
                    }

                    .severity-alto {
                        background-color: #fd7e14;
                        color: white;
                    }

                    .severity-medio {
                        background-color: #ffc107;
                        color: #333;
                    }

                    .report-summary {
                        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                        padding: 30px;
                        border-radius: 15px;
                        margin-bottom: 40px;
                        border: 1px solid #dee2e6;
                    }

                    .report-summary h3 {
                        color: #dc3545;
                        margin: 0 0 15px 0;
                        font-size: 20px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }

                    .summary-item {
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #dee2e6;
                    }

                    .summary-item .number {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }

                    .summary-item .label {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    @media print {
                        body {
                            margin: 0;
                            padding: 15px;
                            font-size: 12px;
                        }

                        .info-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }

                        .info-card:hover {
                            transform: none;
                        }

                        .page-break-before {
                            page-break-before: always;
                        }

                        .avoid-page-break {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🚨 {{tipoRelatorio}}</h1>
                    <p><strong>Data de Geração:</strong> {{dataGeracao}}</p>
                    {{#if periodoAnalise}}
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666">
                        <strong>Período de Análise:</strong> {{periodoAnalise}} {{#if
                        totalDispositivos}} |
                        <strong>Total de Dispositivos Analisados:</strong>
                        {{totalDispositivos}} {{/if}}
                    </p>
                    {{else}}
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666">
                        <strong>Relatório Gerado em:</strong> {{timestamp}} {{#if
                        totalDispositivos}} |
                        <strong>Dispositivos Analisados:</strong> {{totalDispositivos}}
                        {{/if}}
                    </p>
                    {{/if}}
                </div>

                <div class="summary-stats">
                    <h3>{{totalCriticos}}</h3>
                    <p>Dispositivos Críticos Identificados</p>
                </div>

                <!-- Resumo Executivo -->
                <div class="report-summary">
                    <h3>📊 Resumo Executivo da Situação Crítica</h3>
                    <p style="margin: 0 0 15px 0; color: #333; font-size: 14px">
                        Este relatório identifica
                        <strong>{{totalCriticos}} dispositivos</strong>
                        em estado crítico que requerem atenção imediata. A análise
                        revela problemas significativos que podem comprometer a
                        segurança e operacionalidade da infraestrutura.
                    </p>

                    <div class="summary-grid">
                        {{#if scoreMediaCriticidade}}
                        <div class="summary-item">
                            <div class="number" style="color: #dc3545">
                                {{scoreMediaCriticidade}}
                            </div>
                            <div class="label">Score Médio de Criticidade</div>
                        </div>
                        {{/if}} {{#if dispositivosOffline}}
                        <div class="summary-item">
                            <div class="number" style="color: #fd7e14">
                                {{dispositivosOffline}}
                            </div>
                            <div class="label">Dispositivos Offline</div>
                        </div>
                        {{/if}} {{#if atualizacoesPendentes}}
                        <div class="summary-item">
                            <div class="number" style="color: #dc3545">
                                {{atualizacoesPendentes}}
                            </div>
                            <div class="label">Atualizações Críticas Pendentes</div>
                        </div>
                        {{/if}} {{#if sistemaDesatualizados}}
                        <div class="summary-item">
                            <div class="number" style="color: #856404">
                                {{sistemaDesatualizados}}
                            </div>
                            <div class="label">Sistemas Desatualizados</div>
                        </div>
                        {{/if}}
                    </div>
                </div>

                <div class="section page-break-before">
                    <h2>📊 Distribuição por Níveis de Criticidade</h2>

                    <!-- Distribuição por Níveis de Criticidade -->
                    <div class="info-grid avoid-page-break">
                        <div class="info-card">
                            <h4>🔴 Dispositivos Críticos</h4>
                            <div class="value" style="color: #dc3545">
                                {{#if
                                nivelCritico}}{{nivelCritico}}{{else}}{{totalCriticos}}{{/if}}
                            </div>
                            <p class="description">
                                Dispositivos com score ≥ 80 pontos que requerem ação
                                imediata
                                <span class="severity-indicator severity-critico"
                                    >Crítico</span
                                >
                            </p>
                        </div>

                        {{#if nivelAlto}}
                        <div class="info-card">
                            <h4>🟠 Dispositivos Alto Risco</h4>
                            <div class="value" style="color: #fd7e14">
                                {{nivelAlto}}
                            </div>
                            <p class="description">
                                Dispositivos com score entre 60-79 pontos
                                <span class="severity-indicator severity-alto"
                                    >Alto</span
                                >
                            </p>
                        </div>
                        {{/if}} {{#if nivelMedio}}
                        <div class="info-card">
                            <h4>🟡 Dispositivos Médio Risco</h4>
                            <div class="value" style="color: #ffc107">
                                {{nivelMedio}}
                            </div>
                            <p class="description">
                                Dispositivos com score entre 40-59 pontos
                                <span class="severity-indicator severity-medio"
                                    >Médio</span
                                >
                            </p>
                        </div>
                        {{/if}}

                        <div class="info-card">
                            <h4>📊 Status do Sistema</h4>
                            <div class="value" style="color: #dc3545">
                                {{#if
                                tempoMedioOffline}}{{tempoMedioOffline}}{{else}}ATIVO{{/if}}
                            </div>
                            <p class="description">
                                {{#if tempoMedioOffline}} Tempo médio que os
                                dispositivos críticos estão desconectados {{else}}
                                Sistema de monitoramento ativo e funcional {{/if}}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>🚨 Lista de Dispositivos Críticos</h2>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 25%">Nome do Dispositivo</th>
                                <th style="width: 15%">Score de Criticidade</th>
                                <th style="width: 15%">Nível</th>
                                <th style="width: 45%">Problemas Identificados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each dispositivos}}
                            <tr class="critico-row">
                                <td><strong>{{nome}}</strong></td>
                                <td
                                    style="color: {{cor}}; font-weight: bold; font-size: 16px;"
                                >
                                    {{score}} pontos
                                </td>
                                <td style="color: {{cor}}; font-weight: bold;">
                                    {{criticidade}}
                                </td>
                                <td>{{problemas}}</td>
                            </tr>
                            {{/each}}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>📋 Próximos Passos Recomendados</h2>
                    <div
                        style="
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            border-left: 4px solid #007bff;
                        "
                    >
                        <ol style="margin: 0; padding-left: 20px">
                            <li>
                                <strong>Priorização:</strong> Atender primeiro os
                                dispositivos com maior score de criticidade
                            </li>
                            <li>
                                <strong>Conectividade:</strong> Verificar dispositivos
                                offline e restabelecer comunicação
                            </li>
                            <li>
                                <strong>Atualizações:</strong> Instalar atualizações
                                críticas e importantes pendentes
                            </li>
                            <li>
                                <strong>Sistema Operacional:</strong> Atualizar sistemas
                                operacionais desatualizados
                            </li>
                            <li>
                                <strong>Monitoramento:</strong> Implementar
                                monitoramento contínuo para prevenção
                            </li>
                            <li>
                                <strong>Documentação:</strong> Registrar todas as ações
                                tomadas para auditoria
                            </li>
                        </ol>
                    </div>
                </div>

                <div class="footer">
                    <p>
                        <strong
                            >Relatório de Dispositivos Críticos - Sistema SCCM</strong
                        >
                    </p>
                    <p>Timestamp: {{timestamp}}</p>
                    <p style="color: #dc3545">
                        <strong
                            >⚠️ CONFIDENCIAL - Este relatório contém informações
                            críticas de segurança</strong
                        >
                    </p>
                </div>
            </body>
        </html>
        `;
    }

    //Gera período de análise baseado na data atual
    gerarPeriodoAnalise() {
        const agora = new Date();
        const inicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás

        const formatarData = (data) => {
            return data.toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        };

        return `${formatarData(inicio)} a ${formatarData(agora)}`;
    }

    //Calcula score médio dos dispositivos críticos
    calcularScoreMedia(dispositivos) {
        if (!dispositivos || dispositivos.length === 0) return 0;

        const somaScores = dispositivos.reduce((soma, dispositivo) => {
            return soma + (dispositivo.score || 0);
        }, 0);

        return Math.round(somaScores / dispositivos.length);
    }

    //Conta dispositivos offline baseado nos problemas
    contarDispositivosOffline(dispositivos) {
        if (!dispositivos || dispositivos.length === 0) return 0;

        return dispositivos.filter((dispositivo) => {
            const problemas = dispositivo.problemas?.toLowerCase() || "";
            return (
                problemas.includes("offline") ||
                problemas.includes("desconectado")
            );
        }).length;
    }

    //Conta atualizações pendentes baseado nos problemas
    contarAtualizacoesPendentes(dispositivos) {
        if (!dispositivos || dispositivos.length === 0) return 0;

        return dispositivos.filter((dispositivo) => {
            const problemas = dispositivo.problemas?.toLowerCase() || "";
            return (
                problemas.includes("atualização") ||
                problemas.includes("update")
            );
        }).length;
    }

    //Conta sistemas desatualizados baseado nos problemas
    contarSistemasDesatualizados(dispositivos) {
        if (!dispositivos || dispositivos.length === 0) return 0;

        return dispositivos.filter((dispositivo) => {
            const problemas = dispositivo.problemas?.toLowerCase() || "";
            return (
                problemas.includes("sistema operacional desatualizado") ||
                problemas.includes("so desatualizado")
            );
        }).length;
    }

    //Conta dispositivos por nível de criticidade
    contarPorNivel(dispositivos, nivel) {
        if (!dispositivos || dispositivos.length === 0) return 0;

        return dispositivos.filter((dispositivo) => {
            return dispositivo.criticidade === nivel;
        }).length;
    }

    //Calcula tempo médio offline (simulado)
    calcularTempoMedioOffline() {
        // Para este relatório, vamos simular um tempo baseado na criticidade
        // Em implementação real, isso viria dos dados de conectividade
        return "2.5h";
    }

    //Obtém turno atual baseado na hora
    obterTurnoAtual() {
        const agora = new Date();
        const hora = agora.getHours();

        if (hora >= 6 && hora < 14) {
            return "Manhã (06:00-14:00)";
        } else if (hora >= 14 && hora < 22) {
            return "Tarde (14:00-22:00)";
        } else {
            return "Noite (22:00-06:00)";
        }
    }

    //Cleanup - chama automaticamente ao destruir a instância
    async destroy() {
        await this.closeBrowser();
    }
}

// Registrar helpers do Handlebars
handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});

handlebars.registerHelper("gt", function (a, b) {
    return a > b;
});

handlebars.registerHelper("formatDate", function (date) {
    return new Date(date).toLocaleDateString("pt-BR");
});

module.exports = PDFGenerator;
