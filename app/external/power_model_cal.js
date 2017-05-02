module.exports = {
    powerNormalEstimateWin,
    powerSaveEstimateWin,
    powerNormalEstimateLinux,
    powerSaveEstimateLinux
};


function powerNormalEstimateWin(systemMetrics, math) {
    return 2 * systemMetrics['power_rate_w'] + 15
}

function powerSaveEstimateWin(systemMetrics, math) {
    return (2 * systemMetrics['power_rate_w'] + 15) * 0.8
}

function powerNormalEstimateLinux(systemMetrics, math) {
    return 2 * systemMetrics['power_rate_w'] + 15
}

function powerSaveEstimateLinux(systemMetrics, math) {
    return (2 * systemMetrics['power_rate_w'] + 15) * 0.8
}