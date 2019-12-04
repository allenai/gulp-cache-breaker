# ⚠️ INACTIVE PACKAGE ⚠️

This package is no longer under active development. Use at your own risk.

If you find it useful, reach out to [sams@allenai.org](mailto:sams@allenai.org).
I'd be happy to transfer the package to you for future maintenance.

## gulp-cache-breaker

> Gulp utility which inserts SHA1 checksums into filepaths. It can also produce symlinks so that files can be requested by their cache-broken path.

## Installation

```
npm install --save-dev gulp-cache-breaker
```

## Usage

#### Example HTML:

Indicate urls that should have a cache-breaking query string parameter append to by wrapping them in `{{cache-break:%url%}}` statements, as seen below:

``` html
<!DOCTYPE html><html>
  <head>
    <link rel="stylesheet" type="text/css" href="{{cache-break:/styles.css}}">
  </head>
  <body>
	<script src="{{cache-break:/app.js}}">
  </body>
</html>
```

Paths that aren't wrapped in `{{cache-break:%url%}}` will not have the cache-breaking checksum inserted.


#### Gulpfile:

``` js
var gulp = require('gulp');
var CacheBreaker = require('gulp-cache-breaker');

var cb = new CacheBreaker();

gulp.task('html', function() {
  return gulp.src('src/index.html')
      .pipe(cb.gulpCbPath('dist'))
      .pipe(gulp.dest('dist'));
});

// Write symlinks for all cache-broken paths from previous tasks.
gulp.task('symlink-cb-paths', ['html'], function() {
  cb.symlinkCbPaths();
});
```

## API

### cb.gulpCbPath([base])

#### base

Type: `string`
Default: The current working directory, the result of `process.cwd()`

The path to the base directory from which static files that will be served.  For instance, if files are built into the `dist/` directory, this would be set to `dist`.  It's also important to make sure that cache-breaking occurs after any static resources are built (if you want the last modified time to serve as the cache-breaker).

### cb.gulpCdnUri([base], [host])

#### base

Type: `string`
Default: The current working directory, the result of `process.cwd()`

#### host

Type: `string`
Default: `null`

A hostname for a CDN to generate absolute URIs to assets. This method replaces patterns of the form `{{cdn-path:%url%}}`. If this parameter is `null`, it calls through to `gulpCbPath`.

### cb.symlinkCbPaths()

Generates symlinks for all paths seen in previous calls to `gulpCbPath` and `gulpCdnUri` on this instance.
