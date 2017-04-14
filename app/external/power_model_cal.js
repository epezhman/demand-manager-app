module.exports = {
    powerNormalEstimate,
    powerSaveEstimate
};


function powerNormalEstimate(systemMetrics, math) {
    return 2 * systemMetrics['power_rate_w'] + 15
}

function powerSaveEstimate(systemMetrics, math) {
    return (2 * systemMetrics['power_rate_w'] + 15) * 0.8
}