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

  var tri_insert = function(t) {
    for (var i = 1; i < t.length; i++) {
      var temp = t[i];
      var j = i - 1;
      while ((temp > t[j]) && j >= 0) {
        t[j + 1] = t[j];
        j--;
      };
      t[j + 1] = temp;
    }
    return t;
  };

  var sgn = function(x) {
    return x < 0 ? -1 : 1;
  };

  var laplace = function(mu, b) {
    var U = Math.random() - 0.5;
    return mu - (b * sgn(U) * Math.log(1 - 2 * Math.abs(U)));
  };

  var privacy = function(F, deltaF, epsilon) {
    var tab = new Array();
    for (var i = 0; i < 100; i++) {
      tab.push(F + laplace(0.0, deltaF / epsilon));
    }
    return tab;
  };

  var mediane = function(tab) {
    var res = 0;
    if (tab.length % 2 == 0) {
      res = (tab[tab.length / 2] + tab[(tab.length / 2) + 1]) / 2;
    }
    else {
      res = tab[tab.length / 2];
    } 
    return res;
  };

  var erreurMoy = function(tab, value) {
    var res = 0;
    for (var i = 0; i < tab.length; i++) {
      res = res + Math.abs(tab[i] - value);
    }
    return res / tab.length;
  };

  var variance = function(tab) {
    var res = 0;
    for (var i = 0; i < tab.length; i++) {
      res = res + tab[i] * tab[i];
    }
    return res / tab.length;
  };

  var moyenne = function(tab) {
    var res = 0;
    for (var i = 0; i < tab.length; i++) {
      res = res + tab[i];
    }
    return (res / tab.length);
  };

  Adult.sum = function(sum, target, ope, value, cb) {
    value = '\'' + value + '\'';
    console.log(value);
    var request = 'select sum( ' + sum + ') from adult where ' + target + ope + value;
    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        var tab = privacy(parseInt(response['0'].sum), sumDeltaF.get(target), 0.1);

        var va = variance(tab);
        var med = mediane(tab);
        var erreur = erreurMoy(tab, parseInt(response['0'].sum));
        var moy = moyenne(tab);
        var res = {
          'result': moy,
          'mediane': med,
          'erreur': erreur,
          'variance': va,
        };
        cb(null, res);
      }
    });
  };

  Adult.remoteMethod(
    'sum', {
      description: 'sum request',
      http: {path: '/sum', verb: 'get'},
      accepts: [{arg: 'sum', type: 'string'}, {arg: 'target', type: 'string'}, {arg: 'ope', type: 'string'}, {arg: 'value', type: 'string'}],
      returns: {arg: 'result', type: 'number'}}
  );

  Adult.countAdult = function(target, ope, value, cb) {
    var request = 'select count(*) from adult where ' + target + ope + value;

    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        var tab = privacy(parseInt(response['0'].count), 1, 0.1);
        var va = variance(tab);
        var med = mediane(tab);
        var erreur = erreurMoy(tab, parseInt(response['0'].count));
        var moy = moyenne(tab);
        var res = {
          'result': moy,
          'mediane': med,
          'erreur': erreur,
          'variance': va,
        };
        cb(null, res);
      }
    });
  };
  Adult.remoteMethod(
    'countAdult', {
      description: 'count request',
      http: {path: '/count', verb: 'get'},
      accepts: [{arg: 'target', type: 'string'},
        {arg: 'ope', type: 'string'},
        {arg: 'value', type: 'string'}],
      returns: {arg: 'result', type: 'number'}}
  );

  Adult.avg = function(target, ope, param,  value,  cb) {
    var request = 'select AVG(' + target + ') from adult where ' + param + ope + '\' ' + value + '\'';
    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        cb(null, privacy(parseInt(response['0'].avg), 1, 0.1));
      }
    });
  };
  Adult.remoteMethod(
    'avg', {
      description: 'average request',
      http: {path: '/avg', verb: 'get'},
      accepts: [{arg: 'target', type: 'string'},
        {arg: 'ope', type: 'string'},
        {arg: 'param', type: 'string'},
        {arg: 'value', type: 'string'}],
      returns: {arg: 'result', type: 'number'}}
  );
};

