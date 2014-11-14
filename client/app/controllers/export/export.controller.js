'use strict';

angular.module('dnuApp')
  .controller('ExportCtrl', function ($scope, $location) {
    $scope.myhost = 'http://' + $location.host();
  });
