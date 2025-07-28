/**
 * Serviço para verificar as versões mais recentes de softwares
 * usando APIs do WinGet, Chocolatey e GitHub
 */

import {
    VERSION_CHECKER_CONFIG,
    SOFTWARE_ALIASES,
    COMMON_TERMS_TO_REMOVE,
    ERROR_MESSAGES,
} from "./SoftwareVersionConfig";

// Mapeamento de nomes de software para identificadores do WinGet
const WINGET_PACKAGE_IDS = {
    // Navegadores
    "google chrome": "Google.Chrome",
    chrome: "Google.Chrome",
    "microsoft edge": "Microsoft.Edge",
    edge: "Microsoft.Edge",
    "mozilla firefox": "Mozilla.Firefox",
    firefox: "Mozilla.Firefox",
    opera: "Opera.Opera",
    brave: "Brave.Brave",

    // Microsoft Office
    "microsoft office": "Microsoft.Office",
    office: "Microsoft.Office",
    "microsoft word": "Microsoft.Office",
    word: "Microsoft.Office",
    "microsoft excel": "Microsoft.Office",
    excel: "Microsoft.Office",
    "microsoft powerpoint": "Microsoft.Office",
    powerpoint: "Microsoft.Office",
    "microsoft outlook": "Microsoft.Office",
    outlook: "Microsoft.Office",
    "microsoft teams": "Microsoft.Teams",
    teams: "Microsoft.Teams",

    // Desenvolvimento
    "visual studio code": "Microsoft.VisualStudioCode",
    vscode: "Microsoft.VisualStudioCode",
    "vs code": "Microsoft.VisualStudioCode",
    git: "Git.Git",
    "node.js": "OpenJS.NodeJS",
    nodejs: "OpenJS.NodeJS",
    python: "Python.Python.3.11",
    java: "Oracle.JavaRuntimeEnvironment",
    "docker desktop": "Docker.DockerDesktop",
    docker: "Docker.DockerDesktop",
    postman: "Postman.Postman",
    insomnia: "Insomnia.Insomnia",

    // Editores de Texto
    "notepad++": "Notepad++.Notepad++",
    "sublime text": "SublimeHQ.SublimeText.4",
    atom: "GitHub.Atom",

    // Multimedia
    "vlc media player": "VideoLAN.VLC",
    vlc: "VideoLAN.VLC",
    "obs studio": "OBSProject.OBSStudio",
    obs: "OBSProject.OBSStudio",
    audacity: "Audacity.Audacity",
    gimp: "GIMP.GIMP",
    blender: "BlenderFoundation.Blender",
    handbrake: "HandBrake.HandBrake",

    // Comunicação
    discord: "Discord.Discord",
    slack: "SlackTechnologies.Slack",
    zoom: "Zoom.Zoom",
    skype: "Microsoft.Skype",
    telegram: "Telegram.TelegramDesktop",
    whatsapp: "WhatsApp.WhatsApp",

    // Utilitários
    "7-zip": "7zip.7zip",
    winrar: "RARLab.WinRAR",
    putty: "PuTTY.PuTTY",
    filezilla: "TimKosse.FileZilla.Client",
    wireshark: "WiresharkFoundation.Wireshark",
    steam: "Valve.Steam",
    "epic games launcher": "EpicGames.EpicGamesLauncher",
    spotify: "Spotify.Spotify",

    // Adobe (alguns disponíveis)
    "adobe acrobat reader": "Adobe.Acrobat.Reader.64-bit",
    "adobe reader": "Adobe.Acrobat.Reader.64-bit",

    // Antivírus e Segurança
    malwarebytes: "Malwarebytes.Malwarebytes",

    // Outros
    "microsoft powertoys": "Microsoft.PowerToys",
    powertoys: "Microsoft.PowerToys",
    "windows terminal": "Microsoft.WindowsTerminal",
    "microsoft store": "Microsoft.AppInstaller",
};

