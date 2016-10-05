'use strict'


/* jshint ignore:start */
module.exports.DeviceDataExtraction = {
    Win32_BaseBoard: ['Manufacturer', 'Product', 'SerialNumber', 'Version'],
    Win32_BIOS: ['BiosCharacteristics', 'BIOSVersion', 'Caption',
        'Name', 'Manufacturer', 'SerialNumber', 'ReleaseDate', 'SMBIOSBIOSVersion',
        'SMBIOSMajorVersion', 'SMBIOSMinorVersion', 'SMBIOSPresent',
        'SoftwareElementID', 'SoftwareElementState', 'SystemBiosMajorVersion',
        'SystemBiosMinorVersion', 'TargetOperatingSystem', 'Version'],
    Win32_CacheMemory: ['StatusInfo'],
    Win32_CDROMDrive: ['Caption', 'CapabilityDescriptions', 'Name'],
    Win32_ComputerSystem: ['CurrentTimeZone', 'DaylightInEffect', 'WakeUpType',
        'TotalPhysicalMemory', 'SystemSKUNumber', 'SystemFamily',
        'PowerSupplyState', 'PowerState', 'PowerManagementSupported',
        'PowerManagementCapabilities', 'NumberOfProcessors', 'NumberOfProcessors',
        'NumberOfLogicalProcessors', 'Model', 'Manufacturer', 'InfraredSupported',
        'HypervisorPresent', 'FrontPanelResetStatus', 'Description'],
    Win32_ComputerSystemProduct: ['Caption', 'Description', 'IdentifyingNumber', 'Name',
        'Vendor', 'Version'],
    Win32_DiskDrive: ['BytesPerSector', 'Capabilities', 'CapabilityDescriptions',
        'Caption', 'FirmwareRevision', 'Manufacturer', 'Model', 'Partitions',
        'Size', 'Status', 'TotalSectors', 'TotalSectors', 'TotalCylinders',
        'TotalHeads', 'TracksPerCylinder', 'TotalTracks'],
    Win32_OperatingSystem: ['BuildType', 'Caption', 'DataExecutionPrevention_Available',
        'DataExecutionPrevention_32BitApplications',
        'DataExecutionPrevention_SupportPolicy', 'InstallDate', 'LastBootUpTime',
        'Locale', 'MaxNumberOfProcesses', 'MaxProcessMemorySize', 'NumberOfUsers',
        'Status'],
    Win32_PhysicalMemory: ['Capacity', 'ConfiguredClockSpeed', 'DataWidth', 'DeviceLocator',
        'FormFactor', 'Manufacturer', 'MemoryType', 'PartNumber', 'SMBIOSMemoryType',
        'Speed', 'TotalWidth', 'TypeDetail'],
    Win32_PortConnector: ['Caption', 'ConnectorType', 'ExternalReferenceDesignator',
        'Manufacturer', 'Model', 'Model'],
    Win32_Processor: ['AddressWidth', 'Architecture', 'Availability', 'Caption',
        'Characteristics', 'CpuStatus', 'CurrentVoltage', 'DataWidth',
        'Description', 'ExtClock', 'L2CacheSize', 'L3CacheSize', 'Level',
        'Manufacturer', 'MaxClockSpeed', 'NumberOfCores', 'Name',
        'NumberOfEnabledCore', 'NumberOfLogicalProcessors', 'ProcessorType',
        'StatusInfo', 'VirtualizationFirmwareEnabled'],
    Win32_SoundDevice: ['Caption', 'Description', 'Manufacturer', 'ProductName',
        'Status', 'Status'],
    Win32_Battery: ['Availability', 'BatteryStatus', 'Caption', 'Chemistry',
        'DesignVoltage', 'DeviceID', 'EstimatedChargeRemaining', 'EstimatedRunTime',
        'Name', 'PowerManagementCapabilities', 'Status', 'TimeOnBattery',
        'PowerManagementSupported'],
    Win32_DisplayConfiguration: ['BitsPerPel', 'Caption', 'Description', 'DeviceName',
        'DisplayFrequency', 'DisplayFlags', 'LogPixels', 'PelsHeight', 'PelsWidth',
        'SettingID', 'SpecificationVersion'],
    Win32_DisplayControllerConfiguration: ['Caption', 'ColorPlanes', 'Description',
        'DeviceEntriesInAColorTable', 'DeviceSpecificPens', 'HorizontalResolution',
        'Name', 'RefreshRate', 'SettingID', 'VerticalResolution', 'VideoMode'],
    Win32_MotherboardDevice: ['Availability', 'Caption', 'Description', 'PrimaryBusType',
        'SecondaryBusType', 'Status'],
    Win32_PortableBattery: ['CapacityMultiplier', 'Caption', 'Chemistry', 'DesignCapacity',
        'DesignVoltage', 'Manufacturer', 'Name', 'SmartBatteryVersion', 'MaxBatteryError'],
    Win32_VideoController: ['AdapterCompatibility', 'AdapterRAM', 'Availability',
        'Caption', 'CurrentBitsPerPixel', 'CurrentHorizontalResolution', 'CurrentNumberOfColors',
        'CurrentRefreshRate', 'CurrentVerticalResolution', 'Description', 'Name',
        'Status', 'VideoMemoryType', 'VideoArchitecture', 'VideoModeDescription', 'VideoProcessor']
}

module.exports.BatteryCapabilitiesInfo = {
    BatteryFullChargedCapacity: ['FullChargedCapacity'],
    BatteryStaticData: ['Capabilities']
}

module.exports.BatteryInfoMonitor = {
    BatteryFullChargedCapacity: ['FullChargedCapacity'],
    BatteryRuntime: ['EstimatedRuntime'],
    BatteryStaticData: ['Capabilities'],
    BatteryStatus: ['ChargeRate', 'Charging', 'DischargeRate',
        'Discharging', 'PowerOnline', 'RemainingCapacity', 'Voltage'],
}
/* jshint ignore:end */
