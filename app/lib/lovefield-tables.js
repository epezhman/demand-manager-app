'use strict'

module.exports = makeTables

const lf = require('lovefield')

function makeTables(schemaBuilder) {
    schemaBuilder.createTable('Battery')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('status', lf.Type.BOOLEAN)
        .addNullable(['status'])
        .addPrimaryKey(['id'], true)
}
