-- =================================================================
-- SCRIPT PARA INSERIR DADOS FICTÍCIOS COMPLETOS 
-- Base de dados: CM_900_CLONE (SCCM Clone)
-- Objetivo: Preencher todos os campos visíveis na página de detalhes
-- =================================================================

USE CM_900_CLONE;

-- Limpar dados existentes (opcional - descomente se necessário)
-- ATENÇÃO: Execute na ordem correta para respeitar constraints de FK
-- DELETE FROM Update_ComplianceStatus;
-- DELETE FROM CI_LocalizedProperties;
-- DELETE FROM CI_UpdateCIs;
-- DELETE FROM CI_ConfigurationItems;
-- DELETE FROM CI_Models WHERE ModelName LIKE 'Microsoft Update Model%';
-- DELETE FROM Add_Remove_Programs_DATA;
-- DELETE FROM Processor_DATA WHERE MachineID BETWEEN 16777300 AND 16777303;
-- DELETE FROM PC_BIOS_DATA WHERE MachineID BETWEEN 16777300 AND 16777303;
-- DELETE FROM Logical_Disk_DATA;
-- DELETE FROM Computer_System_DATA;
-- DELETE FROM System_DATA;
-- DELETE FROM MachineIdGroupXRef WHERE MachineID BETWEEN 16777300 AND 16777303;
-- DELETE FROM User_DISC WHERE ItemKey BETWEEN 2001 AND 2004;
-- DELETE FROM System_DISC WHERE ItemKey BETWEEN 1001 AND 1004;

-- =================================================================
-- 1. DISPOSITIVOS PRINCIPAIS (System_DISC / v_R_System)
-- =================================================================

-- Dispositivo 1: Workstation Windows 11 (Online)
INSERT INTO System_DISC (
    ItemKey, SMS_Unique_Identifier0, Netbios_Name0, Name0, Distinguished_Name0,
    Operating_System_Name_and0, Resource_Domain_OR_Workgr0, Full_Domain_Name0,
    AD_Site_Name0, User_Name0, Client0, Client_Type0, AgentEdition0,
    Client_Version0, Hardware_ID0, Creation_Date0, SMBIOS_GUID0,
    Obsolete0, Active0, Decommissioned0, DeviceOwner0, Unknown0
) VALUES (
    1001, 'GUID:A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'DEV-USER01', 'DEV-USER01',
    'CN=DEV-USER01,OU=Workstations,DC=empresa,DC=local',
    'Microsoft Windows 11 Enterprise', 'EMPRESA', 'empresa.local',
    'Sede-Lisboa', 'EMPRESA\\joao.silva', 1, 1, 0,
    '5.00.9078.1000', '2:D4C3B21A109876543210FEDCBA987654321', NOW(), 
    '{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}',
    0, 1, 0, 1, 0
);

-- Dispositivo 2: Workstation Windows 10 (Offline - crítico)
INSERT INTO System_DISC (
    ItemKey, SMS_Unique_Identifier0, Netbios_Name0, Name0, Distinguished_Name0,
    Operating_System_Name_and0, Resource_Domain_OR_Workgr0, Full_Domain_Name0,
    AD_Site_Name0, User_Name0, Client0, Client_Type0, AgentEdition0,
    Client_Version0, Hardware_ID0, Creation_Date0, SMBIOS_GUID0,
    Obsolete0, Active0, Decommissioned0, DeviceOwner0, Unknown0
) VALUES (
    1002, 'GUID:B2C3D4E5-F6G7-8901-BCDE-F21345678901', 'LAB-PC02', 'LAB-PC02',
    'CN=LAB-PC02,OU=Laboratório,DC=empresa,DC=local',
    'Microsoft Windows 10 Pro', 'EMPRESA', 'empresa.local',
    'Filial-Porto', 'EMPRESA\\maria.santos', 0, 1, 0,
    '5.00.9040.1000', '2:E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', NOW(), 
    '{B2C3D4E5-F6G7-8901-BCDE-F21345678901}',
    0, 1, 0, 1, 0
);

-- Dispositivo 3: Servidor Windows Server 2022 (Online)
INSERT INTO System_DISC (
    ItemKey, SMS_Unique_Identifier0, Netbios_Name0, Name0, Distinguished_Name0,
    Operating_System_Name_and0, Resource_Domain_OR_Workgr0, Full_Domain_Name0,
    AD_Site_Name0, User_Name0, Client0, Client_Type0, AgentEdition0,
    Client_Version0, Hardware_ID0, Creation_Date0, SMBIOS_GUID0,
    Obsolete0, Active0, Decommissioned0, DeviceOwner0, Unknown0
) VALUES (
    1003, 'GUID:C3D4E5F6-G7H8-9012-CDEF-321456789012', 'SRV-DC01', 'SRV-DC01',
    'CN=SRV-DC01,OU=Servers,DC=empresa,DC=local',
    'Microsoft Windows Server 2022 Standard', 'EMPRESA', 'empresa.local',
    'DataCenter-Lisboa', 'EMPRESA\\admin.sistema', 1, 1, 0,
    '5.00.9078.1000', '2:F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2', NOW(), 
    '{C3D4E5F6-G7H8-9012-CDEF-321456789012}',
    0, 1, 0, 1, 0
);

-- Dispositivo 4: Workstation Windows 7 (Desatualizada - crítica)
INSERT INTO System_DISC (
    ItemKey, SMS_Unique_Identifier0, Netbios_Name0, Name0, Distinguished_Name0,
    Operating_System_Name_and0, Resource_Domain_OR_Workgr0, Full_Domain_Name0,
    AD_Site_Name0, User_Name0, Client0, Client_Type0, AgentEdition0,
    Client_Version0, Hardware_ID0, Creation_Date0, SMBIOS_GUID0,
    Obsolete0, Active0, Decommissioned0, DeviceOwner0, Unknown0
) VALUES (
    1004, 'GUID:D4E5F6G7-H8I9-0123-DEFG-432567890123', 'OLD-PC04', 'OLD-PC04',
    'CN=OLD-PC04,OU=Legacy,DC=empresa,DC=local',
    'Microsoft Windows 7 Professional Service Pack 1', 'EMPRESA', 'empresa.local',
    'Filial-Braga', 'EMPRESA\\carlos.costa', 1, 1, 0,
    '5.00.8239.1000', '2:G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3', NOW(), 
    '{D4E5F6G7-H8I9-0123-DEFG-432567890123}',
    0, 1, 0, 1, 0
);

-- =================================================================
-- 2. UTILIZADORES (User_DISC / v_R_User) 
-- =================================================================

