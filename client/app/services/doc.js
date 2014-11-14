'use strict';

angular.module('dnuApp')
  .service('DocService', function ($q, $upload, ENV, SessionService, API) {
        this.upload = function($files, source, cb){
          for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $upload.upload({
              headers: {'Authorization' : 'Bearer ' + SessionService.token},
              url: ENV.apiEndpoint + '/api/document?source_id=' + source.id,
              file: file,
            }).progress(function(evt) {
              console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
              if(typeof source.documents === 'undefined'){
                source.documents = [];
              }
              cb(null, data);
            }).error(function(err){
              cb(err);
            });
          }
        };
        this.remove = function(id, cb){
          API.delete('/api/document/' + id).then(
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

