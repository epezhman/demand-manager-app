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


    schemaBuilder.createTable('BatteryProfile')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('voltage_v', lf.Type.INTEGER)
        .addColumn('remaining_time_minutes', lf.Type.NUMBER)
        .addColumn('power_rate_w', lf.Type.INTEGER)
        .addColumn('remaining_capacity_percent', lf.Type.NUMBER)
        .addColumn('charging_bool', lf.Type.BOOLEAN)
        .addColumn('discharging_bool', lf.Type.BOOLEAN)
        .addColumn('ac_connected_bool', lf.Type.BOOLEAN)
        .addColumn('day_of_week', lf.Type.STRING)
        .addColumn('one_hour_duration_beginning', lf.Type.NUMBER)
        .addNullable(['remaining_time_minutes', 'power_rate_w',
            'voltage_v', 'charging_bool', 'discharging_bool', 'ac_connected_bool'])
        .addPrimaryKey(['id'], true)

    schemaBuilder.createTable('Location')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('country_code', lf.Type.STRING)
        .addColumn('country_name', lf.Type.STRING)
        .addColumn('region_code', lf.Type.STRING)
        .addColumn('region_name', lf.Type.STRING)
        .addColumn('city', lf.Type.STRING)
        .addColumn('zip_code', lf.Type.STRING)
        .addColumn('time_zone', lf.Type.STRING)
        .addColumn('latitude', lf.Type.NUMBER)
        .addColumn('longitude', lf.Type.NUMBER)
        .addColumn('accuracy', lf.Type.INTEGER)
        .addColumn('time', lf.Type.DATE_TIME)
        .addNullable(['country_code', 'country_name', 'region_code',
            'region_name', 'city', 'zip_code', 'time_zone', 'accuracy'])
        .addPrimaryKey(['id'], true)

    schemaBuilder.createTable('LocationProfile')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('country_code', lf.Type.STRING)
        .addColumn('country_name', lf.Type.STRING)
        .addColumn('region_code', lf.Type.STRING)
        .addColumn('region_name', lf.Type.STRING)
        .addColumn('city', lf.Type.STRING)
        .addColumn('zip_code', lf.Type.STRING)
        .addColumn('time_zone', lf.Type.STRING)
        .addColumn('latitude', lf.Type.NUMBER)
        .addColumn('longitude', lf.Type.NUMBER)
        .addColumn('accuracy', lf.Type.INTEGER)
        .addColumn('day_of_week', lf.Type.STRING)
        .addColumn('one_hour_duration_beginning', lf.Type.NUMBER)
        .addNullable(['country_code', 'country_name', 'region_code',
            'region_name', 'city', 'zip_code', 'time_zone', 'accuracy'])
        .addPrimaryKey(['id'], true)
}
