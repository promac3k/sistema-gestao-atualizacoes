// Importa os módulos locais necessários
const connection = require("../Services/DB"); // Módulo para conexão com o banco de dados
const string_json = require("../Services/string_json"); // Módulo para retornar uma string JSON
const PDFGenerator = require("../Services/PDFGenerator"); // Gerador de PDF
const { checkMultipleSoftwareVersions } = require("../Services/SoftwareVersionChecker"); // Verificador de versões
const debug = process.env.DEBUG; // Módulo para debug

// Cache para controlar chamadas repetidas à API
const apiCache = new Map();
const CACHE_DURATION = 30000; // 30 segundos em milissegundos

// Função auxiliar para verificar e controlar cache
const checkApiCache = (key) => {
    const now = Date.now();
    const cached = apiCache.get(key);

    if (cached && now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    return null;
};

// Função auxiliar para salvar no cache
const setApiCache = (key, data) => {
    apiCache.set(key, {
        data: data,
        timestamp: Date.now(),
    });
};

//Lista dispositivos disponíveis para seleção no relatório
const listarDispositivosParaRelatorio = async (req, res) => {
    if (debug) {
        console.log(
            "📋 GET /api/v1/relatorio/dispositivos - Listando dispositivos para relatório"
        );
    }

    try {
        // Verificar cache primeiro
        const cacheKey = "dispositivos_relatorio";
        const cachedData = checkApiCache(cacheKey);

        if (cachedData) {
            if (debug) {
                console.log(
                    "💾 Dados obtidos do cache (evitando chamada desnecessária à API)"
                );
            }
            return string_json(
                res,
                200,
                "✅ Lista de dispositivos obtida do cache",
                cachedData
            );
        }

        // Query simples para listar dispositivos com informações básicas para a barra de pesquisa
        const query = `
             SELECT 
                sys.ResourceID as id,
                sys.Name0 as nome
            FROM v_R_System sys
            WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
            ORDER BY sys.Name0 ASC
        `;

        if (debug)
            console.log("🚀 Executando query para listar dispositivos...");

        const result = await connection.query(query);
        const dispositivos = Array.isArray(result[0]) ? result[0] : result;

        if (debug) {
            console.log(`📊 ${dispositivos.length} dispositivos encontrados`);
            console.log("📋 Primeiros 10 dispositivos:");
            dispositivos.slice(0, 10).forEach((dispositivo, index) => {
                console.log(
                    `  ${index + 1}. ID: ${dispositivo.id}, Nome: ${
                        dispositivo.nome
                    }`
                );
            });
        }

        const responseData = {
            dispositivos: dispositivos,
            total: dispositivos.length,
            timestamp: new Date().toISOString(),
        };

        // Salvar no cache
        setApiCache(cacheKey, responseData);

        string_json(
            res,
            200,
            "✅ Lista de dispositivos obtida com sucesso",
            responseData
        );

        if (debug) {
            console.log("✅ Lista de dispositivos enviada com sucesso!");
        }
    } catch (error) {
        console.error("❌ Erro ao listar dispositivos para relatório:", error);
        string_json(
            res,
            500,
            "❌ Erro interno do servidor ao listar dispositivos",
            null
        );
    }
};

//Gera dados do relatório individual de um dispositivo
const gerarRelatorioIndividual = async (req, res) => {
    if (debug) {
        console.log(
            "📊 POST /api/v1/relatorio/generate/individual - Gerando relatório individual"
        );
    }

    const { deviceId } = req.body;

    if (!deviceId) {
        return string_json(
            res,
            400,
            "❌ ID do dispositivo é obrigatório",
            null
        );
    }

    try {
        // Query para buscar dados básicos do dispositivo
        const dispositivoQuery = `
            SELECT 
                sys.ItemKey AS ResourceID,
                sys.Name0 AS nome,
                sys.Operating_System_Name_and0 AS sistemaOperacional,
                sys.Client0 AS online,
                sys.User_Name0 AS utilizador,
                sys.Resource_Domain_OR_Workgr0 AS dominio,
                sys.Full_Domain_Name0 AS dominioCompleto,
                sys.Last_Logon_Timestamp0 AS ultimoLogin,
                sys.Creation_Date0 AS dataCriacao,
                sys.Client_Version0 AS versaoCliente,
                usr.Full_User_Name0 AS nomeCompletoUtilizador,
                usr.Mail0 AS emailUtilizador,
                CASE 
                    WHEN sys.Client0 = 1 THEN 'Online'
                    ELSE 'Offline'
                END AS statusConexao,
                CASE 
                    WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                      OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                      OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                      OR sys.Operating_System_Name_and0 LIKE '%2008%'
                      OR sys.Operating_System_Name_and0 LIKE '%2012%'
                    THEN 'Desatualizado'
                    ELSE 'Atualizado'
                END AS statusSO,
                CASE 
                    WHEN sys.Operating_System_Name_and0 LIKE '%Server%' THEN 'Servidor'
                    WHEN sys.Operating_System_Name_and0 LIKE '%Windows%' THEN 'Workstation'
                    ELSE 'Outro'
                END AS tipoDispositivo,
                CASE 
                    WHEN sys.Operating_System_Name_and0 LIKE '%Server%'
                      OR sys.Client0 != 1
                      OR sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                      OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                      OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                      OR sys.Operating_System_Name_and0 LIKE '%2008%'
                      OR sys.Operating_System_Name_and0 LIKE '%2012%'
                    THEN 'Crítico'
                    ELSE 'Normal'
                END AS statusCriticidade
            FROM System_DISC sys
            LEFT JOIN User_DISC usr ON sys.User_Name0 = usr.Unique_User_Name0
            WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
              AND sys.ItemKey = ?
        `;

        if (debug) console.log(`🔍 Buscando dispositivo ID: ${deviceId}`);

        // Buscar dispositivo básico
        const dispositivoResult = await connection.query(dispositivoQuery, [
            deviceId,
        ]);
        const dispositivosRows = Array.isArray(dispositivoResult[0])
            ? dispositivoResult[0]
            : dispositivoResult;

        if (!dispositivosRows || dispositivosRows.length === 0) {
            if (debug)
                console.log(`❌ Dispositivo não encontrado: ${deviceId}`);
            return string_json(
                res,
                404,
                `❌ Dispositivo não encontrado: ${deviceId}`,
                null
            );
        }

        const dispositivo = dispositivosRows[0];
        const resourceId = dispositivo.ResourceID;

        if (debug)
            console.log(
                `✅ Dispositivo encontrado: ${dispositivo.nome} (ID: ${resourceId})`
            );

        // Buscar MachineID para as queries de hardware
        const machineIdQuery = `
            SELECT 
                s.MachineID,
                sd.ItemKey AS ResourceID,
                sd.Name0 AS nome
            FROM System_DISC sd
            INNER JOIN System_DATA s ON sd.Name0 = s.Name0
            WHERE sd.ItemKey = ? 
        `;

        const machineIdResult = await connection.query(machineIdQuery, [
            resourceId,
        ]);
        const machineIdRows = Array.isArray(machineIdResult[0])
            ? machineIdResult[0]
            : machineIdResult;

        if (!machineIdRows || machineIdRows.length === 0) {
            if (debug)
                console.log(
                    `❌ MachineID não encontrado para o dispositivo: ${resourceId}`
                );
            return string_json(
                res,
                404,
                `❌ Dados do dispositivo incompletos: ${deviceId}`,
                null
            );
        }

        const machineId = machineIdRows[0].MachineID;
        if (debug) console.log(`✅ MachineID encontrado: ${machineId}`);

        // Queries focadas em dados críticos para relatório
        // Query para buscar TODOS os softwares instalados no dispositivo (não apenas os críticos)
        const todosSoftwaresQuery = `
            SELECT 
                arp.DisplayName00 AS nome,
                arp.Version00 AS versao,
                arp.Publisher00 AS fabricante,
                arp.InstallDate00 AS dataInstalacao
            FROM Add_Remove_Programs_DATA arp
            WHERE arp.MachineID = ? 
              AND arp.DisplayName00 IS NOT NULL
              AND arp.DisplayName00 != ''
              AND arp.Version00 IS NOT NULL
              AND arp.Version00 != ''
            ORDER BY arp.DisplayName00
        `;

        const updatesQuery = `
            SELECT 
                uci.ArticleID AS artigo,
                lp.DisplayName AS titulo,
                uci.BulletinID AS boletim,
                uci.Severity AS severidade,
                ucs.Status AS status,
                ucs.LastStatusCheckTime AS ultimaVerificacao,
                CASE ucs.Status
                    WHEN 0 THEN 'Desconhecido'
                    WHEN 1 THEN 'Não Aplicável'
                    WHEN 2 THEN 'Não Instalado'
                    WHEN 3 THEN 'Instalado'
                    WHEN 4 THEN 'Falha'
                    WHEN 5 THEN 'Requer Reinicialização'
                    ELSE 'Outro'
                END AS statusDescricao,
                CASE uci.Severity
                    WHEN 1 THEN 'Baixa'
                    WHEN 2 THEN 'Moderada' 
                    WHEN 3 THEN 'Importante'
                    WHEN 4 THEN 'Crítica'
                    ELSE 'Desconhecida'
                END AS severidadeDescricao
            FROM Update_ComplianceStatus ucs
            JOIN CI_UpdateCIs uci ON ucs.CI_ID = uci.CI_ID
            LEFT JOIN CI_LocalizedProperties lp ON uci.CI_ID = lp.CI_ID AND lp.LocaleID = 1033
            WHERE ucs.MachineID = ?
              AND ucs.Status IN (0, 2, 4, 5)  -- Apenas updates problemáticos
            ORDER BY uci.Severity DESC, ucs.LastStatusCheckTime DESC
        `;

        const espacoDiscoQuery = `
            SELECT 
                ld.DeviceID00 AS letra,
                CAST(ld.Size00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS tamanhoTotalGB,
                CAST(ld.FreeSpace00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS espacoLivreGB,
                CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) AS percentualUsado
            FROM Logical_Disk_DATA ld
            WHERE ld.MachineID = ? 
              AND ld.DriveType00 = 3
              AND CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) > 80  -- Apenas discos com mais de 80% de uso
            ORDER BY CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) DESC
        `;

        if (debug)
            console.log(
                "🚀 Executando queries de dados para relatório (incluindo verificação de atualizações)..."
            );

        // Executar queries principais
        const [todosSoftwaresResult, updatesResult, espacoDiscoResult] =
            await Promise.all([
                connection.query(todosSoftwaresQuery, [machineId]),
                connection.query(updatesQuery, [machineId]),
                connection.query(espacoDiscoQuery, [machineId]),
            ]);

        // Processar resultados
        const todosSoftwares = Array.isArray(todosSoftwaresResult[0])
            ? todosSoftwaresResult[0]
            : Array.isArray(todosSoftwaresResult)
            ? todosSoftwaresResult
            : [];
        const updates = Array.isArray(updatesResult[0])
            ? updatesResult[0]
            : Array.isArray(updatesResult)
            ? updatesResult
            : [];
        const discosProblematicos = Array.isArray(espacoDiscoResult[0])
            ? espacoDiscoResult[0]
            : Array.isArray(espacoDiscoResult)
            ? espacoDiscoResult
            : [];

        if (debug) {
            console.log(
                `📦 ${todosSoftwares.length} softwares encontrados para verificação`
            );
        }

        // Verificar atualizações de software usando o SoftwareVersionChecker
        let softwareComAtualizacoes = [];
        let errosVerificacao = [];

        if (todosSoftwares.length > 0) {
            try {
                if (debug)
                    console.log(
                        "🔍 Iniciando verificação de atualizações de software..."
                    );

                // Verificar atualizações para todos os softwares
                const resultadosVerificacao =
                    await checkMultipleSoftwareVersions(
                        todosSoftwares,
                        (progress) => {
                            if (debug) {
                                console.log(
                                    `📊 Progresso: ${progress.percentage}% - Verificando: ${progress.software}`
                                );
                            }
                        }
                    );

                // Filtrar apenas softwares que precisam de atualização ou têm problemas
                softwareComAtualizacoes = resultadosVerificacao.filter(
                    (result) => {
                        return (
                            result.status === "outdated" ||
                            result.status === "error"
                        );
                    }
                );

                // Separar erros para análise
                errosVerificacao = resultadosVerificacao.filter(
                    (result) => result.status === "error"
                );

                if (debug) {
                    console.log(`✅ Verificação concluída:`);
                    console.log(
                        `   - Total verificado: ${resultadosVerificacao.length}`
                    );
                    console.log(
                        `   - Com atualizações disponíveis: ${
                            softwareComAtualizacoes.filter(
                                (s) => s.status === "outdated"
                            ).length
                        }`
                    );
                    console.log(
                        `   - Erros na verificação: ${errosVerificacao.length}`
                    );
                }
            } catch (error) {
                console.error(
                    "❌ Erro ao verificar atualizações de software:",
                    error
                );
                errosVerificacao.push({
                    error: "Erro geral na verificação de atualizações",
                    message: error.message,
                });
            }
        }

        // Filtrar softwares críticos e todos que precisam de atualização
        const softwareCriticoBase = todosSoftwares.filter((software) => {
            const nome = software.nome.toLowerCase();
            return (
                nome.includes("adobe") ||
                nome.includes("java") ||
                nome.includes("flash") ||
                nome.includes("chrome") ||
                nome.includes("firefox") ||
                nome.includes("edge") ||
                nome.includes("office") ||
                nome.includes("word") ||
                nome.includes("excel") ||
                nome.includes("powerpoint") ||
                nome.includes("outlook") ||
                nome.includes("acrobat") ||
                nome.includes("reader") ||
                nome.includes("skype") ||
                nome.includes("teams") ||
                nome.includes("zoom") ||
                nome.includes("vlc") ||
                nome.includes("winrar") ||
                nome.includes("7-zip") ||
                nome.includes("itunes") ||
                nome.includes("steam") ||
                nome.includes("visual studio") ||
                nome.includes("vs code") ||
                nome.includes("git") ||
                nome.includes("python") ||
                nome.includes("node") ||
                nome.includes("discord") ||
                nome.includes("slack") ||
                nome.includes("notepad") ||
                nome.includes("spotify") ||
                nome.includes("windows") ||
                nome.includes("microsoft") ||
                nome.includes("antivirus") ||
                nome.includes("mcafee") ||
                nome.includes("norton") ||
                nome.includes("kaspersky") ||
                nome.includes("defender") ||
                nome.includes("browser") ||
                nome.includes("runtime") ||
                nome.includes("framework") ||
                nome.includes(".net")
            );
        });

        // Adicionar todos os softwares que precisam de atualização, mesmo que não sejam "críticos"
        const softwareComAtualizacoesDisponiveis = softwareComAtualizacoes
            .filter((s) => s.status === "outdated" && s.software)
            .map((s) => s.software);

        // Combinar e remover duplicatas
        const softwareCriticoCompleto = [...softwareCriticoBase];

        softwareComAtualizacoesDisponiveis.forEach((software) => {
            const existe = softwareCriticoCompleto.find(
                (s) => s.nome === software.nome
            );
            if (!existe) {
                softwareCriticoCompleto.push(software);
            }
        });

        const softwareCritico = softwareCriticoCompleto;

        // Análise de criticidade do sistema operacional
        const analiseOS = {
            sistemaOperacional: dispositivo.sistemaOperacional,
            statusSO: dispositivo.statusSO,
            isCritico: dispositivo.statusSO === "Desatualizado",
            motivoCriticidade:
                dispositivo.statusSO === "Desatualizado"
                    ? "Sistema operacional desatualizado"
                    : null,
            recomendacao:
                dispositivo.statusSO === "Desatualizado"
                    ? "Atualizar sistema operacional urgentemente"
                    : "Sistema operacional em conformidade",
        };

        // Análise de conectividade
        const analiseConectividade = {
            statusConexao: dispositivo.statusConexao,
            isProblematico: dispositivo.statusConexao === "Offline",
            ultimoLogin: dispositivo.ultimoLogin,
            recomendacao:
                dispositivo.statusConexao === "Offline"
                    ? "Verificar conectividade do dispositivo"
                    : "Conectividade normal",
        };

        // Categorizar updates por severidade e status
        const updatesPorSeveridade = {
            criticos: updates.filter((u) => u.severidade === 4),
            importantes: updates.filter((u) => u.severidade === 3),
            moderados: updates.filter((u) => u.severidade === 2),
            baixos: updates.filter((u) => u.severidade === 1),
        };

        const updatesPorStatus = {
            naoInstalados: updates.filter((u) => u.status === 2),
            falhas: updates.filter((u) => u.status === 4),
            requerReinicio: updates.filter((u) => u.status === 5),
            desconhecidos: updates.filter((u) => u.status === 0),
        };

        // Análise de risco de updates
        const analiseUpdates = {
            totalProblematicos: updates.length,
            riscoCritico: updatesPorSeveridade.criticos.length > 0,
            riscoImportante: updatesPorSeveridade.importantes.length > 0,
            recomendacao:
                updates.length > 0
                    ? `${updates.length} atualizações pendentes requerem atenção`
                    : "Atualizações em dia",
            detalhePorSeveridade: {
                criticos: updatesPorSeveridade.criticos.length,
                importantes: updatesPorSeveridade.importantes.length,
                moderados: updatesPorSeveridade.moderados.length,
                baixos: updatesPorSeveridade.baixos.length,
            },
            detalhePorStatus: {
                naoInstalados: updatesPorStatus.naoInstalados.length,
                falhas: updatesPorStatus.falhas.length,
                requerReinicio: updatesPorStatus.requerReinicio.length,
                desconhecidos: updatesPorStatus.desconhecidos.length,
            },
        };

        // Análise de software crítico e atualizações
        const analiseSoftware = {
            totalSoftwareInstalado: todosSoftwares.length,
            totalSoftwareCritico: softwareCritico.length,
            softwareComAtualizacoes: softwareComAtualizacoes.filter(
                (s) => s.status === "outdated"
            ).length,
            errosVerificacao: errosVerificacao.length,
            recomendacao:
                softwareComAtualizacoes.filter((s) => s.status === "outdated")
                    .length > 0
                    ? `${
                          softwareComAtualizacoes.filter(
                              (s) => s.status === "outdated"
                          ).length
                      } software(s) precisam de atualização`
                    : "Softwares verificados estão atualizados",
            categorias: {
                navegadores: softwareCritico.filter(
                    (s) =>
                        s.nome.includes("Chrome") ||
                        s.nome.includes("Firefox") ||
                        s.nome.includes("Edge")
                ),
                office: softwareCritico.filter(
                    (s) =>
                        s.nome.includes("Office") ||
                        s.nome.includes("Word") ||
                        s.nome.includes("Excel")
                ),
                multimedia: softwareCritico.filter(
                    (s) =>
                        s.nome.includes("Adobe") ||
                        s.nome.includes("VLC") ||
                        s.nome.includes("iTunes")
                ),
                comunicacao: softwareCritico.filter(
                    (s) =>
                        s.nome.includes("Teams") ||
                        s.nome.includes("Skype") ||
                        s.nome.includes("Zoom")
                ),
                utilitarios: softwareCritico.filter(
                    (s) =>
                        s.nome.includes("Java") ||
                        s.nome.includes("WinRAR") ||
                        s.nome.includes("7-Zip")
                ),
            },
            detalhesAtualizacoes: {
                softwareDesatualizado: softwareComAtualizacoes.filter(
                    (s) => s.status === "outdated"
                ),
                errosEncontrados: errosVerificacao,
                totalVerificado: todosSoftwares.length,
            },
        };

        // Análise de espaço em disco
        const analiseEspaco = {
            temProblemas: discosProblematicos.length > 0,
            discosProblematicos: discosProblematicos.length,
            recomendacao:
                discosProblematicos.length > 0
                    ? `${discosProblematicos.length} disco(s) com espaço crítico (>80%)`
                    : "Espaço em disco adequado",
            detalhes: discosProblematicos,
        };

        // Calcular score de criticidade geral
        let scoreCriticidade = 0;
        let problemasIdentificados = [];

        if (analiseOS.isCritico) {
            scoreCriticidade += 30;
            problemasIdentificados.push("Sistema operacional desatualizado");
        }

        if (analiseConectividade.isProblematico) {
            scoreCriticidade += 25;
            problemasIdentificados.push("Dispositivo offline");
        }

        if (analiseUpdates.riscoCritico) {
            scoreCriticidade += 20;
            problemasIdentificados.push(
                `${updatesPorSeveridade.criticos.length} atualizações críticas pendentes`
            );
        }

        if (analiseUpdates.riscoImportante) {
            scoreCriticidade += 15;
            problemasIdentificados.push(
                `${updatesPorSeveridade.importantes.length} atualizações importantes pendentes`
            );
        }

        if (analiseSoftware.softwareComAtualizacoes > 0) {
            scoreCriticidade += 10;
            problemasIdentificados.push(
                `${analiseSoftware.softwareComAtualizacoes} software(s) com atualizações disponíveis`
            );
        }

        if (analiseEspaco.temProblemas) {
            scoreCriticidade += 10;
            problemasIdentificados.push(
                `${discosProblematicos.length} disco(s) com espaço crítico`
            );
        }

        // Determinar nível de criticidade
        let nivelCriticidade;
        if (scoreCriticidade >= 50) {
            nivelCriticidade = "CRÍTICO";
        } else if (scoreCriticidade >= 30) {
            nivelCriticidade = "ALTO";
        } else if (scoreCriticidade >= 15) {
            nivelCriticidade = "MÉDIO";
        } else if (scoreCriticidade > 0) {
            nivelCriticidade = "BAIXO";
        } else {
            nivelCriticidade = "NORMAL";
        }

        // Estruturar dados do relatório focado em criticidade
        const relatorioData = {
            dispositivo: {
                informacoesBasicas: {
                    id: dispositivo.ResourceID,
                    nome: dispositivo.nome,
                    utilizador: dispositivo.utilizador,
                    nomeCompletoUtilizador: dispositivo.nomeCompletoUtilizador,
                    dominio: dispositivo.dominio,
                    tipoDispositivo: dispositivo.tipoDispositivo,
                },
                analises: {
                    sistemaOperacional: analiseOS,
                    conectividade: analiseConectividade,
                    atualizacoes: analiseUpdates,
                    software: analiseSoftware,
                    espacoDisco: analiseEspaco,
                },
                criticidade: {
                    nivel: nivelCriticidade,
                    score: scoreCriticidade,
                    problemasIdentificados: problemasIdentificados,
                    totalProblemas: problemasIdentificados.length,
                },
                dadosDetalhados: {
                    updatesProblematicos: updates,
                    softwareCritico: softwareCritico,
                    todosSoftwares: todosSoftwares,
                    softwareComAtualizacoes: softwareComAtualizacoes,
                    errosVerificacaoSoftware: errosVerificacao,
                    discosProblematicos: discosProblematicos,
                },
            },
            tipo: "individual",
            geradoEm: new Date().toISOString(),
        };

        if (debug) {
            console.log(
                "📊 Dados do relatório com verificação de atualizações coletados:"
            );
            console.log(`   - Dispositivo: ${dispositivo.nome}`);
            console.log(
                `   - Nível de criticidade: ${nivelCriticidade} (${scoreCriticidade} pontos)`
            );
            console.log(
                `   - SO: ${dispositivo.sistemaOperacional} - ${analiseOS.statusSO}`
            );
            console.log(
                `   - Conectividade: ${analiseConectividade.statusConexao}`
            );
            console.log(`   - Updates problemáticos: ${updates.length}`);
            console.log(`   - Total de softwares: ${todosSoftwares.length}`);
            console.log(
                `   - Software crítico: ${softwareCritico.length} programas`
            );
            console.log(
                `   - Software com atualizações: ${analiseSoftware.softwareComAtualizacoes}`
            );
            console.log(
                `   - Erros na verificação: ${errosVerificacao.length}`
            );
            console.log(
                `   - Discos problemáticos: ${discosProblematicos.length}`
            );
            console.log(
                `   - Problemas identificados: ${problemasIdentificados.join(
                    ", "
                )}`
            );
        }

        string_json(
            res,
            200,
            `✅ Relatório individual do dispositivo ${dispositivo.nome} gerado com sucesso`,
            relatorioData
        );

        if (debug) {
            console.log(
                `✅ Relatório com verificação de atualizações gerado com sucesso para: ${dispositivo.nome} (${nivelCriticidade})`
            );
        }
    } catch (error) {
        console.error("❌ Erro ao gerar relatório individual:", error);
        string_json(
            res,
            500,
            "❌ Erro interno do servidor ao gerar relatório",
            null
        );
    }
};

//Gera dados do relatório geral (múltiplos dispositivos)
const gerarRelatorioGeral = async (req, res) => {
    if (debug) {
        console.log(
            "📊 POST /api/v1/relatorio/generate/geral - Gerando relatório geral"
        );
    }

    const { deviceIds } = req.body;

    // Validar entrada
    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
        return string_json(
            res,
            400,
            "❌ Lista de IDs dos dispositivos é obrigatória",
            null
        );
    }

    // Limitar a máximo 5 dispositivos
    if (deviceIds.length > 5) {
        return string_json(
            res,
            400,
            "❌ Máximo de 5 dispositivos permitidos por relatório",
            null
        );
    }

    if (debug) {
        console.log(
            `🔍 Processando ${deviceIds.length} dispositivos: ${deviceIds.join(
                ", "
            )}`
        );
    }

    try {
        const dispositivosRelatorio = [];
        let totalScoreCriticidade = 0;
        let totalProblemasGerais = [];
        let estatisticasGerais = {
            dispositivosOffline: 0,
            dispositivosComSODesatualizado: 0,
            dispositivosComUpdatesProblematicos: 0,
            dispositivosComSoftwareDesatualizado: 0,
            dispositivosComEspacoCritico: 0,
            totalSoftwareVerificado: 0,
            totalUpdatesProblematicos: 0,
        };

        // Processar cada dispositivo
        for (const deviceId of deviceIds) {
            try {
                if (debug)
                    console.log(`🔍 Processando dispositivo ID: ${deviceId}`);

                // Query para buscar dados básicos do dispositivo
                const dispositivoQuery = `
                    SELECT 
                        sys.ItemKey AS ResourceID,
                        sys.Name0 AS nome,
                        sys.Operating_System_Name_and0 AS sistemaOperacional,
                        sys.Client0 AS online,
                        sys.User_Name0 AS utilizador,
                        sys.Resource_Domain_OR_Workgr0 AS dominio,
                        sys.Full_Domain_Name0 AS dominioCompleto,
                        sys.Last_Logon_Timestamp0 AS ultimoLogin,
                        sys.Creation_Date0 AS dataCriacao,
                        sys.Client_Version0 AS versaoCliente,
                        usr.Full_User_Name0 AS nomeCompletoUtilizador,
                        usr.Mail0 AS emailUtilizador,
                        CASE 
                            WHEN sys.Client0 = 1 THEN 'Online'
                            ELSE 'Offline'
                        END AS statusConexao,
                        CASE 
                            WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                              OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                              OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                              OR sys.Operating_System_Name_and0 LIKE '%2008%'
                              OR sys.Operating_System_Name_and0 LIKE '%2012%'
                            THEN 'Desatualizado'
                            ELSE 'Atualizado'
                        END AS statusSO,
                        CASE 
                            WHEN sys.Operating_System_Name_and0 LIKE '%Server%' THEN 'Servidor'
                            WHEN sys.Operating_System_Name_and0 LIKE '%Windows%' THEN 'Workstation'
                            ELSE 'Outro'
                        END AS tipoDispositivo
                    FROM System_DISC sys
                    LEFT JOIN User_DISC usr ON sys.User_Name0 = usr.Unique_User_Name0
                    WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
                      AND sys.ItemKey = ?
                `;

                // Buscar dispositivo básico
                const dispositivoResult = await connection.query(
                    dispositivoQuery,
                    [deviceId]
                );
                const dispositivosRows = Array.isArray(dispositivoResult[0])
                    ? dispositivoResult[0]
                    : dispositivoResult;

                if (!dispositivosRows || dispositivosRows.length === 0) {
                    if (debug)
                        console.log(
                            `❌ Dispositivo não encontrado: ${deviceId}`
                        );
                    dispositivosRelatorio.push({
                        erro: true,
                        deviceId: deviceId,
                        mensagem: `Dispositivo não encontrado: ${deviceId}`,
                    });
                    continue;
                }

                const dispositivo = dispositivosRows[0];
                const resourceId = dispositivo.ResourceID;

                // Buscar MachineID
                const machineIdQuery = `
                    SELECT 
                        s.MachineID,
                        sd.ItemKey AS ResourceID,
                        sd.Name0 AS nome
                    FROM System_DISC sd
                    INNER JOIN System_DATA s ON sd.Name0 = s.Name0
                    WHERE sd.ItemKey = ? 
                `;

                const machineIdResult = await connection.query(machineIdQuery, [
                    resourceId,
                ]);
                const machineIdRows = Array.isArray(machineIdResult[0])
                    ? machineIdResult[0]
                    : machineIdResult;

                if (!machineIdRows || machineIdRows.length === 0) {
                    if (debug)
                        console.log(
                            `❌ MachineID não encontrado para: ${resourceId}`
                        );
                    dispositivosRelatorio.push({
                        erro: true,
                        deviceId: deviceId,
                        dispositivo: dispositivo,
                        mensagem: `Dados incompletos para dispositivo: ${dispositivo.nome}`,
                    });
                    continue;
                }

                const machineId = machineIdRows[0].MachineID;

                // Queries para dados detalhados
                const todosSoftwaresQuery = `
                    SELECT 
                        arp.DisplayName00 AS nome,
                        arp.Version00 AS versao,
                        arp.Publisher00 AS fabricante,
                        arp.InstallDate00 AS dataInstalacao
                    FROM Add_Remove_Programs_DATA arp
                    WHERE arp.MachineID = ? 
                      AND arp.DisplayName00 IS NOT NULL
                      AND arp.DisplayName00 != ''
                      AND arp.Version00 IS NOT NULL
                      AND arp.Version00 != ''
                    ORDER BY arp.DisplayName00
                `;

                const updatesQuery = `
                    SELECT 
                        uci.ArticleID AS artigo,
                        lp.DisplayName AS titulo,
                        uci.BulletinID AS boletim,
                        uci.Severity AS severidade,
                        ucs.Status AS status,
                        ucs.LastStatusCheckTime AS ultimaVerificacao
                    FROM Update_ComplianceStatus ucs
                    JOIN CI_UpdateCIs uci ON ucs.CI_ID = uci.CI_ID
                    LEFT JOIN CI_LocalizedProperties lp ON uci.CI_ID = lp.CI_ID AND lp.LocaleID = 1033
                    WHERE ucs.MachineID = ?
                      AND ucs.Status IN (0, 2, 4, 5)
                    ORDER BY uci.Severity DESC, ucs.LastStatusCheckTime DESC
                `;

                const espacoDiscoQuery = `
                    SELECT 
                        ld.DeviceID00 AS letra,
                        CAST(ld.Size00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS tamanhoTotalGB,
                        CAST(ld.FreeSpace00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS espacoLivreGB,
                        CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) AS percentualUsado
                    FROM Logical_Disk_DATA ld
                    WHERE ld.MachineID = ? 
                      AND ld.DriveType00 = 3
                      AND CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) > 80
                    ORDER BY CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) DESC
                `;

                // Executar queries
                const [todosSoftwaresResult, updatesResult, espacoDiscoResult] =
                    await Promise.all([
                        connection.query(todosSoftwaresQuery, [machineId]),
                        connection.query(updatesQuery, [machineId]),
                        connection.query(espacoDiscoQuery, [machineId]),
                    ]);

                // Processar resultados
                const todosSoftwares = Array.isArray(todosSoftwaresResult[0])
                    ? todosSoftwaresResult[0]
                    : Array.isArray(todosSoftwaresResult)
                    ? todosSoftwaresResult
                    : [];
                const updates = Array.isArray(updatesResult[0])
                    ? updatesResult[0]
                    : Array.isArray(updatesResult)
                    ? updatesResult
                    : [];
                const discosProblematicos = Array.isArray(espacoDiscoResult[0])
                    ? espacoDiscoResult[0]
                    : Array.isArray(espacoDiscoResult)
                    ? espacoDiscoResult
                    : [];

                // Verificar atualizações de software (versão simplificada para performance)
                let softwareComAtualizacoes = [];
                let errosVerificacao = [];

                if (todosSoftwares.length > 0) {
                    try {
                        // Limitar verificação aos 20 softwares mais críticos para performance
                        const softwarePrioritario = todosSoftwares
                            .filter((software) => {
                                const nome = software.nome.toLowerCase();
                                return (
                                    nome.includes("adobe") ||
                                    nome.includes("java") ||
                                    nome.includes("chrome") ||
                                    nome.includes("firefox") ||
                                    nome.includes("office") ||
                                    nome.includes("teams")
                                );
                            })
                            .slice(0, 20);

                        if (softwarePrioritario.length > 0) {
                            const resultadosVerificacao =
                                await checkMultipleSoftwareVersions(
                                    softwarePrioritario,
                                    (progress) => {
                                        if (debug) {
                                            console.log(
                                                `📊 ${dispositivo.nome} - Progresso: ${progress.percentage}%`
                                            );
                                        }
                                    }
                                );

                            softwareComAtualizacoes =
                                resultadosVerificacao.filter(
                                    (result) =>
                                        result.status === "outdated" ||
                                        result.status === "error"
                                );

                            errosVerificacao = resultadosVerificacao.filter(
                                (result) => result.status === "error"
                            );
                        }
                    } catch (error) {
                        console.error(
                            `❌ Erro ao verificar software do dispositivo ${dispositivo.nome}:`,
                            error
                        );
                        errosVerificacao.push({
                            error: "Erro na verificação de atualizações",
                            message: error.message,
                        });
                    }
                }

                // Calcular criticidade do dispositivo
                let scoreCriticidade = 0;
                let problemasDispositivo = [];

                // Análise SO
                const analiseOS = {
                    sistemaOperacional: dispositivo.sistemaOperacional,
                    statusSO: dispositivo.statusSO,
                    isCritico: dispositivo.statusSO === "Desatualizado",
                };

                if (analiseOS.isCritico) {
                    scoreCriticidade += 30;
                    problemasDispositivo.push("SO desatualizado");
                    estatisticasGerais.dispositivosComSODesatualizado++;
                }

                // Análise conectividade
                const analiseConectividade = {
                    statusConexao: dispositivo.statusConexao,
                    isProblematico: dispositivo.statusConexao === "Offline",
                };

                if (analiseConectividade.isProblematico) {
                    scoreCriticidade += 25;
                    problemasDispositivo.push("Offline");
                    estatisticasGerais.dispositivosOffline++;
                }

                // Análise updates
                const updatesPorSeveridade = {
                    criticos: updates.filter((u) => u.severidade === 4),
                    importantes: updates.filter((u) => u.severidade === 3),
                };

                if (updatesPorSeveridade.criticos.length > 0) {
                    scoreCriticidade += 20;
                    problemasDispositivo.push(
                        `${updatesPorSeveridade.criticos.length} updates críticos`
                    );
                }

                if (updatesPorSeveridade.importantes.length > 0) {
                    scoreCriticidade += 15;
                    problemasDispositivo.push(
                        `${updatesPorSeveridade.importantes.length} updates importantes`
                    );
                }

                if (updates.length > 0) {
                    estatisticasGerais.dispositivosComUpdatesProblematicos++;
                    estatisticasGerais.totalUpdatesProblematicos +=
                        updates.length;
                }

                // Análise software
                const softwareDesatualizados = softwareComAtualizacoes.filter(
                    (s) => s.status === "outdated"
                );
                if (softwareDesatualizados.length > 0) {
                    scoreCriticidade += 10;
                    problemasDispositivo.push(
                        `${softwareDesatualizados.length} software(s) desatualizado(s)`
                    );
                    estatisticasGerais.dispositivosComSoftwareDesatualizado++;
                }

                estatisticasGerais.totalSoftwareVerificado +=
                    todosSoftwares.length;

                // Análise espaço
                if (discosProblematicos.length > 0) {
                    scoreCriticidade += 10;
                    problemasDispositivo.push(
                        `${discosProblematicos.length} disco(s) crítico(s)`
                    );
                    estatisticasGerais.dispositivosComEspacoCritico++;
                }

                // Determinar nível de criticidade
                let nivelCriticidade;
                if (scoreCriticidade >= 50) {
                    nivelCriticidade = "CRÍTICO";
                } else if (scoreCriticidade >= 30) {
                    nivelCriticidade = "ALTO";
                } else if (scoreCriticidade >= 15) {
                    nivelCriticidade = "MÉDIO";
                } else if (scoreCriticidade > 0) {
                    nivelCriticidade = "BAIXO";
                } else {
                    nivelCriticidade = "NORMAL";
                }

                // Adicionar ao relatório
                dispositivosRelatorio.push({
                    erro: false,
                    dispositivo: {
                        informacoesBasicas: {
                            id: dispositivo.ResourceID,
                            nome: dispositivo.nome,
                            utilizador: dispositivo.utilizador,
                            nomeCompletoUtilizador:
                                dispositivo.nomeCompletoUtilizador,
                            dominio: dispositivo.dominio,
                            tipoDispositivo: dispositivo.tipoDispositivo,
                            sistemaOperacional: dispositivo.sistemaOperacional,
                        },
                        analises: {
                            sistemaOperacional: analiseOS,
                            conectividade: analiseConectividade,
                            atualizacoes: {
                                totalProblematicos: updates.length,
                                riscoCritico:
                                    updatesPorSeveridade.criticos.length > 0,
                                riscoImportante:
                                    updatesPorSeveridade.importantes.length > 0,
                                detalhePorSeveridade: {
                                    criticos:
                                        updatesPorSeveridade.criticos.length,
                                    importantes:
                                        updatesPorSeveridade.importantes.length,
                                },
                            },
                            software: {
                                totalSoftwareInstalado: todosSoftwares.length,
                                softwareComAtualizacoes:
                                    softwareDesatualizados.length,
                                errosVerificacao: errosVerificacao.length,
                            },
                            espacoDisco: {
                                temProblemas: discosProblematicos.length > 0,
                                discosProblematicos: discosProblematicos.length,
                            },
                        },
                        criticidade: {
                            nivel: nivelCriticidade,
                            score: scoreCriticidade,
                            problemasIdentificados: problemasDispositivo,
                            totalProblemas: problemasDispositivo.length,
                        },
                        dadosDetalhados: {
                            updatesProblematicos: updates.slice(0, 10), // Limitar para performance
                            softwareComAtualizacoes: softwareComAtualizacoes,
                            discosProblematicos: discosProblematicos,
                        },
                    },
                });

                totalScoreCriticidade += scoreCriticidade;
                totalProblemasGerais = totalProblemasGerais.concat(
                    problemasDispositivo.map((p) => `${dispositivo.nome}: ${p}`)
                );

                if (debug) {
                    console.log(
                        `✅ Dispositivo ${dispositivo.nome} processado - ${nivelCriticidade} (${scoreCriticidade} pontos)`
                    );
                }
            } catch (error) {
                console.error(
                    `❌ Erro ao processar dispositivo ${deviceId}:`,
                    error
                );
                dispositivosRelatorio.push({
                    erro: true,
                    deviceId: deviceId,
                    mensagem: `Erro ao processar dispositivo: ${error.message}`,
                });
            }
        }

        // Calcular estatísticas finais
        const dispositivosValidos = dispositivosRelatorio.filter(
            (d) => !d.erro
        );
        const scoreMedioCriticidade =
            dispositivosValidos.length > 0
                ? Math.round(totalScoreCriticidade / dispositivosValidos.length)
                : 0;

        let nivelCriticidadeGeral;
        if (scoreMedioCriticidade >= 50) {
            nivelCriticidadeGeral = "CRÍTICO";
        } else if (scoreMedioCriticidade >= 30) {
            nivelCriticidadeGeral = "ALTO";
        } else if (scoreMedioCriticidade >= 15) {
            nivelCriticidadeGeral = "MÉDIO";
        } else if (scoreMedioCriticidade > 0) {
            nivelCriticidadeGeral = "BAIXO";
        } else {
            nivelCriticidadeGeral = "NORMAL";
        }

        // Estruturar relatório final
        const relatorioData = {
            resumoGeral: {
                totalDispositivos: deviceIds.length,
                dispositivosProcessados: dispositivosValidos.length,
                dispositivosComErro: dispositivosRelatorio.filter((d) => d.erro)
                    .length,
                nivelCriticidadeGeral: nivelCriticidadeGeral,
                scoreMedioCriticidade: scoreMedioCriticidade,
                totalProblemasIdentificados: totalProblemasGerais.length,
            },
            estatisticasGerais: estatisticasGerais,
            dispositivos: dispositivosRelatorio,
            problemasGerais: totalProblemasGerais.slice(0, 20), // Limitar para exibição
            tipo: "geral",
            geradoEm: new Date().toISOString(),
        };

        if (debug) {
            console.log("📊 Relatório geral concluído:");
            console.log(
                `   - Dispositivos processados: ${dispositivosValidos.length}/${deviceIds.length}`
            );
            console.log(
                `   - Nível geral: ${nivelCriticidadeGeral} (${scoreMedioCriticidade} pontos médios)`
            );
            console.log(
                `   - Total de problemas: ${totalProblemasGerais.length}`
            );
            console.log(
                `   - Offline: ${estatisticasGerais.dispositivosOffline}`
            );
            console.log(
                `   - SO desatualizado: ${estatisticasGerais.dispositivosComSODesatualizado}`
            );
            console.log(
                `   - Com updates problemáticos: ${estatisticasGerais.dispositivosComUpdatesProblematicos}`
            );
        }

        string_json(
            res,
            200,
            `✅ Relatório geral de ${dispositivosValidos.length} dispositivos gerado com sucesso`,
            relatorioData
        );
    } catch (error) {
        console.error("❌ Erro ao gerar relatório geral:", error);
        string_json(
            res,
            500,
            "❌ Erro interno do servidor ao gerar relatório geral",
            null
        );
    }
};

