var replace = require('gulp-replace');
var path = require('path');
var fs = require('fs');
var checksum = require('checksum');
var request = require('request');

// Match {{cache-break:path/to/resource}}
var reCacheBreak = /{{cache-break:(.+?)}}/g;

// Match http://, https:// or // to indicate that the resource lies external
// the the project.
var reExternal = /^(?:https?:)?\/\//;

var reLeadingSlash = /^\/+/;

module.exports = function(base) {
  base = base && path.resolve(base);

  if(!base || !fs.existsSync(base) || !fs.statSync(base).isDirectory()) {
    base = process.cwd();
  }

  return replace(reCacheBreak, function(match, resource) {
    var qs;
    var time = Date.now();

    // If we're not dealing with an external file and the file exists, let's
    // get ourselves a checksum of the file's contents
    if(!reExternal.test(resource)) {
      // Since we know it's not external, we interpret the path as relative from
      // the specified base.  This means that in order to determine the full path
      // correclty we'll need to remove a single leading slash.
      var fullPath = path.resolve(base, resource.replace(reLeadingSlash, ''));
      if(fs.existsSync(fullPath)) {
        qs = checksum(fs.readFileSync(fullPath).toString());
      }
    }

    // Fallback to the current timestamp
    if(!qs) {
      qs = time;
    }

    // Play well with an existing query-string
    return resource + (resource.indexOf('?') === -1 ? '?' : '&') + 'cb=' + qs;
  });
};
