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
server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

server.get(/^\/comics\/([0-9]{4})/, function (req, res) {
  comics.load({
    'release_year': req.params[0]
  }, function (err, rows) {
    res.send(200, rows || []);
  });
});

server.get('/fetch', function (req, res) {
  var page = (parseInt(mysql.escape(req.params.page)) || 0) * 50;
  var lastUpdate = mysql.escape(req.params.lastUpdate);
  var lastId = parseInt(mysql.escape(req.params.lastId));

  var sql = 'select SQL_CALC_FOUND_ROWS * from comics where 1=1';
  if(lastUpdate && lastUpdate != 'NULL') {
    sql += ' and (last_update > ' + lastUpdate;
  }
  if(lastId && lastId != 'NULL') {
    sql += ' and id > ' + lastId;
  }
  sql += ' order by last_update, id';
  sql += ' limit 50 ';
  sql += ' offset ' + page


  db.getConnection(function(err,connection){

    if(err) {
      connection.release();
      throw err;
    }

    connection.query(sql, function (err, comics) {

      if(err) {
        connection.release();
        throw err;
      }

      connection.query('select FOUND_ROWS() rows', function (err, pages) {

        if(err) {
          connection.release();
          throw err;
        }

        res.send(200, {
          'comics': comics,
          'page': page + 1,
          'total_pages': Math.ceil(pages[0]['rows'] / 50)
        });

      });

    });

  });
});

server.get('/update', function (req, res) {
  db.query('select max(last_update) last_update, max(id) last_id from comics', function (err, rows) {
    if(err) throw err;

    res.send(200, rows[0]);
  });
});

server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});