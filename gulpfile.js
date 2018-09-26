var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('css', function(){
  return gulp.src('less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('css'))
});

gulp.task('default', [ 'css']);
gulp.watch('less/**/*.less', ['default']);