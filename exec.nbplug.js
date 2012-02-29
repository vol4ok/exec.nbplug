/*!
 * exec plugin for nBuild
 * Copyright(c) 2011-2012 vol4ok <admin@vol4ok.net>
 * MIT Licensed
*/
/** Module dependencies
*/
var ExecPlugin, async, basename, dirname, exec, existsSync, extname, fs, join, normalize, path, relative, _;

require("colors");

fs = require('fs');

_ = require('underscore');

path = require('path');

async = require('async');

exec = require('child_process').exec;

normalize = path.normalize, basename = path.basename, dirname = path.dirname, extname = path.extname, join = path.join, existsSync = path.existsSync, relative = path.relative;

exports.initialize = function(builder) {
  return new ExecPlugin(builder);
};

ExecPlugin = (function() {

  function ExecPlugin(builder) {
    this.builder = builder;
    this.builder.registerType('exec', this.exec, this);
  }

  ExecPlugin.prototype.exec = function(name, options) {
    var n, newDir, oldDir,
      _this = this;
    this.builder.lock();
    oldDir = null;
    newDir = options["change-dir"] || this.builder.defines.PROJECT_DIR;
    if (existsSync(newDir)) {
      newDir = fs.realpathSync(newDir);
      oldDir = process.cwd();
      process.chdir(newDir);
    } else {
      this.builder.unlock();
      throw "Error: directory " + newDir + " not exists";
    }
    n = 0;
    console.log('executing...'.cyan);
    return async.forEachSeries(options.exec, function(command, callback) {
      return exec(command, function(err, stdout, stderr) {
        if (err === null) {
          if (_this.builder.verbose) console.log(stdout);
          console.log(("" + name + "[" + n + "]: `" + command + "` successfully executed!").green);
        } else {
          if (_this.builder.verbose) console.error(stderr);
          console.error(("Error: exec `" + command + "` failed with error \"" + err + "\"").red);
        }
        n++;
        return callback(0);
      });
    }, function(err) {
      if (oldDir) process.chdir(oldDir);
      return _this.builder.unlock();
    });
  };

  return ExecPlugin;

})();