// Mapeamento de nomes de software para repositórios GitHub conhecidos
const GITHUB_REPOS = {
    // Desenvolvimento
    git: "git/git",
    "node.js": "nodejs/node",
    nodejs: "nodejs/node",
    "visual studio code": "microsoft/vscode",
    vscode: "microsoft/vscode",
    python: "python/cpython",
    docker: "docker/docker",
    kubernetes: "kubernetes/kubernetes",
    terraform: "hashicorp/terraform",
    ansible: "ansible/ansible",
    java: "openjdk/jdk",
    openjdk: "openjdk/jdk",
    maven: "apache/maven",
    gradle: "gradle/gradle",

    // Navegadores
    chrome: "chromium/chromium",
    chromium: "chromium/chromium",
    firefox: "mozilla/gecko-dev",
    edge: "MicrosoftEdge/MSEdge",

    // Editores e IDEs
    atom: "atom/atom",
    "sublime text": "sublimehq/sublime_text",
    "notepad++": "notepad-plus-plus/notepad-plus-plus",
    vim: "vim/vim",
    emacs: "emacs-mirror/emacs",

    // Ferramentas de Sistema
    "7-zip": "7zip/7zip",
    winrar: "rarlab/winrar",
    putty: "putty-unofficial/putty",
    wireshark: "wireshark/wireshark",
    nmap: "nmap/nmap",

    // Multimedia
    vlc: "videolan/vlc",
    "vlc media player": "videolan/vlc",
    obs: "obsproject/obs-studio",
    "obs studio": "obsproject/obs-studio",
    ffmpeg: "FFmpeg/FFmpeg",
    audacity: "audacity/audacity",
    gimp: "GNOME/gimp",
    blender: "blender/blender",

    // Comunicação
    discord: "discord/discord-api-docs",
    slack: "slackhq/slack-api-docs",
    teams: "MicrosoftDocs/msteams-docs",
    zoom: "zoom/zoom-sdk",
    skype: "microsoft/skype-docs",

    // Utilitários
    steam: "ValveSoftware/steam-for-linux",
    spotify: "spotify/web-api",
    postman: "postmanlabs/postman-app-support",
    insomnia: "Kong/insomnia",
    filezilla: "FileZilla3/FileZilla3",

    // Banco de Dados
    mysql: "mysql/mysql-server",
    postgresql: "postgres/postgres",
    mongodb: "mongodb/mongo",
    redis: "redis/redis",
    sqlite: "sqlite/sqlite",

    // Linguagens
    rust: "rust-lang/rust",
    go: "golang/go",
    php: "php/php-src",
    ruby: "ruby/ruby",
    perl: "Perl/perl5",
    scala: "scala/scala",
    kotlin: "JetBrains/kotlin",
    swift: "apple/swift",

    // Frameworks e Libraries
    react: "facebook/react",
    angular: "angular/angular",
    vue: "vuejs/vue",
    express: "expressjs/express",
    django: "django/django",
    flask: "pallets/flask",
    spring: "spring-projects/spring-framework",

    // Ferramentas DevOps
    jenkins: "jenkinsci/jenkins",
    gitlab: "gitlab-org/gitlab",
    nginx: "nginx/nginx",
    apache: "apache/httpd",
    elasticsearch: "elastic/elasticsearch",

    // Microsoft Office (documentação/APIs)
    "microsoft office": "OfficeDev/office-js",
    office: "OfficeDev/office-js",
    word: "OfficeDev/Word-Add-in-samples",
    excel: "OfficeDev/Excel-Add-in-samples",
    powerpoint: "OfficeDev/PowerPoint-Add-in-samples",

    // Antivírus e Segurança
    malwarebytes: "malwarebytes/malwarebytes-api",
    kaspersky: "KasperskyLab/klara",
    avast: "avast/avast-sdk",

    // Outros
    telegram: "telegramdesktop/tdesktop",
    whatsapp: "WhatsApp/WhatsApp-Business-API-Setup-Scripts",
    adobe: "adobe/brackets",
    oracle: "oracle/openjdk",
};

