'use strict';

angular.module('dnuApp')
  .service('EntryService', function ($q, Entry, API) {
        this.empty = function(){
          return new Entry();
        };
        this.remove = function(id, cb){
          API.delete('/api/entry/' + id).then(
            function() {
                cb();
            },
            function() {
                cb();
            });
        };
        this.getById = function(id){
          var defer = $q.defer();
          var path = '/api/entry/' + id;
          API.get(path).then(
            function(res) {
                defer.resolve(new Entry(res));
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.changeStatus = function(id, status, cb){
          API.post('/api/entry/' + id + '/status', {status: status}).then(
            function(res) {
                cb(new Entry(res));
            },
            function() {
                cb();
            });
        };
        this.save = function(entry){
          var defer = $q.defer();
          var path = '/api/entry';
          if(!entry.isNew()){
            path += '/' + entry.id;
          }
          API.post(path, entry.export()).then(
            function(res) {
                defer.resolve(new Entry(res));
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.finder = function(params){
            var defer = $q.defer();

            API.post('/api/entry/finder', params).then(
                function(res) {
                    if(res.records){
                      for(var key in res.records){
                        res.records[key] = new Entry(res.records[key]);
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
  .factory('Entry', function(DefinitionService){
    /*
    var ISODateString = function(d){
      function pad(n){
        return n<10 ? '0'+n : n;
      }
      return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+ pad(d.getUTCDate());
    };
    */
    var Entry = function(data) {
        this.import = function(data){
          var obj = {};
          if(data){
            obj.id = data.id;
            obj.reliability = data.reliability;
            obj.severity = data.severity;
            obj.slocations = data.slocations;
            obj.source_id = data.source_id;
            obj.source = data.source;
            obj.excerpt = data.excerpt;
            obj.createdAt = data.createdAt,
            obj.updatedAt = data.updatedAt,
            obj.status = data.status,
            obj.user_id = data.user_id,
            obj.user = data.user,
            obj.tags = [];
            angular.forEach( data.tags, function(tag){
              if(typeof obj[tag.type] === 'undefined'){
                obj[tag.type] = [];
              }
              obj[tag.type].push(tag.id);
            });
          }
          return obj;
        };
        this.export = function(){
          var self = this;
          var obj = {};
          if(this.id){
            obj.id = this.id;
          }
          obj.reliability = this.reliability;
          if(this.severity){
            obj.severity = this.severity;
          }
          obj.source_id = parseInt(this.source_id);
          obj.excerpt = this.excerpt;
          obj.slocations = this.slocations;
          obj.tags = [];

          if(typeof this.severity === 'undefined'){
            this.severity = 1;
          }
          obj.severity = this.severity;

          angular.forEach( DefinitionService.getStractures(),function(entry, type){
            if(self[type] !== 'undefined'){
              obj.tags = obj.tags.concat(self[type]);
            }
          });
          obj.tags = obj.tags.filter(function(id) {
            return !isNaN(parseFloat(id)) && isFinite(id);
          });
          return obj;
        };
        angular.extend(this, {
            source: [],
            tags: [],
            isNew:function(){
                return (this.id === null || this.id === 0);
            }

        });
        angular.extend(this, this.import(data));
    };
    return Entry;
  });

