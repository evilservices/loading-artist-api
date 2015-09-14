var restify = require('restify');
var config = require('config');

var mysql = require('mysql');
var db = mysql.createPool(config.get('db'));

var CRUD = require('mysql-crud');
var comics = CRUD(db, 'comics');

var server = restify.createServer({
  name: 'loading-artist-server',
  version: '1.0.0'
});

var port = process.env.PORT || 3000;

server.use(restify.queryParser());

server.get(/^\/comics\/([0-9]{4})/, function (req, res) {
  comics.load({
    'release_year': req.params[0]
  }, function (err, rows) {
    res.send(200, rows || []);
  });
});

server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});