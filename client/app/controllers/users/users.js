'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.users', {
        url: '/users',
        templateUrl: 'app/controllers/users/users.html',
        controller: 'UsersCtrl'
      });
  });