// Normalizar nome do software para busca
const normalizeSoftwareName = (name) => {
    if (!name) return "";

    let normalized = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
        .replace(/\s+/g, " "); // Normaliza espaços

    // Remove termos comuns usando a configuração
    const termsRegex = new RegExp(
        `\\b(${COMMON_TERMS_TO_REMOVE.join("|")})\\b`,
        "g"
    );
    normalized = normalized.replace(termsRegex, "").trim();

    // Verifica aliases
    for (const [main, aliases] of Object.entries(SOFTWARE_ALIASES)) {
        if (aliases.includes(normalized) || normalized.includes(main)) {
            return main;
        }
    }

    return normalized;
};

// Função para buscar versão no WinGet (Microsoft Package Manager)
const searchWinGet = async (softwareName) => {
    try {
        const normalizedName = normalizeSoftwareName(softwareName);

        // Verificar se temos um ID direto no mapeamento
        let packageId = WINGET_PACKAGE_IDS[normalizedName];

        if (!packageId) {
            // Tentar buscar com termos comuns
            for (const [key, id] of Object.entries(WINGET_PACKAGE_IDS)) {
                if (
                    normalizedName.includes(key) ||
                    key.includes(normalizedName)
                ) {
                    packageId = id;
                    break;
                }
            }
        }

        if (!packageId) {
            return {
                found: false,
                source: "winget",
                reason: "Package ID not mapped",
            };
        }

        // Buscar informações do pacote no repositório do WinGet
        // Usamos a API do GitHub para acessar o repositório winget-pkgs
        const manifestPath = packageId.replace(".", "/");
        const url = `https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/${manifestPath
            .charAt(0)
            .toLowerCase()}/${manifestPath}`;

        console.log(
            `🔍 Buscando no WinGet: ${normalizedName} - Package ID: ${packageId}`
        );

        const response = await fetch(url, {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": VERSION_CHECKER_CONFIG.USER_AGENT,
            },
        });

        if (response.status === 404) {
            return {
                found: false,
                source: "winget",
                reason: "Package manifest not found",
            };
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            return {
                found: false,
                source: "winget",
                reason: "No versions available",
            };
        }

        // Procurar pela versão mais recente (última pasta ordenada)
        const versionFolders = data
            .filter((item) => item.type === "dir")
            .map((item) => item.name)
            .sort((a, b) => {
                // Ordenação por versão semântica
                const aParts = a.split(".").map((n) => parseInt(n) || 0);
                const bParts = b.split(".").map((n) => parseInt(n) || 0);

                for (
                    let i = 0;
                    i < Math.max(aParts.length, bParts.length);
                    i++
                ) {
                    const aPart = aParts[i] || 0;
                    const bPart = bParts[i] || 0;
                    if (aPart !== bPart) return bPart - aPart; // Ordem decrescente
                }
                return 0;
            });

        if (versionFolders.length === 0) {
            return {
                found: false,
                source: "winget",
                reason: "No version folders found",
            };
        }

        const latestVersion = versionFolders[0];

        // Tentar obter mais detalhes do manifesto da versão mais recente
        const manifestUrl = `https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/${manifestPath
            .charAt(0)
            .toLowerCase()}/${manifestPath}/${latestVersion}`;

        try {
            const manifestResponse = await fetch(manifestUrl, {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": VERSION_CHECKER_CONFIG.USER_AGENT,
                },
            });

            if (manifestResponse.ok) {
                const manifestData = await manifestResponse.json();
                const yamlFile = manifestData.find(
                    (file) =>
                        file.name.endsWith(".yaml") &&
                        (file.name.includes("version") ||
                            file.name.includes("installer"))
                );

                if (yamlFile) {
                    // Buscar conteúdo do arquivo YAML para obter mais detalhes
                    const yamlResponse = await fetch(yamlFile.download_url);
                    if (yamlResponse.ok) {
                        const yamlContent = await yamlResponse.text();

                        // Extrair informações básicas do YAML
                        const packageNameMatch =
                            yamlContent.match(/PackageName:\s*(.+)/);
                        const publisherMatch =
                            yamlContent.match(/Publisher:\s*(.+)/);
                        const homepageMatch =
                            yamlContent.match(/PackageUrl:\s*(.+)/);

                        return {
                            found: true,
                            source: "winget",
                            name: packageNameMatch
                                ? packageNameMatch[1].trim()
                                : packageId,
                            version: latestVersion,
                            description: `WinGet package: ${packageId}`,
                            downloadUrl: `https://github.com/microsoft/winget-pkgs/tree/master/manifests/${manifestPath
                                .charAt(0)
                                .toLowerCase()}/${manifestPath}/${latestVersion}`,
                            projectUrl: homepageMatch
                                ? homepageMatch[1].trim()
                                : `https://github.com/microsoft/winget-pkgs/tree/master/manifests/${manifestPath
                                      .charAt(0)
                                      .toLowerCase()}/${manifestPath}`,
                            publisher: publisherMatch
                                ? publisherMatch[1].trim()
                                : undefined,
                            packageId: packageId,
                        };
                    }
                }
            }
        } catch (manifestError) {
            console.warn(
                `⚠️ Erro ao buscar detalhes do manifesto: ${manifestError.message}`
            );
        }

        // Fallback: retornar informações básicas
        return {
            found: true,
            source: "winget",
            name: packageId,
            version: latestVersion,
            description: `WinGet package: ${packageId}`,
            downloadUrl: `https://github.com/microsoft/winget-pkgs/tree/master/manifests/${manifestPath
                .charAt(0)
                .toLowerCase()}/${manifestPath}/${latestVersion}`,
            projectUrl: `https://github.com/microsoft/winget-pkgs/tree/master/manifests/${manifestPath
                .charAt(0)
                .toLowerCase()}/${manifestPath}`,
            packageId: packageId,
        };
    } catch (error) {
        console.error(
            `❌ Erro ao buscar no WinGet para ${softwareName}:`,
            error
        );

        // Verificar se é erro de CORS
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            return {
                found: false,
                source: "winget",
                error: "CORS/Network error",
            };
        }

        return { found: false, source: "winget", error: error.message };
    }
};

