const karmaBrowserify = require('karma-browserify');
const karmaMocha = require('karma-mocha');
const karmaPhantomjsLauncher = require('karma-phantomjs-launcher');
const karmaChromeLauncher = require('karma-chrome-launcher');
const karmaReferee = require('karma-referee');

module.exports = function(config) {
    config.set({
      files: ["test/vendor/syn.js", "test/**/*.js"],
      preprocessors: {
        "test/**/*.js": ["browserify"],
      },
      frameworks: ["browserify", "mocha", "referee"],
      plugins: [
        karmaBrowserify,
        karmaMocha,
        karmaPhantomjsLauncher,
        karmaChromeLauncher,
        karmaReferee,
        require('karma-spec-reporter'),
      ],
      browserify: {
        debug: true,
        transform: ["babelify"],
      },
      reporters: ["spec"],
      autoWatch: false,
      browsers: ["Chrome"],
      singleRun: true,
    });
};
