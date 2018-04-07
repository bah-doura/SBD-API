'use strict';

module.exports = function(Adult) {
  Adult.disableRemoteMethodByName('prototype.patchAttributes');
  Adult.disableRemoteMethodByName('patchOrCreate');
  Adult.disableRemoteMethodByName('create');
  Adult.disableRemoteMethodByName('upsert');
  Adult.disableRemoteMethodByName('exists');
  Adult.disableRemoteMethodByName('findById');
  Adult.disableRemoteMethodByName('deleteById');
  Adult.disableRemoteMethodByName('find');
  Adult.disableRemoteMethodByName('findOne');
  Adult.disableRemoteMethodByName('createChangeStream');
  Adult.disableRemoteMethodByName('updateAll');
  Adult.disableRemoteMethodByName('replaceById');
  Adult.disableRemoteMethodByName('replaceOrCreate');
  Adult.disableRemoteMethodByName('upsertWithWhere');
  Adult.disableRemoteMethodByName('count');

  var sumDeltaF = new Map();
  sumDeltaF.set('age', 120);
  sumDeltaF.set('capital_gain', 99999);
  sumDeltaF.set('capital_loss', 99999);
  sumDeltaF.set('hours_per_week', 99);

  var override = Adult.find;

  var sgn = function(x) {
    return x < 0 ? -1 : 1;
  };

  var laplace = function(mu, b) {
    var U = Math.random() - 0.5;
    return mu - (b * sgn(U) * Math.log(1 - 2 * Math.abs(U)));
  };

  var privacy = function(F, deltaF, epsilon) {
    return F + laplace(0.0, deltaF / epsilon);
  };

  Adult.sum = function(target, ope, value, cb) {
    var request = 'select sum( ' + target + ') from adult where ' + target + ope + value;
    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        response['0'].sum = privacy(parseInt(response['0'].sum), sumDeltaF.get(target), 0.1);
        cb(null, response);
      }
    });
  };

  Adult.remoteMethod(
    'sum', {
      description: 'sum request',
      http: {path: '/sum', verb: 'get'},
      accepts: [{arg: 'target', type: 'string'}, {arg: 'ope', type: 'string'}, {arg: 'value', type: 'integer'}],
      returns: {arg: 'result', type: 'json'}}
  );

  Adult.countAdult = function(target, ope, value, cb) {
    var request = 'select count( ' + target + ') from adult where ' + target + ope + value;

    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        response['0'].count = privacy(parseInt(response['0'].count), 1, 0.1);
        cb(null, response);
      }
    });
  };
  Adult.remoteMethod(
    'countAdult', {
      description: 'count request',
      http: {path: '/count', verb: 'get'},
      accepts: [{arg: 'target', type: 'string'},
        {arg: 'ope', type: 'string'},
        {arg: 'value', type: 'integer'}],
      returns: {arg: 'result', type: 'text'}}
  );

  Adult.avg = function(target, cb) {
    var request = 'select AVG( ' + target + ') from adult;';

    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        response['0'].avg = privacy(parseInt(response['0'].avg), 1, 0.1);
        cb(null, response);
      }
    });
  };
  Adult.remoteMethod(
    'avg', {
      description: 'average request',
      http: {path: '/avg', verb: 'get'},
      accepts: [{arg: 'target', type: 'string'}],
      returns: {arg: 'result', type: 'text'}}
  );
};

