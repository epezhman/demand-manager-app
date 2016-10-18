'use strict'

var gulp = require('gulp')
var sass = require('gulp-sass')

gulp.task('sass', () => {
    return gulp.src('./app/assets/stylesheets/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./app/assets/stylesheets/css'))
})

gulp.task('sass:watch', ()=> {
    gulp.watch('./app/assets/stylesheets/sass/**/*.scss', ['sass'])
})