//Gera dados do relatório de dispositivos críticos
const gerarRelatorioCriticos = async (req, res) => {
    if (debug) {
        console.log(
            "🚨 POST /api/v1/relatorio/generate/criticos - Gerando relatório de críticos"
        );
    }

    try {
        // Query para buscar todos os dispositivos ativos e calcular pontuação de criticidade
        const dispositivosQuery = `
            SELECT 
                sys.ItemKey AS ResourceID,
                sys.Name0 AS nome,
                sys.Operating_System_Name_and0 AS sistemaOperacional,
                sys.Client0 AS online,
                sys.User_Name0 AS utilizador,
                sys.Resource_Domain_OR_Workgr0 AS dominio,
                sys.Full_Domain_Name0 AS dominioCompleto,
                sys.Last_Logon_Timestamp0 AS ultimoLogin,
                sys.Creation_Date0 AS dataCriacao,
                sys.Client_Version0 AS versaoCliente,
                usr.Full_User_Name0 AS nomeCompletoUtilizador,
                usr.Mail0 AS emailUtilizador,
                CASE 
                    WHEN sys.Client0 = 1 THEN 'Online'
                    ELSE 'Offline'
                END AS statusConexao,
                CASE 
                    WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                      OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                      OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                      OR sys.Operating_System_Name_and0 LIKE '%2008%'
                      OR sys.Operating_System_Name_and0 LIKE '%2012%'
                    THEN 'Desatualizado'
                    ELSE 'Atualizado'
                END AS statusSO,
                CASE 
                    WHEN sys.Operating_System_Name_and0 LIKE '%Server%' THEN 'Servidor'
                    WHEN sys.Operating_System_Name_and0 LIKE '%Windows%' THEN 'Workstation'
                    ELSE 'Outro'
                END AS tipoDispositivo,
                -- Cálculo básico de pontuação de criticidade
                (
                    -- SO desatualizado (30 pontos)
                    CASE 
                        WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                          OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                          OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                          OR sys.Operating_System_Name_and0 LIKE '%2008%'
                          OR sys.Operating_System_Name_and0 LIKE '%2012%'
                        THEN 30
                        ELSE 0
                    END +
                    -- Dispositivo offline (25 pontos)
                    CASE 
                        WHEN sys.Client0 != 1 THEN 25
                        ELSE 0
                    END +
                    -- Servidor crítico (20 pontos extra)
                    CASE 
                        WHEN sys.Operating_System_Name_and0 LIKE '%Server%' THEN 20
                        ELSE 0
                    END +
                    -- Cliente SCCM desatualizado (15 pontos)
                    CASE 
                        WHEN sys.Client_Version0 < '5.00.9070.1000' THEN 15
                        ELSE 0
                    END +
                    -- Dispositivo muito antigo (10 pontos se criado há mais de 5 anos)
                    CASE 
                        WHEN sys.Creation_Date0 < DATE_SUB(NOW(), INTERVAL 5 YEAR) THEN 10
                        ELSE 0
                    END
                ) AS pontuacaoBasica
            FROM System_DISC sys
            LEFT JOIN User_DISC usr ON sys.User_Name0 = usr.Unique_User_Name0
            WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
            ORDER BY pontuacaoBasica DESC, sys.Name0 ASC
            LIMIT 20
        `;

        if (debug)
            console.log(
                "🔍 Buscando dispositivos para análise de criticidade..."
            );

        const dispositivosResult = await connection.query(dispositivosQuery);
        const dispositivosRows = Array.isArray(dispositivosResult[0])
            ? dispositivosResult[0]
            : dispositivosResult;

        if (!dispositivosRows || dispositivosRows.length === 0) {
            if (debug)
                console.log("❌ Nenhum dispositivo encontrado para análise");
            return string_json(
                res,
                404,
                "❌ Nenhum dispositivo encontrado para análise de criticidade",
                null
            );
        }

        if (debug)
            console.log(
                `📊 ${dispositivosRows.length} dispositivos encontrados para análise detalhada`
            );

        const dispositivosCriticos = [];
        let estatisticasGerais = {
            totalAnalisados: dispositivosRows.length,
            dispositivosOffline: 0,
            dispositivosComSODesatualizado: 0,
            dispositivosComUpdatesProblematicos: 0,
            dispositivosComSoftwareDesatualizado: 0,
            dispositivosComEspacoCritico: 0,
            servidoresCriticos: 0,
            dispositivosAntigos: 0,
        };

        // Analisar cada dispositivo em detalhe
        for (const dispositivo of dispositivosRows) {
            try {
                if (debug)
                    console.log(
                        `🔍 Analisando dispositivo: ${dispositivo.nome}`
                    );

                const resourceId = dispositivo.ResourceID;

                // Buscar MachineID para queries de hardware
                const machineIdQuery = `
                    SELECT 
                        s.MachineID,
                        sd.ItemKey AS ResourceID,
                        sd.Name0 AS nome
                    FROM System_DISC sd
                    INNER JOIN System_DATA s ON sd.Name0 = s.Name0
                    WHERE sd.ItemKey = ? 
                `;

                const machineIdResult = await connection.query(machineIdQuery, [
                    resourceId,
                ]);
                const machineIdRows = Array.isArray(machineIdResult[0])
                    ? machineIdResult[0]
                    : machineIdResult;

                let machineId = null;
                if (machineIdRows && machineIdRows.length > 0) {
                    machineId = machineIdRows[0].MachineID;
                }

                // Queries para análise detalhada (apenas se MachineID disponível)
                let updates = [];
                let todosSoftwares = [];
                let discosProblematicos = [];
                let softwareComAtualizacoes = [];

                if (machineId) {
                    // Query para updates problemáticos
                    const updatesQuery = `
                        SELECT 
                            uci.ArticleID AS artigo,
                            lp.DisplayName AS titulo,
                            uci.BulletinID AS boletim,
                            uci.Severity AS severidade,
                            ucs.Status AS status,
                            ucs.LastStatusCheckTime AS ultimaVerificacao
                        FROM Update_ComplianceStatus ucs
                        JOIN CI_UpdateCIs uci ON ucs.CI_ID = uci.CI_ID
                        LEFT JOIN CI_LocalizedProperties lp ON uci.CI_ID = lp.CI_ID AND lp.LocaleID = 1033
                        WHERE ucs.MachineID = ?
                          AND ucs.Status IN (0, 2, 4, 5)
                        ORDER BY uci.Severity DESC
                        LIMIT 50
                    `;

                    // Query para software instalado
                    const softwareQuery = `
                        SELECT 
                            arp.DisplayName00 AS nome,
                            arp.Version00 AS versao,
                            arp.Publisher00 AS fabricante,
                            arp.InstallDate00 AS dataInstalacao
                        FROM Add_Remove_Programs_DATA arp
                        WHERE arp.MachineID = ? 
                          AND arp.DisplayName00 IS NOT NULL
                          AND arp.DisplayName00 != ''
                          AND arp.Version00 IS NOT NULL
                          AND arp.Version00 != ''
                        ORDER BY arp.DisplayName00
                        LIMIT 100
                    `;

                    // Query para espaço em disco crítico
                    const espacoDiscoQuery = `
                        SELECT 
                            ld.DeviceID00 AS letra,
                            CAST(ld.Size00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS tamanhoTotalGB,
                            CAST(ld.FreeSpace00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS espacoLivreGB,
                            CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) AS percentualUsado
                        FROM Logical_Disk_DATA ld
                        WHERE ld.MachineID = ? 
                          AND ld.DriveType00 = 3
                          AND CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) > 80
                        ORDER BY CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) DESC
                    `;

                    try {
                        // Executar queries em paralelo para melhor performance
                        const [updatesResult, softwareResult, espacoResult] =
                            await Promise.all([
                                connection
                                    .query(updatesQuery, [machineId])
                                    .catch(() => []),
                                connection
                                    .query(softwareQuery, [machineId])
                                    .catch(() => []),
                                connection
                                    .query(espacoDiscoQuery, [machineId])
                                    .catch(() => []),
                            ]);

                        updates = Array.isArray(updatesResult[0])
                            ? updatesResult[0]
                            : Array.isArray(updatesResult)
                            ? updatesResult
                            : [];
                        todosSoftwares = Array.isArray(softwareResult[0])
                            ? softwareResult[0]
                            : Array.isArray(softwareResult)
                            ? softwareResult
                            : [];
                        discosProblematicos = Array.isArray(espacoResult[0])
                            ? espacoResult[0]
                            : Array.isArray(espacoResult)
                            ? espacoResult
                            : [];

                        // Verificar software crítico (versão limitada para performance)
                        const softwareCritico = todosSoftwares
                            .filter((software) => {
                                const nome = software.nome.toLowerCase();
                                return (
                                    nome.includes("adobe") ||
                                    nome.includes("java") ||
                                    nome.includes("chrome") ||
                                    nome.includes("firefox") ||
                                    nome.includes("office") ||
                                    nome.includes("teams")
                                );
                            })
                            .slice(0, 10); // Limitar a 10 para performance

                        // Verificação simplificada de atualizações de software
                        if (softwareCritico.length > 0) {
                            try {
                                const resultadosVerificacao =
                                    await checkMultipleSoftwareVersions(
                                        softwareCritico,
                                        null // Sem callback de progresso para melhor performance
                                    );

                                softwareComAtualizacoes =
                                    resultadosVerificacao.filter(
                                        (result) => result.status === "outdated"
                                    );
                            } catch (error) {
                                if (debug)
                                    console.log(
                                        `⚠️ Erro na verificação de software para ${dispositivo.nome}: ${error.message}`
                                    );
                            }
                        }
                    } catch (error) {
                        if (debug)
                            console.log(
                                `⚠️ Erro ao buscar dados detalhados para ${dispositivo.nome}: ${error.message}`
                            );
                    }
                }

                // Calcular pontuação detalhada de criticidade
                let pontuacaoTotal = dispositivo.pontuacaoBasica || 0;
                let problemasIdentificados = [];

                // Análise sistema operacional
                const analiseOS = {
                    sistemaOperacional: dispositivo.sistemaOperacional,
                    statusSO: dispositivo.statusSO,
                    isCritico: dispositivo.statusSO === "Desatualizado",
                };

                if (analiseOS.isCritico) {
                    problemasIdentificados.push(
                        "Sistema operacional desatualizado"
                    );
                    estatisticasGerais.dispositivosComSODesatualizado++;
                }

                // Análise conectividade
                const analiseConectividade = {
                    statusConexao: dispositivo.statusConexao,
                    isProblematico: dispositivo.statusConexao === "Offline",
                };

                if (analiseConectividade.isProblematico) {
                    problemasIdentificados.push("Dispositivo offline");
                    estatisticasGerais.dispositivosOffline++;
                }

                // Análise updates
                const updatesPorSeveridade = {
                    criticos: updates.filter((u) => u.severidade === 4),
                    importantes: updates.filter((u) => u.severidade === 3),
                    moderados: updates.filter((u) => u.severidade === 2),
                };

                let pontuacaoUpdates = 0;
                if (updatesPorSeveridade.criticos.length > 0) {
                    pontuacaoUpdates +=
                        updatesPorSeveridade.criticos.length * 5; // 5 pontos por update crítico
                    problemasIdentificados.push(
                        `${updatesPorSeveridade.criticos.length} atualizações críticas pendentes`
                    );
                }

                if (updatesPorSeveridade.importantes.length > 0) {
                    pontuacaoUpdates +=
                        updatesPorSeveridade.importantes.length * 3; // 3 pontos por update importante
                    problemasIdentificados.push(
                        `${updatesPorSeveridade.importantes.length} atualizações importantes pendentes`
                    );
                }

                if (updatesPorSeveridade.moderados.length > 0) {
                    pontuacaoUpdates +=
                        updatesPorSeveridade.moderados.length * 1; // 1 ponto por update moderado
                }

                if (updates.length > 0) {
                    estatisticasGerais.dispositivosComUpdatesProblematicos++;
                }

                pontuacaoTotal += Math.min(pontuacaoUpdates, 50); // Máximo 50 pontos para updates

                // Análise software
                if (softwareComAtualizacoes.length > 0) {
                    pontuacaoTotal += softwareComAtualizacoes.length * 2; // 2 pontos por software desatualizado
                    problemasIdentificados.push(
                        `${softwareComAtualizacoes.length} software(s) crítico(s) desatualizado(s)`
                    );
                    estatisticasGerais.dispositivosComSoftwareDesatualizado++;
                }

                // Análise espaço em disco
                if (discosProblematicos.length > 0) {
                    pontuacaoTotal += discosProblematicos.length * 10; // 10 pontos por disco crítico
                    problemasIdentificados.push(
                        `${discosProblematicos.length} disco(s) com espaço crítico`
                    );
                    estatisticasGerais.dispositivosComEspacoCritico++;
                }

                // Análise tipo de dispositivo
                if (dispositivo.tipoDispositivo === "Servidor") {
                    pontuacaoTotal += 15; // Servidores têm prioridade maior
                    problemasIdentificados.push("Servidor crítico");
                    estatisticasGerais.servidoresCriticos++;
                }

                // Análise idade do dispositivo
                const dataAtual = new Date();
                const dataCriacao = new Date(dispositivo.dataCriacao);
                const idadeAnos =
                    (dataAtual - dataCriacao) / (1000 * 60 * 60 * 24 * 365);

                if (idadeAnos > 5) {
                    pontuacaoTotal += Math.min(
                        Math.floor(idadeAnos - 5) * 5,
                        20
                    ); // Máximo 20 pontos por idade
                    problemasIdentificados.push(
                        `Dispositivo antigo (${Math.floor(idadeAnos)} anos)`
                    );
                    estatisticasGerais.dispositivosAntigos++;
                }

                // Determinar nível de criticidade
                let nivelCriticidade;
                if (pontuacaoTotal >= 80) {
                    nivelCriticidade = "CRÍTICO";
                } else if (pontuacaoTotal >= 60) {
                    nivelCriticidade = "ALTO";
                } else if (pontuacaoTotal >= 40) {
                    nivelCriticidade = "MÉDIO";
                } else if (pontuacaoTotal >= 20) {
                    nivelCriticidade = "BAIXO";
                } else {
                    nivelCriticidade = "NORMAL";
                }

                // Adicionar apenas dispositivos com algum nível de criticidade
                if (pontuacaoTotal > 0) {
                    dispositivosCriticos.push({
                        dispositivo: {
                            informacoesBasicas: {
                                id: dispositivo.ResourceID,
                                nome: dispositivo.nome,
                                utilizador: dispositivo.utilizador,
                                nomeCompletoUtilizador:
                                    dispositivo.nomeCompletoUtilizador,
                                dominio: dispositivo.dominio,
                                tipoDispositivo: dispositivo.tipoDispositivo,
                                sistemaOperacional:
                                    dispositivo.sistemaOperacional,
                            },
                            analises: {
                                sistemaOperacional: analiseOS,
                                conectividade: analiseConectividade,
                                atualizacoes: {
                                    totalProblematicos: updates.length,
                                    riscoCritico:
                                        updatesPorSeveridade.criticos.length >
                                        0,
                                    riscoImportante:
                                        updatesPorSeveridade.importantes
                                            .length > 0,
                                    detalhePorSeveridade: {
                                        criticos:
                                            updatesPorSeveridade.criticos
                                                .length,
                                        importantes:
                                            updatesPorSeveridade.importantes
                                                .length,
                                        moderados:
                                            updatesPorSeveridade.moderados
                                                .length,
                                    },
                                },
                                software: {
                                    totalSoftwareInstalado:
                                        todosSoftwares.length,
                                    softwareComAtualizacoes:
                                        softwareComAtualizacoes.length,
                                },
                                espacoDisco: {
                                    temProblemas:
                                        discosProblematicos.length > 0,
                                    discosProblematicos:
                                        discosProblematicos.length,
                                },
                            },
                            criticidade: {
                                nivel: nivelCriticidade,
                                score: pontuacaoTotal,
                                problemasIdentificados: problemasIdentificados,
                                totalProblemas: problemasIdentificados.length,
                                rankingPosition: 0, // Será definido após ordenação
                            },
                            dadosDetalhados: {
                                updatesProblematicos: updates.slice(0, 10),
                                softwareComAtualizacoes:
                                    softwareComAtualizacoes,
                                discosProblematicos: discosProblematicos,
                            },
                        },
                    });
                }

                if (debug) {
                    console.log(
                        `✅ Dispositivo ${dispositivo.nome} analisado - ${nivelCriticidade} (${pontuacaoTotal} pontos) - ${problemasIdentificados.length} problemas`
                    );
                }
            } catch (error) {
                console.error(
                    `❌ Erro ao analisar dispositivo ${dispositivo.nome}:`,
                    error
                );
            }
        }

        // Ordenar por pontuação de criticidade (maior para menor) e pegar os 10 mais críticos
        dispositivosCriticos.sort(
            (a, b) =>
                b.dispositivo.criticidade.score -
                a.dispositivo.criticidade.score
        );
        const top10Criticos = dispositivosCriticos.slice(0, 10);

        // Definir posição no ranking
        top10Criticos.forEach((dispositivo, index) => {
            dispositivo.dispositivo.criticidade.rankingPosition = index + 1;
        });

        // Calcular estatísticas finais
        const pontuacaoMedia =
            top10Criticos.length > 0
                ? Math.round(
                      top10Criticos.reduce(
                          (sum, d) => sum + d.dispositivo.criticidade.score,
                          0
                      ) / top10Criticos.length
                  )
                : 0;

        const distribuicaoPorNivel = {
            critico: top10Criticos.filter(
                (d) => d.dispositivo.criticidade.nivel === "CRÍTICO"
            ).length,
            alto: top10Criticos.filter(
                (d) => d.dispositivo.criticidade.nivel === "ALTO"
            ).length,
            medio: top10Criticos.filter(
                (d) => d.dispositivo.criticidade.nivel === "MÉDIO"
            ).length,
            baixo: top10Criticos.filter(
                (d) => d.dispositivo.criticidade.nivel === "BAIXO"
            ).length,
        };

        // Estruturar relatório final
        const relatorioData = {
            resumoExecutivo: {
                totalDispositivosAnalisados: estatisticasGerais.totalAnalisados,
                top10DispositivosCriticos: top10Criticos.length,
                pontuacaoMediaCriticidade: pontuacaoMedia,
                nivelCriticidadeGeral:
                    pontuacaoMedia >= 80
                        ? "CRÍTICO"
                        : pontuacaoMedia >= 60
                        ? "ALTO"
                        : pontuacaoMedia >= 40
                        ? "MÉDIO"
                        : "BAIXO",
                recomendacaoUrgente:
                    pontuacaoMedia >= 80
                        ? "Ação imediata necessária nos dispositivos críticos"
                        : pontuacaoMedia >= 60
                        ? "Atenção prioritária recomendada"
                        : "Monitoramento contínuo recomendado",
            },
            estatisticasGerais: estatisticasGerais,
            distribuicaoPorNivel: distribuicaoPorNivel,
            top10DispositivosCriticos: top10Criticos,
            criteriosAvaliacao: {
                sistemaOperacionalDesatualizado: "30 pontos",
                dispositivoOffline: "25 pontos",
                tipoServidor: "20 pontos extra",
                clienteSCCMDesatualizado: "15 pontos",
                atualizacoesCriticas: "5 pontos por update crítico",
                atualizacoesImportantes: "3 pontos por update importante",
                softwareDesatualizado: "2 pontos por software",
                discoComEspacoCritico: "10 pontos por disco",
                dispositivoAntigo: "5 pontos por ano acima de 5 anos (máx 20)",
                observacao: "Pontuação máxima de updates limitada a 50 pontos",
            },
            tipo: "criticos",
            geradoEm: new Date().toISOString(),
        };

        if (debug) {
            console.log("🚨 Relatório de dispositivos críticos concluído:");
            console.log(
                `   - Total analisados: ${estatisticasGerais.totalAnalisados}`
            );
            console.log(
                `   - Top 10 críticos identificados: ${top10Criticos.length}`
            );
            console.log(`   - Pontuação média: ${pontuacaoMedia}`);
            console.log(
                `   - Nível geral: ${relatorioData.resumoExecutivo.nivelCriticidadeGeral}`
            );
            console.log(
                `   - Distribuição: CRÍTICO(${distribuicaoPorNivel.critico}) ALTO(${distribuicaoPorNivel.alto}) MÉDIO(${distribuicaoPorNivel.medio}) BAIXO(${distribuicaoPorNivel.baixo})`
            );

            if (top10Criticos.length > 0) {
                console.log("📊 Top 5 mais críticos:");
                top10Criticos.slice(0, 5).forEach((d, i) => {
                    console.log(
                        `   ${i + 1}. ${
                            d.dispositivo.informacoesBasicas.nome
                        } - ${d.dispositivo.criticidade.nivel} (${
                            d.dispositivo.criticidade.score
                        } pontos)`
                    );
                });
            }
        }

        string_json(
            res,
            200,
            `🚨 Relatório de dispositivos críticos gerado com sucesso - ${top10Criticos.length} dispositivos identificados`,
            relatorioData
        );
    } catch (error) {
        console.error(
            "❌ Erro ao gerar relatório de dispositivos críticos:",
            error
        );
        string_json(
            res,
            500,
            "❌ Erro interno do servidor ao gerar relatório de dispositivos críticos",
            null
        );
    }
};

