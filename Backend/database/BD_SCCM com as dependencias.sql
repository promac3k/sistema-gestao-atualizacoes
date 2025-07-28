drop database cm_900_clone;
create database cm_900_clone;
USE CM_900_CLONE;

/****** Object:  Table `Update_ComplianceStatus`    Script Date: 30/05/2025 18:53:39 ******/
CREATE TABLE IF NOT exists `Update_ComplianceStatus`(
	`CI_ID` INT NOT NULL,
	`MachineID` INT NOT NULL,
	`Status` TINYINT NOT NULL,
	`LastStatusCheckTime` DATETIME NULL,
	`LastStatusChangeTime` DATETIME NULL,
	`EnforcementSource` TINYINT NULL,
	`LastEnforcementMessageID` TINYINT NULL,
	`LastEnforcementMessageTime` DATETIME NULL,
	`LastEnforcementStatusMsgID` INT NULL,
	`LastErrorCode` INT NULL,
	`LastLocalChangeTime` DATETIME NULL,
	`ComplianceCRC` BINARY(4) NULL,
	`rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`LastErrorDetail` VARCHAR(1024) NULL,
 CONSTRAINT `Update_ComplianceStatus_PK` PRIMARY KEY 
(
	`CI_ID` ASC,
	`MachineID` ASC
) 
);

-- 
create view `v_UpdateComplianceStatus` as 
    select CI_ID, MachineID AS ResourceID, Status, LastStatusCheckTime, LastStatusChangeTime, 
        EnforcementSource, LastEnforcementMessageID, LastEnforcementMessageTime, LastEnforcementStatusMsgID, LastErrorCode, LastLocalChangeTime 
    from Update_ComplianceStatus cs 
    where Status>1; 

/****** Object:  Table `Flat_Group_System_Relationship`    Script Date: 30/05/2025 18:53:39 ******/

CREATE TABLE `Flat_Group_System_Relationship`(
	`ID` BIGINT AUTO_INCREMENT  NOT NULL,
	`Group_ObjectGUID` BINARY(16) NOT NULL,
	`System_ObjectGUID` BINARY(16) NOT NULL,
	`SiteCode` VARCHAR(3) NOT NULL,
 CONSTRAINT `Flat_Group_System_Relationship_PK` PRIMARY KEY 
(
	`ID` ASC
)
);

/****** Object:  Table `ActiveDirectoryObjectInfo`    Script Date: 30/05/2025 18:53:39 ******/

CREATE TABLE `ActiveDirectoryObjectInfo`(
	`ObjectGUID` BINARY(16) NOT NULL,
	`SiteCode` VARCHAR(3) NOT NULL,
	`Name` VARCHAR(256) NOT NULL,
	`CName` VARCHAR(256) NULL,
	`LastRefreshTime` DATETIME NOT NULL,
 CONSTRAINT `ActiveDirectoryObjectInfo_PK` PRIMARY KEY 
(
	`ObjectGUID` ASC,
	`SiteCode` ASC
)
);

CREATE TABLE `System_DISC` (
    `ItemKey` INT NOT NULL,
    `DiscArchKey` INT DEFAULT NULL,
    `SMS_Unique_Identifier0` VARCHAR(255),
    `Netbios_Name0` VARCHAR(256),
    `Name0` VARCHAR(256),
    `Distinguished_Name0` VARCHAR(256),
    `Operating_System_Name_and0` VARCHAR(256),
    `Resource_Domain_OR_Workgr0` VARCHAR(256),
    `Full_Domain_Name0` VARCHAR(256),
    `AD_Site_Name0` VARCHAR(256),
    `User_Name0` VARCHAR(256),
    `Client0` INT,
    `Client_Type0` INT,
    `AgentEdition0` INT,
    `DeviceOwner0` INT,
    `Unknown0` INT,
    `Client_Version0` VARCHAR(256),
    `Community_Name0` VARCHAR(256),
    `User_Domain0` VARCHAR(256),
    `Previous_SMS_UUID0` VARCHAR(255),
    `SMS_UUID_Change_Date0` DATETIME,
    `CPUType0` VARCHAR(256),
    `Hardware_ID0` VARCHAR(256),
    `Obsolete0` INT,
    `Active0` INT,
    `Creation_Date0` DATETIME,
    `SMBIOS_GUID0` VARCHAR(256),
    `AlwaysInternet0` INT,
    `InternetEnabled0` INT,
    `Decommissioned0` INT DEFAULT 0,
    `WipeStatus0` INT,
    `AMTStatus0` INT,
    `AMTFullVersion0` VARCHAR(256),
    `IsClientAMT30Compatible0` BOOLEAN,
    `SuppressAutoProvision0` BOOLEAN,
    `Primary_Group_ID0` INT,
    `User_Account_Control0` INT,
    `SID0` VARCHAR(256),
    `EAS_DeviceID` VARCHAR(256),
    `Object_GUID0` BINARY(16),
    `Last_Logon_Timestamp0` DATETIME,
    `Is_Virtual_Machine0` BOOLEAN,
    `Is_MachineChanges_Persisted0` BOOLEAN,
    `Is_Assigned_To_User0` BOOLEAN,
    `Virtual_Machine_Host_Name0` VARCHAR(256),
    `WTGUniqueKey` VARCHAR(256),
    `Is_Write_Filter_Capable0` BOOLEAN,
    `Is_Portable_Operating_System0` BOOLEAN,
    `Is_AOAC_Capable0` BOOLEAN,
    `PublisherDeviceID` VARCHAR(64),
    `IsReassigned0` BOOLEAN,
    `MdmStatus` VARCHAR(256),
    `MDMDeviceCategoryID0` VARCHAR(256),
    `Virtual_Machine_Type0` INT,
    `Build01` VARCHAR(256),
    `OSBranch01` VARCHAR(256),
    `ManagementAuthority` INT,
    `Build0` VARCHAR(256),
    `OSBranch0` VARCHAR(256),
    `SerialNumber` VARCHAR(64),
    `IMEI` VARCHAR(256),
    `MDMStatusUpdatedTime` DATETIME,
    `AADDeviceID` CHAR(36),
    `AADTenantID` CHAR(36),
    `BuildExt` VARCHAR(256),
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `DNSForestGUID` CHAR(36),
    `ESUValue` CHAR(36),
    `SenseID` VARCHAR(40),
    `DoNotConnectToWULocations` BOOLEAN,
    `DisableWindowsUpdateAccess` BOOLEAN,
    `OSIsSupported` BOOLEAN,
    `DotNetRelease` INT,
    `CloudPCInfo` VARCHAR(256),
    `CertKeyType` INT,
    PRIMARY KEY (`ItemKey`)
);


CREATE VIEW `System_System_Group_Name_ARR` AS 
SELECT DISTINCT 
    UD.ItemKey, 
    GN.Name AS System_Group_Name0 
FROM Flat_Group_System_Relationship FLAT
INNER JOIN System_DISC UD 
    ON FLAT.System_ObjectGUID = UD.Object_GUID0
INNER JOIN ( 
    SELECT GI.ObjectGUID, GI.SiteCode, GI.Name 
    FROM ActiveDirectoryObjectInfo GI
    INNER JOIN (
        SELECT ObjectGUID, MAX(LastRefreshTime) AS MLRT 
        FROM ActiveDirectoryObjectInfo 
        GROUP BY ObjectGUID 
    ) NEWEST 
    ON GI.ObjectGUID = NEWEST.ObjectGUID 
       AND GI.LastRefreshTime = NEWEST.MLRT 
) GN  
ON FLAT.Group_ObjectGUID = GN.ObjectGUID 
   AND FLAT.SiteCode = GN.SiteCode;


/****** Object:  View `v_RA_System_SystemGroupName`    Script Date: 30/05/2025 18:53:39 ******/

CREATE VIEW `v_RA_System_SystemGroupName` As SELECT ItemKey AS `ResourceID`,`System_Group_Name0` FROM `System_System_Group_Name_ARR`;


CREATE TABLE `CI_UpdateInfo`(
	`CI_ID` INT NOT NULL,
	`Locales` VARCHAR(1024) NULL,
	`RevisionTag` BINARY(4) NULL,
 CONSTRAINT `CI_UpdateInfo_PK` PRIMARY KEY 
(
	`CI_ID` ASC
)
);

-- Tabela: CI_Models
CREATE TABLE `CI_Models` (
    `ModelId` INT NOT NULL AUTO_INCREMENT,
    `ModelName` VARCHAR(300) NOT NULL,
    `CIGUID` CHAR(36) DEFAULT (UUID()), -- uniqueidentifier convertido
    PRIMARY KEY (`ModelId`)
);

-- Tabela: CI_Types
CREATE TABLE `CI_Types` (
    `CIType_ID` INT NOT NULL,
    `TypeName` VARCHAR(255) NOT NULL,
    `SecuredTypeID` INT DEFAULT NULL,
    `DeployOperation` INT DEFAULT NULL,
    PRIMARY KEY (`CIType_ID`),
    UNIQUE KEY `CI_Types_AK` (`TypeName`) -- Índice não-clusterizado único
);

CREATE TABLE `CI_ConfigurationItems` (
    `CI_ID` INT NOT NULL AUTO_INCREMENT,
    `CI_UniqueID` VARCHAR(300) NOT NULL,
    `ModelId` INT NOT NULL,
    `CIVersion` INT NOT NULL,
    `SDMPackageDigest` TEXT,  -- XML convertido para TEXT
    `CIType_ID` INT NOT NULL,
    `PolicyVersion` INT DEFAULT NULL,
    `DateCreated` DATETIME NOT NULL,
    `DateLastModified` DATETIME DEFAULT NULL,
    `LastModifiedBy` VARCHAR(512) NOT NULL,
    `LocalDateLastReplicated` DATETIME DEFAULT NULL,
    `CreatedBy` VARCHAR(512) DEFAULT NULL,
    `PermittedUses` INT NOT NULL,
    `IsBundle` BOOLEAN NOT NULL,
    `IsHidden` BOOLEAN NOT NULL,
    `IsTombstoned` BOOLEAN NOT NULL,
    `IsUserDefined` BOOLEAN NOT NULL,
    `IsEnabled` BOOLEAN NOT NULL,
    `IsExpired` BOOLEAN NOT NULL DEFAULT 0,
    `IsLatest` BOOLEAN NOT NULL DEFAULT 1,
    `SourceSite` VARCHAR(3) DEFAULT NULL,
    `ContentSourcePath` VARCHAR(512) DEFAULT NULL,
    `ApplicabilityCondition` VARCHAR(512) DEFAULT NULL,
    `Precedence` INT DEFAULT NULL,
    `ConfigurationFlags` BIGINT DEFAULT NULL,
    `CI_CRC` VARCHAR(8) DEFAULT NULL,
    `IsUserCI` BOOLEAN DEFAULT NULL,
    `ApplicableAtUserLogon` BOOLEAN DEFAULT NULL,
    `RevisionTag` BINARY(64) DEFAULT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `SEDOComponentID` CHAR(36) NOT NULL DEFAULT (UUID()), -- equivalente a newid()
    `MinRequiredVersion` INT DEFAULT NULL,
    PRIMARY KEY (`CI_ID`),
    FOREIGN KEY (`ModelId`) REFERENCES `CI_Models` (`ModelId`),
    FOREIGN KEY (`CIType_ID`) REFERENCES `CI_Types` (`CIType_ID`) ON DELETE CASCADE
);

-- Tabela: CI_CIEULA
CREATE TABLE `CI_CIEULA` (
    `CI_ID` INT NOT NULL,
    `EULAAccepted` BOOLEAN DEFAULT NULL,
    `EULASignoffDate` DATETIME DEFAULT NULL,
    `EULASignoffUser` VARCHAR(512) DEFAULT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`CI_ID`),
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

-- Tabela: EULA_Content
CREATE TABLE `EULA_Content` (
    `EULAContentID` INT NOT NULL AUTO_INCREMENT,
    `EULAContentUniqueID` VARCHAR(64) NOT NULL,
    `EULAText` LONGBLOB NOT NULL, -- varbinary(max) convertido para LONGBLOB
    `DateLastModified` DATETIME DEFAULT NULL,
    `SourceSite` VARCHAR(3) NOT NULL,
    `IsDeleted` BOOLEAN NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`EULAContentID`),
    UNIQUE KEY `EULA_Content_AK` (`EULAContentUniqueID`)
);

CREATE VIEW `v_EULAContent` AS 
SELECT 
    `EULAContentID`, 
    `EULAContentUniqueID`, 
    `EULAText`, 
    `SourceSite` 
FROM `EULA_Content`
WHERE `IsDeleted` = 0;

CREATE TABLE `EULA_LocalizedContent` (
    `CI_ID` INT NOT NULL,
    `LocaleID` INT NOT NULL,
    `EULAContentID` INT NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`CI_ID`, `LocaleID`),
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_CIEULA` (`CI_ID`) ON DELETE CASCADE,
    FOREIGN KEY (`EULAContentID`) REFERENCES `EULA_Content` (`EULAContentID`) ON DELETE CASCADE
);

