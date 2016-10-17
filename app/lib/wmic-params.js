'use strict'


/* jshint ignore:start */
module.exports.DeviceDataExtraction = {
    CIMV2$Win32_BaseBoard: ['Manufacturer', 'Product', 'SerialNumber', 'Version'],
    CIMV2$Win32_BIOS: ['BiosCharacteristics', 'BIOSVersion', 'Caption',
        'Name', 'Manufacturer', 'SerialNumber', 'ReleaseDate', 'SMBIOSBIOSVersion',
        'SMBIOSMajorVersion', 'SMBIOSMinorVersion', 'SMBIOSPresent',
        'SoftwareElementID', 'SoftwareElementState', 'SystemBiosMajorVersion',
        'SystemBiosMinorVersion', 'TargetOperatingSystem', 'Version'],
    CIMV2$Win32_CacheMemory: ['StatusInfo'],
    CIMV2$Win32_CDROMDrive: ['Caption', 'CapabilityDescriptions', 'Name'],
    CIMV2$Win32_ComputerSystem: ['CurrentTimeZone', 'DaylightInEffect', 'WakeUpType',
        'TotalPhysicalMemory', 'SystemSKUNumber', 'SystemFamily',
        'PowerSupplyState', 'PowerState', 'PowerManagementSupported',
        'PowerManagementCapabilities', 'NumberOfProcessors', 'NumberOfProcessors',
        'NumberOfLogicalProcessors', 'Model', 'Manufacturer', 'InfraredSupported',
        'HypervisorPresent', 'FrontPanelResetStatus', 'Description'],
    CIMV2$Win32_ComputerSystemProduct: ['Caption', 'Description', 'IdentifyingNumber', 'Name',
        'Vendor', 'Version'],
    CIMV2$Win32_DiskDrive: ['BytesPerSector', 'Capabilities', 'CapabilityDescriptions',
        'Caption', 'FirmwareRevision', 'Manufacturer', 'Model', 'Partitions',
        'Size', 'Status', 'TotalSectors', 'TotalSectors', 'TotalCylinders',
        'TotalHeads', 'TracksPerCylinder', 'TotalTracks'],
    CIMV2$Win32_OperatingSystem: ['BuildType', 'Caption', 'DataExecutionPrevention_Available',
        'DataExecutionPrevention_32BitApplications',
        'DataExecutionPrevention_SupportPolicy', 'InstallDate', 'LastBootUpTime',
        'Locale', 'MaxNumberOfProcesses', 'MaxProcessMemorySize', 'NumberOfUsers',
        'Status'],
    CIMV2$Win32_PhysicalMemory: ['Capacity', 'ConfiguredClockSpeed', 'DataWidth', 'DeviceLocator',
        'FormFactor', 'Manufacturer', 'MemoryType', 'PartNumber', 'SMBIOSMemoryType',
        'Speed', 'TotalWidth', 'TypeDetail'],
    CIMV2$Win32_PortConnector: ['Caption', 'ConnectorType', 'ExternalReferenceDesignator',
        'Manufacturer', 'Model', 'Model'],
    CIMV2$Win32_Processor: ['AddressWidth', 'Architecture', 'Availability', 'Caption',
        'Characteristics', 'CpuStatus', 'CurrentVoltage', 'DataWidth',
        'Description', 'ExtClock', 'L2CacheSize', 'L3CacheSize', 'Level',
        'Manufacturer', 'MaxClockSpeed', 'NumberOfCores', 'Name',
        'NumberOfEnabledCore', 'NumberOfLogicalProcessors', 'ProcessorType',
        'StatusInfo', 'VirtualizationFirmwareEnabled'],
    CIMV2$Win32_SoundDevice: ['Caption', 'Description', 'Manufacturer', 'ProductName',
        'Status', 'Status'],
    CIMV2$Win32_Battery: ['Availability', 'BatteryStatus', 'Caption', 'Chemistry',
        'DesignVoltage', 'DeviceID', 'EstimatedChargeRemaining', 'EstimatedRunTime',
        'Name', 'PowerManagementCapabilities', 'Status', 'TimeOnBattery',
        'PowerManagementSupported'],
    CIMV2$Win32_DisplayConfiguration: ['BitsPerPel', 'Caption', 'Description', 'DeviceName',
        'DisplayFrequency', 'DisplayFlags', 'LogPixels', 'PelsHeight', 'PelsWidth',
        'SettingID', 'SpecificationVersion'],
    CIMV2$Win32_DisplayControllerConfiguration: ['Caption', 'ColorPlanes', 'Description',
        'DeviceEntriesInAColorTable', 'DeviceSpecificPens', 'HorizontalResolution',
        'Name', 'RefreshRate', 'SettingID', 'VerticalResolution', 'VideoMode'],
    CIMV2$Win32_MotherboardDevice: ['Availability', 'Caption', 'Description', 'PrimaryBusType',
        'SecondaryBusType', 'Status'],
    CIMV2$Win32_PortableBattery: ['CapacityMultiplier', 'Caption', 'Chemistry', 'DesignCapacity',
        'DesignVoltage', 'Manufacturer', 'Name', 'SmartBatteryVersion', 'MaxBatteryError'],
    CIMV2$Win32_VideoController: ['AdapterCompatibility', 'AdapterRAM', 'Availability',
        'Caption', 'CurrentBitsPerPixel', 'CurrentHorizontalResolution', 'CurrentNumberOfColors',
        'CurrentRefreshRate', 'CurrentVerticalResolution', 'Description', 'Name',
        'Status', 'VideoMemoryType', 'VideoArchitecture', 'VideoModeDescription', 'VideoProcessor']
}

module.exports.BatteryCapabilitiesInfo = {
    WMI$BatteryFullChargedCapacity: ['FullChargedCapacity'],
    WMI$BatteryStaticData: ['Capabilities']
}

module.exports.BatteryInfoMonitor = {
    WMI$BatteryFullChargedCapacity: ['FullChargedCapacity'],
    WMI$BatteryRuntime: ['EstimatedRuntime'],
    WMI$BatteryStaticData: ['Capabilities'],
    WMI$BatteryStatus: ['ChargeRate', 'Charging', 'DischargeRate',
        'Discharging', 'PowerOnline', 'RemainingCapacity', 'Voltage'],
    CIMV2$Win32_Battery: ['Availability', 'BatteryStatus', 'Caption', 'Chemistry',
        'DesignVoltage', 'DeviceID', 'EstimatedChargeRemaining', 'EstimatedRunTime',
        'Name', 'PowerManagementCapabilities', 'Status', 'TimeOnBattery',
        'PowerManagementSupported'],
}

/* jshint ignore:end */