//Gera e retorna PDF do relatório individual
const gerarPDFIndividual = async (req, res) => {
    if (debug) {
        console.log(
            "📄 POST /api/v1/relatorio/pdf/individual - Gerando PDF individual"
        );
    }

    const { deviceId, dadosProcessados } = req.body;

    if (!deviceId) {
        return string_json(
            res,
            400,
            "❌ ID do dispositivo é obrigatório",
            null
        );
    }

    try {
        if (debug) console.log(`📄 Gerando PDF para dispositivo: ${deviceId}`);

        let relatorioData = null;

        // Se dados já processados foram fornecidos, usar eles
        if (dadosProcessados) {
            if (debug)
                console.log("✅ Usando dados já processados do front-end");
            relatorioData = dadosProcessados;
        } else {
            // Caso contrário, processar dados (comportamento legacy)
            if (debug)
                console.log("🔄 Processando dados do back-end (modo legacy)");

            const mockReq = { body: { deviceId } };
            const mockRes = {
                status: () => mockRes,
                json: (data) => {
                    if (data.success && data.data) {
                        relatorioData = data.data;
                    }
                    return mockRes;
                },
            };

            await new Promise((resolve, reject) => {
                const originalStringJson = string_json;
                global.string_json = (res, status, message, data) => {
                    if (status === 200 && data) {
                        relatorioData = data;
                    }
                    resolve();
                };

                gerarRelatorioIndividual(mockReq, mockRes)
                    .then(() => {
                        global.string_json = originalStringJson;
                        resolve();
                    })
                    .catch(reject);
            });
        }

        if (!relatorioData) {
            throw new Error("Não foi possível obter dados do dispositivo");
        }

        // Inicializar gerador de PDF
        const pdfGenerator = new PDFGenerator();

        // Gerar PDF
        const pdfBuffer = await pdfGenerator.generatePDF(relatorioData);

        // Configurar headers para download
        const nomeDispositivo =
            relatorioData.dispositivo?.informacoesBasicas?.nome || deviceId;
        const nomeArquivo = `Relatorio_Individual_${nomeDispositivo}_${
            new Date().toISOString().split("T")[0]
        }.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nomeArquivo}"`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        // Enviar PDF
        res.send(pdfBuffer);

        // Cleanup
        await pdfGenerator.destroy();

        if (debug)
            console.log(`✅ PDF individual gerado e enviado: ${nomeArquivo}`);
    } catch (error) {
        console.error("❌ Erro ao gerar PDF individual:", error);
        string_json(res, 500, "❌ Erro interno do servidor ao gerar PDF", null);
    }
};