INSERT INTO User_DISC (
    ItemKey, Unique_User_Name0, Full_User_Name0, Mail0, Distinguished_Name0,
    Windows_NT_Domain0, User_Principal_Name0, Creation_Date0
) VALUES 
(2001, 'EMPRESA\\joao.silva', 'João Silva', 'joao.silva@empresa.local', 
 'CN=João Silva,OU=Utilizadores,DC=empresa,DC=local', 'EMPRESA', 
 'joao.silva@empresa.local', NOW()),

(2002, 'EMPRESA\\maria.santos', 'Maria Santos', 'maria.santos@empresa.local', 
 'CN=Maria Santos,OU=Utilizadores,DC=empresa,DC=local', 'EMPRESA', 
 'maria.santos@empresa.local', NOW()),

(2003, 'EMPRESA\\admin.sistema', 'Administrador do Sistema', 'admin.sistema@empresa.local', 
 'CN=Administrador Sistema,OU=Admins,DC=empresa,DC=local', 'EMPRESA', 
 'admin.sistema@empresa.local', NOW()),

(2004, 'EMPRESA\\carlos.costa', 'Carlos Costa', 'carlos.costa@empresa.local', 
 'CN=Carlos Costa,OU=Utilizadores,DC=empresa,DC=local', 'EMPRESA', 
 'carlos.costa@empresa.local', NOW());

-- =================================================================
-- 3. HARDWARE (System_DATA e Computer_System_DATA / v_GS_COMPUTER_SYSTEM)
-- =================================================================

-- Primeiro inserir em MachineIdGroupXRef (tabela raiz da hierarquia)
INSERT INTO MachineIdGroupXRef (MachineID, ArchitectureKey, GroupKey, GUID)
VALUES 
    (16777300, 1, 10, 'GUID-DEV-USER01-001'),
    (16777301, 2, 20, 'GUID-LAB-PC02-002'),
    (16777302, 3, 30, 'GUID-SRV-DC01-003'),
    (16777303, 10, 100, 'GUID-OLD-PC04-004');

-- Depois inserir registos base em System_DATA (referencia MachineIdGroupXRef)
INSERT INTO System_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    Name0, Domain0, SystemRole0, SystemType0
) VALUES 
(16777300, 1, 1, 1, NOW(), 'DEV-USER01', 'empresa.local', 'Workstation', 'x64-based PC'),
(16777301, 1, 1, 1, NOW(), 'LAB-PC02', 'empresa.local', 'Workstation', 'x64-based PC'),
(16777302, 1, 1, 1, NOW(), 'SRV-DC01', 'empresa.local', 'Server', 'x64-based PC'),
(16777303, 1, 1, 1, NOW(), 'OLD-PC04', 'empresa.local', 'Workstation', 'x64-based PC');

-- Por fim inserir hardware detalhado em Computer_System_DATA (referencia System_DATA)
-- Hardware para DEV-USER01 (Windows 11)
INSERT INTO Computer_System_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey, 
    Manufacturer00, Model00, SystemType00, TotalPhysicalMemory00, 
    NumberOfProcessors00, Name00, Domain00, UserName00,
    PrimaryOwnerName00, PrimaryOwnerContact00, Description00,
    ThermalState00, PowerState00, WakeUpType00
) VALUES (
    16777300, 1, 1, 1, NOW(),
    'Dell Inc.', 'OptiPlex 7090', 'x64-based PC', 17179869184, -- 16GB RAM
    1, 'DEV-USER01', 'empresa.local', 'EMPRESA\\joao.silva',
    'João Silva', 'joao.silva@empresa.local', 'Workstation de desenvolvimento',
    3, 0, 6
);

-- Hardware para LAB-PC02 (Windows 10)  
INSERT INTO Computer_System_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey, 
    Manufacturer00, Model00, SystemType00, TotalPhysicalMemory00, 
    NumberOfProcessors00, Name00, Domain00, UserName00,
    PrimaryOwnerName00, PrimaryOwnerContact00, Description00,
    ThermalState00, PowerState00, WakeUpType00
) VALUES (
    16777301, 1, 1, 1, NOW(),
    'HP', 'EliteDesk 800 G5', 'x64-based PC', 8589934592, -- 8GB RAM
    1, 'LAB-PC02', 'empresa.local', 'EMPRESA\\maria.santos',
    'Maria Santos', 'maria.santos@empresa.local', 'PC do laboratório',
    3, 0, 6
);

-- Hardware para SRV-DC01 (Windows Server 2022)
INSERT INTO Computer_System_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey, 
    Manufacturer00, Model00, SystemType00, TotalPhysicalMemory00, 
    NumberOfProcessors00, Name00, Domain00, UserName00,
    PrimaryOwnerName00, PrimaryOwnerContact00, Description00,
    ThermalState00, PowerState00, WakeUpType00
) VALUES (
    16777302, 1, 1, 1, NOW(),
    'HPE', 'ProLiant DL380 Gen10', 'x64-based PC', 68719476736, -- 64GB RAM
    2, 'SRV-DC01', 'empresa.local', 'EMPRESA\\admin.sistema',
    'Administrador do Sistema', 'admin.sistema@empresa.local', 'Servidor de domínio principal',
    3, 0, 6
);

-- Hardware para OLD-PC04 (Windows 7)
INSERT INTO Computer_System_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey, 
    Manufacturer00, Model00, SystemType00, TotalPhysicalMemory00, 
    NumberOfProcessors00, Name00, Domain00, UserName00,
    PrimaryOwnerName00, PrimaryOwnerContact00, Description00,
    ThermalState00, PowerState00, WakeUpType00
) VALUES (
    16777303, 1, 1, 1, NOW(),
    'Lenovo', 'ThinkCentre M58p', 'x64-based PC', 4294967296, -- 4GB RAM
    1, 'OLD-PC04', 'empresa.local', 'EMPRESA\\carlos.costa',
    'Carlos Costa', 'carlos.costa@empresa.local', 'PC legado para tarefas básicas',
    3, 0, 6
);

-- =================================================================
-- 4. DISCOS LÓGICOS (Logical_Disk_DATA / v_GS_LOGICAL_DISK)
-- =================================================================

-- Discos DEV-USER01 (C: e D:)
INSERT INTO Logical_Disk_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DeviceID00, DriveType00, FileSystem00, Size00, FreeSpace00,
    VolumeName00, VolumeSerialNumber00, Compressed00,
    Description00, MediaType00, SupportsFileBasedCompression00
) VALUES 
(16777300, 1, 1, 1, NOW(), 'C:', 3, 'NTFS', 536870912000, 214748364800, 
 'Sistema', 'A4B5C6D7', 0, 'Disco fixo local', 12, 1),
(16777300, 2, 1, 1, NOW(), 'D:', 3, 'NTFS', 1073741824000, 858993459200,
 'Dados', 'E8F9G0H1', 0, 'Disco fixo local', 12, 1);

