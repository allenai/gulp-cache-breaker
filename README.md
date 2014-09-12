gulp-cache-breaker
==================

> Gulp utility which appends a unique query string paramter to static files.  

## Installation

```
npm install --save-dev gulp-cache-breaker
```

## Usage

#### Example HTML:

Indicate urls that should have a cache-breaking query string parameter append to by wrapping them in `{{cache-break:%url%}}` statements, as seen below:

```
<!DOCTYPE html><html>
  <head>
    <link rel="stylesheet" type="text/css" href="{{cache-break:/styles.css">
  </head>
  <body>
	<script src="{{cache-break://cdn.jquery.org/jquery.js}}">
  </body>
</html>
```

Urls that arent wrapped in `{{cache-break:%url%}}` will not have the cache-breaking query string param added.

The cache-breaking parameter will be set to the last modified time of the corresponding static file.  If the file cannot be found or is external, the parameter will be set to the UNIX timestamp representing the time at which the build occured.

#### Gulpfile:

```
var gulp = require('gulp');
var cachebreaker = require('gulp-cache-breaker');

gulp.task('default', function() {
  return gulp.src('src/index.html')
      .pipe(cachebreaker('dist'))
      .pipe(gulp.dest('dist'));
});
```

## API

### cachebreaker([base])

#### base

Type: `string`  
Default: The current working directory, the result of `process.cwd()`

The path to the base directory from which  static files that will be served.  For instance, if files are built into the `dist/` directory, this would be set to `dist`.  It's also important to make sure that cache-breaking occurs after any static resources are built (if you want the last modified time to serve as the cache-breaker).

## Known Issues

The value of using the last modified time as the cache breaker is low, as it's likely that your static resources will be rebuilt with each build (thus updating their last modified time).


