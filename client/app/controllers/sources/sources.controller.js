'use strict';

angular.module('dnuApp')
  .controller('SourcesCtrl', function ($scope, dialogs, GeoService, DocService, SourceService, SessionService, PaginatedTable, DefinitionService) {
    $scope.statuses = [
      {id: null, name: 'All'},
      {id: 1, name: 'Active'},
      {id: 2, name: 'Inactive'}
    ];
    $scope.filters = {
      status: 1
    };
    $scope.table = new PaginatedTable({
      'filters': $scope.filters,
      'getDataFn': SourceService.finder
    });
    $scope.table.setup(function(tableParams){
      $scope.tableParams = tableParams;
    });

    $scope.countries = GeoService.getCountries();
    $scope.definitions = DefinitionService.getCompound();
    $scope.definitionStrings = DefinitionService.getStrings();

    $scope.actions = {
      onFileSelect: function($files, source){
        DocService.upload($files, source, function(err, data){
          if(err){
            dialogs.notify('Error', 'Unable to save file');
          }
          source.documents.push(data);
        });
      },
      filter: function(){
        $scope.table.reload();
      },
      inactivate: function(source){
        SourceService.changeStatus(source.id, 2, function(){
          $scope.table.reload();
        });
      },
      activate: function(source){
        SourceService.changeStatus(source.id, 1, function(){
          $scope.table.reload();
        });
      },
      add: function(){
        var source = SourceService.empty();
        source._edit = true;
        $scope.table.tableParams.data.unshift(source);
      },
      edit: function(source){
        source._edit = true;
      },
      save: function(source){
        source._edit = false;
        SourceService.save(source).then(
          function(res){
            source = res;
            $scope.table.reload();
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
            SourceService.remove(source.id, function(){
              $scope.table.reload();
            });
          });
        }
      },
      deleteDocument: function(source, doc, $index){
        dialogs.confirm('Delete', 'Delete ' + doc.filename + '?').result.then(function(){
          DocService.remove(doc.id, function(){
            source.documents.splice($index, 1);
          });
        });
      }
    };
  });
