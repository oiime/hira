'use strict';

angular.module('dnuApp')
  .service('UsersService', function ($q, User, API) {
        this.remove = function(id, cb){
          API.delete('/api/user/' + id).then(
            function() {
                cb();
            },
            function() {
                cb();
            });
        };
        this.changeStatus = function(id, status, cb){
          API.post('/api/user/' + id + '/status', {status: status}).then(
            function(res) {
                cb(new User(res));
            },
            function() {
                cb();
            });
        };
        this.finder = function(params){
            var defer = $q.defer();

            API.post('/api/user/finder', params).then(
                function(res) {
                    if(res.records){
                      for(var key in res.records){
                        res.records[key] = new User(res.records[key]);
                      }
                    }
                    defer.resolve(res);
                },
                function(res) {
                    defer.reject(res);
                });

            return defer.promise;
        };
  })
  .factory('User', function(){
    var User = function(data) {
        this.import = function(data){
          return data;
        };
        this.export = function(){
          return this;
        };
        angular.extend(this, this.import(data));
    };
    return User;
  });