CREATE VIEW `v_CIEULA_LocalizedContent` AS 
SELECT 
    EULA_LocalizedContent.CI_ID, 
    EULA_LocalizedContent.LocaleID, 
    v_EULAContent.EULAContentUniqueID, 
    v_EULAContent.EULAText, 
    v_EULAContent.SourceSite 
FROM `EULA_LocalizedContent`
INNER JOIN `v_EULAContent` 
    ON EULA_LocalizedContent.EULAContentID = v_EULAContent.EULAContentID;

CREATE TABLE `CI_ConfigurationItemRelations` (
    `RelationID` BIGINT NOT NULL AUTO_INCREMENT,
    `FromCI_ID` INT NOT NULL,
    `ToCI_ID` INT NOT NULL,
    `RelationType` INT NOT NULL,
    `IsBroken` BOOLEAN NOT NULL DEFAULT 0,
    `IsVersionSpecific` BOOLEAN NOT NULL,
    `ExtFlag` INT DEFAULT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`RelationID`),
    UNIQUE KEY `CI_ConfigurationItemRelations_AK` (`FromCI_ID`, `ToCI_ID`, `RelationType`),
    FOREIGN KEY (`ToCI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`),
    FOREIGN KEY (`FromCI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

-- View: v_CIRelation
CREATE VIEW `v_CIRelation` AS 
SELECT 
    rel.FromCI_ID AS FromCIID, 
    rel.ToCI_ID AS ToCIID, 
    rel.RelationType, 
    rel.IsVersionSpecific, 
    rel.IsBroken, 
    CASE 
        WHEN rel.RelationType = 9 THEN rel.ExtFlag 
        ELSE 0 
    END AS Priority
FROM `CI_ConfigurationItemRelations` rel;

CREATE TABLE `Collections_G` (
    `CollectionID` INT NOT NULL,
    `SiteID` VARCHAR(8) NOT NULL,
    `LimitToCollectionID` VARCHAR(8) DEFAULT NULL,
    `CollectionName` VARCHAR(255) NOT NULL,
    `Flags` INT NOT NULL,
    `ResultTableName` VARCHAR(32) DEFAULT '', -- DEFAULT ([fn_SMSDefaultBlank]()) → ''
    `CollectionComment` VARCHAR(512) DEFAULT '',
    `Schedule` VARCHAR(255) DEFAULT '',
    `LastChangeTime` DATETIME DEFAULT CURRENT_TIMESTAMP, -- DEFAULT (getdate())
    `SourceLocaleID` INT DEFAULT NULL,
    `LastRefreshRequest` DATETIME DEFAULT NULL,
    `CollectionType` INT NOT NULL DEFAULT 2,
    `ISVData` LONGBLOB DEFAULT NULL, -- varbinary(max) → LONGBLOB
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ISVString` VARCHAR(2048) DEFAULT NULL,
    PRIMARY KEY (`CollectionID`),
    UNIQUE KEY `Collections_G_AK` (`SiteID`)
);

CREATE TABLE `CI_CIAssignments` (
    `AssignmentID` INT NOT NULL AUTO_INCREMENT,
    `Assignment_UniqueID` VARCHAR(38) NOT NULL,
    `AssignmentName` VARCHAR(256) NOT NULL,
    `Description` VARCHAR(512) DEFAULT NULL,
    `TargetCollectionID` INT NOT NULL,
    `DesiredConfigType` INT NOT NULL,
    `AssignmentAction` INT NOT NULL,
    `NonComplianceCriticality` INT DEFAULT NULL,
    `DPLocality` INT NOT NULL,
    `LogComplianceToWinEvent` BOOLEAN NOT NULL,
    `SendDetailedNonComplianceStatus` BOOLEAN NOT NULL,
    `SuppressReboot` INT NOT NULL,
    `NotifyUser` BOOLEAN NOT NULL,
    `UseGMTTimes` BOOLEAN NOT NULL,
    `CreationTime` DATETIME NOT NULL,
    `ExpirationTime` DATETIME DEFAULT NULL,
    `StartTime` DATETIME NOT NULL,
    `EnforcementDeadline` DATETIME DEFAULT NULL,
    `SoftDeadlineEnabled` BOOLEAN DEFAULT NULL,
    `LastModificationTime` DATETIME NOT NULL,
    `LastModifiedBy` VARCHAR(512) DEFAULT NULL,
    `UpdateDeadlineTime` DATETIME DEFAULT NULL,
    `EvaluationSchedule` VARCHAR(255) DEFAULT NULL,
    `OverrideServiceWindows` BOOLEAN DEFAULT NULL,
    `RebootOutsideOfServiceWindows` BOOLEAN DEFAULT NULL,
    `SourceSite` VARCHAR(3) NOT NULL,
    `IsTombstoned` BOOLEAN NOT NULL,
    `AssignmentType` INT NOT NULL,
    `Priority` INT DEFAULT NULL,
    `OfferTypeID` INT DEFAULT 0,
    `OfferFlags` INT DEFAULT NULL,
    `LocaleID` INT NOT NULL,
    `WoLEnabled` BOOLEAN DEFAULT NULL,
    `RaiseMomAlertsOnFailure` BOOLEAN DEFAULT NULL,
    `DisableMomAlerts` BOOLEAN DEFAULT NULL,
    `EnforcementEnabled` BOOLEAN DEFAULT NULL,
    `UserUIExperience` BOOLEAN DEFAULT NULL,
    `AssignmentEnabled` BOOLEAN DEFAULT NULL,
    `LimitStateMessageVerbosity` BOOLEAN DEFAULT NULL,
    `StateMessageVerbosity` TINYINT DEFAULT NULL,
    `RequireApproval` BOOLEAN DEFAULT NULL,
    `UpdateSupersedence` BOOLEAN NOT NULL DEFAULT 0,
    `StateMessagePriority` INT DEFAULT NULL,
    `RandomizationEnabled` BOOLEAN DEFAULT NULL,
    `RandomizationMinutes` INT DEFAULT NULL,
    `UseBranchCache` BOOLEAN DEFAULT NULL,
    `RequirePostRebootFullScan` BOOLEAN DEFAULT NULL,
    `PersistOnWriteFilterDevices` BOOLEAN DEFAULT NULL,
    `ParentAssignmentID` INT DEFAULT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `MinRequiredVersion` INT DEFAULT NULL,
    `AdditionalProperties` VARCHAR(2048) DEFAULT NULL,
    `PreDownloadUpdateContent` BOOLEAN DEFAULT NULL,
    PRIMARY KEY (`AssignmentID`),
    UNIQUE KEY `CI_CIAssignments_AK` (`Assignment_UniqueID`),
    FOREIGN KEY (`TargetCollectionID`) REFERENCES `Collections_G` (`CollectionID`) ON DELETE CASCADE
);