// Função para buscar versão no Chocolatey
const searchChocolatey = async (softwareName) => {
    try {
        const normalizedName = normalizeSoftwareName(softwareName);
        const encodedName = encodeURIComponent(normalizedName);

        // URL da API do Chocolatey para buscar pacotes
        const url = `https://community.chocolatey.org/api/v2/Packages()?$filter=tolower(Id) eq '${encodedName.toLowerCase()}'&$orderby=Created desc&$top=1`;

        console.log(
            `🔍 Buscando no Chocolatey: ${normalizedName} - URL: ${url}`
        );

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": VERSION_CHECKER_CONFIG.USER_AGENT,
            },
            mode: "cors", // Especificar modo CORS
        });

        if (!response.ok) {
            // Se houver erro de CORS, tentar busca alternativa
            if (response.status === 0 || response.type === "opaque") {
                console.warn(
                    `⚠️ CORS bloqueado para Chocolatey: ${normalizedName}`
                );
                return {
                    found: false,
                    source: "chocolatey",
                    error: "CORS blocked",
                };
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.d && data.d.results && data.d.results.length > 0) {
            const packageInfo = data.d.results[0];
            return {
                found: true,
                source: "chocolatey",
                name: packageInfo.Title || packageInfo.Id,
                version: packageInfo.Version,
                description: packageInfo.Description,
                downloadUrl: packageInfo.PackageDownloadUrl,
                projectUrl: packageInfo.ProjectUrl,
                lastUpdated: packageInfo.LastUpdated,
            };
        }

        return { found: false, source: "chocolatey" };
    } catch (error) {
        console.error(
            `❌ Erro ao buscar no Chocolatey para ${softwareName}:`,
            error
        );

        // Verificar se é erro de CORS
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            return {
                found: false,
                source: "chocolatey",
                error: "CORS/Network error",
            };
        }

        return { found: false, source: "chocolatey", error: error.message };
    }
};