-- Discos LAB-PC02 (C: apenas)
INSERT INTO Logical_Disk_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DeviceID00, DriveType00, FileSystem00, Size00, FreeSpace00,
    VolumeName00, VolumeSerialNumber00, Compressed00,
    Description00, MediaType00, SupportsFileBasedCompression00
) VALUES 
(16777301, 1, 1, 1, NOW(), 'C:', 3, 'NTFS', 268435456000, 107374182400,
 'Sistema', 'I2J3K4L5', 0, 'Disco fixo local', 12, 1);

-- Discos SRV-DC01 (C:, D:, E:)
INSERT INTO Logical_Disk_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DeviceID00, DriveType00, FileSystem00, Size00, FreeSpace00,
    VolumeName00, VolumeSerialNumber00, Compressed00,
    Description00, MediaType00, SupportsFileBasedCompression00
) VALUES 
(16777302, 1, 1, 1, NOW(), 'C:', 3, 'NTFS', 268435456000, 161061273600,
 'Sistema', 'M6N7O8P9', 0, 'Disco fixo local', 12, 1),
(16777302, 2, 1, 1, NOW(), 'D:', 3, 'NTFS', 2147483648000, 1288490188800,
 'Dados', 'Q0R1S2T3', 0, 'Disco fixo local', 12, 1),
(16777302, 3, 1, 1, NOW(), 'E:', 3, 'NTFS', 1073741824000, 858993459200,
 'Backups', 'U4V5W6X7', 0, 'Disco fixo local', 12, 1);

-- Discos OLD-PC04 (C: apenas, pequeno)
INSERT INTO Logical_Disk_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DeviceID00, DriveType00, FileSystem00, Size00, FreeSpace00,
    VolumeName00, VolumeSerialNumber00, Compressed00,
    Description00, MediaType00, SupportsFileBasedCompression00
) VALUES 
(16777303, 1, 1, 1, NOW(), 'C:', 3, 'NTFS', 160049152000, 32009830400,
 'Sistema', 'Y8Z9A0B1', 0, 'Disco fixo local', 12, 1);

-- =================================================================
-- 5. INFORMAÇÕES DA BIOS (PC_BIOS_DATA / v_GS_PC_BIOS)
-- =================================================================

-- BIOS DEV-USER01 (Dell OptiPlex 7090 - BIOS moderno)
INSERT INTO PC_BIOS_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    BiosCharacteristics00, BIOSVersion00, BuildNumber00, Caption00, CodeSet00,
    CurrentLanguage00, Description00, IdentificationCode00, InstallableLanguages00,
    InstallDate00, LanguageEdition00, ListOfLanguages00, Manufacturer00, Name00,
    OtherTargetOS00, PrimaryBIOS00, ReleaseDate00, SerialNumber00, SMBIOSBIOSVersion00,
    SMBIOSMajorVersion00, SMBIOSMinorVersion00, SMBIOSPresent00, SoftwareElementID00,
    SoftwareElementState00, Status00, TargetOperatingSystem00, Version00
) VALUES (
    16777300, 1, 1, 1, NOW(),
    '7,9,11,12,14,15,16,19,20,21,22,23,24,25,26,27,28,29,30,32,33,40,41,42,43,44,45,46,47,48', 
    'DELL   - 1072009', '1072009', 'Default System BIOS', 'UTF-8',
    'en-US', 'BIOS Date: 01/15/2024 14:30:15 Ver: 2.18.0', 'Dell Inc.',
    1, '2024-01-15 14:30:15', 'en-US', 'en-US,pt-PT,es-ES,fr-FR,de-DE',
    'Dell Inc.', 'Default System BIOS', 'Microsoft Windows 11',
    1, '2024-01-15 14:30:15', 'BVDK579P', '2.18.0',
    2, 18, 1, 'Ver: 2.18.0',
    4, 'OK', 64, 'DELL   - 1072009'
);

-- BIOS LAB-PC02 (HP EliteDesk 800 G5 - BIOS padrão)
INSERT INTO PC_BIOS_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    BiosCharacteristics00, BIOSVersion00, BuildNumber00, Caption00, CodeSet00,
    CurrentLanguage00, Description00, IdentificationCode00, InstallableLanguages00,
    InstallDate00, LanguageEdition00, ListOfLanguages00, Manufacturer00, Name00,
    OtherTargetOS00, PrimaryBIOS00, ReleaseDate00, SerialNumber00, SMBIOSBIOSVersion00,
    SMBIOSMajorVersion00, SMBIOSMinorVersion00, SMBIOSPresent00, SoftwareElementID00,
    SoftwareElementState00, Status00, TargetOperatingSystem00, Version00
) VALUES (
    16777301, 1, 1, 1, NOW(),
    '4,7,9,10,11,12,14,15,16,17,19,20,22,23,24,25,26,27,28,32,33,39,40,41,42', 
    'HP - 02.12.00', '02.12.00', 'HP BIOS', 'UTF-8',
    'en-US', 'BIOS Date: 06/15/2023 10:45:30 Ver: 02.12.00', 'HP',
    1, '2023-06-15 10:45:30', 'en-US', 'en-US,pt-PT,es-ES,fr-FR',
    'HP', 'HP BIOS', 'Microsoft Windows 10',
    1, '2023-06-15 10:45:30', 'CZC021P4GM', '02.12.00',
    2, 12, 1, 'Ver: 02.12.00',
    4, 'OK', 64, 'HP - 02.12.00'
);

-- BIOS SRV-DC01 (HPE ProLiant DL380 Gen10 - BIOS de servidor)
INSERT INTO PC_BIOS_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    BiosCharacteristics00, BIOSVersion00, BuildNumber00, Caption00, CodeSet00,
    CurrentLanguage00, Description00, IdentificationCode00, InstallableLanguages00,
    InstallDate00, LanguageEdition00, ListOfLanguages00, Manufacturer00, Name00,
    OtherTargetOS00, PrimaryBIOS00, ReleaseDate00, SerialNumber00, SMBIOSBIOSVersion00,
    SMBIOSMajorVersion00, SMBIOSMinorVersion00, SMBIOSPresent00, SoftwareElementID00,
    SoftwareElementState00, Status00, TargetOperatingSystem00, Version00
) VALUES (
    16777302, 1, 1, 1, NOW(),
    '4,7,8,9,10,11,12,14,15,16,17,19,20,21,22,23,24,25,26,27,28,29,30,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48', 
    'HPE - U32 v2.74', 'U32 v2.74', 'HPE System ROM', 'UTF-8',
    'en-US', 'BIOS Date: 11/20/2023 16:22:45 Ver: U32 v2.74', 'HPE',
    1, '2023-11-20 16:22:45', 'en-US', 'en-US,pt-PT,es-ES,fr-FR,de-DE,ja-JP',
    'HPE', 'HPE System ROM', 'Microsoft Windows Server 2022',
    1, '2023-11-20 16:22:45', 'MXQ23400KP', 'U32 v2.74 (10/12/2023)',
    3, 14, 1, 'Ver: U32 v2.74',
    4, 'OK', 64, 'HPE - U32 v2.74'
);

