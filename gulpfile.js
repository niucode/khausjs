var gulp = require('gulp'),
	path = require('path'),
	less = require('gulp-less'),
	coffee = require('gulp-coffee'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps');


gulp.task('less', function () {  
	return gulp.src('src/less/app.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('coffee', function() {
	gulp.src('src/coffee/app.coffee')
		.pipe(coffee({bare: true}))
		.pipe(gulp.dest('dist/js'))
});


gulp.task('compressJS', function() {  
  return gulp.src('dist/js/app.js')
  	.pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('compressCSS', function() {
	return gulp.src('styles/*.css')
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist'));
});



gulp.task('default', function() {
    gulp.src('dist/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});