module.exports = {
    powerNormalEstimate,
    powerSaveEstimate
};

let powerModel = {};

const battery = {
    'remaining_time_minutes': 50,
    'power_rate_w': 15,
    'remaining_capacity_percent': 50,
    'voltage_v': 9,
    'charging_bool': false,
    'discharging_bool': false,
    'ac_connected_bool': true,
    'brightness_percent': 90,
    'memory_percent': 30,
    'memory_mb': 20,
    'read_request_per_s': 4,
    'read_kb_per_s': 3,
    'write_request_per_s': 10,
    'write_kb_per_s': 20,
    'cpu_usage_percent': 50,
    'cpu_cores': 4,
    'download_kb': 40,
    'upload_kb': 30,
    'wifi': true,
    'internet_connected': true,
    'dm_enabled': true
};


function powerNormalEstimate(systemMetrics, math) {
    return math.log(10000, 10);
    //return 5 * systemMetrics['power_rate_w'] + 10
}

function powerSaveEstimate(systemMetrics) {
    return 2 * systemMetrics['power_rate_w'] + 5
}