//Gera e retorna PDF do relatório geral
const gerarPDFGeral = async (req, res) => {
    if (debug) {
        console.log("📄 POST /api/v1/relatorio/pdf/geral - Gerando PDF geral");
    }

    const { deviceIds, dadosProcessados } = req.body;

    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
        return string_json(
            res,
            400,
            "❌ Lista de IDs dos dispositivos é obrigatória",
            null
        );
    }

    try {
        let relatorioData = null;

        // Se dados já processados foram fornecidos, usar eles
        if (dadosProcessados) {
            if (debug)
                console.log("✅ Usando dados já processados do front-end");
            relatorioData = dadosProcessados;
        } else {
            // Caso contrário, processar dados (comportamento legacy)
            if (debug)
                console.log("🔄 Processando dados do back-end (modo legacy)");

            const mockReq = { body: { deviceIds } };
            const mockRes = {
                status: () => mockRes,
                json: (data) => {
                    if (data.success && data.data) {
                        relatorioData = data.data;
                    }
                    return mockRes;
                },
            };

            await new Promise((resolve, reject) => {
                const originalStringJson = string_json;
                global.string_json = (res, status, message, data) => {
                    if (status === 200 && data) {
                        relatorioData = data;
                    }
                    resolve();
                };

                gerarRelatorioGeral(mockReq, mockRes)
                    .then(() => {
                        global.string_json = originalStringJson;
                        resolve();
                    })
                    .catch(reject);
            });
        }

        if (!relatorioData) {
            throw new Error("Não foi possível obter dados dos dispositivos");
        }

        const pdfGenerator = new PDFGenerator();
        const pdfBuffer = await pdfGenerator.generatePDF(relatorioData);

        const nomeArquivo = `Relatorio_Geral_${
            new Date().toISOString().split("T")[0]
        }.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nomeArquivo}"`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        res.send(pdfBuffer);
        await pdfGenerator.destroy();

        if (debug) console.log(`✅ PDF geral gerado e enviado: ${nomeArquivo}`);
    } catch (error) {
        console.error("❌ Erro ao gerar PDF geral:", error);
        string_json(res, 500, "❌ Erro interno do servidor ao gerar PDF", null);
    }
};

