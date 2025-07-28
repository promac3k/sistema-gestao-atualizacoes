/**
 * Configurações do Sistema de Verificação de Versões
 */

// Configurações gerais
export const VERSION_CHECKER_CONFIG = {
    // Delay entre requisições para evitar rate limiting (ms)
    REQUEST_DELAY: 100,

    // Timeout para requisições (ms)
    REQUEST_TIMEOUT: 5000,

    // Número máximo de softwares a verificar por vez
    MAX_BATCH_SIZE: 100,

    // User-Agent para as requisições
    USER_AGENT: "SCCM-Dashboard/1.0",

    // URLs das APIs
    APIS: {
        WINGET: "https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests",
        CHOCOLATEY: "https://community.chocolatey.org/api/v2/Packages()",
        GITHUB: "https://api.github.com/repos",
    },
};

// Aliases e variações de nomes comuns para normalização
export const SOFTWARE_ALIASES = {
    // Visual Studio Code
    "visual studio code": ["vscode", "vs code", "code"],
    vscode: ["visual studio code", "vs code", "code"],

    // Node.js
    "node.js": ["nodejs", "node"],
    nodejs: ["node.js", "node"],

    // Browsers
    "google chrome": ["chrome", "chromium"],
    chrome: ["google chrome", "chromium"],
    "mozilla firefox": ["firefox"],
    firefox: ["mozilla firefox"],
    "microsoft edge": ["edge"],
    edge: ["microsoft edge"],

    // Office
    "microsoft office": ["office", "ms office"],
    office: ["microsoft office", "ms office"],
    "microsoft word": ["word", "ms word"],
    word: ["microsoft word", "ms word"],
    "microsoft excel": ["excel", "ms excel"],
    excel: ["microsoft excel", "ms excel"],

    // Adobe
    "adobe acrobat reader": ["acrobat reader", "adobe reader"],
    "adobe photoshop": ["photoshop"],
    "adobe illustrator": ["illustrator"],

    // Media
    "vlc media player": ["vlc"],
    "windows media player": ["media player"],

    // Compression
    "7-zip": ["7zip", "sevenzip"],
    winrar: ["rar"],

    // Development
    "jetbrains intellij idea": ["intellij", "idea"],
    "android studio": ["android-studio"],
    "sublime text": ["sublime"],

    // Communication
    "microsoft teams": ["teams"],
    "zoom meeting": ["zoom"],
    discord: ["discord app"],

    // Security
    "windows defender": ["defender", "microsoft defender"],
    malwarebytes: ["mbam"],

    // Others
    spotify: ["spotify desktop"],
    steam: ["steam client"],
    "epic games launcher": ["epic games", "epic launcher"],
};

// Termos a serem removidos durante a normalização
export const COMMON_TERMS_TO_REMOVE = [
    // Empresas
    "microsoft",
    "adobe",
    "google",
    "mozilla",
    "apple",
    "oracle",
    "jetbrains",
    "autodesk",
    "vmware",
    "citrix",
    "nvidia",
    "amd",
    "intel",

    // Sufixos corporativos
    "inc",
    "corporation",
    "corp",
    "ltd",
    "llc",
    "gmbh",
    "co",
    "company",

    // Versões e edições
    "professional",
    "enterprise",
    "standard",
    "home",
    "business",
    "ultimate",
    "premium",
    "basic",
    "starter",
    "express",
    "community",
    "edition",
    "version",
    "update",
    "service pack",

    // Arquiteturas
    "x64",
    "x86",
    "32-bit",
    "64-bit",
    "arm",
    "arm64",

    // Outros termos comuns
    "software",
    "application",
    "program",
    "tool",
    "suite",
    "client",
    "server",
    "desktop",
    "mobile",
    "web",
    "free",
    "trial",
    "demo",
    "beta",
    "alpha",
    "rc",
    "preview",
];

// Categorias de software para melhor organização
export const SOFTWARE_CATEGORIES = {
    DEVELOPMENT: [
        "visual studio code",
        "git",
        "node.js",
        "python",
        "java",
        "docker",
        "kubernetes",
        "terraform",
        "ansible",
    ],

    BROWSERS: ["chrome", "firefox", "edge", "safari", "opera"],

    OFFICE: [
        "microsoft office",
        "word",
        "excel",
        "powerpoint",
        "outlook",
        "libreoffice",
        "openoffice",
    ],

    MULTIMEDIA: [
        "vlc",
        "obs studio",
        "audacity",
        "gimp",
        "photoshop",
        "premiere",
        "after effects",
        "blender",
    ],

    SECURITY: [
        "windows defender",
        "malwarebytes",
        "kaspersky",
        "avast",
        "norton",
        "mcafee",
        "bitdefender",
    ],

    COMMUNICATION: ["teams", "zoom", "discord", "slack", "skype", "telegram"],

    UTILITIES: ["7-zip", "winrar", "notepad++", "putty", "filezilla"],

    GAMING: ["steam", "epic games launcher", "origin", "uplay", "battle.net"],
};

// Prioridades para fontes de verificação
export const SOURCE_PRIORITY = [
    "winget", // Prioridade 1: WinGet (Microsoft Package Manager - melhor para Windows)
    "chocolatey", // Prioridade 2: Chocolatey (confiável para Windows)
    "github", // Prioridade 3: GitHub (para software open source)
];

// Configurações de rate limiting por API
export const RATE_LIMITS = {
    winget: {
        requestsPerMinute: 60, // Usa API do GitHub
        burstLimit: 10,
    },
    chocolatey: {
        requestsPerMinute: 60,
        burstLimit: 10,
    },
    github: {
        requestsPerMinute: 60, // GitHub permite 60 req/min sem autenticação
        burstLimit: 5,
    },
};

// Configurações de cache (se implementado no futuro)
export const CACHE_CONFIG = {
    enabled: false, // Desabilitado por enquanto
    ttl: 24 * 60 * 60 * 1000, // 24 horas em ms
    maxSize: 1000, // Máximo de entradas no cache
    storageKey: "software_version_cache",
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
    CORS_BLOCKED: "Acesso bloqueado pelo navegador (CORS)",
    NETWORK_ERROR: "Erro de conexão com a internet",
    API_UNAVAILABLE: "API temporariamente indisponível",
    RATE_LIMITED: "Muitas requisições - tente novamente em alguns minutos",
    INVALID_RESPONSE: "Resposta inválida da API",
    TIMEOUT: "Timeout na requisição",
    NOT_FOUND: "Software não encontrado nas APIs consultadas",
    UNKNOWN_ERROR: "Erro desconhecido durante a verificação",
};

export default {
    VERSION_CHECKER_CONFIG,
    SOFTWARE_ALIASES,
    COMMON_TERMS_TO_REMOVE,
    SOFTWARE_CATEGORIES,
    SOURCE_PRIORITY,
    RATE_LIMITS,
    CACHE_CONFIG,
    ERROR_MESSAGES,
};
