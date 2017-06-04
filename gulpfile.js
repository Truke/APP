'use strict';
var path = require('path');
var gulp = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var concat = require('gulp-concat');
var $ = require('gulp-load-plugins')({ lazy: true });
var runSequence = require('run-sequence');
var config = {
    src:'src',
    dist:'dist'
};
var cheerio = require('gulp-cheerio');
//
var gulpJade = require('gulp-jade');
var fileinclude = require('gulp-file-include');

var reload = browserSync.reload;
function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}
//main
gulp.task('default', function () {
    runSequence(
        'clean',
        'js',
        ['fonts','images', 'css',],
        'html',
        'web-server',
        'watch'
    );
});

gulp.task('clean', function () {
    return del([
        '!' + config.dist + '/',
        config.dist + '/*'
    ]);
});

gulp.task('web-server', function () {
    browserSync.init({
        server: {
            baseDir: config.dist
        }
    });

});

gulp.task('watch', function () {
    gulp.watch([config.src + '/images/**/**'], ['images', reload]);
    //gulp.watch([config.src + '/fonts/**/**'], ['fonts', reload]);

    gulp.watch([config.src + '/css/**/*.less'], ['css', reload]);
    gulp.watch([config.src + '/view/**/*.html'], ['html', reload]);
    gulp.watch([config.src + '/js/**/*.js'], ['js', reload]);
    gulp.watch([config.src + '/jade/**/*.jade'], ['jadehtml']);
});


gulp.task('js', function () {
    return gulp
        .src([
            config.src + '/js/**/*.js'
        ])
        .pipe($.plumber({ errorHandler: swallowError }))
        // .pipe(gulp.dest(config.dist + '/js'))
        .pipe($.uglify())
        // .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.dist + '/js'))
});

gulp.task('html', function () {
    return gulp
        .src([
            config.src + '/view/**/**'
        ]).pipe(fileinclude({
            context:{
                "highLigh":""
            }
        }))
        .on('error',function(error){
            console.log(error);
            this.emit('end');
        })
        .pipe($.plumber({ errorHandler: swallowError }))
        .pipe(gulp.dest(config.dist))
});

gulp.task('css', function () {
    gulp
        .src(config.src+'/css/**/**')
        .pipe($.less())
        .pipe($.autoprefixer([//浏览器兼容，自动css前缀
            'ie >= 8',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 6',
            'android >= 2.2',
            'bb >= 10'
        ]))
        // .pipe(gulp.dest(config.dist + '/css'))
        .pipe($.cssnano())
        .pipe(concat('app.css'))
        // .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.dist + '/css'))
});

gulp.task('images', function () {
    return gulp
        .src([
            config.src + '/images/**/**'
        ])
        .pipe($.plumber({ errorHandler: swallowError }))
        //todo 
        .pipe(gulp.dest(config.dist + '/images'));
});

gulp.task('fonts', function () {
    return gulp
        .src([
            config.src + '/fonts/**/**'
        ], { base: config.src + '/fonts' })
        .pipe($.plumber({ errorHandler: swallowError }))
        .pipe(gulp.dest(config.dist + '/fonts'));
});

gulp.task('jade', function() {
 return gulp.src([config.src + '/jade/tpl/*.jade'])
    .pipe(gulpJade({
      pretty:true
    }))
    .on('error',function(error){
        console.log(error);
        this.emit('end');
    })
    .pipe(gulp.dest(config.src + '/jade/htm'))
});
gulp.task('jadehtml',['jade'], function () {
    return gulp
        .src([
            config.src + '/jade/htm/**'
        ])
        .pipe(gulp.dest(config.src + '/view'))
});

/**
 * 版本控制
 * todo 只是发布前执行一次
 */
