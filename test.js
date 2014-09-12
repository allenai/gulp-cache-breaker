var cb = require('./');
var assert = require('assert');
var gutil = require('gulp-util');
var format = require('util').format;
var fs = require('fs');

it('should autoprefix CSS', function(done) {
	var s = cb('fixture/');
  var path = __dirname + '/fixture/fixture.html';
  var contents = fs.readFileSync(path);
  var mod = fs.statSync(__dirname + '/fixture/fixture.js').mtime.getTime();
  var time;

	s.on('data', function(file) {
		assert(
      file.contents.toString().indexOf(
        format('<script src="fixture.js?cb=%s"></script>', mod)
      ) !== -1
    );
    assert(
      file.contents.toString().indexOf(
        format('<script src="fixture.js?cb=%s"></script>', mod)
      ) !== -1
    );
    assert(
      file.contents.toString().indexOf(
        format('<script src="/does-not-exist.js?cb=%s"></script>', time)
      ) !== -1
    );
    assert(
      file.contents.toString().indexOf(
        format('<script src="//external.js?cb=%s"></script>', time)
      ) !== -1
    );
    assert(
      file.contents.toString().indexOf(
        '<script src="/do/not/cache-break.js"></script>'
      ) !== -1
    );
		assert.equal(file.relative, 'fixture.html');
	});

	s.on('end', done);

  time = Date.now();
	s.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: path,
		contents: fs.readFileSync(path)
	}));

	s.end();
});
