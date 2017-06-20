module.exports = {
    powerNormalEstimateWin,
    powerSaveEstimateWin,
    powerNormalEstimateLinux,
    powerSaveEstimateLinux
};


function standardizeReadWriteRate(readRate, writeRate) {
    let readWriteRate = readRate + writeRate;
    return (readWriteRate > 1000 ? 1000 : readWriteRate) / 10
}

function standardizeDownloadUploadRate(downloadRate, uploadRate) {
    let downloadUploadRate = downloadRate + uploadRate
    return (downloadUploadRate > 1000 ? 1000 : downloadUploadRate) / 10
}

function powerNormalEstimateWin(systemMetrics, math) {
    let power = 29.2640774995438

    if (systemMetrics.hasOwnProperty('power_rate_w')) {
        power += 2.07185395003116 * systemMetrics['power_rate_w']
        power += -0.0491634826198328 * systemMetrics['power_rate_w'] * systemMetrics['power_rate_w']
        if (systemMetrics.hasOwnProperty('brightness_percent')) {
            power += 0.011266049104918 * systemMetrics['power_rate_w'] * systemMetrics['brightness_percent']
        }
        if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
            power += -0.00874571404500626 * systemMetrics['power_rate_w'] * systemMetrics['remaining_capacity_percent']
        }
    }

    if (systemMetrics.hasOwnProperty('charging_bool')) {
        power += -9.435543147928 * systemMetrics['charging_bool'] ? 1 : 0
    }

    if (systemMetrics.hasOwnProperty('cpu_usage_percent')) {
        power += 0.00934289047611992 * systemMetrics['cpu_usage_percent']
    }

    if (systemMetrics.hasOwnProperty('memory_percent')) {
        power += 0.0624802837735262 * systemMetrics['memory_percent']
    }

    if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
        power += 0.0274158866575458 * systemMetrics['remaining_capacity_percent']
    }

    if (systemMetrics.hasOwnProperty('read_request_per_s') && systemMetrics.hasOwnProperty('write_request_per_s')) {
        power += 0.000546782609206991 * standardizeReadWriteRate(systemMetrics['read_request_per_s'],
                systemMetrics['write_request_per_s'])
    }

    if (systemMetrics.hasOwnProperty('download_kb') && systemMetrics.hasOwnProperty('upload_kb')) {
        power += 0.0302543818673967 * standardizeDownloadUploadRate(systemMetrics['download_kb'],
                systemMetrics['upload_kb'])
    }

    return power
}

function powerSaveEstimateWin(systemMetrics, math) {
    let power = 18.6183363008292

    if (systemMetrics.hasOwnProperty('power_rate_w')) {
        power += 1.08107763640821 * systemMetrics['power_rate_w']
        power += 0.00935020347880415 * systemMetrics['power_rate_w'] * systemMetrics['power_rate_w']
        if (systemMetrics.hasOwnProperty('brightness_percent')) {
            power += 0.00587567924514585 * systemMetrics['power_rate_w'] * systemMetrics['brightness_percent']
        }
        if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
            power += -0.00276980426636256 * systemMetrics['power_rate_w'] * systemMetrics['remaining_capacity_percent']
        }
    }

    if (systemMetrics.hasOwnProperty('charging_bool')) {
        power += -3.40897597424257 * systemMetrics['charging_bool'] ? 1 : 0
    }

    if (systemMetrics.hasOwnProperty('cpu_usage_percent')) {
        power += 0.0473331068273466 * systemMetrics['cpu_usage_percent']
    }

    if (systemMetrics.hasOwnProperty('memory_percent')) {
        power += 0.0308373430969711 * systemMetrics['memory_percent']
    }

    if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
        power += -0.0238332670179607 * systemMetrics['remaining_capacity_percent']
    }

    if (systemMetrics.hasOwnProperty('read_request_per_s') && systemMetrics.hasOwnProperty('write_request_per_s')) {
        power += 0.0869658823802499 * standardizeReadWriteRate(systemMetrics['read_request_per_s'],
                systemMetrics['write_request_per_s'])
    }

    if (systemMetrics.hasOwnProperty('download_kb') && systemMetrics.hasOwnProperty('upload_kb')) {
        power += 0.032983955517436 * standardizeDownloadUploadRate(systemMetrics['download_kb'],
                systemMetrics['upload_kb'])
    }

    return power
}

