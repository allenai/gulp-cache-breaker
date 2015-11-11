var cb = require('./');
var assert = require('assert');
var gutil = require('gulp-util');
var format = require('util').format;
var checksum = require('checksum');
var fs = require('fs');

it('break the cache as is appropriate', function(done) {
	var s = cb('fixture/');
  var path = __dirname + '/fixture/fixture.html';
  var contents = fs.readFileSync(path);
  var cs = checksum(fs.readFileSync(__dirname + '/fixture/fixture.js').toString());

	s.on('data', function(file) {
		var fc = file.contents.toString();

		assert(fc.indexOf(format('<script src="fixture.js?cb=%s"></script>', cs)) !== -1);

    assert(fc.indexOf(format('<script src="fixture.js?cb=%s"></script>', cs)) !== -1);

    assert(fc.match(/does-not-exist\.js\?cb=\d{13}/));

		assert(fc.match(/\/\/external\.js\?cb=\d{13}/));

    assert(fc.indexOf('<script src="/do/not/cache-break.js"></script>') !== -1);

		assert.equal(file.relative, 'fixture.html');
	});

	s.on('end', done);

	s.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: path,
		contents: fs.readFileSync(path)
	}));

	s.end();
});
