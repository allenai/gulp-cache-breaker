var CacheBreaker = require('./');
var assert = require('assert');
var gutil = require('gulp-util');
var format = require('util').format;
var checksum = require('checksum');
var fs = require('fs');
var path = require('path');

it('break the cache as is appropriate', function(done) {
  var cb = new CacheBreaker();
  var s = cb.gulpCbPath('fixture/');
  var fixturePath = __dirname + '/fixture/fixture.html';
  var cs = checksum(fs.readFileSync(__dirname + '/fixture/fixture.js')).substring(0, 10);

  s.on('data', function(file) {
    var fc = file.contents.toString();

    assert(fc.indexOf(format('<script src="fixture.%s.js"></script>', cs)) !== -1);

    assert(fc.indexOf(format('<script src="/fixture.%s.js"></script>', cs)) !== -1);

    assert(fc.indexOf('<script src="/do/not/cache-break.js"></script>') !== -1);

    assert.equal(file.relative, 'fixture.html');
  });

  s.on('end', done);

  s.write(new gutil.File({
    cwd: __dirname,
    base: __dirname + '/fixture',
    path: fixturePath,
    contents: fs.readFileSync(fixturePath)
  }));

  s.end();
});

it('sets the CDN URI', function(done) {
  var cb = new CacheBreaker();
  var s = cb.gulpCdnUri('fixture/', 'foo.cloudfront.net');
  var fixturePath = __dirname + '/fixture/fixture.html';
  var cs = checksum(fs.readFileSync(__dirname + '/fixture/fixture.js')).substring(0, 10);

  s.on('data', function(file) {
    var fc = file.contents.toString();

    assert(fc.indexOf(format('<script src="https://foo.cloudfront.net/fixture.%s.js"></script>', cs)) !== -1);

    assert.equal(file.relative, 'fixture.html');
  });

  s.on('end', done);

  s.write(new gutil.File({
    cwd: __dirname,
    base: __dirname + '/fixture',
    path: fixturePath,
    contents: fs.readFileSync(fixturePath)
  }));

  s.end();
});

it('sets the insecure CDN URI', function(done) {
  var cb = new CacheBreaker();
  var s = cb.gulpCdnUri('fixture/', 'foo.cloudfront.net', false);
  var fixturePath = __dirname + '/fixture/fixture.html';
  var cs = checksum(fs.readFileSync(__dirname + '/fixture/fixture.js')).substring(0, 10);

  s.on('data', function(file) {
    var fc = file.contents.toString();

    assert(fc.indexOf(format('<script src="http://foo.cloudfront.net/fixture.%s.js"></script>', cs)) !== -1);

    assert.equal(file.relative, 'fixture.html');
  });

  s.on('end', done);

  s.write(new gutil.File({
    cwd: __dirname,
    base: __dirname + '/fixture',
    path: fixturePath,
    contents: fs.readFileSync(fixturePath)
  }));

  s.end();
});

it('symlinks', function(done) {
  var cb = new CacheBreaker();
  var s = cb.gulpCbPath('fixture/');
  var fixturePath = __dirname + '/fixture/fixture.html';
  var cs = checksum(fs.readFileSync(__dirname + '/fixture/fixture.js')).substring(0, 10);

  s.on('data', function() {});

  s.on('end', function() {
    cb.symlinkCbPaths();

    var symlink = path.resolve('fixture', format('fixture.%s.js', cs));
    try {
      var realpath = fs.realpathSync(symlink);

      assert.equal(path.resolve('fixture', 'fixture.js'), realpath);

      done();
    } finally {
      try { fs.unlinkSync(symlink); } catch (e) { }
    }
  });

  s.write(new gutil.File({
    cwd: __dirname,
    base: __dirname + '/fixture',
    path: fixturePath,
    contents: fs.readFileSync(fixturePath)
  }));

  s.end();
});

