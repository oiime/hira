'use strict';

angular.module('dnuApp')
  .service('SlocationsService', function ($q, Slocation, API) {
        this.empty = function(){
          return new Slocation();
        };
        this.remove = function(id, cb){
          API.delete('/api/slocation/' + id).then(
            function() {
                cb();
            },
            function() {
                cb();
            });
        };
        this.getById = function(id){
          var defer = $q.defer();
          var path = '/api/slocation/' + id;
          API.get(path).then(
            function(res) {
                defer.resolve(new Slocation(res));
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.save = function(slocation){
          var defer = $q.defer();
          var path = '/api/slocation';
          if(!slocation.isNew()){
            path += '/' + slocation.id;
          }
          API.post(path, slocation.export()).then(
            function(res) {
                defer.resolve(new Slocation(res));
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.finder = function(params){
            var defer = $q.defer();

            API.post('/api/slocation/finder', params).then(
                function(res) {
                    if(res.records){
                      for(var key in res.records){
                        res.records[key] = new Slocation(res.records[key]);
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
  .factory('Slocation', function(){
    var Slocation = function(data) {
        this.import = function(data){
          var obj = {};
          if(data){
            obj.id = data.id;
            obj.country = data.country;
            obj.code = data.code;
            obj.name = data.name;
            obj.level = data.level;
            obj.parent_id = data.parent_id;
            obj.parent = {
              id: data.parent_id,
              name: data.parent_name,
              code: data.parent_code
            };
            obj.latitude = data.latitude;
            obj.longitude = data.longitude;
          }
          return obj;
        };
        this.export = function(){
          var obj = {};
          if(this.id){
            obj.id = this.id;
          }
          obj.country = this.country;
          obj.code = this.code;
          obj.name = this.name;
          obj.level = this.level;
          if(parent){
            obj.parent_id = this.parent.id;
          }
          else {
            obj.parent_id = this.parent_id;
          }
          obj.latitude = this.latitude;
          obj.longitude = this.longitude;
          return obj;
        };
        angular.extend(this, {
            isNew:function(){
                return (this.id === null || this.id === 0);
            }
        });
        angular.extend(this, this.import(data));
    };
    return Slocation;
  });

