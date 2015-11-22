'use strict'

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const codePaths = [
  '**/*.js',
  '!node_modules/**',
  '!test/**',
  '!coverage/**'
];

gulp.task('lint', function() {
  gulp.src(codePaths)
    .pipe(eslint({
      extends: 'eslint:recommended',
      ecmaFeatures: {
        'modules': true
      },
      rules: {
        'no-console': 0,
        'arrow-parens': 0
      },
      envs: [
        'node',
        'es6'
      ]
    }))
    .pipe(eslint.formatEach('compact', process.stderr));
});
