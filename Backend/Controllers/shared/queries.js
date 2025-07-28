/**
 * Queries SQL reutilizáveis e padronizadas
 * Centraliza todas as queries comuns entre controllers
 */

const {
    SQL_CONDITIONS,
    SQL_CASE_FIELDS,
    SQL_COUNTERS,
    SQL_OS_STATS,
} = require("./constants");

/**
 * Query para estatísticas básicas do dashboard
 */
const DASHBOARD_STATS_QUERY = `
    SELECT 
        ${SQL_COUNTERS.TOTAL_DEVICES},
        ${SQL_COUNTERS.ONLINE_DEVICES},
        ${SQL_COUNTERS.OFFLINE_DEVICES},
        ${SQL_COUNTERS.TOTAL_USERS},
        ${SQL_COUNTERS.ACTIVE_USERS},
        ${SQL_COUNTERS.OUTDATED_SYSTEMS},
        ${SQL_COUNTERS.CRITICAL_SERVERS},
        COUNT(DISTINCT CASE WHEN ${SQL_CONDITIONS.OFFLINE_DEVICES} THEN sys.ResourceID END) as dispositivosOfflineCritico,
        
        -- Distribuição detalhada de SO
        ${SQL_OS_STATS.WINDOWS_11},
        ${SQL_OS_STATS.WINDOWS_10},
        ${SQL_OS_STATS.WINDOWS_8},
        ${SQL_OS_STATS.WINDOWS_7},
        ${SQL_OS_STATS.WINDOWS_XP},
        ${SQL_OS_STATS.SERVER_2022},
        ${SQL_OS_STATS.SERVER_2019},
        ${SQL_OS_STATS.SERVER_2016},
        ${SQL_OS_STATS.SERVER_2012},
        ${SQL_OS_STATS.SERVER_2008},
        
        -- Outros sistemas (servidores não listados + outros SO)
        (COUNT(DISTINCT CASE 
            WHEN sys.Operating_System_Name_and0 LIKE '%Server%' 
             AND sys.Operating_System_Name_and0 NOT LIKE '%Server 2022%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Server 2019%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Server 2016%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Server 2012%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Server 2008%'
            THEN sys.ResourceID 
        END) + COUNT(DISTINCT CASE 
            WHEN sys.Operating_System_Name_and0 NOT LIKE '%Windows 11%' 
             AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 10%' 
             AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 8%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 7%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Windows XP%'
             AND sys.Operating_System_Name_and0 NOT LIKE '%Server%'
             AND sys.Operating_System_Name_and0 IS NOT NULL
             AND sys.Operating_System_Name_and0 != ''
            THEN sys.ResourceID 
        END)) as outros
        
    FROM v_R_System sys
    LEFT JOIN v_R_User usr ON sys.User_Name0 = usr.Unique_User_Name0
    WHERE ${SQL_CONDITIONS.ACTIVE_SYSTEMS}
`;

/**
 * Query para utilizadores do dashboard
 */
const DASHBOARD_USERS_QUERY = `
    SELECT 
        usr.ResourceID,
        usr.Full_User_Name0,
        usr.Unique_User_Name0,
        usr.Mail0,
        sys.Name0 as ComputerName,
        sys.Operating_System_Name_and0
    FROM v_R_User usr
    LEFT JOIN v_R_System sys ON usr.Unique_User_Name0 = sys.User_Name0
    WHERE ${SQL_CONDITIONS.VALID_USERS}
        AND ${SQL_CONDITIONS.ACTIVE_SYSTEMS}
    ORDER BY usr.Full_User_Name0
    LIMIT 10
`;

/**
 * Query para dispositivos críticos do dashboard
 */
