'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.sources', {
        url: '/sources',
        templateUrl: 'app/controllers/sources/sources.html',
        controller: 'SourcesCtrl'
      });
  });
