'use strict';

angular.module('dnuApp')
  .controller('SystemCtrl', function ($scope, SessionService) {
    $scope.myself = SessionService.user;
  });
