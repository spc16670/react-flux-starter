"use strict";

var gulp 			= require('gulp')
	, babelify 		= require('babelify')
	, sass 			= require('gulp-sass')
	, open 			= require('gulp-open')
	, browserify 	= require('browserify')
	, concat 		= require('gulp-concat')
	, lint 			= require('gulp-eslint')
	, uglify 		= require('gulp-uglify')
	, connect 		= require('gulp-connect')
	, cssnano 		= require('gulp-cssnano')
	, buffer 		= require('vinyl-buffer')
	, sourcemaps 	= require('gulp-sourcemaps')
	, autoprefixer 	= require('gulp-autoprefixer')
	, source 		= require('vinyl-source-stream');

var CONFIG = {
	MAIN: 'app/app.js'
	, SERVER: {
		PORT: 9005
		, BASE_URL: 'http://localhost'
	}
	, PATHS: {
		INDEX: 'views/index.html'
		, JS: './app/**/*.js'
		, CSS: [
			'app/css/*.scss'
    	]
		, DIST: 'dist'
	}
}

gulp.task('connect', function() {
	connect.server({
		root: ['.']
		, port: CONFIG.SERVER.PORT
		, base: CONFIG.SERVER.BASE_URL
		, livereload: true
	});
});

gulp.task('open', ['connect'], function() {
	gulp.src(CONFIG.PATHS.INDEX)
		.pipe(open({ 
			uri: CONFIG.SERVER.BASE_URL 
				+ ':' + CONFIG.SERVER.PORT 
				+ '/' + CONFIG.PATHS.INDEX
		}));
});

gulp.task('html', function() {
	gulp.src(CONFIG.PATHS.INDEX)
		.pipe(gulp.dest(CONFIG.PATHS.DIST))
		.pipe(connect.reload());
});

gulp.task('js', function() {
	browserify(CONFIG.MAIN)
		.transform(babelify, {
			presets: [ 'es2015', 'react' ]
		})
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(gulp.dest(CONFIG.PATHS.DIST))
		.pipe(sourcemaps.write(CONFIG.PATHS.DIST))
		.pipe(connect.reload());
});

gulp.task('css', function() {
	gulp.src(CONFIG.PATHS.CSS)
		.pipe(sass())
		.pipe(autoprefixer('last 2 version'))
		.pipe(concat('bundle.css'))
		.pipe(cssnano())
		.pipe(gulp.dest(CONFIG.PATHS.DIST));
});

gulp.task('lint', function() {
	return gulp.src(CONFIG.PATHS.JS)
		.pipe(lint({
			config: 'eslint.config'
		}))
		.pipe(lint.format());
});

gulp.task('watch', function() {
	gulp.watch(CONFIG.PATHS.INDEX, [
		'html'
	]);
	gulp.watch(CONFIG.PATHS.JS, [
		'js'
		, 'lint'
	]);
});

gulp.task('default', [
	'html'
	, 'js'
	, 'css'
	, 'lint'
	, 'open'
	, 'watch'
]);

