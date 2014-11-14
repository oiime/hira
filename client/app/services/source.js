'use strict';

angular.module('dnuApp')
  .service('SourceService', function ($q, Source, API) {
        this.empty = function(){
          var source = new Source();
          source.date = new Date();
          return source;
        };
        this.remove = function(id, cb){
          API.delete('/api/source/' + id).then(
            function() {
                cb();
            },
            function() {
                cb();
            });
        };
        this.getById = function(id){
          var defer = $q.defer();
          var path = '/api/source/' + id;
          API.get(path).then(
            function(res) {
                defer.resolve(new Source(res));
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.changeStatus = function(id, status, cb){
          API.post('/api/source/' + id + '/status', {status: status}).then(
            function(res) {
                cb(new Source(res));
            },
            function() {
                cb();
            });
        };
        this.save = function(source){
          var defer = $q.defer();
          var path = '/api/source';
          if(!source.isNew()){
            path += '/' + source.id;
          }
          API.post(path, source.export()).then(
            function(res) {
                defer.resolve(new Source(res));
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.finder = function(params){
            var defer = $q.defer();

            API.post('/api/source/finder', params).then(
                function(res) {
                    if(res.records){
                      for(var key in res.records){
                        res.records[key] = new Source(res.records[key]);
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
  .factory('Source', function(){
    var Source = function(data) {
        this.import = function(data){
          var obj = {};
          if(data){
            obj.id = data.id;
            obj.link = data.link;
            obj.type = data.type;
            obj.date = data.date;
            obj.site = data.site;
            obj.createdAt = data.createdAt;
            obj.updatedAt = data.updatedAt;
            obj.status = data.status;
            obj.entries_count = data.entries_count;
            obj.countries = data.countries;
            obj.user_id = data.user_id;
            obj.user = data.user;
            obj.documents = data.documents;
          }
          return obj;
        };
        this.export = function(){
          var obj = {};
          if(this.id){
            obj.id = this.id;
          }
          obj.link = this.link;
          obj.date = this.date;
          obj.type = this.type;
          obj.site = this.site;

          return obj;
        };
        angular.extend(this, {
            isNew:function(){
                return (this.id === null || this.id === 0);
            }
        });
        angular.extend(this, this.import(data));
    };
    return Source;
  });

