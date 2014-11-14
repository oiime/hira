'use strict';

angular.module('dnuApp')
.factory('PaginatedTable', function(ngTableParams){
      var PaginatedTable = function(opt) {
        angular.extend(this, {
            dataset: [],
            total: null,
            filters: {},
            getDataFn: null,
            tableParams: {},
            reload: function(){
              var self = this;
              angular.forEach(self.filters, function(filter, name){
                if (filter instanceof Array && filter.length===0) {
                  delete self.filters[name];
                }
              });
              self.tableParams.getData = function($defer, params) {
                  var limitReq = {_meta: {limit: {offset: (params.page() - 1) * params.count(), limit: params.count()}}};
                  angular.extend(limitReq, self.filters);
                  self.getDataFn(limitReq).then(function(res){
                    self.dataset = res.records;
                    $defer.resolve(res.records);
                  });
              };
              self.tableParams.reload();
            },
            setup: function(cb){
              var self = this;
              var countReq = {_meta: {count: true}};
              // clean unused filters
              angular.forEach(self.filters, function(filter, name){
                if (filter instanceof Array && filter.length===0) {
                  delete self.filters[name];
                }
              });
              angular.extend(countReq, self.filters);
              self.getDataFn(countReq).then(function(res){
                self.total = res._meta.count;
                self.tableParams = new ngTableParams({
                        page: 1,
                        count: 25,
                    },{
                        total: res._meta.count,
                        getData: function($defer, params) {
                            var limitReq = {_meta: {limit: {offset: (params.page() - 1) * params.count(), limit: params.count()}}};
                            angular.extend(limitReq, self.filters);
                            self.getDataFn(limitReq).then(function(res){
                              self.dataset = res.records;
                              $defer.resolve(res.records);
                            });
                        }
                    });
                  cb(self.tableParams);
              });
            }

        });
        angular.extend(this, opt);
    };
    return PaginatedTable;
  });