//Gera e retorna PDF do relatório críticos
const gerarPDFCriticos = async (req, res) => {
    if (debug) {
        console.log(
            "📄 POST /api/v1/relatorio/pdf/criticos - Gerando PDF críticos"
        );
    }

    const { dadosProcessados } = req.body;

    try {
        let relatorioData = null;

        // Se dados já processados foram fornecidos, usar eles
        if (dadosProcessados) {
            if (debug)
                console.log("✅ Usando dados já processados do front-end");
            relatorioData = dadosProcessados;
        } else {
            // Caso contrário, processar dados (comportamento legacy)
            if (debug)
                console.log("🔄 Processando dados do back-end (modo legacy)");

            const mockReq = { body: {} };
            const mockRes = {
                status: () => mockRes,
                json: (data) => {
                    if (data.success && data.data) {
                        relatorioData = data.data;
                    }
                    return mockRes;
                },
            };

            await new Promise((resolve, reject) => {
                const originalStringJson = string_json;
                global.string_json = (res, status, message, data) => {
                    if (status === 200 && data) {
                        relatorioData = data;
                    }
                    resolve();
                };

                gerarRelatorioCriticos(mockReq, mockRes)
                    .then(() => {
                        global.string_json = originalStringJson;
                        resolve();
                    })
                    .catch(reject);
            });
        }

        if (!relatorioData) {
            throw new Error(
                "Não foi possível obter dados dos dispositivos críticos"
            );
        }

        // Adicionar logs detalhados para debug
        if (debug) {
            console.log(
                "🔍 Debug - Estrutura dos dados antes do PDFGenerator:"
            );
            console.log(
                "📊 Chaves do relatorioData:",
                Object.keys(relatorioData)
            );
            console.log("📋 Tipo de relatório:", relatorioData.tipo);
            console.log(
                "📱 Dispositivos críticos encontrados:",
                relatorioData.top10DispositivosCriticos?.length || 0
            );

            if (
                relatorioData.top10DispositivosCriticos &&
                relatorioData.top10DispositivosCriticos.length > 0
            ) {
                console.log("🔍 Estrutura do primeiro dispositivo:", {
                    temDispositivo:
                        !!relatorioData.top10DispositivosCriticos[0]
                            .dispositivo,
                    chavesItem: Object.keys(
                        relatorioData.top10DispositivosCriticos[0]
                    ),
                    chavesDentroDispositivo: relatorioData
                        .top10DispositivosCriticos[0].dispositivo
                        ? Object.keys(
                              relatorioData.top10DispositivosCriticos[0]
                                  .dispositivo
                          )
                        : "N/A",
                });
            }
        }

        const pdfGenerator = new PDFGenerator();
        const pdfBuffer = await pdfGenerator.generatePDF(relatorioData);

        const nomeArquivo = `Relatorio_Criticos_${
            new Date().toISOString().split("T")[0]
        }.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nomeArquivo}"`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        res.send(pdfBuffer);
        await pdfGenerator.destroy();

        if (debug)
            console.log(`✅ PDF críticos gerado e enviado: ${nomeArquivo}`);
    } catch (error) {
        console.error("❌ Erro ao gerar PDF críticos:", error);
        string_json(res, 500, "❌ Erro interno do servidor ao gerar PDF", null);
    }
};

