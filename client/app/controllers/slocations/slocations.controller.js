'use strict';

angular.module('dnuApp')
  .controller('SlocationsCtrl', function ($scope, PaginatedTable, SlocationsService, GeoService, dialogs) {
    $scope.table = new PaginatedTable({
      'filters': $scope.filters,
      'getDataFn': SlocationsService.finder
    });
    $scope.table.setup(function(tableParams){
      $scope.tableParams = tableParams;
    });

    $scope.countries = GeoService.getCountries();

    $scope.actions = {
      filter: function(){
        $scope.table.reload();
      },
      add: function(){
        var sloc = SlocationsService.empty();
        sloc._edit = true;
        $scope.table.tableParams.data.unshift(sloc);
      },
      edit: function(sloc){
        sloc._edit = true;
      },
      save: function(sloc){
        sloc._edit = false;
        SlocationsService.save(sloc).then(
          function(res){
            sloc = res;
          },
          function(res){
            var errStr = '';
            res.data.errors.forEach(function(error){
              errStr += ' ' + error.name + ' ' + error.error;
            });
            alert(errStr);
          });
      },
      delete: function(source, $index){
        if(typeof source.id === 'undefined' || source.id < 1){
          $scope.table.tableParams.data.splice($index, 1);
        }
        else {
          dialogs.confirm('Delete', 'Delete this source?').result.then(function(){
            SlocationsService.remove(source.id, function(){
              $scope.table.reload();
            });
          });
        }
      },
      slocSelect: function(sloc, $item){
        if($item.id){
          sloc.parent_id = $item.id;
          sloc.parent = $item;
        }
      },
      getParent: function(val, countryCode){
        return SlocationsService.finder({q: val, country: countryCode, _meta: {limit: {offset:0, limit:25}}}).then(function(res){
            return res.records.map(function(entry){
              return entry;
            });
        });
      }
    };
  });