// Função para buscar versão no GitHub
const searchGitHub = async (softwareName) => {
    try {
        const normalizedName = normalizeSoftwareName(softwareName);

        // Verificar se temos um mapeamento direto
        let repoPath = GITHUB_REPOS[normalizedName];

        if (!repoPath) {
            // Tentar buscar com termos comuns
            for (const [key, repo] of Object.entries(GITHUB_REPOS)) {
                if (
                    normalizedName.includes(key) ||
                    key.includes(normalizedName)
                ) {
                    repoPath = repo;
                    break;
                }
            }
        }

        if (!repoPath) {
            return {
                found: false,
                source: "github",
                reason: "Repository not mapped",
            };
        }

        const url = `https://api.github.com/repos/${repoPath}/releases/latest`;

        console.log(
            `🔍 Buscando no GitHub: ${normalizedName} - Repo: ${repoPath}`
        );

        const response = await fetch(url, {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": VERSION_CHECKER_CONFIG.USER_AGENT,
            },
        });

        if (response.status === 404) {
            return {
                found: false,
                source: "github",
                reason: "Repository not found",
            };
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const release = await response.json();

        return {
            found: true,
            source: "github",
            name: release.name || `${repoPath} ${release.tag_name}`,
            version: release.tag_name.replace(/^v/, ""), // Remove 'v' prefix
            description: release.body,
            downloadUrl: release.html_url,
            projectUrl: `https://github.com/${repoPath}`,
            lastUpdated: release.published_at,
            prerelease: release.prerelease,
        };
    } catch (error) {
        console.error(
            `❌ Erro ao buscar no GitHub para ${softwareName}:`,
            error
        );
        return { found: false, source: "github", error: error.message };
    }
};

// Função para comparar versões
const compareVersions = (currentVersion, latestVersion) => {
    if (!currentVersion || !latestVersion) return "unknown";

    try {
        // Normalizar versões removendo caracteres não numéricos/pontos
        const normalizeCurrent = currentVersion
            .replace(/[^\d.]/g, "")
            .split(".")
            .map((n) => parseInt(n) || 0);
        const normalizeLatest = latestVersion
            .replace(/[^\d.]/g, "")
            .split(".")
            .map((n) => parseInt(n) || 0);

        // Igualar o tamanho dos arrays
        const maxLength = Math.max(
            normalizeCurrent.length,
            normalizeLatest.length
        );
        while (normalizeCurrent.length < maxLength) normalizeCurrent.push(0);
        while (normalizeLatest.length < maxLength) normalizeLatest.push(0);

        for (let i = 0; i < maxLength; i++) {
            if (normalizeCurrent[i] < normalizeLatest[i]) return "outdated";
            if (normalizeCurrent[i] > normalizeLatest[i]) return "newer";
        }

        return "up-to-date";
    } catch (error) {
        console.error("Erro ao comparar versões:", error);
        return "unknown";
    }
};

