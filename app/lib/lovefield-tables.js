'use strict'

module.exports = makeTables

const lf = require('lovefield')

function makeTables(schemaBuilder) {
    schemaBuilder.createTable('Battery')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('estimated_runtime', lf.Type.NUMBER)
        .addColumn('charge_rate', lf.Type.INTEGER)
        .addColumn('discharge_rate', lf.Type.INTEGER)
        .addColumn('remaining_capacity', lf.Type.NUMBER)
        .addColumn('voltage', lf.Type.INTEGER)
        .addColumn('charging', lf.Type.BOOLEAN)
        .addColumn('discharging', lf.Type.BOOLEAN)
        .addColumn('power_online', lf.Type.BOOLEAN)
        .addColumn('time', lf.Type.DATE_TIME)
        .addNullable(['estimated_runtime', 'charge_rate', 'discharge_rate',
            'voltage', 'charging', 'discharging', 'power_online'])
        .addPrimaryKey(['id'], true)
}
