/** Gulp requires **/
var gulp = require('gulp'),
	path = require('path'),
	rename = require('gulp-rename'),
	less = require('gulp-less'),
	coffee = require('gulp-coffee'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps');

/** Vendor paths **/
var vendor = {
	styles: [],
	scripts: []
}

/** App paths **/
var paths = {
	styles: ['src/less/khausjs.less'],
	scripts: ['src/coffee/khausjs.coffee'],
	images: ''
};

gulp.task('styles', function () {  
	return gulp.src(paths.styles)
		.pipe(sourcemaps.init())
			.pipe(less())
			.pipe(concat('kahusjs.css'))
			.pipe(gulp.dest('dist/css'))
			.pipe(minifyCss({compatibility: 'ie8'}))
			.pipe(rename({extname:'.min.css'}))
			.pipe(gulp.dest('dist/css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/css'));
});
gulp.task('vendor-styles', function() {
	return gulp.src(vendor.styles)
		.pipe(sourcemaps.init())
			.pipe(concat('vendor.css'))
			.pipe(gulp.dest('dist/css'))
			.pipe(minifyCss({compatibility: 'ie8'}))
			.pipe(rename({extname:'.min.css'}))
			.pipe(gulp.dest('dist/css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
			.pipe(coffee({bare: true}))
			.pipe(concat('kahusjs.js'))
			.pipe(gulp.dest('dist/js'))
			.pipe(uglify())
			.pipe(rename({extname:'.min.js'}))
			.pipe(gulp.dest('dist/js'))
		.pipe(sourcemaps.write('.'))
    	.pipe(gulp.dest('dist/js'));
});
gulp.task('vendor-scripts', function() {
	return gulp.src(vendor.scripts)
		.pipe(sourcemaps.init())
			.pipe(concat('app.js'))
			.pipe(gulp.dest('dist/js'))
			.pipe(uglify())
			.pipe(rename({extname:'.min.js'}))
			.pipe(gulp.dest('dist/js'))
		.pipe(sourcemaps.write('.'))
    	.pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function() {
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', [
	'vendor-styles', 
	'styles', 
	'scripts',
	'vendor-scripts'
]);