-- BIOS OLD-PC04 (Lenovo ThinkCentre M58p - BIOS antigo)
INSERT INTO PC_BIOS_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    BiosCharacteristics00, BIOSVersion00, BuildNumber00, Caption00, CodeSet00,
    CurrentLanguage00, Description00, IdentificationCode00, InstallableLanguages00,
    InstallDate00, LanguageEdition00, ListOfLanguages00, Manufacturer00, Name00,
    OtherTargetOS00, PrimaryBIOS00, ReleaseDate00, SerialNumber00, SMBIOSBIOSVersion00,
    SMBIOSMajorVersion00, SMBIOSMinorVersion00, SMBIOSPresent00, SoftwareElementID00,
    SoftwareElementState00, Status00, TargetOperatingSystem00, Version00
) VALUES (
    16777303, 1, 1, 1, NOW(),
    '4,7,9,10,11,12,14,15,16,19,20,22,23,24,25,26,27,28,32,33,40', 
    'LENOVO - 5CKT51AUS', '5CKT51AUS', 'LENOVO BIOS', 'UTF-8',
    'en-US', 'BIOS Date: 03/18/2019 09:15:20 Ver: 5CKT51AUS', 'LENOVO',
    1, '2019-03-18 09:15:20', 'en-US', 'en-US,pt-PT',
    'LENOVO', 'LENOVO BIOS', 'Microsoft Windows 7',
    1, '2019-03-18 09:15:20', 'S4M9CK7', '5CKT51AUS',
    2, 6, 1, 'Ver: 5CKT51AUS',
    4, 'OK', 32, 'LENOVO - 5CKT51AUS'
);

-- =================================================================
-- 6. INFORMAÇÕES DO PROCESSADOR (Processor_DATA / v_GS_PROCESSOR)
-- =================================================================

-- Processador DEV-USER01 (Intel Core i7-11700 - moderno)
INSERT INTO Processor_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    Is64Bit00, MaxClockSpeed00, AddressWidth00, Architecture00, Availability00,
    BrandID00, Caption00, ConfigManagerErrorCode00, ConfigManagerUserConfig00,
    CPUHash00, CPUKey00, CpuStatus00, CurrentClockSpeed00, CurrentVoltage00,
    DataWidth00, Description00, DeviceID00, ErrorCleared00, ErrorDescription00,
    ExtClock00, Family00, InstallDate00, IsHyperthreadCapable00, IsHyperthreadEnabled00,
    IsMobile00, IsTrustedExecutionCapable00, IsVitualizationCapable00, L2CacheSize00,
    L2CacheSpeed00, L3CacheSize00, L3CacheSpeed00, LastErrorCode00, Level00,
    LoadPercentage00, Manufacturer00, Name00, NormSpeed00, NumberOfCores00,
    NumberOfLogicalProcessors00, OtherFamilyDescription00, PartOfDomain00, PCache00,
    PNPDeviceID00, PowerManagementCapabilities00, PowerManagementSupported00,
    ProcessorId00, ProcessorType00, Revision00, Role00, SocketDesignation00,
    Status00, StatusInfo00, Stepping00, SystemName00, UniqueId00, UpgradeMethod00,
    Version00, VoltageCaps00, Workgroup00
) VALUES (
    16777300, 1, 1, 1, NOW(),
    1, 4900, 64, 9, 3,
    8, 'Intel64 Family 6 Model 167 Stepping 1', 0, 0,
    'CPUID_8086_A7_01', 'CPU0', 1, 2900, 1200,
    64, 'Intel64 Family 6 Model 167 Stepping 1', 'CPU0', 0, NULL,
    100, 198, NULL, 1, 1,
    0, 1, 1, 512,
    2900, 16384, 2900, 0, 6,
    15, 'GenuineIntel', 'Intel(R) Core(TM) i7-11700 @ 2.90GHz', 2900, 8,
    16, NULL, 1, 512,
    'ACPI\\GENUINEINTEL_-_X86_FAMILY_6_MODEL_167\\_0', '1,2,3,4,5', 1,
    'BFEBFBFF000A0671', 3, 2689, 'CPU', 'U3E1',
    'OK', 3, '1', 'DEV-USER01', 'BFEBFBFF000A0671', 2,
    'Model 167, Stepping 1', 5, 'EMPRESA'
);

-- Processador LAB-PC02 (Intel Core i5-9500 - padrão)
INSERT INTO Processor_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    Is64Bit00, MaxClockSpeed00, AddressWidth00, Architecture00, Availability00,
    BrandID00, Caption00, ConfigManagerErrorCode00, ConfigManagerUserConfig00,
    CPUHash00, CPUKey00, CpuStatus00, CurrentClockSpeed00, CurrentVoltage00,
    DataWidth00, Description00, DeviceID00, ErrorCleared00, ErrorDescription00,
    ExtClock00, Family00, InstallDate00, IsHyperthreadCapable00, IsHyperthreadEnabled00,
    IsMobile00, IsTrustedExecutionCapable00, IsVitualizationCapable00, L2CacheSize00,
    L2CacheSpeed00, L3CacheSize00, L3CacheSpeed00, LastErrorCode00, Level00,
    LoadPercentage00, Manufacturer00, Name00, NormSpeed00, NumberOfCores00,
    NumberOfLogicalProcessors00, OtherFamilyDescription00, PartOfDomain00, PCache00,
    PNPDeviceID00, PowerManagementCapabilities00, PowerManagementSupported00,
    ProcessorId00, ProcessorType00, Revision00, Role00, SocketDesignation00,
    Status00, StatusInfo00, Stepping00, SystemName00, UniqueId00, UpgradeMethod00,
    Version00, VoltageCaps00, Workgroup00
) VALUES (
    16777301, 1, 1, 1, NOW(),
    1, 4400, 64, 9, 3,
    8, 'Intel64 Family 6 Model 158 Stepping 10', 0, 0,
    'CPUID_8086_9E_0A', 'CPU0', 1, 3000, 1200,
    64, 'Intel64 Family 6 Model 158 Stepping 10', 'CPU0', 0, NULL,
    100, 198, NULL, 0, 0,
    0, 1, 1, 256,
    3000, 9216, 3000, 0, 6,
    8, 'GenuineIntel', 'Intel(R) Core(TM) i5-9500 @ 3.00GHz', 3000, 6,
    6, NULL, 1, 256,
    'ACPI\\GENUINEINTEL_-_X86_FAMILY_6_MODEL_158\\_0', '1,2,3,4,5', 1,
    'BFEBFBFF00009E0A', 3, 2562, 'CPU', 'U3E1',
    'OK', 3, '10', 'LAB-PC02', 'BFEBFBFF00009E0A', 2,
    'Model 158, Stepping 10', 5, 'EMPRESA'
);