//Preview dos dados do relatório (sem gerar PDF)
//Preview do relatório usando dados já processados (novo fluxo otimizado)
const previewRelatorio = async (req, res) => {
    if (debug) {
        console.log(
            "👁️ POST /api/v1/relatorio/preview - Gerando preview do relatório"
        );
    }

    const { dadosProcessados } = req.body;

    if (!dadosProcessados) {
        return string_json(
            res,
            400,
            "❌ Dados processados são obrigatórios para o preview",
            null
        );
    }

    try {
        if (debug) {
            console.log("✅ Usando dados já processados para preview");
        }

        // Criar um preview dos dados formatados sem gerar o PDF
        const pdfGenerator = new PDFGenerator();
        const templateData =
            pdfGenerator.formatDataForTemplate(dadosProcessados);

        // Retornar dados formatados para preview
        const previewData = {
            tipo: dadosProcessados.tipo,
            dadosFormatados: templateData,
            resumo: {
                tipoRelatorio: templateData.tipoRelatorio,
                dataGeracao: templateData.dataGeracao,
                totalDispositivos: templateData.totalDispositivos || 1,
                totalProblemas: templateData.totalProblemas || 0,
                nivelCriticidade: templateData.nivelCriticidade || "NORMAL",
            },
            metadados: {
                geradoEm: new Date().toISOString(),
                versao: "2.0",
                formato: "preview",
                fonte: "dados-pre-processados",
            },
        };

        string_json(
            res,
            200,
            `✅ Preview do relatório ${dadosProcessados.tipo} gerado com sucesso`,
            previewData
        );

        if (debug) {
            console.log(
                `✅ Preview gerado para relatório ${dadosProcessados.tipo} usando dados pré-processados`
            );
        }
    } catch (error) {
        console.error("❌ Erro ao gerar preview do relatório:", error);
        string_json(
            res,
            500,
            "❌ Erro interno do servidor ao gerar preview",
            null
        );
    }
};

module.exports = {
    listarDispositivosParaRelatorio,
    gerarRelatorioIndividual,
    gerarRelatorioGeral,
    gerarRelatorioCriticos,
    gerarPDFIndividual,
    gerarPDFGeral,
    gerarPDFCriticos,
    previewRelatorio,
};
