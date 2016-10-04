'use strict'

module.exports = {
    addOne
}


const config = require('../config')
const lf = require('lovefield')

var schemaBuilder = lf.schema.create(config.LOVEFILED_DB_NAME, 1)

schemaBuilder.createTable('Battery')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('status', lf.Type.BOOLEAN)
    .addNullable(['status'])
    .addPrimaryKey(['id'], true)





function addOne() {

    schemaBuilder.connect().then((db)=> {
        var _db
        _db = db
        var battery = _db.getSchema().table('Battery')
        var row = battery.createRow({
            'status': true
        })

        _db.insert().into(battery).values([row]).exec()
    })

}