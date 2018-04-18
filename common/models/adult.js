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

  /**
   * Valeur par défaut des deltaF pour la methode sum
   */
  var sumDeltaF = new Map();
  sumDeltaF.set('age', 120);
  sumDeltaF.set('capital_gain', 99999);
  sumDeltaF.set('capital_loss', 99999);
  sumDeltaF.set('hours_per_week', 99);

  /**
   * Algorithme de tri par insertion pour trier le tableau de donnée afin de trouver la médiane
   * @param {*} t tableau à trier
   */
  var tri_insert = function(t) {
    for (var i = 1; i < t.length; i++) {
      var temp = t[i];
      var j = i - 1;
      while ((temp < t[j]) && j >= 0) {
        t[j + 1] = t[j];
        j--;
      };
      t[j + 1] = temp;
    }
    return t;
  };

/**
 * AlGORITHME D'ANONYMISATION
*/

  var sgn = function(x) {
    return x < 0 ? -1 : 1;
  };

  /**
   * distribution de Laplace largement inspiré de la page wikipedia : https://en.wikipedia.org/wiki/Laplace_distribution
   * @param {*} mu
   * @param {*} b
   */
  var laplace = function(mu, b) {
    var U = Math.random() - 0.5;
    return mu - (b * sgn(U) * Math.log(1 - 2 * Math.abs(U)));
  };

  /**
   *  Fonction d'anonymisation
   * La fonction utilise une distribution de laplace
   * La fonction est répété 100 fois. Les valeurs sont conservé dans un tableau
   */
  var privacy = function(F, deltaF, epsilon) {
    var tab = new Array();
    for (var i = 0; i < 100; i++) {
      tab.push(F + laplace(0.0, deltaF / epsilon));
    }
    return tri_insert(tab);
  };

  /**
   * CALCULE DE LA MEDIANE, VARIANCE ET ERREUR MOYENNE
   */

  /**
   * Calcule de la mediane pour le tableau de donnée tab
   * @param {*} tab
   */
  var mediane = function(tab) {
    var res = 0;
    if (tab.length % 2 == 0) {
      res = (tab[tab.length / 2] + tab[(tab.length / 2) + 1]) / 2;
    }    else {
      res = tab[tab.length / 2];
    }
    return res;
  };

  /**
   * Calculue de l'erreur moyenne pour le tableau de donnée tab, et la valeur réelle value
   * @param {*} tab
   * @param {*} value
   */
  var erreurMoy = function(tab, value) {
    var res = 0;
    for (var i = 0; i < tab.length; i++) {
      res = res + Math.abs(tab[i] - value);
    }
    return res / tab.length;
  };

  /**
   * Calcule de la variance pour le tableau de donnée tab
   * @param {*} tab
   */
  var variance = function(tab) {
    var res = 0;
    for (var i = 0; i < tab.length; i++) {
      res = res + tab[i] * tab[i];
    }
    return res / tab.length;
  };

  /**
   * Calcule de la moyenne
   * @param {*} tab
   */
  var moyenne = function(tab) {
    var res = 0;
    for (var i = 0; i < tab.length; i++) {
      res = res + tab[i];
    }
    return (res / tab.length);
  };

  /**
   * API
   */

  /**
   * Methode sum
   * @param {*} sum
   * @param {*} target
   * @param {*} ope
   * @param {*} value
   * @param {*} cb
   */
  Adult.sum = function(sum, target, ope, value, cb) {
    value = '\'' + value + '\'';
    var request = 'select sum(' + sum + ') from adult where ' + target + ope + value;
    var ds = Adult.dataSource;
    ds.connector.query(request, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        var tab = privacy(parseInt(response['0'].sum), sumDeltaF.get(sum), 0.1);
        var va = variance(tab);
        var med = mediane(tab);
        var erreur = erreurMoy(tab, parseInt(response['0'].sum));
        var moy = moyenne(tab);
        console.log(tab);

        var res = {
          'result': tab,
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

  /**
   * Methode count
   * @param {*} target
   * @param {*} ope
   * @param {*} value
   * @param {*} cb
   */
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
          'result': tab,
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

  Adult.countAge = function(cb) {
    var request1 = 'select COUNT(*) from adult where age > 1 AND age<=10';
    var request2 = 'select COUNT(*) from adult where age > 10 AND age<=20';
    var request3 = 'select COUNT(*) from adult where age > 20 AND age<=30';
    var request4 = 'select COUNT(*) from adult where age > 30 AND age<=40';
    var request5 = 'select COUNT(*) from adult where age > 40 AND age<=50';
    var request6 = 'select COUNT(*) from adult where age > 50 AND age<=60';
    var request7 = 'select COUNT(*) from adult where age > 60 AND age<=70';
    var request8 = 'select COUNT(*) from adult where age > 70 AND age<=80';
    var request9 = 'select COUNT(*) from adult where age > 80 AND age<=90';
    var request10 = 'select COUNT(*) from adult where age > 90 AND age<=100';
    var res = {response1: [],
      response2: [],
      response3: [],
      response4: [],
      response5: [],
      response6: [],
      response7: [],
      response8: [],
      response9: [],
      response10: []};

    var ds = Adult.dataSource;
    ds.connector.query(request1, function(err, response) {
      if (err) {
        cb(null, err);
      } else {
        res.response1 = privacy(parseInt(response['0'].count), 1, 0.1);

        ds.connector.query(request2, function(err, response) {
          if (err) {
            cb(null, err);
          } else {
            res.response2 = privacy(parseInt(response['0'].count), 1, 0.1);
            ds.connector.query(request3, function(err, response) {
              if (err) {
                cb(null, err);
              } else {
                res.response3 = privacy(parseInt(response['0'].count), 1, 0.1);
                ds.connector.query(request4, function(err, response) {
                  if (err) {
                    cb(null, err);
                  } else {
                    res.response4 = privacy(parseInt(response['0'].count), 1, 0.1);
                    ds.connector.query(request5, function(err, response) {
                      if (err) {
                        cb(null, err);
                      } else {
                        res.response5 = privacy(parseInt(response['0'].count), 1, 0.1);
                        ds.connector.query(request6, function(err, response) {
                          if (err) {
                            cb(null, err);
                          } else {
                            res.response6 = privacy(parseInt(response['0'].count), 1, 0.1);
                            ds.connector.query(request7, function(err, response) {
                              if (err) {
                                cb(null, err);
                              } else {
                                res.response7 = privacy(parseInt(response['0'].count), 1, 0.1);
                                ds.connector.query(request8, function(err, response) {
                                  if (err) {
                                    cb(null, err);
                                  } else {
                                    res.response8 = privacy(parseInt(response['0'].count), 1, 0.1);
                                    ds.connector.query(request9, function(err, response) {
                                      if (err) {
                                        cb(null, err);
                                      } else {
                                        res.response9 = privacy(parseInt(response['0'].count), 1, 0.1);
                                        ds.connector.query(request10, function(err, response) {
                                          if (err) {
                                            cb(null, err);
                                          } else {
                                            res.response10 = privacy(parseInt(response['0'].count), 1, 0.1);
                                            console.log(res);
                                            cb(res);
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

  };

  Adult.remoteMethod(
    'countAge', {
      description: 'count request',
      http: {path: '/countAge', verb: 'get'},
      accepts: [],
      returns: {arg: 'result', type: 'object'}}
  );

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

