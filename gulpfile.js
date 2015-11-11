var gulp = require('gulp');
var connect = require('connect');
var serveStatic = require('serve-static');
var connectLivereload = require('connect-livereload');
var opn = require('opn');
var gulpLivereload = require('gulp-livereload');

var config = {
    port: 8080
};

gulp.task('default', ['watch', 'serve']);

gulp.task('watch', ['connect'], function () {
    gulpLivereload.listen();
    gulp.watch('app/js/*.js', function(file) {
        gulp.src(file.path)
        .pipe(gulpLivereload());
    });
});

gulp.task('serve', ['connect'], function () {
  opn('http://localhost:' + config.port);
});

gulp.task('connect', function(){
    connect()
    // .use(connectLivereload())
    .use(serveStatic('app'))
    .listen(config.port);
});