const DASHBOARD_CRITICAL_DEVICES_QUERY = `
    SELECT 
        sys.ResourceID,
        sys.Name0,
        sys.Operating_System_Name_and0,
        sys.Client0,
        sys.Last_Logon_Timestamp0,
        CASE 
            WHEN ${SQL_CONDITIONS.OFFLINE_DEVICES} THEN 'Offline'
            WHEN ${SQL_CONDITIONS.OUTDATED_OS} THEN 'SO Desatualizado'
            ELSE 'Atenção Necessária'
        END as TipoAlerta
    FROM v_R_System sys
    WHERE ${SQL_CONDITIONS.ACTIVE_SYSTEMS}
        AND (
            ${SQL_CONDITIONS.OFFLINE_DEVICES}
            OR ${SQL_CONDITIONS.OUTDATED_OS}
        )
    ORDER BY 
        CASE WHEN ${SQL_CONDITIONS.OFFLINE_DEVICES} THEN 1 ELSE 2 END,
        sys.Last_Logon_Timestamp0 DESC
    LIMIT 10
`;

/**
 * Query base para informações de dispositivos
 */
const DEVICE_BASE_INFO_QUERY = `
    SELECT 
        sys.ResourceID,
        sys.Name0 AS nome,
        sys.Operating_System_Name_and0 AS sistemaOperacional,
        sys.Client0 AS online,
        sys.User_Name0 AS utilizador,
        sys.Resource_Domain_OR_Workgr0 AS dominio,
        sys.Last_Logon_Timestamp0 AS ultimoLogin,
        usr.Full_User_Name0 AS nomeCompletoUtilizador,
        ${SQL_CASE_FIELDS.CONNECTION_STATUS},
        ${SQL_CASE_FIELDS.OS_STATUS},
        ${SQL_CASE_FIELDS.DEVICE_TYPE},
        ${SQL_CASE_FIELDS.CRITICALITY_STATUS}
    FROM v_R_System sys
    LEFT JOIN v_R_User usr ON sys.User_Name0 = usr.Unique_User_Name0
    WHERE ${SQL_CONDITIONS.ACTIVE_SYSTEMS}
`;

/**
 * Query para estatísticas de dispositivos
 */
const DEVICES_STATS_QUERY = `
    SELECT 
        ${SQL_COUNTERS.TOTAL_DEVICES},
        ${SQL_COUNTERS.ONLINE_DEVICES},
        ${SQL_COUNTERS.OFFLINE_DEVICES},
        ${SQL_COUNTERS.OUTDATED_SYSTEMS},
        
        -- Dispositivos críticos (servidores + offline + desatualizados)
        COUNT(DISTINCT CASE 
            WHEN ${SQL_CONDITIONS.SERVERS}
                OR ${SQL_CONDITIONS.OFFLINE_DEVICES}
                OR ${SQL_CONDITIONS.OUTDATED_OS}
            THEN sys.ResourceID 
        END) as dispositivosCriticos,
        
        -- Apenas servidores
        COUNT(DISTINCT CASE WHEN ${SQL_CONDITIONS.SERVERS} THEN sys.ResourceID END) as totalServidores,
        
        -- Estatísticas detalhadas por SO
        ${SQL_OS_STATS.WINDOWS_11},
        ${SQL_OS_STATS.WINDOWS_10},
        ${SQL_OS_STATS.WINDOWS_8},
        ${SQL_OS_STATS.WINDOWS_7},
        ${SQL_OS_STATS.WINDOWS_XP},
        ${SQL_OS_STATS.SERVER_2022},
        ${SQL_OS_STATS.SERVER_2019},
        ${SQL_OS_STATS.SERVER_2016},
        ${SQL_OS_STATS.SERVER_2012},
        ${SQL_OS_STATS.SERVER_2008},
        
        COUNT(DISTINCT CASE 
            WHEN sys.Operating_System_Name_and0 NOT LIKE '%Windows%' 
                OR (sys.Operating_System_Name_and0 LIKE '%Windows%' 
                    AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 11%'
                    AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 10%'
                    AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 8%'
                    AND sys.Operating_System_Name_and0 NOT LIKE '%Windows 7%'
                    AND sys.Operating_System_Name_and0 NOT LIKE '%Windows XP%'
                    AND sys.Operating_System_Name_and0 NOT LIKE '%Server%')
            THEN sys.ResourceID 
        END) as outros,
        
        -- Contadores por tipo de dispositivo
        COUNT(DISTINCT CASE WHEN ${SQL_CONDITIONS.SERVERS} THEN sys.ResourceID END) as totalServidores,
        COUNT(DISTINCT CASE WHEN sys.Operating_System_Name_and0 LIKE '%Windows%' AND sys.Operating_System_Name_and0 NOT LIKE '%Server%' THEN sys.ResourceID END) as totalWorkstations
        
    FROM v_R_System sys
    WHERE ${SQL_CONDITIONS.ACTIVE_SYSTEMS}
`;

