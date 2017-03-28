'use strict'


module.exports.WindowType = {
    STATUS: 'status',
    SETTINGS: 'settings',
    ABOUT: 'about',
    REGISTER: 'register'
}

module.exports.WMICommandType = {
    DEVICE: 'device',
    BATTERY: 'battery',
    BATTERY_CAPABILITY: 'battery_capability',
    BATTERY_FIRST_PROFILE: 'battery_first_profile'
}

module.exports.LinuxPowerMonitor = {
    BATTERY: 'battery',
    BATTERY_FIRST_PROFILE: 'battery_first_profile'
}

module.exports.LocationMonitor = {
    FIND_LOCATION: 'find-location',
    MAKE_LOCATION_PROFILE: 'make-location-profile'
}

module.exports.WeekDays = {
    MONDAY: 'mon',
    TUESDAY: 'tue',
    WEDNESDAY: 'wed',
    THURSDAY: 'thu',
    FRIDAY: 'fri',
    SATURDAY: 'sat',
    SUNDAY: 'sun'
}

module.exports.DMCheck = {
    RUN_DM: 0,
    NOT_RUN_DM: 1
}
