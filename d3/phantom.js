const phantom = require('node-phantom');

var webshot = require('webshot');

webshot('http://127.0.0.1:8080/', 'bracket.png', function(err) {
  console.log(err);
});