CREATE TABLE `CI_AssignmentTargetedCIs` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `AssignmentID` INT NOT NULL,
    `CI_ID` INT NOT NULL,
    `ActualCI_ID` INT DEFAULT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`ID`),
    FOREIGN KEY (`AssignmentID`) REFERENCES `CI_CIAssignments` (`AssignmentID`) ON DELETE CASCADE,
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE,
    FOREIGN KEY (`ActualCI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`)
);

CREATE TABLE `CI_AssignmentTargetedGroups` (
    `AssignmentID` INT NOT NULL,
    `CI_ID` INT NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`AssignmentID`),
    FOREIGN KEY (`AssignmentID`) REFERENCES `CI_CIAssignments` (`AssignmentID`) ON DELETE CASCADE,
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

CREATE TABLE `CI_ConfigurationItemRelations_Flat` (
    `RelationID` BIGINT NOT NULL AUTO_INCREMENT,
    `FromCI_ID` INT NOT NULL,
    `ToCI_ID` INT NOT NULL,
    `RelationType` INT NOT NULL,
    `RelationDepth` INT NOT NULL,
    `IsVersionSpecific` BOOLEAN NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`RelationID`),
    UNIQUE KEY `CI_ConfigurationItemRelations_Flat_AK` (`FromCI_ID`, `ToCI_ID`, `RelationType`),
    FOREIGN KEY (`FromCI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

-- View: v_CIRelation_All
CREATE VIEW `v_CIRelation_All` AS 
SELECT 
    FromCI_ID AS CI_ID, 
    ToCI_ID AS ReferencedCI_ID, 
    RelationType, 
    RelationDepth AS Level, 
    IsVersionSpecific
FROM `CI_ConfigurationItemRelations_Flat`;

-- View: vCI_AssignmentTargetedGroups
CREATE VIEW `vCI_AssignmentTargetedGroups` AS 
SELECT 
    CIA_Gs.AssignmentID, 
    CIA_Gs.CI_ID AS AssignedUpdateGroup
FROM `CI_AssignmentTargetedGroups` CIA_Gs;

CREATE TABLE `CI_CIStatus` (
    `CI_ID` INT NOT NULL,
    `IsBroken` BOOLEAN NOT NULL DEFAULT 0,
    `Status` INT DEFAULT NULL,
    PRIMARY KEY (`CI_ID`),
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

CREATE VIEW `v_CIRelationEx` AS 
SELECT 
    `FromCI_ID` AS `FromCIID`, 
    `ToCI_ID` AS `ToCIID`, 
    `RelationType`, 
    `RelationDepth`, 
    `IsVersionSpecific`
FROM `CI_ConfigurationItemRelations_Flat`
WHERE `RelationType` <> 7;

CREATE TABLE `CI_CategoryInstances` (
    `CategoryInstanceID` INT NOT NULL AUTO_INCREMENT,
    `CategoryInstance_UniqueID` VARCHAR(512) NOT NULL,
    `CategoryTypeName` VARCHAR(64) NOT NULL,
    `DateLastModified` DATETIME DEFAULT NULL,
    `SourceSite` VARCHAR(3) NOT NULL,
    `ParentCategoryInstanceID` INT DEFAULT NULL,
    `IsDeleted` BOOLEAN NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`CategoryInstanceID`),
    UNIQUE KEY `CI_CategoryInstances_AK` (`CategoryInstance_UniqueID`)
);

CREATE TABLE `CI_CICategories` (
    `RelationID` BIGINT NOT NULL AUTO_INCREMENT,
    `CI_ID` INT NOT NULL,
    `CategoryInstanceID` INT NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`RelationID`),
    UNIQUE KEY `CI_CICategories_AK` (`CI_ID`, `CategoryInstanceID`),
    FOREIGN KEY (`CategoryInstanceID`) REFERENCES `CI_CategoryInstances` (`CategoryInstanceID`) ON DELETE CASCADE,
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

CREATE TABLE `CI_CICategories_All` (
    `RelationID` BIGINT NOT NULL AUTO_INCREMENT,
    `CI_ID` INT NOT NULL,
    `CategoryInstanceID` INT NOT NULL,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`RelationID`),
    UNIQUE KEY `CI_CICategories_All_AK` (`CI_ID`, `CategoryInstanceID`),
    FOREIGN KEY (`CategoryInstanceID`) REFERENCES `CI_CategoryInstances` (`CategoryInstanceID`) ON DELETE CASCADE,
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

CREATE VIEW `vSMS_CIPlatform` AS 
SELECT 
    `CI_ID`, 
    SUM(`PlatformType`) AS `PlatformType` 
FROM (
    SELECT DISTINCT 
        `rel`.`FromCI_ID` AS `CI_ID`,  
        CASE 
            WHEN `cci`.`CategoryInstance_UniqueID` = 'Platform:C92857DF-9FD1-4FAD-BAA1-BE9FAD4B4F74' THEN 1
            WHEN `cci`.`CategoryInstance_UniqueID` = 'Platform:21296EAC-44A3-4B41-B7C4-962B3A30C4E2' THEN 2
            WHEN `cci`.`CategoryInstance_UniqueID` = 'Platform:FA39C57C-63ED-4166-8948-6A51230227FC' THEN 3
            ELSE 4
        END AS `PlatformType`
    FROM `CI_ConfigurationItemRelations` AS `rel`
    INNER JOIN `CI_ConfigurationItems` AS `toci` 
        ON `rel`.`ToCI_ID` = `toci`.`CI_ID` AND `toci`.`CIType_ID` = 14
    INNER JOIN `CI_CICategories_All` AS `cca` 
        ON `toci`.`CI_ID` = `cca`.`CI_ID`
    INNER JOIN `CI_CategoryInstances` AS `cci` 
        ON `cci`.`CategoryInstanceID` = `cca`.`CategoryInstanceID` AND `cci`.`ParentCategoryInstanceID` IS NULL
    WHERE `rel`.`RelationType` = 12

    UNION ALL

    SELECT DISTINCT 
        `pci`.`CI_ID`,  
        CASE 
            WHEN `cci`.`CategoryInstance_UniqueID` = 'Platform:C92857DF-9FD1-4FAD-BAA1-BE9FAD4B4F74' THEN 1
            WHEN `cci`.`CategoryInstance_UniqueID` = 'Platform:21296EAC-44A3-4B41-B7C4-962B3A30C4E2' THEN 2
            WHEN `cci`.`CategoryInstance_UniqueID` = 'Platform:FA39C57C-63ED-4166-8948-6A51230227FC' THEN 3
            ELSE 4
        END AS `PlatformType`
    FROM `CI_ConfigurationItems` AS `pci`
    INNER JOIN `CI_CICategories_All` AS `cca` 
        ON `pci`.`CI_ID` = `cca`.`CI_ID`
    INNER JOIN `CI_CategoryInstances` AS `cci` 
        ON `cci`.`CategoryInstanceID` = `cca`.`CategoryInstanceID` AND `cci`.`ParentCategoryInstanceID` IS NULL
    WHERE `pci`.`CIType_ID` = 14
) AS `t`
GROUP BY `CI_ID`;

CREATE TABLE `SEDO_LockableObjectComponents` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `ObjectID` CHAR(36) NOT NULL,
    `ComponentID` CHAR(36) NOT NULL,
    `OrigSiteNum` INT DEFAULT NULL,
    PRIMARY KEY (`ID`),
    UNIQUE KEY `SEDO_LockableObjectComponents_UniqueComponentID` (`ComponentID`)
);

CREATE TABLE `SEDO_LockableObjectTypes` (
    `ObjectTypeID` INT NOT NULL AUTO_INCREMENT,
    `ObjectType` VARCHAR(256) NOT NULL,
    `KeyProperty` VARCHAR(256) NOT NULL,
    `KeyDataType` VARCHAR(256) NOT NULL,
    `BaseTable` VARCHAR(256) NOT NULL,  -- sysname convertido para VARCHAR(256)
    `KeyColumn` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`ObjectTypeID`)
);

CREATE TABLE `SEDO_LockableObjects` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `LockID` CHAR(36) NOT NULL,
    `ObjectID` CHAR(36) NOT NULL,
    `ObjectVersion` CHAR(36) NOT NULL,
    `ObjectTypeID` INT NOT NULL,
    `OrigSiteNum` INT DEFAULT NULL,
    PRIMARY KEY (`ID`),
    UNIQUE KEY `SEDO_LockableObjects_AK` (`LockID`),
    UNIQUE KEY `SEDO_LockableObjects_UniqueObjectID` (`ObjectID`),
    FOREIGN KEY (`ObjectTypeID`) REFERENCES `SEDO_LockableObjectTypes` (`ObjectTypeID`)
);

CREATE VIEW `v_ConfigurationItems` AS 
SELECT 
  ci.CI_ID, 
  ci.CI_UniqueID, 
  ci.ModelId, 
  models.ModelName, 
  ci.CIVersion AS SDMPackageVersion, 
  ci.SDMPackageDigest, 
  ci.CIType_ID, 
  ci.CIVersion, 
  ci.DateCreated, 
  ci.DateLastModified, 
  ci.LastModifiedBy, 
  ci.CreatedBy, 
  ci.PermittedUses, 
  ci.IsBundle, 
  ci.IsHidden, 
  ci.IsTombstoned, 
  ci.IsUserDefined, 
  ci.IsEnabled, 
  ci.IsExpired, 
  ci.SourceSite, 
  ci.ContentSourcePath, 
  ci.ApplicabilityCondition, 
  ci.CI_CRC, 
  ci.Precedence, 
  ci.ConfigurationFlags,

  CASE 
    WHEN EXISTS (SELECT 1 FROM v_CIEULA_LocalizedContent cieula WHERE cieula.CI_ID = ci.CI_ID) THEN 1 
    ELSE 0 
  END AS EULAExists,

  IFNULL(CAST(eula.EULAAccepted AS UNSIGNED), 2) AS EULAAccepted, 
  eula.EULASignoffDate, 
  eula.EULASignoffUser, 
  0 AS IsQuarantined, 
  NULL AS EffectiveDate, 
  NULL AS ModifiedTime, 

  CASE  
    WHEN CIType_ID = 9 
      THEN CASE WHEN EXISTS (SELECT 1 FROM vCI_AssignmentTargetedGroups WHERE AssignedUpdateGroup = ci.CI_ID) THEN 1 ELSE 0 END 
    ELSE CASE WHEN EXISTS (SELECT 1 FROM CI_AssignmentTargetedCIs WHERE CI_ID = ci.CI_ID) THEN 1 ELSE 0 END 
  END AS IsDeployed,

  CASE WHEN EXISTS (SELECT 1 FROM v_CIRelation_All WHERE ReferencedCI_ID = ci.CI_ID AND RelationType = 6) THEN 1 ELSE 0 END AS IsSuperseded,
  CASE WHEN EXISTS (SELECT 1 FROM v_CIRelation WHERE FromCIID = ci.CI_ID AND RelationType = 5) THEN 1 ELSE 0 END AS IsChild,

  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM CI_ConfigurationItems cif 
      JOIN v_CIRelation cir ON cir.ToCIID = ci.CI_ID AND cir.FromCIID = cif.CI_ID 
      WHERE cir.RelationType IN (1, 2, 3, 4, 5, 8, 13) AND cif.IsTombstoned = 0
    ) THEN 1 
    ELSE 0 
  END AS InUse,

  ci.IsLatest,

  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM CI_CIStatus cis 
      INNER JOIN v_CIRelation_All rel ON cis.CI_ID = rel.ReferencedCI_ID 
      WHERE rel.CI_ID = ci.CI_ID AND cis.IsBroken = 1
    ) THEN 1 
    ELSE 0 
  END AS IsBroken,

  IFNULL(pl.PlatformType, 1) AS PlatformType,

  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM CI_ConfigurationItems toci 
      INNER JOIN v_CIRelationEx rel ON rel.ToCIID = toci.CI_ID 
      WHERE rel.FromCIID = ci.CI_ID 
        AND toci.IsUserCI = 1 
        AND ci.CIType_ID IN (2, 3, 4, 5) 
        AND rel.RelationType NOT IN (8, 80)
    ) THEN 1 
    WHEN ci.CIType_ID IN (10, 21) 
         AND EXISTS (
            SELECT * 
            FROM CI_ConfigurationItems cidt 
            WHERE cidt.CI_ID IN (
              SELECT ciappdt.ToCI_ID FROM CI_ConfigurationItemRelations ciappdt 
              WHERE (ciappdt.FromCI_ID = ci.CI_ID OR ciappdt.ToCI_ID = ci.CI_ID) 
              AND ciappdt.RelationType = 9 
              UNION 
              SELECT cidtdt.ToCIID 
              FROM v_CIRelationEx cidtdt 
              INNER JOIN CI_ConfigurationItemRelations ciappdt 
                ON ciappdt.ToCI_ID = cidtdt.FromCIID 
              WHERE (ciappdt.FromCI_ID = ci.CI_ID OR ciappdt.ToCI_ID = ci.CI_ID) 
                AND ciappdt.RelationType = 9
            ) AND cidt.IsUserCI = 1
         ) THEN 1 
    ELSE IFNULL(ci.IsUserCI, 0)
  END AS IsUserCI,

  ci.RevisionTag,

  CASE 
    WHEN NOT EXISTS (
      SELECT 1 
      FROM CI_ConfigurationItems 
      WHERE IsTombstoned = 0 
        AND ModelId = ci.ModelId 
        AND CIVersion > ci.CIVersion 
        AND RevisionTag = ci.RevisionTag
    ) THEN 1 
    ELSE 0 
  END AS IsSignificantRevision,

  CAST(SO.ObjectVersion AS CHAR(56)) AS SedoObjectVersion,

  ci.ApplicableAtUserLogon

FROM CI_ConfigurationItems ci 
LEFT JOIN CI_Models models ON models.ModelId = ci.ModelId 
LEFT JOIN CI_CIEULA eula ON ci.CI_ID = eula.CI_ID 
LEFT JOIN vSMS_CIPlatform pl ON pl.CI_ID = ci.CI_ID 
LEFT JOIN SEDO_LockableObjectComponents SC ON ci.SEDOComponentID = SC.ComponentID 
LEFT JOIN SEDO_LockableObjects SO ON SC.ObjectID = SO.ObjectID 
WHERE ci.IsTombstoned = 0;

CREATE TABLE `CI_UpdateCIs` (
    `CI_ID` INT NOT NULL,
    `BulletinID` VARCHAR(64) NOT NULL,
    `ArticleID` VARCHAR(64) NOT NULL,
    `Severity` INT DEFAULT NULL,
    `CustomSeverity` INT DEFAULT NULL,
    `CMTag` INT DEFAULT NULL,
    `DatePosted` DATETIME DEFAULT NULL,
    `DateRevised` DATETIME DEFAULT NULL,
    `RevisionNumber` INT NOT NULL,
    `MaxExecutionTime` INT DEFAULT NULL,
    `RequiresExclusiveHandling` BOOLEAN NOT NULL DEFAULT 0,
    `rowversion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `UpdateSource_ID` INT DEFAULT NULL,
    `MinSourceVersion` INT DEFAULT NULL,
    PRIMARY KEY (`CI_ID`),
    FOREIGN KEY (`CI_ID`) REFERENCES `CI_ConfigurationItems` (`CI_ID`) ON DELETE CASCADE
);

