'use strict'

module.exports = makeTables

const lf = require('lovefield')

function makeTables(schemaBuilder) {
    schemaBuilder.createTable('Battery')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('voltage_v', lf.Type.INTEGER)
        .addColumn('remaining_time_minutes', lf.Type.NUMBER)
        .addColumn('power_rate_w', lf.Type.INTEGER)
        .addColumn('remaining_capacity_percent', lf.Type.NUMBER)
        .addColumn('charging_bool', lf.Type.BOOLEAN)
        .addColumn('discharging_bool', lf.Type.BOOLEAN)
        .addColumn('ac_connected_bool', lf.Type.BOOLEAN)
        .addColumn('time', lf.Type.DATE_TIME)
        .addNullable(['remaining_time_minutes', 'power_rate_w',
            'voltage_v', 'charging_bool', 'discharging_bool', 'ac_connected_bool'])
        .addPrimaryKey(['id'], true)
}
