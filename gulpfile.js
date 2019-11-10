'use strict';

const gulp           = require('gulp');
const debug          = require('gulp-debug');
const prefixer       = require('gulp-autoprefixer');
const uglify         = require('gulp-uglify-es').default;
const sass           = require('gulp-sass');
const sourcemaps     = require('gulp-sourcemaps');
const rigger         = require('gulp-rigger');
const imagemin       = require('gulp-imagemin');
const rename         = require('gulp-rename');
const pngquant       = require('imagemin-pngquant');
const jpgrecompress  = require('imagemin-jpeg-recompress');
const del            = require('del');
const jshint         = require('gulp-jshint');
const plumber        = require('gulp-plumber');
const nunjucksRender = require('gulp-nunjucks-render');
const data           = require('gulp-data');
const fs             = require('fs-extra');
const path           = require('path');
const browserSync    = require('browser-sync');
const ssh            = require('gulp-ssh');

let project = JSON.parse(fs.readFileSync('./package.json'));

let paths = {
    dist: {
      js:    './dist/js/',
      css:   './dist/css/',
      img:   './dist/img/',
      fonts: './dist/fonts/',
      html:  './',
    },
    src: {
      js:    './src/js/**/*.js',
      css:   './src/sass/**/*.scss',
      img:   './src/img/**/*.*',
      fonts: './src/fonts/**/*.*',
      html:  './src/tmpl/**/*.{htm,html}',
      tmpl:  './src/tmpl/',
    },
    watch: {
      js:    './src/js/**/*.js',
      css:   './src/sass/**/*.scss',
      img:   './src/img/**/*.*',
      fonts: './src/fonts/**/*.*',
      html:  './src/tmpl/**/*.htm',
      tmpl:  './src/tmpl/',
    },
    clean:   './dist/*',
};

function getDataForFile(file) {
  return JSON.parse(fs.readFileSync(paths.src.tmpl + 'data/' + path.parse(file.path).name + '.json'));
}

const gulpSSH = new ssh({
  ignoreErrors: false,
  sshConfig: {
    host: project.config.host,
    port: project.config.port,
    username: project.config.user,
    password: project.config.password,
  }
});

gulp.task('clean', function () {
    return del(paths.clean);
});

gulp.task('serve', function(done) {
  browserSync.init({
    proxy: project.name,
    host: project.name,
    open: 'external'
  });

  done();
});

gulp.task('dist:js', function (done) {
    gulp.src(paths.src.js)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(rigger())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(debug({title: 'dest:'})
    );

    done();
});

gulp.task('dist:css', function (done) {
    gulp.src(paths.src.css)
        .pipe(plumber())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(prefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(debug({title: 'dest:'})
    );

    done();
});

gulp.task('dist:img', function (done) {
    gulp.src(paths.src.img)
        .pipe(plumber())
        .pipe(imagemin([
              imagemin.gifsicle({interlaced: true}),
              jpgrecompress({
                progressive: true,
                max: 90,
                min: 80,
                quality:'high'
              }),
              imagemin.optipng({optimizationLevel: 3}),
              imagemin.svgo(),
              pngquant({quality: '80-90', speed: 3})
            ]))
        .pipe(gulp.dest(paths.dist.img))
        .pipe(debug({title: 'dest:'})
    );

    done();
});

gulp.task('dist:fonts', function(done) {
    gulp.src(paths.src.fonts)
        .pipe(plumber())
        .pipe(gulp.dest(paths.dist.fonts))
        .pipe(debug({title: 'dest:'})
    );

    done();
});

gulp.task('dist:html', function (done) {
    gulp.src(paths.src.html)
        .pipe(plumber())
        .pipe(data(getDataForFile))
        .pipe(nunjucksRender({
          path: [paths.src.tmpl]
        }))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(debug({title: 'dest:'})
    );

    done();
});

gulp.task('dist', gulp.series(
  'dist:js',
  'dist:css',
  'dist:fonts',
  'dist:img',
  'dist:html'
));

gulp.task('watch:js', function(done) {
  gulp.watch(paths.watch.js, gulp.parallel('dist:js')).on('change', browserSync.reload);
  done();
});

gulp.task('watch:css', function(done) {
  gulp.watch(paths.watch.css, gulp.parallel('dist:css')).on('change', browserSync.reload);
  done();
});

gulp.task('watch:img', function(done) {
  gulp.watch(paths.watch.img, gulp.parallel('dist:img')).on('change', browserSync.reload);
  done();
});

gulp.task('watch:fonts', function(done) {
  gulp.watch(paths.watch.fonts, gulp.parallel('dist:fonts')).on('change', browserSync.reload);
  done();
});

gulp.task('watch:html', function(done) {
  gulp.watch(paths.watch.html, gulp.parallel('dist:html')).on('change', browserSync.reload);
  done();
});

gulp.task('watch:data', function(done) {
  gulp.watch(paths.watch.tmpl, gulp.parallel('dist:html')).on('change', browserSync.reload);
  done();
});

gulp.task('watch', gulp.series(
  'watch:js',
  'watch:css',
  'watch:img',
  'watch:fonts',
  'watch:html',
  'watch:data'
));

gulp.task('deploy:dist', function(done) {
  gulp.src(['dist/**']).pipe(gulpSSH.dest(project.config.path + '/dist'));
  done();
});

gulp.task('deploy:vendor', function(done) {
  gulp.src(['vendor/**']).pipe(gulpSSH.dest(project.config.path + '/vendor'));
  done();
});


gulp.task('deploy:html', function(done) {
  gulp.src(['*.html', '.htaccess', 'robots.txt', 'sitemap.xml']).pipe(gulpSSH.dest(project.config.path));
  done();
});

gulp.task('deploy', gulp.series(
  gulp.parallel('deploy:dist', 'deploy:vendor', 'deploy:html')
));

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('dist', 'watch', 'serve')
));
