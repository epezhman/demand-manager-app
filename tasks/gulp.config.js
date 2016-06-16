module.exports = ()=> {
    var config = {

        // All app js which is needed for vet
        appjs:[
            './app/**/*.js',
            '!./app/node_modules/**'
        ]
    }

    return config
}