-- View: v_UpdateCIs
CREATE VIEW `v_UpdateCIs` AS 
SELECT 
    ci.*, 
    uci.BulletinID, 
    uci.ArticleID, 
    uci.Severity, 
    uci.CustomSeverity, 
    uci.CMTag, 
    uci.DatePosted, 
    uci.DateRevised, 
    uci.RevisionNumber, 
    uci.MaxExecutionTime, 
    uci.RequiresExclusiveHandling, 
    uci.UpdateSource_ID, 
    uci.MinSourceVersion 
FROM `v_ConfigurationItems` ci 
LEFT JOIN `CI_UpdateCIs` uci ON uci.CI_ID = ci.CI_ID 
WHERE ci.CIType_ID IN (1, 8, 9);

CREATE VIEW v_Categories AS
    -- direct map of CI_CategoryInstances
    SELECT cat.*
    FROM CI_CategoryInstances cat
    WHERE IsDeleted = 0;

CREATE VIEW v_CICategories AS
    -- return categories directly associated with CIs
    SELECT cc.CI_ID, cat.*
    FROM CI_CICategories cc
    JOIN v_Categories cat ON cat.CategoryInstanceID = cc.CategoryInstanceID;

CREATE TABLE CI_LocalizedCategoryInstances (
    CategoryInstanceID INT NOT NULL,
    LocaleID INT NOT NULL,
    CategoryInstanceName VARCHAR(512) NULL,
    rowversion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (CategoryInstanceID, LocaleID),
    CONSTRAINT CI_LocalizedCategoryInstances_CI_CategoryInstances_FK FOREIGN KEY (CategoryInstanceID)
        REFERENCES CI_CategoryInstances (CategoryInstanceID)
        ON DELETE CASCADE
);

