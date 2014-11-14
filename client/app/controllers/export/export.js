'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.export', {
        url: '/export',
        templateUrl: 'app/controllers/export/export.html',
        controller: 'ExportCtrl'
      });
  });
