'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.help', {
        url: '/help',
        templateUrl: 'app/controllers/help/help.html',
      });
  });