CREATE VIEW v_LocalizedCategories AS
    -- return all defined localized category properties (multiple per category instance)
    SELECT *
    FROM CI_LocalizedCategoryInstances;

CREATE TABLE SMSData (
    ThisSiteCode VARCHAR(3) NOT NULL,
    ThisSiteName VARCHAR(200) NULL,
    ThisSiteGuid VARCHAR(64) NULL,
    SMSVersion VARCHAR(8) NULL,
    SMSBuildNumber INT NULL,
    SMSMinBuildNumber INT NULL,
    ServiceAccountName VARCHAR(255) NULL,
    SMSProviderServer VARCHAR(128) NULL,
    SMSSiteServer VARCHAR(128) NULL,
    LocaleID INT NULL,
    InstallDate DATETIME NULL,
    LastTimeSerial_MUS INT NULL,
    LastTimeSerial_FUS INT NULL,
    SiteNumber INT NOT NULL DEFAULT 1,
    SiteSid VARCHAR(256) NULL,
    SMSAvailableConsoleVersion VARCHAR(32) NULL,
    BoundaryGroupCacheTimestamp DATETIME NULL,
    MonthlyReleaseVersion INT NULL,
    PRIMARY KEY (ThisSiteCode)
);

CREATE VIEW v_LocalizedCategories_SiteLoc AS
    SELECT loc.*
    FROM SMSData sms
    JOIN CI_LocalizedCategoryInstances loc ON loc.LocaleID = sms.LocaleID;

-- View: v_CICategoryInfo
CREATE VIEW `v_CICategoryInfo` AS 
SELECT 
    cat.*, 
    loc.CategoryInstanceName, 
    loc.LocaleID 
FROM `v_CICategories` cat 
JOIN `v_LocalizedCategories_SiteLoc` loc 
    ON loc.CategoryInstanceID = cat.CategoryInstanceID;

CREATE TABLE CI_LocalizedProperties (
    CI_ID INT NOT NULL,
    LocaleID INT NOT NULL,
    DisplayName VARCHAR(513) NOT NULL,
    Description VARCHAR(3000) NULL,
    CIInformativeURL VARCHAR(512) NULL,
    rowversion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (CI_ID, LocaleID),
    CONSTRAINT CI_LocalizedProperties_CI_ConfigurationItems_FK FOREIGN KEY (CI_ID)
        REFERENCES CI_ConfigurationItems (CI_ID)
        ON DELETE CASCADE
);

CREATE VIEW v_LocalizedCIProperties_SiteLoc AS
SELECT loc.*
FROM SMSData sms
JOIN CI_LocalizedProperties loc ON loc.LocaleID = sms.LocaleID;

-- View: v_UpdateInfo
CREATE VIEW `v_UpdateInfo` AS 
SELECT 
    ci.*, 
    loc.LocaleID, 
    loc.DisplayName AS Title, 
    loc.Description, 
    loc.CIInformativeURL AS InfoURL, 
    IFNULL(typ.CategoryInstanceName, '') AS UpdateType, 
    IFNULL(inf.Locales, '') AS Locales 
FROM `v_UpdateCIs` ci 
LEFT JOIN `v_LocalizedCIProperties_SiteLoc` loc ON loc.CI_ID = ci.CI_ID 
LEFT JOIN `v_CICategoryInfo` typ ON typ.CI_ID = ci.CI_ID AND typ.CategoryTypeName = 'Update Type' 
LEFT JOIN `CI_UpdateInfo` inf ON inf.CI_ID = ci.CI_ID 
WHERE ci.IsHidden = 0;

CREATE TABLE MachineIdGroupXRef (
    MachineID INT NOT NULL,
    ArchitectureKey INT NOT NULL,
    GroupKey INT NOT NULL,
    GUID VARCHAR(255) NOT NULL,
    PRIMARY KEY (MachineID),
    UNIQUE KEY MachineIdGroupXRef_AK (GUID, ArchitectureKey)
);

CREATE TABLE MachineGroupXRef (
    MachineID INT NOT NULL,
    ArchitectureKey INT NOT NULL,
    GroupKey INT NOT NULL,
    NextInstanceKey INT NULL,
    PRIMARY KEY (MachineID, ArchitectureKey, GroupKey),
    CONSTRAINT MachineGroupXRef_MachineIDGroupXRef_FK FOREIGN KEY (MachineID)
        REFERENCES MachineIdGroupXRef (MachineID)
        ON DELETE CASCADE
);

CREATE TABLE System_DATA (
    MachineID INT NOT NULL,
    InstanceKey INT NOT NULL,
    RevisionID INT NULL,
    AgentID INT NULL,
    TimeKey DATETIME NOT NULL,
    rowversion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Name0 VARCHAR(255) NULL,
    SMSID0 VARCHAR(255) NULL,
    Domain0 VARCHAR(255) NULL,
    SystemRole0 VARCHAR(255) NULL,
    SystemType0 VARCHAR(255) NULL,
    PRIMARY KEY (MachineID),
    CONSTRAINT System_DATA_FK FOREIGN KEY (MachineID)
        REFERENCES MachineIdGroupXRef (MachineID)
        ON DELETE CASCADE,
    CONSTRAINT System_DATA_MachineID_Partition_CK CHECK (MachineID >= 16777216 AND MachineID <= 33554431)
);

CREATE TABLE Add_Remove_Programs_DATA (
    MachineID INT NOT NULL,
    InstanceKey INT NOT NULL,
    RevisionID INT NOT NULL,
    AgentID INT NULL,
    TimeKey DATETIME NOT NULL,
    rowversion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ProdID00 VARCHAR(255) NULL,
    DisplayName00 VARCHAR(255) NULL,
    InstallDate00 VARCHAR(255) NULL,
    Publisher00 VARCHAR(255) NULL,
    Version00 VARCHAR(255) NULL,
    PRIMARY KEY (MachineID, InstanceKey),
    UNIQUE KEY Add_Remove_Programs_DATA_AK (ProdID00, MachineID),
    CONSTRAINT Add_Remove_Programs_DATA_FK FOREIGN KEY (MachineID)
        REFERENCES System_DATA (MachineID)
        ON DELETE CASCADE,
    CONSTRAINT Add_Remove_Programs_DATA_MachineID_Partition_CK CHECK (MachineID >= 16777216 AND MachineID <= 33554431)
);

-- View: v_GS_ADD_REMOVE_PROGRAMS
CREATE VIEW `v_GS_ADD_REMOVE_PROGRAMS` AS 
SELECT 
    MachineID AS `ResourceID`, 
    InstanceKey AS `GroupID`, 
    RevisionID, 
    AgentID, 
    TimeKey AS `TimeStamp`,
    `DisplayName00` AS `DisplayName0`,
    `InstallDate00` AS `InstallDate0`,
    `ProdID00` AS `ProdID0`,
    `Publisher00` AS `Publisher0`,
    `Version00` AS `Version0`
FROM `Add_Remove_Programs_DATA`;