-- Processador SRV-DC01 (Intel Xeon Silver 4214R - servidor dual socket)
-- Socket 1
INSERT INTO Processor_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    Is64Bit00, MaxClockSpeed00, AddressWidth00, Architecture00, Availability00,
    BrandID00, Caption00, ConfigManagerErrorCode00, ConfigManagerUserConfig00,
    CPUHash00, CPUKey00, CpuStatus00, CurrentClockSpeed00, CurrentVoltage00,
    DataWidth00, Description00, DeviceID00, ErrorCleared00, ErrorDescription00,
    ExtClock00, Family00, InstallDate00, IsHyperthreadCapable00, IsHyperthreadEnabled00,
    IsMobile00, IsTrustedExecutionCapable00, IsVitualizationCapable00, L2CacheSize00,
    L2CacheSpeed00, L3CacheSize00, L3CacheSpeed00, LastErrorCode00, Level00,
    LoadPercentage00, Manufacturer00, Name00, NormSpeed00, NumberOfCores00,
    NumberOfLogicalProcessors00, OtherFamilyDescription00, PartOfDomain00, PCache00,
    PNPDeviceID00, PowerManagementCapabilities00, PowerManagementSupported00,
    ProcessorId00, ProcessorType00, Revision00, Role00, SocketDesignation00,
    Status00, StatusInfo00, Stepping00, SystemName00, UniqueId00, UpgradeMethod00,
    Version00, VoltageCaps00, Workgroup00
) VALUES (
    16777302, 1, 1, 1, NOW(),
    1, 3500, 64, 9, 3,
    8, 'Intel64 Family 6 Model 85 Stepping 7', 0, 0,
    'CPUID_8086_55_07', 'CPU0', 1, 2400, 1800,
    64, 'Intel64 Family 6 Model 85 Stepping 7', 'CPU0', 0, NULL,
    100, 198, NULL, 1, 1,
    0, 1, 1, 1024,
    2400, 16896, 2400, 0, 6,
    3, 'GenuineIntel', 'Intel(R) Xeon(R) Silver 4214R CPU @ 2.40GHz', 2400, 12,
    24, NULL, 1, 1024,
    'ACPI\\GENUINEINTEL_-_X86_FAMILY_6_MODEL_85\\_0', '1,2,3,4,5', 1,
    'BFEBFBFF00050657', 3, 1351, 'CPU', 'CPU1',
    'OK', 3, '7', 'SRV-DC01', 'BFEBFBFF00050657', 11,
    'Model 85, Stepping 7', 5, 'EMPRESA'
);

-- Socket 2
INSERT INTO Processor_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    Is64Bit00, MaxClockSpeed00, AddressWidth00, Architecture00, Availability00,
    BrandID00, Caption00, ConfigManagerErrorCode00, ConfigManagerUserConfig00,
    CPUHash00, CPUKey00, CpuStatus00, CurrentClockSpeed00, CurrentVoltage00,
    DataWidth00, Description00, DeviceID00, ErrorCleared00, ErrorDescription00,
    ExtClock00, Family00, InstallDate00, IsHyperthreadCapable00, IsHyperthreadEnabled00,
    IsMobile00, IsTrustedExecutionCapable00, IsVitualizationCapable00, L2CacheSize00,
    L2CacheSpeed00, L3CacheSize00, L3CacheSpeed00, LastErrorCode00, Level00,
    LoadPercentage00, Manufacturer00, Name00, NormSpeed00, NumberOfCores00,
    NumberOfLogicalProcessors00, OtherFamilyDescription00, PartOfDomain00, PCache00,
    PNPDeviceID00, PowerManagementCapabilities00, PowerManagementSupported00,
    ProcessorId00, ProcessorType00, Revision00, Role00, SocketDesignation00,
    Status00, StatusInfo00, Stepping00, SystemName00, UniqueId00, UpgradeMethod00,
    Version00, VoltageCaps00, Workgroup00
) VALUES (
    16777302, 2, 1, 1, NOW(),
    1, 3500, 64, 9, 3,
    8, 'Intel64 Family 6 Model 85 Stepping 7', 0, 0,
    'CPUID_8086_55_07', 'CPU1', 1, 2400, 1800,
    64, 'Intel64 Family 6 Model 85 Stepping 7', 'CPU1', 0, NULL,
    100, 198, NULL, 1, 1,
    0, 1, 1, 1024,
    2400, 16896, 2400, 0, 6,
    3, 'GenuineIntel', 'Intel(R) Xeon(R) Silver 4214R CPU @ 2.40GHz', 2400, 12,
    24, NULL, 1, 1024,
    'ACPI\\GENUINEINTEL_-_X86_FAMILY_6_MODEL_85\\_1', '1,2,3,4,5', 1,
    'BFEBFBFF00050657', 3, 1351, 'CPU', 'CPU2',
    'OK', 3, '7', 'SRV-DC01', 'BFEBFBFF00050657', 11,
    'Model 85, Stepping 7', 5, 'EMPRESA'
);

-- Processador OLD-PC04 (Intel Core 2 Duo E8400 - sistema antigo)
INSERT INTO Processor_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    Is64Bit00, MaxClockSpeed00, AddressWidth00, Architecture00, Availability00,
    BrandID00, Caption00, ConfigManagerErrorCode00, ConfigManagerUserConfig00,
    CPUHash00, CPUKey00, CpuStatus00, CurrentClockSpeed00, CurrentVoltage00,
    DataWidth00, Description00, DeviceID00, ErrorCleared00, ErrorDescription00,
    ExtClock00, Family00, InstallDate00, IsHyperthreadCapable00, IsHyperthreadEnabled00,
    IsMobile00, IsTrustedExecutionCapable00, IsVitualizationCapable00, L2CacheSize00,
    L2CacheSpeed00, L3CacheSize00, L3CacheSpeed00, LastErrorCode00, Level00,
    LoadPercentage00, Manufacturer00, Name00, NormSpeed00, NumberOfCores00,
    NumberOfLogicalProcessors00, OtherFamilyDescription00, PartOfDomain00, PCache00,
    PNPDeviceID00, PowerManagementCapabilities00, PowerManagementSupported00,
    ProcessorId00, ProcessorType00, Revision00, Role00, SocketDesignation00,
    Status00, StatusInfo00, Stepping00, SystemName00, UniqueId00, UpgradeMethod00,
    Version00, VoltageCaps00, Workgroup00
) VALUES (
    16777303, 1, 1, 1, NOW(),
    1, 3000, 64, 9, 3,
    8, 'x86 Family 6 Model 23 Stepping 10', 0, 0,
    'CPUID_8086_17_0A', 'CPU0', 1, 3000, 1200,
    64, 'x86 Family 6 Model 23 Stepping 10', 'CPU0', 0, NULL,
    333, 198, NULL, 0, 0,
    0, 0, 1, 6144,
    3000, 0, 0, 0, 6,
    25, 'GenuineIntel', 'Intel(R) Core(TM)2 Duo CPU E8400 @ 3.00GHz', 3000, 2,
    2, NULL, 1, 32,
    'ACPI\\GENUINEINTEL_-_X86_FAMILY_6_MODEL_23\\_0', '1,2,3,4,5', 1,
    'BFEBFBFF0001070A', 3, 658, 'CPU', 'U2E1',
    'OK', 3, '10', 'OLD-PC04', 'BFEBFBFF0001070A', 2,
    'Model 23, Stepping 10', 5, 'EMPRESA'
);