/**
 * Query para dispositivos completos
 */
const DEVICES_COMPLETE_QUERY = `
    ${DEVICE_BASE_INFO_QUERY}
    ORDER BY sys.Name0
`;

/**
 * Query para buscar dispositivo específico por ID ou nome
 */
const DEVICE_BY_ID_QUERY = `
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
        sys.SMS_Unique_Identifier0 AS smsId,
        sys.Netbios_Name0 AS netbiosName,
        sys.Distinguished_Name0 AS distinguishedName,
        sys.AD_Site_Name0 AS siteAD,
        sys.Client_Version0 AS versaoCliente,
        sys.Hardware_ID0 AS hardwareId,
        sys.SMBIOS_GUID0 AS smbiosGuid,
        usr.Full_User_Name0 AS nomeCompletoUtilizador,
        usr.Mail0 AS emailUtilizador,
        usr.Distinguished_Name0 AS distinguishedNameUtilizador,
        ${SQL_CASE_FIELDS.CONNECTION_STATUS},
        ${SQL_CASE_FIELDS.OS_STATUS},
        ${SQL_CASE_FIELDS.DEVICE_TYPE},
        CASE 
            WHEN 1 = 0 THEN 'Virtual'
            ELSE 'Físico'
        END AS tipoMaquina,
        ${SQL_CASE_FIELDS.CRITICALITY_STATUS}
    FROM System_DISC sys
    LEFT JOIN User_DISC usr ON sys.User_Name0 = usr.Unique_User_Name0
    WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
        AND (sys.ItemKey = ? OR sys.Name0 = ?)
`;

/**
 * Query para buscar MachineID de um dispositivo
 */
const DEVICE_MACHINE_ID_QUERY = `
    SELECT 
        s.MachineID,
        sd.ItemKey AS ResourceID,
        sd.Name0 AS nome
    FROM System_DISC sd
    INNER JOIN System_DATA s ON sd.Name0 = s.Name0
    WHERE sd.ItemKey = ?
`;

/**
 * Query para hardware de um dispositivo
 */
const DEVICE_HARDWARE_QUERY = `
    SELECT 
        csd.Manufacturer00 AS fabricante,
        csd.Model00 AS modelo,
        csd.SystemType00 AS tipoSistema,
        CAST(csd.TotalPhysicalMemory00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS ramGB,
        csd.NumberOfProcessors00 AS numeroProcessadores,
        csd.Name00 AS nomeComputador,
        csd.Domain00 AS dominioComputador,
        csd.UserName00 AS utilizadorComputador,
        csd.PrimaryOwnerName00 AS proprietarioPrimario,
        csd.PrimaryOwnerContact00 AS contatoProprietario
    FROM Computer_System_DATA csd
    WHERE csd.MachineID = ?
`;

/**
 * Query para processadores de um dispositivo
 */
const DEVICE_PROCESSOR_QUERY = `
    SELECT 
        pd.Name00 AS nomeProcessador,
        pd.Manufacturer00 AS fabricante,
        pd.NumberOfCores00 AS nucleos,
        pd.NumberOfLogicalProcessors00 AS threads,
        pd.MaxClockSpeed00 AS clockMaxMhz,
        pd.CurrentClockSpeed00 AS clockAtualMhz,
        pd.SocketDesignation00 AS socket
    FROM Processor_DATA pd
    WHERE pd.MachineID = ?
    ORDER BY pd.InstanceKey
`;

