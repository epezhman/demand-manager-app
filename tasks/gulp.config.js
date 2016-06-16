module.exports = ()=> {
    var config = {

        // All js which is needed to be vet
        appjs:[
            './app/**/*.js',
            '!./app/node_modules/**',
            './tasks/**/*.js'
        ]
    }

    return config
}