-- =================================================================
-- 7. SOFTWARE INSTALADO (Add_Remove_Programs_DATA / v_GS_ADD_REMOVE_PROGRAMS)
-- =================================================================

-- Software DEV-USER01 (Desenvolvedor - muitos programas)
INSERT INTO Add_Remove_Programs_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DisplayName00, Version00, Publisher00, InstallDate00, ProdID00
) VALUES 
(16777300, 1, 1, 1, NOW(), 'Microsoft Visual Studio Community 2022', '17.8.3', 'Microsoft Corporation', '2024-01-15', '{VS2022-COMMUNITY}'),
(16777300, 2, 1, 1, NOW(), 'Google Chrome', '120.0.6099.129', 'Google LLC', '2024-01-10', '{CHROME-120}'),
(16777300, 3, 1, 1, NOW(), 'Git for Windows', '2.42.0.2', 'Git Development Community', '2024-01-08', '{GIT-WINDOWS}'),
(16777300, 4, 1, 1, NOW(), 'Node.js', '20.10.0', 'Node.js Foundation', '2024-01-05', '{NODEJS-20}'),
(16777300, 5, 1, 1, NOW(), 'Microsoft Office Professional Plus 2021', '16.0.17029.20028', 'Microsoft Corporation', '2023-12-20', '{OFFICE-2021-PRO}'),
(16777300, 6, 1, 1, NOW(), 'Docker Desktop', '4.25.2', 'Docker Inc.', '2023-12-15', '{DOCKER-DESKTOP}'),
(16777300, 7, 1, 1, NOW(), 'Postman', '10.21.0', 'Postman, Inc.', '2023-12-10', '{POSTMAN-10}'),
(16777300, 8, 1, 1, NOW(), 'Windows Terminal', '1.18.3181.0', 'Microsoft Corporation', '2023-12-01', '{WINDOWS-TERMINAL}');

-- Software LAB-PC02 (Utilizador básico)
INSERT INTO Add_Remove_Programs_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DisplayName00, Version00, Publisher00, InstallDate00, ProdID00
) VALUES 
(16777301, 1, 1, 1, NOW(), 'Microsoft Office Standard 2019', '16.0.10396.20023', 'Microsoft Corporation', '2023-11-20', '{OFFICE-2019-STD}'),
(16777301, 2, 1, 1, NOW(), 'Adobe Acrobat Reader DC', '23.008.20470', 'Adobe Inc.', '2023-11-15', '{ADOBE-READER-DC}'),
(16777301, 3, 1, 1, NOW(), 'Mozilla Firefox', '120.0.1', 'Mozilla', '2023-11-10', '{FIREFOX-120}'),
(16777301, 4, 1, 1, NOW(), 'Microsoft Teams', '24009.213.2761.7628', 'Microsoft Corporation', '2023-11-05', '{TEAMS-24009}'),
(16777301, 5, 1, 1, NOW(), '7-Zip', '23.01', 'Igor Pavlov', '2023-10-30', '{7ZIP-23}');

-- Software SRV-DC01 (Servidor - software de sistema)
INSERT INTO Add_Remove_Programs_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DisplayName00, Version00, Publisher00, InstallDate00, ProdID00
) VALUES 
(16777302, 1, 1, 1, NOW(), 'Microsoft SQL Server 2022', '16.0.1000.6', 'Microsoft Corporation', '2023-11-25', '{SQL-SERVER-2022}'),
(16777302, 2, 1, 1, NOW(), 'Active Directory Domain Services', '10.0.20348.1', 'Microsoft Corporation', '2023-11-20', '{AD-DS}'),
(16777302, 3, 1, 1, NOW(), 'Microsoft Configuration Manager', '5.2211.1088.1700', 'Microsoft Corporation', '2023-11-15', '{SCCM-5.22}'),
(16777302, 4, 1, 1, NOW(), 'Windows Admin Center', '2311.0.34.0', 'Microsoft Corporation', '2023-11-10', '{WAC-2311}'),
(16777302, 5, 1, 1, NOW(), 'PowerShell 7', '7.4.0.0', 'Microsoft Corporation', '2023-11-05', '{PWSH-7.4}');

-- Software OLD-PC04 (Sistema antigo - software básico)
INSERT INTO Add_Remove_Programs_DATA (
    MachineID, InstanceKey, RevisionID, AgentID, TimeKey,
    DisplayName00, Version00, Publisher00, InstallDate00, ProdID00
) VALUES 
(16777303, 1, 1, 1, NOW(), 'Microsoft Office 2010', '14.0.7015.1000', 'Microsoft Corporation', '2020-03-15', '{OFFICE-2010}'),
(16777303, 2, 1, 1, NOW(), 'Internet Explorer 11', '11.0.9600.19597', 'Microsoft Corporation', '2020-01-14', '{IE11}'),
(16777303, 3, 1, 1, NOW(), 'Windows Media Player', '12.0.7601.17514', 'Microsoft Corporation', '2020-01-14', '{WMP-12}'),
(16777303, 4, 1, 1, NOW(), 'WinRAR', '5.71', 'win.rar GmbH', '2019-12-10', '{WINRAR-5.71}');

-- =================================================================
-- 8. UPDATES / PATCHES (CI_Types, CI_Models, CI_ConfigurationItems, CI_UpdateCIs, CI_LocalizedProperties, Update_ComplianceStatus)
-- =================================================================

-- 8.1 Inserir tipos de CI necessários primeiro
INSERT IGNORE INTO CI_Types (CIType_ID, TypeName, SecuredTypeID, DeployOperation) VALUES 
(1, 'Software Update', 1, 1),
(8, 'Software Update Bundle', 8, 1),
(9, 'Software Update Group', 9, 1);

