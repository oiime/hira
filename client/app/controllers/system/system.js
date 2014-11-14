'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system', {
        templateUrl: 'app/controllers/system/system.html',
        controller: 'SystemCtrl',
        data: {
          requireAuth: true
        },
        resolve:{
          entryDefinitions: function(DefinitionService){
            return DefinitionService.init();
          }
        }
      });
  });
