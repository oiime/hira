'use strict';

angular.module('dnuApp')
  .controller('UsersCtrl', function ($scope, PaginatedTable, UsersService, dialogs) {
    $scope.table = new PaginatedTable({
      'filters': $scope.filters,
      'getDataFn': UsersService.finder
    });
    $scope.table.setup(function(tableParams){
      $scope.tableParams = tableParams;
    });


    $scope.actions = {
      delete: function(user){
        dialogs.confirm('Delete', 'Delete this user?').result.then(function(){
          UsersService.remove(user.id, function(){
            $scope.table.reload();
          });
        });
      },
      inactivate: function(user){
        UsersService.changeStatus(user.id, 2, function(){
          $scope.table.reload();
        });
      },
      activate: function(user){
        UsersService.changeStatus(user.id, 1, function(){
          $scope.table.reload();
        });
      }
    };
  });
