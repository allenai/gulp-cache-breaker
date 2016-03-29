var replace = require('gulp-replace');
var path = require('path');
var fs = require('fs');
var url = require('url');
var checksum = require('checksum');

// Match {{cache-break:path/to/resource}}
var reCacheBreak = /{{cache-break:(.+?)}}/g;

// Match {{cdn-path:path/to/resource}}
var reCdnPath = /{{cdn-path:(.+?)}}/g;

function CacheBreaker() {
  this.checksumCache = {};
}

CacheBreaker.prototype.cacheBreakPath = function(base, resource) {
  base = base || process.cwd();;

  var joinedPath = path.join(base, resource);
  var fullPath = path.resolve(joinedPath);

  var cs;
  var mtime = fs.statSync(fullPath).mtime.getTime();
  if (fullPath in this.checksumCache && mtime === this.checksumCache[fullPath].mtime) {
    cs = this.checksumCache[fullPath].checksum;
  } else {
    cs = checksum(fs.readFileSync(fullPath));
    this.checksumCache[fullPath] = { checksum: cs, mtime: mtime };
  }

  var dirname = path.dirname(resource);
  var extname = path.extname(resource);
  var basename = path.basename(resource, extname);

  return url.resolve(dirname + '/', basename + '.' + cs.substring(0, 10) + extname);
};

CacheBreaker.prototype.cdnUri = function(base, resource, host, secure) {
  if (host) {
    var prefix = (secure === false ? 'http://' : 'https://');
    return prefix + host + this.cacheBreakPath(base, resource);
  } else {
    return this.cacheBreakPath(base, resource);
  }
};

CacheBreaker.prototype.gulpCbPath = function(base) {
  return replace(reCacheBreak, function(match, resource) {
    return this.cacheBreakPath(base, resource);
  }.bind(this));
};

CacheBreaker.prototype.gulpCdnUri = function(base, host, secure) {
  return replace(reCdnPath, function(match, resource) {
    return this.cdnUri(base, resource, host, secure);
  }.bind(this));
};

CacheBreaker.prototype.symlinkCbPaths = function() {
  Object.keys(this.checksumCache).forEach(function(fullPath) {
    var cbPath = this.cacheBreakPath('/', fullPath);
    try {
      fs.symlinkSync(path.basename(fullPath), cbPath);
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
  }.bind(this));
};

module.exports = CacheBreaker;

