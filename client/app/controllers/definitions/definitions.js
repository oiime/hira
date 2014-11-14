'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.definitions', {
        url: '/definitions',
        templateUrl: 'app/controllers/definitions/definitions.html',
        controller: 'DefinitionsCtrl'
      });
  });