/**
 * Query para BIOS de um dispositivo
 */
const DEVICE_BIOS_QUERY = `
    SELECT 
        pb.Manufacturer00 AS fabricanteBios,
        pb.SMBIOSBIOSVersion00 AS versaoBios,
        CASE pb.SMBIOSMajorVersion00 
            WHEN 2 THEN 'SMBIOS 2.x'
            WHEN 3 THEN 'SMBIOS 3.x'
            ELSE 'Versão Desconhecida'
        END AS versaoSmbios
    FROM PC_BIOS_DATA pb
    WHERE pb.MachineID = ?
`;

/**
 * Query para discos de um dispositivo
 */
const DEVICE_DISK_QUERY = `
    SELECT 
        ld.DeviceID00 AS letra,
        ld.FileSystem00 AS sistemaArquivos,
        CAST(ld.Size00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS tamanhoTotalGB,
        CAST(ld.FreeSpace00 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS espacoLivreGB,
        CAST((ld.Size00 - ld.FreeSpace00) / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS espacoUsadoGB,
        CAST(((ld.Size00 - ld.FreeSpace00) * 100.0 / ld.Size00) AS DECIMAL(5,2)) AS percentualUsado
    FROM Logical_Disk_DATA ld
    WHERE ld.MachineID = ? AND ld.DriveType00 = 3
    ORDER BY ld.DeviceID00
`;

/**
 * Query para software de um dispositivo
 */
const DEVICE_SOFTWARE_QUERY = `
    SELECT 
        arp.DisplayName00 AS nome,
        arp.Version00 AS versao,
        arp.Publisher00 AS fabricante,
        arp.InstallDate00 AS dataInstalacao,
        arp.ProdID00 AS produtoId
    FROM Add_Remove_Programs_DATA arp
    WHERE arp.MachineID = ? AND arp.DisplayName00 IS NOT NULL
    ORDER BY arp.InstallDate00 DESC, arp.DisplayName00
    LIMIT ?
`;

/**
 * Query para updates de um dispositivo
 */
const DEVICE_UPDATES_QUERY = `
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
        END AS statusDescricao
    FROM Update_ComplianceStatus ucs
    JOIN CI_UpdateCIs uci ON ucs.CI_ID = uci.CI_ID
    LEFT JOIN CI_LocalizedProperties lp ON uci.CI_ID = lp.CI_ID AND lp.LocaleID = 1033
    WHERE ucs.MachineID = ?
    ORDER BY ucs.LastStatusCheckTime DESC, uci.Severity DESC
    LIMIT ?
`;

/**
 * Query para listar dispositivos simples (para relatórios)
 */
const SIMPLE_DEVICES_LIST_QUERY = `
    SELECT 
        sys.ResourceID as id,
        sys.Name0 as nome
    FROM v_R_System sys
    WHERE ${SQL_CONDITIONS.ACTIVE_SYSTEMS}
    ORDER BY sys.Name0 ASC
`;

