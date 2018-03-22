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

  Adult.remoteMethod(
    'Sum', {
      description: 'sum request',
      http: {path: '/sum', verb: 'post'},
      accepts: [{arg: 'arg1', type: 'any'}],
      returns: {arg: 'response', type: 'any'}}
  );
};

var sgn = function(x) {
  return x < 0 ? -1 : 1;
};

// From wikipedia:
// Lap(X) = mu - b sgn(U) ln (1-2|U|) where U is a random variable between -0.5 and 0.5
var laplace = function(mu, b) {
  var U = Math.random() - 0.5;
  return mu - (b * sgn(U) * Math.log(1 - 2 * Math.abs(U)));
};

var privatieze = function(F, deltaF, epsilon) {
  return F + laplace(0.0, deltaF / epsilon);
};