-- 8.2 Inserir modelos base para os updates
INSERT INTO CI_Models (ModelName, CIGUID) VALUES 
('Microsoft Update Model - KB5034441', UUID()),
('Microsoft Update Model - KB5034467', UUID()),
('Microsoft Update Model - KB5034445', UUID()),
('Microsoft Update Model - KB5034442', UUID()),
('Microsoft Update Model - KB5034448', UUID());

-- 8.3 Criar Configuration Items base para os updates
INSERT INTO CI_ConfigurationItems (
    CI_UniqueID, ModelId, CIVersion, CIType_ID, PolicyVersion,
    DateCreated, DateLastModified, LastModifiedBy, CreatedBy, PermittedUses,
    IsBundle, IsHidden, IsTombstoned, IsUserDefined, IsEnabled, IsExpired, IsLatest
) VALUES 
('ScopeId_A1B2C3D4-E5F6-7890-ABCD-EF1234567890/Update_KB5034441', (SELECT ModelId FROM CI_Models WHERE ModelName = 'Microsoft Update Model - KB5034441'), 1, 1, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 1, 0, 0, 0, 0, 1, 0, 1),
('ScopeId_A1B2C3D4-E5F6-7890-ABCD-EF1234567891/Update_KB5034467', (SELECT ModelId FROM CI_Models WHERE ModelName = 'Microsoft Update Model - KB5034467'), 1, 1, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 1, 0, 0, 0, 0, 1, 0, 1),
('ScopeId_A1B2C3D4-E5F6-7890-ABCD-EF1234567892/Update_KB5034445', (SELECT ModelId FROM CI_Models WHERE ModelName = 'Microsoft Update Model - KB5034445'), 1, 1, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 1, 0, 0, 0, 0, 1, 0, 1),
('ScopeId_A1B2C3D4-E5F6-7890-ABCD-EF1234567893/Update_KB5034442', (SELECT ModelId FROM CI_Models WHERE ModelName = 'Microsoft Update Model - KB5034442'), 1, 1, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 1, 0, 0, 0, 0, 1, 0, 1),
('ScopeId_A1B2C3D4-E5F6-7890-ABCD-EF1234567894/Update_KB5034448', (SELECT ModelId FROM CI_Models WHERE ModelName = 'Microsoft Update Model - KB5034448'), 1, 1, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 1, 0, 0, 0, 0, 1, 0, 1);

-- 8.4 Informações específicas dos updates
INSERT INTO CI_UpdateCIs (
    CI_ID, BulletinID, ArticleID, Severity, DatePosted, DateRevised, RevisionNumber
) VALUES 
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034441%'), 'MS24-001', 'KB5034441', 3, NOW(), NOW(), 1),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034467%'), 'MS24-002', 'KB5034467', 4, NOW(), NOW(), 1),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034445%'), 'MS24-003', 'KB5034445', 3, NOW(), NOW(), 1),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034442%'), 'MS23-012', 'KB5034442', 2, NOW(), NOW(), 1),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034448%'), 'MS24-004', 'KB5034448', 3, NOW(), NOW(), 1);

-- 8.5 Títulos e descrições localizadas (LocaleID 1033 = inglês)
INSERT INTO CI_LocalizedProperties (
    CI_ID, LocaleID, DisplayName, Description
) VALUES 
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034441%'), 1033, '2024-01 Cumulative Update for Windows 11 Version 22H2', 'Atualização de segurança crítica para Windows 11'),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034467%'), 1033, '2024-01 Security Update for Microsoft Office', 'Correção de vulnerabilidades no Microsoft Office'),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034445%'), 1033, '2024-01 .NET Framework Security Update', 'Atualização de segurança do .NET Framework'),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034442%'), 1033, '2023-12 Windows Defender Update', 'Atualização de definições do Windows Defender'),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034448%'), 1033, '2024-01 SQL Server 2022 CU Update', 'Atualização cumulativa do SQL Server 2022');

-- 8.6 Status de compliance dos updates para cada dispositivo
INSERT INTO Update_ComplianceStatus (
    CI_ID, MachineID, Status, LastStatusCheckTime, LastStatusChangeTime
) VALUES 
-- DEV-USER01 (maioria instalada)
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034441%'), 16777300, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034467%'), 16777300, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034445%'), 16777300, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034442%'), 16777300, 2, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034448%'), 16777300, 1, NOW(), NOW()),

-- LAB-PC02 (algumas falhas)
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034441%'), 16777301, 4, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034467%'), 16777301, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034445%'), 16777301, 2, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034442%'), 16777301, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034448%'), 16777301, 1, NOW(), NOW()),

-- SRV-DC01 (servidor - tudo atualizado)
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034441%'), 16777302, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034467%'), 16777302, 1, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034445%'), 16777302, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034442%'), 16777302, 3, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034448%'), 16777302, 3, NOW(), NOW()),

-- OLD-PC04 (sistema antigo - muitos pendentes)
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034441%'), 16777303, 1, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034467%'), 16777303, 2, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034445%'), 16777303, 4, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034442%'), 16777303, 2, NOW(), NOW()),
((SELECT CI_ID FROM CI_ConfigurationItems WHERE CI_UniqueID LIKE '%KB5034448%'), 16777303, 1, NOW(), NOW());

-- =================================================================
-- 9. VERIFICAÇÃO DOS DADOS INSERIDOS
-- =================================================================

-- Verificar dispositivos criados na System_DISC
SELECT 'DISPOSITIVOS CRIADOS (System_DISC):' AS Info;
SELECT 
    ItemKey AS ResourceID,
    Name0 AS Nome,
    Operating_System_Name_and0 AS SO,
    User_Name0 AS Utilizador,
    Client0 AS Online
FROM System_DISC 
ORDER BY ItemKey;

-- Verificar hardware na hierarquia System_DATA -> Computer_System_DATA
SELECT 'HARDWARE CONFIGURADO (System_DATA):' AS Info;
SELECT 
    sd.MachineID,
    sd.Name0 AS Nome,
    csd.Manufacturer00 AS Fabricante,
    csd.Model00 AS Modelo,
    ROUND(csd.TotalPhysicalMemory00/1024/1024/1024, 2) AS 'RAM_GB',
    csd.NumberOfProcessors00 AS CPUs
FROM System_DATA sd
LEFT JOIN Computer_System_DATA csd ON sd.MachineID = csd.MachineID
ORDER BY sd.MachineID;

-- Verificar discos em Logical_Disk_DATA
SELECT 'DISCOS CONFIGURADOS (Logical_Disk_DATA):' AS Info;
SELECT 
    ld.MachineID,
    sd.Name0 AS Dispositivo,
    ld.DeviceID00 AS Letra,
    ld.FileSystem00 AS Sistema,
    ROUND(ld.Size00/1024/1024/1024, 2) AS 'Tamanho_GB',
    ROUND(ld.FreeSpace00/1024/1024/1024, 2) AS 'Livre_GB'