// Função principal para verificar versão de um software
export const checkSoftwareVersion = async (software) => {
    if (!software || !software.nome) {
        return {
            software: software,
            status: "error",
            message: "Nome do software não fornecido",
        };
    }

    console.log(`🔍 Verificando versão para: ${software.nome}`);

    try {
        // Primeiro, tentar no WinGet (Microsoft Package Manager)
        const wingetResult = await searchWinGet(software.nome);

        if (wingetResult.found) {
            const versionStatus = compareVersions(
                software.versao,
                wingetResult.version
            );

            return {
                software: software,
                latestVersion: wingetResult,
                status: versionStatus,
                currentVersion: software.versao,
                message: getStatusMessage(
                    versionStatus,
                    software.versao,
                    wingetResult.version
                ),
            };
        }

        // Se não encontrou no WinGet, tentar no Chocolatey
        const chocolateyResult = await searchChocolatey(software.nome);

        if (chocolateyResult.found) {
            const versionStatus = compareVersions(
                software.versao,
                chocolateyResult.version
            );

            return {
                software: software,
                latestVersion: chocolateyResult,
                status: versionStatus,
                currentVersion: software.versao,
                message: getStatusMessage(
                    versionStatus,
                    software.versao,
                    chocolateyResult.version
                ),
            };
        }

        // Se não encontrou no Chocolatey, tentar no GitHub
        const githubResult = await searchGitHub(software.nome);

        if (githubResult.found) {
            const versionStatus = compareVersions(
                software.versao,
                githubResult.version
            );

            return {
                software: software,
                latestVersion: githubResult,
                status: versionStatus,
                currentVersion: software.versao,
                message: getStatusMessage(
                    versionStatus,
                    software.versao,
                    githubResult.version
                ),
            };
        }

        // Não encontrado em nenhuma API
        return {
            software: software,
            status: "not-found",
            currentVersion: software.versao,
            message:
                "Versão mais recente não encontrada nas APIs consultadas (WinGet, Chocolatey, GitHub)",
        };
    } catch (error) {
        console.error(`❌ Erro ao verificar ${software.nome}:`, error);
        return {
            software: software,
            status: "error",
            currentVersion: software.versao,
            message: `Erro ao verificar: ${error.message}`,
        };
    }
};

// Função para obter mensagem de status
const getStatusMessage = (status, currentVersion, latestVersion) => {
    switch (status) {
        case "up-to-date":
            return `Atualizado (${currentVersion})`;
        case "outdated":
            return `Desatualizado: ${currentVersion} → ${latestVersion}`;
        case "newer":
            return `Versão mais recente que o disponível (${currentVersion})`;
        default:
            return "Status desconhecido";
    }
};

// Função para verificar múltiplos softwares
export const checkMultipleSoftwareVersions = async (
    softwareList,
    onProgress = null
) => {
    if (!Array.isArray(softwareList)) {
        return [];
    }

    const results = [];
    const total = softwareList.length;

    console.log(`🚀 Iniciando verificação de ${total} softwares...`);

    for (let i = 0; i < softwareList.length; i++) {
        const software = softwareList[i];

        if (onProgress) {
            onProgress({
                current: i + 1,
                total: total,
                software: software.nome,
                percentage: Math.round(((i + 1) / total) * 100),
            });
        }

        const result = await checkSoftwareVersion(software);
        results.push(result);

        // Pequeno delay para evitar rate limiting
        await new Promise((resolve) =>
            setTimeout(resolve, VERSION_CHECKER_CONFIG.REQUEST_DELAY)
        );
    }

    console.log(
        `✅ Verificação concluída: ${results.length} softwares verificados`
    );

    return results;
};

// Função para obter estatísticas dos resultados
export const getSoftwareStatistics = (results) => {
    if (!Array.isArray(results)) return null;

    const stats = {
        total: results.length,
        upToDate: 0,
        outdated: 0,
        newer: 0,
        notFound: 0,
        errors: 0,
    };

    results.forEach((result) => {
        switch (result.status) {
            case "up-to-date":
                stats.upToDate++;
                break;
            case "outdated":
                stats.outdated++;
                break;
            case "newer":
                stats.newer++;
                break;
            case "not-found":
                stats.notFound++;
                break;
            case "error":
                stats.errors++;
                break;
        }
    });

    return stats;
};
