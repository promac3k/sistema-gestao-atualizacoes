/**
 * Constantes compartilhadas entre controllers
 * Centraliza queries SQL comuns e lógicas repetidas
 */

// Condições SQL reutilizáveis
const SQL_CONDITIONS = {
    // Filtros básicos para dispositivos ativos
    ACTIVE_SYSTEMS: "sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0",

    // Sistemas operacionais desatualizados
    OUTDATED_OS: `
        sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
        OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
        OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
        OR sys.Operating_System_Name_and0 LIKE '%2008%'
        OR sys.Operating_System_Name_and0 LIKE '%2012%'
    `,

    // Servidores
    SERVERS: "sys.Operating_System_Name_and0 LIKE '%Server%'",

    // Dispositivos offline
    OFFLINE_DEVICES: "sys.Client0 != 1",

    // Utilizadores válidos
    VALID_USERS:
        "usr.Full_User_Name0 IS NOT NULL AND usr.Full_User_Name0 != ''",
};

// Campos CASE comuns para classificação
const SQL_CASE_FIELDS = {
    // Status de conexão
    CONNECTION_STATUS: `
        CASE 
            WHEN sys.Client0 = 1 THEN 'Online'
            ELSE 'Offline'
        END AS statusConexao
    `,

    // Status do sistema operacional
    OS_STATUS: `
        CASE 
            WHEN ${SQL_CONDITIONS.OUTDATED_OS}
            THEN 'Desatualizado'
            ELSE 'Atualizado'
        END AS statusSO
    `,

    // Tipo de dispositivo
    DEVICE_TYPE: `
        CASE 
            WHEN sys.Operating_System_Name_and0 LIKE '%Server%' THEN 'Servidor'
            WHEN sys.Operating_System_Name_and0 LIKE '%Windows%' THEN 'Workstation'
            ELSE 'Outro'
        END AS tipoDispositivo
    `,

    // Status de criticidade
    CRITICALITY_STATUS: `
        CASE 
            WHEN ${SQL_CONDITIONS.SERVERS}
                OR ${SQL_CONDITIONS.OFFLINE_DEVICES}
                OR ${SQL_CONDITIONS.OUTDATED_OS}
            THEN 'Crítico'
            ELSE 'Normal'
        END AS statusCriticidade
    `,
};

// Contadores comuns para estatísticas
const SQL_COUNTERS = {
    TOTAL_DEVICES: "COUNT(DISTINCT sys.ResourceID) as totalDispositivos",
    ONLINE_DEVICES:
        "COUNT(DISTINCT CASE WHEN sys.Client0 = 1 THEN sys.ResourceID END) as dispositivosOnline",
    OFFLINE_DEVICES:
        "COUNT(DISTINCT CASE WHEN sys.Client0 != 1 THEN sys.ResourceID END) as dispositivosOffline",
    OUTDATED_SYSTEMS: `COUNT(DISTINCT CASE WHEN ${SQL_CONDITIONS.OUTDATED_OS} THEN sys.ResourceID END) as sistemasDesatualizados`,
    CRITICAL_SERVERS: `COUNT(DISTINCT CASE WHEN ${SQL_CONDITIONS.SERVERS} THEN sys.ResourceID END) as servidoresCriticos`,
    TOTAL_USERS: "COUNT(DISTINCT usr.ResourceID) as totalUtilizadores",
    ACTIVE_USERS: `COUNT(DISTINCT CASE WHEN ${SQL_CONDITIONS.VALID_USERS} THEN usr.ResourceID END) as utilizadoresAtivos`,
};

// Estatísticas detalhadas de SO
const SQL_OS_STATS = {
    WINDOWS_11:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Windows 11%' THEN sys.ResourceID END) as windows11",
    WINDOWS_10:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Windows 10%' THEN sys.ResourceID END) as windows10",
    WINDOWS_8:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Windows 8%' THEN sys.ResourceID END) as windows8",
    WINDOWS_7:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' THEN sys.ResourceID END) as windows7",
    WINDOWS_XP:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Windows XP%' THEN sys.ResourceID END) as windowsXP",
    SERVER_2022:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Server 2022%' THEN sys.ResourceID END) as windowsServer2022",
    SERVER_2019:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Server 2019%' THEN sys.ResourceID END) as windowsServer2019",
    SERVER_2016:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Server 2016%' THEN sys.ResourceID END) as windowsServer2016",
    SERVER_2012:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Server 2012%' THEN sys.ResourceID END) as windowsServer2012",
    SERVER_2008:
        "COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Server 2008%' THEN sys.ResourceID END) as windowsServer2008",
};

// Status de update compliance
const UPDATE_STATUS = {
    UNKNOWN: 0,
    NOT_APPLICABLE: 1,
    NOT_INSTALLED: 2,
    INSTALLED: 3,
    FAILED: 4,
    REQUIRES_RESTART: 5,
};

// Mapeamento de status de update para descrição
const UPDATE_STATUS_DESCRIPTIONS = {
    [UPDATE_STATUS.UNKNOWN]: "Desconhecido",
    [UPDATE_STATUS.NOT_APPLICABLE]: "Não Aplicável",
    [UPDATE_STATUS.NOT_INSTALLED]: "Não Instalado",
    [UPDATE_STATUS.INSTALLED]: "Instalado",
    [UPDATE_STATUS.FAILED]: "Falha",
    [UPDATE_STATUS.REQUIRES_RESTART]: "Requer Reinicialização",
};

// Severidades de update
const UPDATE_SEVERITY = {
    LOW: 1,
    MODERATE: 2,
    IMPORTANT: 3,
    CRITICAL: 4,
};

const UPDATE_SEVERITY_DESCRIPTIONS = {
    [UPDATE_SEVERITY.LOW]: "Baixa",
    [UPDATE_SEVERITY.MODERATE]: "Moderada",
    [UPDATE_SEVERITY.IMPORTANT]: "Importante",
    [UPDATE_SEVERITY.CRITICAL]: "Crítica",
};

module.exports = {
    SQL_CONDITIONS,
    SQL_CASE_FIELDS,
    SQL_COUNTERS,
    SQL_OS_STATS,
    UPDATE_STATUS,
    UPDATE_STATUS_DESCRIPTIONS,
    UPDATE_SEVERITY,
    UPDATE_SEVERITY_DESCRIPTIONS,
};