FROM Logical_Disk_DATA ld
LEFT JOIN System_DATA sd ON ld.MachineID = sd.MachineID
ORDER BY ld.MachineID, ld.DeviceID00;

-- Verificar software em Add_Remove_Programs_DATA
SELECT 'SOFTWARE POR DISPOSITIVO (Add_Remove_Programs_DATA):' AS Info;
SELECT 
    arp.MachineID,
    sd.Name0 AS Dispositivo,
    COUNT(*) AS Total_Programas
FROM Add_Remove_Programs_DATA arp
LEFT JOIN System_DATA sd ON arp.MachineID = sd.MachineID
GROUP BY arp.MachineID, sd.Name0
ORDER BY arp.MachineID;

-- Verificar updates por dispositivo
SELECT 'UPDATES POR DISPOSITIVO (Update_ComplianceStatus):' AS Info;
SELECT 
    ucs.MachineID,
    sd.Name0 AS Dispositivo,
    COUNT(*) AS Total_Updates,
    SUM(CASE WHEN ucs.Status = 3 THEN 1 ELSE 0 END) AS Instalados,
    SUM(CASE WHEN ucs.Status = 2 THEN 1 ELSE 0 END) AS Pendentes,
    SUM(CASE WHEN ucs.Status = 4 THEN 1 ELSE 0 END) AS Falhas
FROM Update_ComplianceStatus ucs
LEFT JOIN System_DATA sd ON ucs.MachineID = sd.MachineID
GROUP BY ucs.MachineID, sd.Name0
ORDER BY ucs.MachineID;

-- Verificar informações dos updates criados
SELECT 'UPDATES CRIADOS (CI_UpdateCIs + CI_LocalizedProperties):' AS Info;
SELECT 
    uci.CI_ID,
    uci.ArticleID,
    uci.BulletinID,
    lp.DisplayName AS Titulo,
    CASE uci.Severity 
        WHEN 1 THEN 'Low'
        WHEN 2 THEN 'Moderate' 
        WHEN 3 THEN 'Important'
        WHEN 4 THEN 'Critical'
        ELSE 'Unknown'
    END AS Severidade
FROM CI_UpdateCIs uci
LEFT JOIN CI_LocalizedProperties lp ON uci.CI_ID = lp.CI_ID AND lp.LocaleID = 1033
ORDER BY uci.CI_ID;

-- Verificar informações de BIOS por dispositivo
SELECT 'BIOS POR DISPOSITIVO (PC_BIOS_DATA):' AS Info;
SELECT 
    pb.MachineID,
    sd.Name0 AS Dispositivo,
    pb.Manufacturer00 AS Fabricante_BIOS,
    pb.SMBIOSBIOSVersion00 AS Versao_BIOS,
    pb.ReleaseDate00 AS Data_Lancamento,
    CASE pb.SMBIOSMajorVersion00 
        WHEN 2 THEN 'SMBIOS 2.x'
        WHEN 3 THEN 'SMBIOS 3.x'
        ELSE 'Versao Desconhecida'
    END AS Versao_SMBIOS
FROM PC_BIOS_DATA pb
LEFT JOIN System_DATA sd ON pb.MachineID = sd.MachineID
ORDER BY pb.MachineID;

-- Verificar processadores por dispositivo
SELECT 'PROCESSADORES POR DISPOSITIVO (Processor_DATA):' AS Info;
SELECT 
    pd.MachineID,
    sd.Name0 AS Dispositivo,
    pd.Name00 AS Nome_Processador,
    pd.Manufacturer00 AS Fabricante,
    pd.NumberOfCores00 AS Nucleos,
    pd.NumberOfLogicalProcessors00 AS Threads,
    pd.MaxClockSpeed00 AS 'Clock_Max_MHz',
    pd.CurrentClockSpeed00 AS 'Clock_Atual_MHz',
    ROUND(pd.L3CacheSize00/1024, 2) AS 'Cache_L3_MB',
    CASE pd.Is64Bit00 
        WHEN 1 THEN '64-bit'
        ELSE '32-bit'
    END AS Arquitetura,
    pd.SocketDesignation00 AS Socket
FROM Processor_DATA pd
LEFT JOIN System_DATA sd ON pd.MachineID = sd.MachineID
ORDER BY pd.MachineID, pd.InstanceKey;

-- =================================================================
-- 10. INSTRUÇÕES DE USO
-- =================================================================

/*
COMO USAR ESTE SCRIPT:

1. Execute este script na base de dados CM_900_CLONE
2. Isto criará:
   - 4 dispositivos fictícios na tabela System_DISC (IDs: 1001-1004)
   - 4 utilizadores na tabela User_DISC (IDs: 2001-2004)  
   - 4 registos de hardware na hierarquia MachineIdGroupXRef -> System_DATA -> Computer_System_DATA (MachineIDs: 16777300-16777303)
   - Múltiplos discos lógicos para cada dispositivo
   - Informações de BIOS realistas para cada dispositivo (PC_BIOS_DATA)
   - Informações de processador detalhadas para cada dispositivo (Processor_DATA)
   - Software instalado variado para cada tipo de utilizador
   - 5 updates com informações completas e status de compliance

3. Dispositivos criados:
   - DEV-USER01 (ID: 1001, MachineID: 16777300): Windows 11, online, utilizador de desenvolvimento
   - LAB-PC02 (ID: 1002, MachineID: 16777301): Windows 10, offline, utilizador básico  
   - SRV-DC01 (ID: 1003, MachineID: 16777302): Windows Server 2022, online, servidor de domínio
   - OLD-PC04 (ID: 1004, MachineID: 16777303): Windows 7, online mas desatualizado, sistema legado

4. Estrutura corrigida:
   - Usa tabelas reais da base de dados (não views inexistentes)
   - Respeita todas as constraints de chaves estrangeiras
   - MachineIDs dentro do range válido (16777216-33554431)
   - Updates nas tabelas corretas do SCCM (CI_ConfigurationItems, CI_UpdateCIs, etc.)

5. Para testar na aplicação:
   - Aceda à página de dispositivos
   - Clique em qualquer dos 4 dispositivos criados
   - Todas as secções devem mostrar dados completos

6. Queries de verificação incluídas:
   - O script executa automaticamente queries para verificar os dados inseridos
   - Mostra contagens de dispositivos, hardware, discos, BIOS, processadores, software e updates
   - Útil para confirmar que tudo foi inserido corretamente

NOTA: Este script corrige todos os erros de constraint encontrados anteriormente
e usa a estrutura real da base de dados CM_900_CLONE, incluindo as novas tabelas
PC_BIOS_DATA e Processor_DATA com as respetivas views v_GS_PC_BIOS e v_GS_PROCESSOR.
*/