// Queries relacionadas a updates
const updateQueries = {
    // Estatísticas de updates
    updateStats: `
        SELECT 
            -- Total de dispositivos
            COUNT(DISTINCT sys.ResourceID) as totalDispositivos,
            
            -- Dispositivos com updates necessários (usando MachineID)
            COUNT(DISTINCT CASE 
                WHEN ucs.Status IN (2, 3, 4, 5) 
                THEN sys.ResourceID 
            END) as totalDispositivosComUpdates,
            
            -- Dispositivos que necessitam updates (não instalados)
            COUNT(DISTINCT CASE 
                WHEN ucs.Status = 2 
                THEN sys.ResourceID 
            END) as dispositivosNecessitamUpdates,
            
            -- Updates não instalados
            COUNT(DISTINCT CASE 
                WHEN ucs.Status = 2 
                THEN ucs.CI_ID 
            END) as dispositivosNaoInstalados,
            
            -- Updates necessários (diversos status)
            COUNT(DISTINCT CASE 
                WHEN ucs.Status IN (2, 3) 
                THEN ucs.CI_ID 
            END) as dispositivosNecessarios,
            
            -- Dispositivos com falhas de update
            COUNT(DISTINCT CASE 
                WHEN ucs.Status = 4 OR ucs.LastErrorCode IS NOT NULL 
                THEN sys.ResourceID 
            END) as dispositivosComFalhas,
            
            -- Sistemas desatualizados (SO antigo)
            COUNT(DISTINCT CASE 
                WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                  OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                  OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                  OR sys.Operating_System_Name_and0 LIKE '%2008%'
                  OR sys.Operating_System_Name_and0 LIKE '%2012%'
                THEN sys.ResourceID 
            END) as sistemasDesatualizados,
            
            -- Dispositivos offline
            COUNT(DISTINCT CASE 
                WHEN sys.Client0 != 1 
                THEN sys.ResourceID 
            END) as sistemasOffline
        FROM v_R_System sys
        LEFT JOIN System_DISC disc ON sys.ResourceID = disc.ItemKey
        LEFT JOIN System_DATA sd ON disc.Name0 = sd.Name0
        LEFT JOIN v_UpdateComplianceStatus ucs ON ucs.ResourceID = sd.MachineID
        WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
    `,

    // Dispositivos com updates pendentes
    devicesWithUpdates: `
        SELECT DISTINCT
            sys.ResourceID,
            sys.Name0 as ComputerName,
            sd.MachineID,
            sys.Operating_System_Name_and0 as OperatingSystem,
            sys.Client0 as ClientStatus,
            sys.Last_Logon_Timestamp0 as LastLogon,
            COUNT(DISTINCT ucs.CI_ID) as TotalUpdates,
            COUNT(DISTINCT CASE WHEN ucs.Status = 2 THEN ucs.CI_ID END) as UpdatesPendentes,
            COUNT(DISTINCT CASE WHEN ucs.Status = 4 THEN ucs.CI_ID END) as UpdatesFalharam,
            MAX(ucs.LastStatusCheckTime) as UltimaVerificacao,
            CASE 
                WHEN sys.Client0 != 1 THEN 'Offline'
                WHEN COUNT(DISTINCT CASE WHEN ucs.Status = 4 THEN ucs.CI_ID END) > 0 THEN 'Com Falhas'
                WHEN COUNT(DISTINCT CASE WHEN ucs.Status = 2 THEN ucs.CI_ID END) > 5 THEN 'Muitos Updates Pendentes'
                WHEN COUNT(DISTINCT CASE WHEN ucs.Status = 2 THEN ucs.CI_ID END) > 0 THEN 'Updates Pendentes'
                WHEN sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                  OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                  OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                THEN 'SO Desatualizado'
                ELSE 'Atualizado'
            END as StatusUpdate
        FROM v_R_System sys
        LEFT JOIN System_DISC disc ON sys.ResourceID = disc.ItemKey
        LEFT JOIN System_DATA sd ON disc.Name0 = sd.Name0
        LEFT JOIN v_UpdateComplianceStatus ucs ON ucs.ResourceID = sd.MachineID
        WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
            AND (
                ucs.Status IN (2, 3, 4, 5) 
                OR sys.Client0 != 1
                OR sys.Operating_System_Name_and0 LIKE '%Windows 7%' 
                OR sys.Operating_System_Name_and0 LIKE '%Windows 8%' 
                OR sys.Operating_System_Name_and0 LIKE '%Windows XP%'
                OR sys.Operating_System_Name_and0 LIKE '%2008%'
                OR sys.Operating_System_Name_and0 LIKE '%2012%'
            )
        GROUP BY sys.ResourceID, sys.Name0, sys.Operating_System_Name_and0, 
                 sys.Client0, sys.Last_Logon_Timestamp0, sd.MachineID
        ORDER BY 
            CASE 
                WHEN sys.Client0 != 1 THEN 1
                WHEN COUNT(DISTINCT CASE WHEN ucs.Status = 4 THEN ucs.CI_ID END) > 0 THEN 2
                WHEN COUNT(DISTINCT CASE WHEN ucs.Status = 2 THEN ucs.CI_ID END) > 5 THEN 3
                ELSE 4
            END,
            TotalUpdates DESC
    `,

    // Dispositivos críticos
    criticalDevices: `
        SELECT 
            ResourceID,
            ComputerName,
            MachineID,
            OperatingSystem,
            ClientStatus,
            LastLogon,
            TotalUpdates,
            UpdatesPendentes,
            UpdatesFalharam,
            UltimaVerificacao,
            CASE 
                WHEN ClientStatus != 1 THEN 'Offline'
                WHEN UpdatesFalharam > 0 THEN 'Com Falhas'
                WHEN UpdatesPendentes > 10 THEN 'Muitos Updates Pendentes'
                WHEN OperatingSystem LIKE '%Windows 7%' 
                  OR OperatingSystem LIKE '%Windows 8%' 
                  OR OperatingSystem LIKE '%Windows XP%'
                THEN 'SO Desatualizado'
                ELSE 'Crítico'
            END as StatusUpdate
        FROM (
            SELECT DISTINCT
                sys.ResourceID,
                sys.Name0 as ComputerName,
                sd.MachineID,
                sys.Operating_System_Name_and0 as OperatingSystem,
                sys.Client0 as ClientStatus,
                sys.Last_Logon_Timestamp0 as LastLogon,
                COUNT(DISTINCT ucs.CI_ID) as TotalUpdates,
                COUNT(DISTINCT CASE WHEN ucs.Status = 2 THEN ucs.CI_ID END) as UpdatesPendentes,
                COUNT(DISTINCT CASE WHEN ucs.Status = 4 THEN ucs.CI_ID END) as UpdatesFalharam,
                MAX(ucs.LastStatusCheckTime) as UltimaVerificacao
            FROM v_R_System sys
            LEFT JOIN System_DISC disc ON sys.ResourceID = disc.ItemKey
            LEFT JOIN System_DATA sd ON disc.Name0 = sd.Name0
            LEFT JOIN v_UpdateComplianceStatus ucs ON ucs.ResourceID = sd.MachineID
            WHERE sys.Obsolete0 = 0 AND sys.Decommissioned0 = 0
            GROUP BY sys.ResourceID, sys.Name0, sys.Operating_System_Name_and0, 
                     sys.Client0, sys.Last_Logon_Timestamp0, sd.MachineID
        ) as dispositivos_stats
        WHERE 
            ClientStatus != 1
            OR UpdatesFalharam > 0
            OR UpdatesPendentes > 10
            OR OperatingSystem LIKE '%Windows 7%' 
            OR OperatingSystem LIKE '%Windows 8%' 
            OR OperatingSystem LIKE '%Windows XP%'
        ORDER BY 
            CASE 
                WHEN ClientStatus != 1 THEN 1
                WHEN UpdatesFalharam > 0 THEN 2
                WHEN UpdatesPendentes > 10 THEN 3
                ELSE 4
            END,
            TotalUpdates DESC
        LIMIT 15
    `,
};

module.exports = {
    DASHBOARD_STATS_QUERY,
    DASHBOARD_USERS_QUERY,
    DASHBOARD_CRITICAL_DEVICES_QUERY,
    DEVICE_BASE_INFO_QUERY,
    DEVICES_STATS_QUERY,
    DEVICES_COMPLETE_QUERY,
    DEVICE_BY_ID_QUERY,
    DEVICE_MACHINE_ID_QUERY,
    DEVICE_HARDWARE_QUERY,
    DEVICE_PROCESSOR_QUERY,
    DEVICE_BIOS_QUERY,
    DEVICE_DISK_QUERY,
    DEVICE_SOFTWARE_QUERY,
    DEVICE_UPDATES_QUERY,
    SIMPLE_DEVICES_LIST_QUERY,
    updateQueries,
};
