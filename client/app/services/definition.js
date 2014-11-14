'use strict';

angular.module('dnuApp')
  .constant('DEFINITIONS_STRUCT', {
    'interest': {
        title: 'Sectors of interest',
        columns: [
          {name: 'sector', title:'Sector',  type: 'text'},
          {name: 'subsector', title: 'Subsector', type: 'text', primary: true},
          {name: 'desc', title: 'Description', type: 'textarea'},
        ]
    },
    'affected': {
        title: 'Affected',
        columns: [
          {name: 'name', title:'Name',  type: 'text', primary: true},
        ]
    },
    'informationtype': {
        title: 'Information Type',
        columns: [
          {name: 'name', title:'Name',  type: 'text', primary: true},
        ]
    },
    'responsecategory': {
        title: 'Response Category',
        columns: [
          {name: 'name', title:'Name',  type: 'text', primary: true},
        ]
    },
    'vulnerablegroup': {
        title: 'Vulnerable groups',
        columns: [
          {name: 'name', title:'Name',  type: 'text', primary: true},
        ]
    },
    'sourcetype': {
        title: 'Source Type',
        columns: [
          {name: 'name', title:'Name',  type: 'text', primary: true},
        ]
    }
  })
  .service('DefinitionService', function ($q, API, DEFINITIONS_STRUCT) {

        this.init = function(){
          var self = this;
          var defer = $q.defer();
          if(typeof self.tags !== 'undefined'){
            defer.resolve(self.tags);
            return defer.promise;
          }
          else {
            return this.updateTags();
          }
        };
        this.updateTags = function(){
          var self = this;
          var defer = $q.defer();
          API.post('/api/tag/finder', {}).then(
                function(res) {
                  self.tags = res;
                  defer.resolve(res);
                },
                function(res) {
                    defer.reject(res);
                });
          return defer.promise;
        };
        this.remove = function(id, cb){
          API.delete('/api/tag/' + id).then(
            function() {
                cb();
            },
            function() {
                cb();
            });
        };
        this.save = function(tag){
          var defer = $q.defer();
          var path = '/api/tag';
          var self = this;
          if(typeof tag.id !== 'undefined' && tag.id > 0){
            path += '/' + tag.id;
          }
          API.post(path, tag).then(
            function(res) {
                self.updateTags();
                defer.resolve(res);
            },
            function(res) {
                defer.reject(res);
            });

          return defer.promise;
        };
        this.getStrings = function(){
          var arr = {};
          this.tags.records.forEach(function(tag){
            arr[tag.id] = tag.name;
          });
          return arr;
        };
        this.getStractures = function(){
            return DEFINITIONS_STRUCT;
        };
        this.getTags = function(){
          return this.tags.records;
        };
        this.getCompound = function(){
          var groupedValues = {};
          var structures = {};

          angular.forEach( this.getTags(),function(entry){
            if( typeof groupedValues[entry.type] === 'undefined'){
              groupedValues[entry.type] = [];
            }
            entry.data.id = entry.id;
            groupedValues[entry.type].push(entry.data);
          });
          angular.forEach( this.getStractures(), function(structure, name){
            structure.name = name;
            structure.values = (typeof groupedValues[name] !== 'undefined')?groupedValues[name]:[];
            structures[name] = structure;
          });

          return structures;
        };
  });
