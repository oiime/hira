'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.slocations', {
        url: '/slocations',
        templateUrl: 'app/controllers/slocations/slocations.html',
        controller: 'SlocationsCtrl'
      });
  });
