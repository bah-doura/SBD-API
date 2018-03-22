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

  var response;

  var sgn = function(x) {
    return x < 0 ? -1 : 1;
  };

// From wikipedia:
// Lap(X) = mu - b sgn(U) ln (1-2|U|) where U is a random variable between -0.5 and 0.5
  var laplace = function(mu, b) {
    var U = Math.random() - 0.5;
    return mu - (b * sgn(U) * Math.log(1 - 2 * Math.abs(U)));
  };

  var f = function(F, deltaF, epsilon) {
    return F + laplace(0.0, deltaF / epsilon);
  };

  Adult.greet = function(msg, cb) {
    cb(null, msg);
  };

  Adult.sum = function(target, ope, value, cb) {
    var request = 'select sum(age) from adult where age=30;';

    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        cb(null, response);
      }
    });
  };

  Adult.remoteMethod(
    'sum', {
      description: 'sum request',
      http: {path: '/sum', verb: 'get'},
      accepts: [{arg: 'target', type: 'string'}, {arg: 'ope', type: 'string'}, {arg: 'value', type: 'integer'}],
      returns: {arg: 'result', type: 'string'}}
  );
};