function powerNormalEstimateLinux(systemMetrics, math) {
    let power = 76.1630856275752

    if (systemMetrics.hasOwnProperty('power_rate_w')) {
        power += -1.87866892968447 * systemMetrics['power_rate_w']
        power += 0.0212839300207896 * systemMetrics['power_rate_w'] * systemMetrics['power_rate_w']
        // if (systemMetrics.hasOwnProperty('brightness_percent')) {
        //     power += -0.0461943601807379 * systemMetrics['power_rate_w'] * systemMetrics['brightness_percent']
        // }
        if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
            power += 0.0257185065298105 * systemMetrics['power_rate_w'] * systemMetrics['remaining_capacity_percent']
        }
    }

    if (systemMetrics.hasOwnProperty('charging_bool')) {
        power += 1.21538627094047 * systemMetrics['charging_bool'] ? 1 : 0
    }

    if (systemMetrics.hasOwnProperty('cpu_usage_percent')) {
        power += 0.141578213328859 * systemMetrics['cpu_usage_percent']
    }

    if (systemMetrics.hasOwnProperty('memory_percent')) {
        power += 0.0809562125011695 * systemMetrics['memory_percent']
    }

    if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
        power += -0.566656290923732 * systemMetrics['remaining_capacity_percent']
    }

    if (systemMetrics.hasOwnProperty('read_request_per_s') && systemMetrics.hasOwnProperty('write_request_per_s')) {
        power += -0.0461943601807379 * standardizeReadWriteRate(systemMetrics['read_request_per_s'],
                systemMetrics['write_request_per_s'])
    }

    if (systemMetrics.hasOwnProperty('download_kb') && systemMetrics.hasOwnProperty('upload_kb')) {
        power += 0.0111823396892784 * standardizeDownloadUploadRate(systemMetrics['download_kb'],
                systemMetrics['upload_kb'])
    }

    return power
}

function powerSaveEstimateLinux(systemMetrics, math) {
    let power = 112.964711750662

    if (systemMetrics.hasOwnProperty('power_rate_w')) {
        power += -2.26766911536105 * systemMetrics['power_rate_w']
        power += 0.00727874616419765 * systemMetrics['power_rate_w'] * systemMetrics['power_rate_w']
        // if (systemMetrics.hasOwnProperty('brightness_percent')) {
        //     power += -0.127547639472381 * systemMetrics['power_rate_w'] * systemMetrics['brightness_percent']
        // }
        if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
            power += 0.0324660287895647 * systemMetrics['power_rate_w'] * systemMetrics['remaining_capacity_percent']
        }
    }

    if (systemMetrics.hasOwnProperty('charging_bool')) {
        power += -0.878828524363993 * systemMetrics['charging_bool'] ? 1 : 0
    }

    if (systemMetrics.hasOwnProperty('cpu_usage_percent')) {
        power += 0.263432802724263 * systemMetrics['cpu_usage_percent']
    }

    if (systemMetrics.hasOwnProperty('memory_percent')) {
        power += -0.317283036529003 * systemMetrics['memory_percent']
    }

    if (systemMetrics.hasOwnProperty('remaining_capacity_percent')) {
        power += -0.861106673734758 * systemMetrics['remaining_capacity_percent']
    }

    if (systemMetrics.hasOwnProperty('read_request_per_s') && systemMetrics.hasOwnProperty('write_request_per_s')) {
        power += -0.127547639472381 * standardizeReadWriteRate(systemMetrics['read_request_per_s'],
                systemMetrics['write_request_per_s'])
    }

    if (systemMetrics.hasOwnProperty('download_kb') && systemMetrics.hasOwnProperty('upload_kb')) {
        power += 0.019050448900371 * standardizeDownloadUploadRate(systemMetrics['download_kb'],
                systemMetrics['upload_kb'])
    }

    return power
}