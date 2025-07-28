
-- ===============================
-- SCCM Useful Views - SQL Queries
-- ===============================

-- 🖥️ DISPOSITIVOS (COMPUTADORES)

-- 1. Listar todos os dispositivos com informações básicas
SELECT Name0, Operating_System_Name_and0, Client0, User_Name0, Resource_Domain_OR_Workgr0
FROM v_R_System
ORDER BY Name0;
-- okay

-- 2. Ver dispositivos co-gerenciados (SCCM + Intune)
SELECT MachineID, ClientState, TenantID
FROM v_CombinedDeviceResources;
-- tem que ser trabalhada


-- 👤 UTILIZADORES

-- 3. Listar todos os utilizadores
SELECT Unique_User_Name0, Full_User_Name0, Windows_NT_Domain0
FROM v_R_User;
-- okay

-- 4. Dispositivos principais por utilizador
SELECT 
    sys.Name0 AS DeviceName,
    sys.User_Name0 AS LastLoggedOnUser,
    u.Full_User_Name0,
    u.Unique_User_Name0
FROM v_R_System sys
LEFT JOIN v_R_User u ON sys.User_Name0 = u.Unique_User_Name0
ORDER BY u.Full_User_Name0;
-- okay



-- 🔧 INVENTÁRIO DE SOFTWARE & HARDWARE

-- 5. Listar software instalado
SELECT 
    sys.Name0 AS DeviceName,
    arp.DisplayName0,
    arp.Version0
FROM v_GS_ADD_REMOVE_PROGRAMS arp
JOIN v_R_System sys ON arp.ResourceID = sys.ResourceID
WHERE arp.DisplayName0 IS NOT NULL
ORDER BY sys.Name0, arp.DisplayName0;
-- okay

-- 6. Ver hardware de um dispositivo (fabricante, modelo, RAM)
SELECT 
    cs.Name0 AS DeviceName,
    cs.Manufacturer0,
    cs.Model0,
    CAST(cs.TotalPhysicalMemory0 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS RAM_GB,
    ld.DeviceID0 AS DriveLetter,
    CAST(ld.Size0 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS TotalDisk_GB,
    CAST(ld.FreeSpace0 / 1024 / 1024 / 1024 AS DECIMAL(10,2)) AS FreeDisk_GB
FROM v_GS_COMPUTER_SYSTEM cs
JOIN v_GS_LOGICAL_DISK ld ON cs.ResourceID = ld.ResourceID
WHERE ld.DriveType0 = 3
ORDER BY cs.Name0, ld.DeviceID0;
-- okay


-- 🔄 ESTADO DO CLIENTE SCCM

-- 7. Resumo de clientes (ativo, inativo, estado de remediação)
SELECT ResourceID, ClientActiveStatus, ClientRemediationStatus
FROM v_CH_ClientSummary;
-- tem que ser trabalhada


-- 🛡️ UPDATES E PATCHES

-- 8. Ver estado de updates por dispositivo
SELECT 
    sys.Name0 AS DeviceName,
    ui.ArticleID,
    ui.Title,
    ucs.Status,
    ucs.LastStatusCheckTime
FROM v_UpdateComplianceStatus ucs
JOIN v_UpdateInfo ui ON ucs.CI_ID = ui.CI_ID
JOIN v_R_System sys ON ucs.ResourceID = sys.ResourceID
ORDER BY sys.Name0, ui.ArticleID;
-- okay


-- 🌍 ACTIVE DIRECTORY / AAD

-- 9. Ver grupos de AD associados a cada máquina
SELECT ResourceID, System_Group_Name0
FROM v_RA_System_SystemGroupName;
-- okay

-- 🧪 MONITORAMENTO & ESTADO

-- 10. Ver data do último inventário bem-sucedido
SELECT ResourceID, LastScanTime
FROM v_GS_LAST_SUCCESSFUL_SCAN;

-- 12. Estado do antivírus / Endpoint Protection
SELECT Name, AMServiceEnabled, AntispywareEnabled, AntivirusEnabled
FROM v_EndpointProtectionStatus;

-- FIM DAS QUERIES