CREATE TABLE Computer_System_DATA (
  AdminPasswordStatus00 INT NULL,
  AutomaticResetBootOption00 INT NULL,
  AutomaticResetCapability00 INT NULL,
  BootOptionOnLimit00 INT NULL,
  BootOptionOnWatchDog00 INT NULL,
  BootROMSupported00 INT NULL,
  BootupState00 VARCHAR(255) NULL,
  Caption00 VARCHAR(255) NULL,
  ChassisBootupState00 INT NULL,
  CurrentTimeZone00 INT NULL,
  DaylightInEffect00 INT NULL,
  Description00 VARCHAR(255) NULL,
  Domain00 VARCHAR(255) NULL,
  DomainRole00 INT NULL,
  FrontPanelResetStatus00 INT NULL,
  InfraredSupported00 INT NULL,
  InitialLoadInfo00 VARCHAR(255) NULL,
  InstallDate00 DATETIME NULL,
  KeyboardPasswordStatus00 INT NULL,
  LastLoadInfo00 VARCHAR(255) NULL,
  Manufacturer00 VARCHAR(255) NULL,
  Model00 VARCHAR(255) NULL,
  Name00 VARCHAR(255) NULL,
  NameFormat00 VARCHAR(255) NULL,
  NetworkServerModeEnabled00 INT NULL,
  NumberOfProcessors00 INT NULL,
  OEMLogoBitmap00 VARCHAR(255) NULL,
  OEMStringArray00 VARCHAR(255) NULL,
  PauseAfterReset00 VARCHAR(255) NULL,
  PowerManagementCapabilities00 VARCHAR(255) NULL,
  PowerManagementSupported00 INT NULL,
  PowerOnPasswordStatus00 INT NULL,
  PowerState00 INT NULL,
  PowerSupplyState00 INT NULL,
  PrimaryOwnerContact00 VARCHAR(255) NULL,
  PrimaryOwnerName00 VARCHAR(255) NULL,
  ResetCapability00 INT NULL,
  ResetCount00 INT NULL,
  ResetLimit00 INT NULL,
  Roles00 VARCHAR(255) NULL,
  Status00 VARCHAR(255) NULL,
  SupportContactDescription00 VARCHAR(255) NULL,
  SystemStartupDelay00 INT NULL,
  SystemStartupOptions00 VARCHAR(255) NULL,
  SystemStartupSetting00 INT NULL,
  SystemType00 VARCHAR(255) NULL,
  ThermalState00 INT NULL,
  TotalPhysicalMemory00 BIGINT NULL,
  UserName00 VARCHAR(255) NULL,
  WakeUpType00 INT NULL,
  MachineID INT NOT NULL,
  InstanceKey INT NOT NULL,
  TimeKey DATETIME NOT NULL,
  RevisionID INT NOT NULL,
  AgentID INT NULL,
  rowversion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (MachineID, InstanceKey),
  UNIQUE KEY Computer_System_DATA_AK (Name00, MachineID),
  CONSTRAINT fk_Computer_System_DATA_MachineID FOREIGN KEY (MachineID) REFERENCES System_DATA(MachineID) ON DELETE CASCADE,
  CHECK (MachineID >= 16777216 AND MachineID <= 33554431)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW `v_GS_COMPUTER_SYSTEM` AS SELECT MachineID AS `ResourceID`, InstanceKey AS `GroupID`, RevisionID, AgentID, TimeKey AS `TimeStamp`,`AdminPasswordStatus00` AS `AdminPasswordStatus0`,`AutomaticResetBootOption00` AS `AutomaticResetBootOption0`,`AutomaticResetCapability00` AS `AutomaticResetCapability0`,`BootOptionOnLimit00` AS `BootOptionOnLimit0`,`BootOptionOnWatchDog00` AS `BootOptionOnWatchDog0`,`BootROMSupported00` AS `BootROMSupported0`,`BootupState00` AS `BootupState0`,`Caption00` AS `Caption0`,`ChassisBootupState00` AS `ChassisBootupState0`,`CurrentTimeZone00` AS `CurrentTimeZone0`,`DaylightInEffect00` AS `DaylightInEffect0`,`Description00` AS `Description0`,`Domain00` AS `Domain0`,`DomainRole00` AS `DomainRole0`,`FrontPanelResetStatus00` AS `FrontPanelResetStatus0`,`InfraredSupported00` AS `InfraredSupported0`,`InitialLoadInfo00` AS `InitialLoadInfo0`,`InstallDate00` AS `InstallDate0`,`KeyboardPasswordStatus00` AS `KeyboardPasswordStatus0`,`LastLoadInfo00` AS `LastLoadInfo0`,`Manufacturer00` AS `Manufacturer0`,`Model00` AS `Model0`,`Name00` AS `Name0`,`NameFormat00` AS `NameFormat0`,`NetworkServerModeEnabled00` AS `NetworkServerModeEnabled0`,`NumberOfProcessors00` AS `NumberOfProcessors0`,`OEMLogoBitmap00` AS `OEMLogoBitmap0`,`OEMStringArray00` AS `OEMStringArray0`,`PauseAfterReset00` AS `PauseAfterReset0`,`PowerManagementCapabilities00` AS `PowerManagementCapabilities0`,`PowerManagementSupported00` AS `PowerManagementSupported0`,`PowerOnPasswordStatus00` AS `PowerOnPasswordStatus0`,`PowerState00` AS `PowerState0`,`PowerSupplyState00` AS `PowerSupplyState0`,`PrimaryOwnerContact00` AS `PrimaryOwnerContact0`,`PrimaryOwnerName00` AS `PrimaryOwnerName0`,`ResetCapability00` AS `ResetCapability0`,`ResetCount00` AS `ResetCount0`,`ResetLimit00` AS `ResetLimit0`,`Roles00` AS `Roles0`,`Status00` AS `Status0`,`SupportContactDescription00` AS `SupportContactDescription0`,`SystemStartupDelay00` AS `SystemStartupDelay0`,`SystemStartupOptions00` AS `SystemStartupOptions0`,`SystemStartupSetting00` AS `SystemStartupSetting0`,`SystemType00` AS `SystemType0`,`ThermalState00` AS `ThermalState0`,`TotalPhysicalMemory00` AS `TotalPhysicalMemory0`,`UserName00` AS `UserName0`,`WakeUpType00` AS `WakeUpType0` FROM `Computer_System_DATA`;

CREATE TABLE Logical_Disk_DATA (
  Access00 INT NULL, 
  Availability00 INT NULL,
  BlockSize00 BIGINT NULL,
  Caption00 VARCHAR(255) NULL,
  Compressed00 INT NULL,
  ConfigManagerErrorCode00 INT NULL,
  ConfigManagerUserConfig00 INT NULL,
  Description00 VARCHAR(255) NULL,
  DeviceID00 VARCHAR(255) NULL,
  DriveType00 INT NULL,
  ErrorCleared00 INT NULL,
  ErrorDescription00 VARCHAR(255) NULL,
  ErrorMethodology00 VARCHAR(255) NULL,
  FileSystem00 VARCHAR(255) NULL,
  FreeSpace00 BIGINT NULL,
  InstallDate00 DATETIME NULL,
  LastErrorCode00 INT NULL,
  MaximumComponentLength00 INT NULL,
  MediaType00 INT NULL,
  Name00 VARCHAR(255) NULL,
  NumberOfBlocks00 VARCHAR(255) NULL,
  PNPDeviceID00 VARCHAR(255) NULL,
  PowerManagementCapabilities00 VARCHAR(255) NULL,
  PowerManagementSupported00 INT NULL,
  ProviderName00 VARCHAR(255) NULL,
  Purpose00 VARCHAR(255) NULL,
  Size00 BIGINT NULL,
  Status00 VARCHAR(255) NULL,
  StatusInfo00 INT NULL,
  SupportsFileBasedCompression00 INT NULL,
  SystemName00 VARCHAR(255) NULL,
  VolumeName00 VARCHAR(255) NULL,
  VolumeSerialNumber00 VARCHAR(255) NULL,
  MachineID INT NOT NULL,
  InstanceKey INT NOT NULL,
  TimeKey DATETIME NOT NULL,
  RevisionID INT NOT NULL,
  AgentID INT NULL,
  rowversion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (MachineID, InstanceKey),
  UNIQUE KEY Logical_Disk_DATA_AK (DeviceID00, MachineID),
  CONSTRAINT fk_Logical_Disk_DATA_MachineID FOREIGN KEY (MachineID) REFERENCES System_DATA(MachineID) ON DELETE CASCADE,
  CHECK (MachineID >= 16777216 AND MachineID <= 33554431)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW `v_GS_LOGICAL_DISK` AS SELECT MachineID AS `ResourceID`, InstanceKey AS `GroupID`, RevisionID, AgentID, TimeKey AS `TimeStamp`,`Access00` AS `Access0`,`Availability00` AS `Availability0`,`BlockSize00` AS `BlockSize0`,`Caption00` AS `Caption0`,`Compressed00` AS `Compressed0`,`ConfigManagerErrorCode00` AS `ConfigManagerErrorCode0`,`ConfigManagerUserConfig00` AS `ConfigManagerUserConfig0`,`Description00` AS `Description0`,`DeviceID00` AS `DeviceID0`,`DriveType00` AS `DriveType0`,`ErrorCleared00` AS `ErrorCleared0`,`ErrorDescription00` AS `ErrorDescription0`,`ErrorMethodology00` AS `ErrorMethodology0`,`FileSystem00` AS `FileSystem0`,`FreeSpace00` AS `FreeSpace0`,`InstallDate00` AS `InstallDate0`,`LastErrorCode00` AS `LastErrorCode0`,`MaximumComponentLength00` AS `MaximumComponentLength0`,`MediaType00` AS `MediaType0`,`Name00` AS `Name0`,`NumberOfBlocks00` AS `NumberOfBlocks0`,`PNPDeviceID00` AS `PNPDeviceID0`,`PowerManagementCapabilities00` AS `PowerManagementCapabilities0`,`PowerManagementSupported00` AS `PowerManagementSupported0`,`ProviderName00` AS `ProviderName0`,`Purpose00` AS `Purpose0`,`Size00` AS `Size0`,`Status00` AS `Status0`,`StatusInfo00` AS `StatusInfo0`,`SupportsFileBasedCompression00` AS `SupportsFileBasedCompression0`,`SystemName00` AS `SystemName0`,`VolumeName00` AS `VolumeName0`,`VolumeSerialNumber00` AS `VolumeSerialNumber0` FROM `Logical_Disk_DATA`;

CREATE VIEW vSMS_R_System AS
SELECT *
FROM System_DISC
WHERE Decommissioned0 = 0
  AND (
       (ItemKey < 16777216)
       OR (ItemKey BETWEEN 16777216 AND 33554431)
       OR (ItemKey >= 2030043136)
      );

CREATE VIEW `v_R_System` AS SELECT ItemKey AS `ResourceID`, DiscArchKey AS `ResourceType`,`AADDeviceID`,`AADTenantID`,`Active0`,`AD_Site_Name0`,`AlwaysInternet0`,`AMTFullVersion0`,`AMTStatus0`,`Build01`,`BuildExt`,`CertKeyType`,`Client0`,`AgentEdition0`,`Client_Type0`,`Client_Version0`,`CloudPCInfo`,`CPUType0`,`Creation_Date0`,`Decommissioned0`,`DeviceOwner0`,`DisableWindowsUpdateAccess`,`Distinguished_Name0`,`DNSForestGuid`,`DoNotConnectToWULocations`,`DotNetRelease`,`EAS_DeviceID`,`ESUValue`,`Full_Domain_Name0`,`Hardware_ID0`,`InternetEnabled0`,`Is_AOAC_Capable0`,`Is_MachineChanges_Persisted0`,`IsClientAMT30Compatible0`,`Is_Assigned_To_User0`,`Is_Portable_Operating_System0`,`Is_Virtual_Machine0`,`Is_Write_Filter_Capable0`,`Last_Logon_Timestamp0`,`User_Domain0`,`User_Name0`,`ManagementAuthority`,`MDMStatus`,`MDMDeviceCategoryID0`,`Name0`,`Netbios_Name0`,`Object_GUID0`,`Obsolete0`,`Operating_System_Name_and0`,`OSBranch01`,`Previous_SMS_UUID0`,`Primary_Group_ID0`,`PublisherDeviceID`,`Resource_Domain_OR_Workgr0`,`SenseID`,`SerialNumber`,`SID0`,`SMBIOS_GUID0`,`SMS_Unique_Identifier0`,`SMS_UUID_Change_Date0`,`Community_Name0`,`SuppressAutoProvision0`,`Unknown0`,`User_Account_Control0`,`Virtual_Machine_Host_Name0`,`Virtual_Machine_Type0`,`WipeStatus0`,`WTGUniqueKey` FROM `vSMS_R_System`;

CREATE TABLE User_DISC (
  ItemKey INT NOT NULL,
  DiscArchKey INT NULL,
  User_Name0 VARCHAR(256) NULL,
  Unique_User_Name0 VARCHAR(255) NULL,
  Network_Operating_System0 VARCHAR(256) NULL,
  Windows_NT_Domain0 VARCHAR(256) NULL,
  Full_Domain_Name0 VARCHAR(256) NULL,
  Name0 VARCHAR(256) NULL,
  SID0 VARCHAR(256) NULL,
  Object_GUID0 BINARY(16) NULL,
  Full_User_Name0 VARCHAR(256) NULL,
  Creation_Date0 DATETIME NULL,
  AD_Object_Creation_Time0 DATETIME NULL,
  Primary_Group_ID0 INT NULL,
  User_Account_Control0 INT NULL,
  Mail0 VARCHAR(256) NULL,
  Distinguished_Name0 VARCHAR(256) NULL,
  User_Principal_Name0 VARCHAR(256) NULL,
  CloudUserID CHAR(36) NULL,  -- GUID como string
  AADTenantID CHAR(36) NULL,
  AADUserID CHAR(36) NULL,
  vwgroupADMigration01 VARCHAR(32) NULL,
  vwgroupBETISCompanyCode VARCHAR(32) NULL,
  PRIMARY KEY (ItemKey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW `v_R_User` AS SELECT ItemKey AS `ResourceID`, DiscArchKey AS `ResourceType`,`AADTenantID`,`AADUserID`,`AD_Object_Creation_Time0`,`CloudUserId`,`Creation_Date0`,`Distinguished_Name0`,`Full_Domain_Name0`,`Full_User_Name0`,`Mail0`,`Name0`,`Network_Operating_System0`,`Object_GUID0`,`Primary_Group_ID0`,`SID0`,`Unique_User_Name0`,`User_Account_Control0`,`User_Name0`,`User_Principal_Name0`,`vwgroupADMigration01`,`vwgroupBETISCompanyCode`,`Windows_NT_Domain0` FROM `User_DISC`;

CREATE TABLE `PC_BIOS_DATA` (
  `MachineID` INT NOT NULL,
  `InstanceKey` INT NOT NULL,
  `RevisionID` INT NOT NULL,
  `AgentID` INT DEFAULT NULL,
  `TimeKey` DATETIME NOT NULL,
  `BiosCharacteristics00` VARCHAR(255) DEFAULT NULL,
  `BuildNumber00` VARCHAR(255) DEFAULT NULL,
  `Caption00` VARCHAR(255) DEFAULT NULL,
  `CodeSet00` VARCHAR(255) DEFAULT NULL,
  `CurrentLanguage00` VARCHAR(255) DEFAULT NULL,
  `Description00` VARCHAR(255) DEFAULT NULL,
  `IdentificationCode00` VARCHAR(255) DEFAULT NULL,
  `InstallableLanguages00` INT DEFAULT NULL,
  `InstallDate00` DATETIME DEFAULT NULL,
  `LanguageEdition00` VARCHAR(255) DEFAULT NULL,
  `ListOfLanguages00` VARCHAR(255) DEFAULT NULL,
  `Manufacturer00` VARCHAR(255) DEFAULT NULL,
  `Name00` VARCHAR(255) DEFAULT NULL,
  `OtherTargetOS00` VARCHAR(255) DEFAULT NULL,
  `PrimaryBIOS00` INT DEFAULT NULL,
  `ReleaseDate00` DATETIME DEFAULT NULL,
  `SerialNumber00` VARCHAR(255) DEFAULT NULL,
  `SMBIOSBIOSVersion00` VARCHAR(255) DEFAULT NULL,
  `SMBIOSMajorVersion00` INT DEFAULT NULL,
  `SMBIOSMinorVersion00` INT DEFAULT NULL,
  `SMBIOSPresent00` INT DEFAULT NULL,
  `SoftwareElementID00` VARCHAR(255) DEFAULT NULL,
  `SoftwareElementState00` INT DEFAULT NULL,
  `Status00` VARCHAR(255) DEFAULT NULL,
  `TargetOperatingSystem00` INT DEFAULT NULL,
  `Version00` VARCHAR(255) DEFAULT NULL,
  `BIOSVersion00` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`MachineID`, `InstanceKey`),
  UNIQUE KEY `PC_BIOS_DATA_AK` (
    `Name00`,
    `SoftwareElementID00`,
    `SoftwareElementState00`,
    `TargetOperatingSystem00`,
    `Version00`,
    `MachineID`
  ),
  -- FOREIGN KEY to System_DATA, assumed to exist
  CONSTRAINT `PC_BIOS_DATA_FK` FOREIGN KEY (`MachineID`)
    REFERENCES `System_DATA` (`MachineID`)
    ON DELETE CASCADE
);


CREATE VIEW `v_GS_PC_BIOS` AS
SELECT
    `MachineID` AS `ResourceID`,
    `InstanceKey` AS `GroupID`,
    `RevisionID`,
    `AgentID`,
    `TimeKey` AS `TimeStamp`,
    `BiosCharacteristics00` AS `BiosCharacteristics0`,
    `BIOSVersion00` AS `BIOSVersion0`,
    `BuildNumber00` AS `BuildNumber0`,
    `Caption00` AS `Caption0`,
    `CodeSet00` AS `CodeSet0`,
    `CurrentLanguage00` AS `CurrentLanguage0`,
    `Description00` AS `Description0`,
    `IdentificationCode00` AS `IdentificationCode0`,
    `InstallableLanguages00` AS `InstallableLanguages0`,
    `InstallDate00` AS `InstallDate0`,
    `LanguageEdition00` AS `LanguageEdition0`,
    `ListOfLanguages00` AS `ListOfLanguages0`,
    `Manufacturer00` AS `Manufacturer0`,
    `Name00` AS `Name0`,
    `OtherTargetOS00` AS `OtherTargetOS0`,
    `PrimaryBIOS00` AS `PrimaryBIOS0`,
    `ReleaseDate00` AS `ReleaseDate0`,
    `SerialNumber00` AS `SerialNumber0`,
    `SMBIOSBIOSVersion00` AS `SMBIOSBIOSVersion0`,
    `SMBIOSMajorVersion00` AS `SMBIOSMajorVersion0`,
    `SMBIOSMinorVersion00` AS `SMBIOSMinorVersion0`,
    `SMBIOSPresent00` AS `SMBIOSPresent0`,
    `SoftwareElementID00` AS `SoftwareElementID0`,
    `SoftwareElementState00` AS `SoftwareElementState0`,
    `Status00` AS `Status0`,
    `TargetOperatingSystem00` AS `TargetOperatingSystem0`,
    `Version00` AS `Version0`
FROM `PC_BIOS_DATA`;

CREATE TABLE `Processor_DATA` (
  `MachineID` INT NOT NULL,
  `InstanceKey` INT NOT NULL,
  `RevisionID` INT NOT NULL,
  `AgentID` INT DEFAULT NULL,
  `TimeKey` DATETIME NOT NULL,
  `Is64Bit00` INT DEFAULT NULL,
  `MaxClockSpeed00` INT DEFAULT NULL,
  `AddressWidth00` INT DEFAULT NULL,
  `Architecture00` INT DEFAULT NULL,
  `Availability00` INT DEFAULT NULL,
  `BrandID00` INT DEFAULT NULL,
  `Caption00` VARCHAR(255) DEFAULT NULL,
  `ConfigManagerErrorCode00` INT DEFAULT NULL,
  `ConfigManagerUserConfig00` INT DEFAULT NULL,
  `CPUHash00` VARCHAR(255) DEFAULT NULL,
  `CPUKey00` VARCHAR(255) DEFAULT NULL,
  `CpuStatus00` INT DEFAULT NULL,
  `CurrentClockSpeed00` INT DEFAULT NULL,
  `CurrentVoltage00` INT DEFAULT NULL,
  `DataWidth00` INT DEFAULT NULL,
  `Description00` VARCHAR(255) DEFAULT NULL,
  `DeviceID00` VARCHAR(255) DEFAULT NULL,
  `ErrorCleared00` INT DEFAULT NULL,
  `ErrorDescription00` VARCHAR(255) DEFAULT NULL,
  `ExtClock00` INT DEFAULT NULL,
  `Family00` INT DEFAULT NULL,
  `InstallDate00` DATETIME DEFAULT NULL,
  `IsHyperthreadCapable00` INT DEFAULT NULL,
  `IsHyperthreadEnabled00` INT DEFAULT NULL,
  `IsMobile00` INT DEFAULT NULL,
  `IsTrustedExecutionCapable00` INT DEFAULT NULL,
  `IsVitualizationCapable00` INT DEFAULT NULL,
  `L2CacheSize00` INT DEFAULT NULL,
  `L2CacheSpeed00` INT DEFAULT NULL,
  `L3CacheSize00` INT DEFAULT NULL,
  `L3CacheSpeed00` INT DEFAULT NULL,
  `LastErrorCode00` INT DEFAULT NULL,
  `Level00` INT DEFAULT NULL,
  `LoadPercentage00` INT DEFAULT NULL,
  `Manufacturer00` VARCHAR(255) DEFAULT NULL,
  `Name00` VARCHAR(255) DEFAULT NULL,
  `NormSpeed00` INT DEFAULT NULL,
  `NumberOfCores00` INT DEFAULT NULL,
  `NumberOfLogicalProcessors00` INT DEFAULT NULL,
  `OtherFamilyDescription00` VARCHAR(255) DEFAULT NULL,
  `PartOfDomain00` INT DEFAULT NULL,
  `PCache00` INT DEFAULT NULL,
  `PNPDeviceID00` VARCHAR(255) DEFAULT NULL,
  `PowerManagementCapabilities00` VARCHAR(255) DEFAULT NULL,
  `PowerManagementSupported00` INT DEFAULT NULL,
  `ProcessorId00` VARCHAR(255) DEFAULT NULL,
  `ProcessorType00` INT DEFAULT NULL,
  `Revision00` INT DEFAULT NULL,
  `Role00` VARCHAR(255) DEFAULT NULL,
  `SocketDesignation00` VARCHAR(255) DEFAULT NULL,
  `Status00` VARCHAR(255) DEFAULT NULL,
  `StatusInfo00` INT DEFAULT NULL,
  `Stepping00` VARCHAR(255) DEFAULT NULL,
  `SystemName00` VARCHAR(255) DEFAULT NULL,
  `UniqueId00` VARCHAR(255) DEFAULT NULL,
  `UpgradeMethod00` INT DEFAULT NULL,
  `Version00` VARCHAR(255) DEFAULT NULL,
  `VoltageCaps00` INT DEFAULT NULL,
  `Workgroup00` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`MachineID`, `InstanceKey`),
  UNIQUE KEY `Processor_DATA_AK` (`DeviceID00`, `MachineID`),
  CONSTRAINT `Processor_DATA_FK` FOREIGN KEY (`MachineID`)
    REFERENCES `System_DATA` (`MachineID`)
    ON DELETE CASCADE
);

CREATE VIEW `v_GS_PROCESSOR` AS
SELECT
    `MachineID` AS `ResourceID`,
    `InstanceKey` AS `GroupID`,
    `RevisionID`,
    `AgentID`,
    `TimeKey` AS `TimeStamp`,
    `AddressWidth00` AS `AddressWidth0`,
    `Architecture00` AS `Architecture0`,
    `Availability00` AS `Availability0`,
    `BrandID00` AS `BrandID0`,
    `Caption00` AS `Caption0`,
    `ConfigManagerErrorCode00` AS `ConfigManagerErrorCode0`,
    `ConfigManagerUserConfig00` AS `ConfigManagerUserConfig0`,
    `CPUHash00` AS `CPUHash0`,
    `CPUKey00` AS `CPUKey0`,
    `CpuStatus00` AS `CpuStatus0`,
    `CurrentClockSpeed00` AS `CurrentClockSpeed0`,
    `CurrentVoltage00` AS `CurrentVoltage0`,
    `DataWidth00` AS `DataWidth0`,
    `Description00` AS `Description0`,
    `DeviceID00` AS `DeviceID0`,
    `ErrorCleared00` AS `ErrorCleared0`,
    `ErrorDescription00` AS `ErrorDescription0`,
    `ExtClock00` AS `ExtClock0`,
    `Family00` AS `Family0`,
    `InstallDate00` AS `InstallDate0`,
    `Is64Bit00` AS `Is64Bit0`,
    `IsHyperthreadCapable00` AS `IsHyperthreadCapable0`,
    `IsHyperthreadEnabled00` AS `IsHyperthreadEnabled0`,
    `IsMobile00` AS `IsMobile0`,
    `IsTrustedExecutionCapable00` AS `IsTrustedExecutionCapable0`,
    `IsVitualizationCapable00` AS `IsVitualizationCapable0`,
    `L2CacheSize00` AS `L2CacheSize0`,
    `L2CacheSpeed00` AS `L2CacheSpeed0`,
    `L3CacheSize00` AS `L3CacheSize0`,
    `L3CacheSpeed00` AS `L3CacheSpeed0`,
    `LastErrorCode00` AS `LastErrorCode0`,
    `Level00` AS `Level0`,
    `LoadPercentage00` AS `LoadPercentage0`,
    `Manufacturer00` AS `Manufacturer0`,
    `MaxClockSpeed00` AS `MaxClockSpeed0`,
    `Name00` AS `Name0`,
    `NormSpeed00` AS `NormSpeed0`,
    `NumberOfCores00` AS `NumberOfCores0`,
    `NumberOfLogicalProcessors00` AS `NumberOfLogicalProcessors0`,
    `OtherFamilyDescription00` AS `OtherFamilyDescription0`,
    `PartOfDomain00` AS `PartOfDomain0`,
    `PCache00` AS `PCache0`,
    `PNPDeviceID00` AS `PNPDeviceID0`,
    `PowerManagementCapabilities00` AS `PowerManagementCapabilities0`,
    `PowerManagementSupported00` AS `PowerManagementSupported0`,
    `ProcessorId00` AS `ProcessorId0`,
    `ProcessorType00` AS `ProcessorType0`,
    `Revision00` AS `Revision0`,
    `Role00` AS `Role0`,
    `SocketDesignation00` AS `SocketDesignation0`,
    `Status00` AS `Status0`,
    `StatusInfo00` AS `StatusInfo0`,
    `Stepping00` AS `Stepping0`,
    `SystemName00` AS `SystemName0`,
    `UniqueId00` AS `UniqueId0`,
    `UpgradeMethod00` AS `UpgradeMethod0`,
    `Version00` AS `Version0`,
    `VoltageCaps00` AS `VoltageCaps0`,
    `Workgroup00` AS `Workgroup0`
FROM `Processor_DATA`;

ALTER TABLE `Update_ComplianceStatus` 
MODIFY COLUMN `Status` TINYINT NOT NULL DEFAULT 0;

ALTER TABLE `Update_ComplianceStatus` 
MODIFY COLUMN `LastLocalChangeTime` DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `CI_UpdateInfo`   ADD  CONSTRAINT `CI_UpdateInfo_CI_ConfigurationItems_FK` FOREIGN KEY(`CI_ID`)
REFERENCES `CI_ConfigurationItems` (`CI_ID`)
ON DELETE CASCADE;

ALTER TABLE `Update_ComplianceStatus`   ADD  CONSTRAINT `Update_ComplianceStatus_CI_ConfigurationItems_FK` FOREIGN KEY(`CI_ID`)
REFERENCES `CI_ConfigurationItems` (`CI_ID`)
ON DELETE CASCADE;

ALTER TABLE `Update_ComplianceStatus`   ADD  CONSTRAINT `Update_ComplianceStatus_MachineIdGroupXRef_FK` FOREIGN KEY(`MachineID`)
REFERENCES `MachineIdGroupXRef` (`MachineID`)
ON DELETE CASCADE;