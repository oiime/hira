'use strict';

angular.module('dnuApp')
  .controller('RegisterCtrl', function ($scope, $state,  AuthService) {
$scope.credentials = {};
    $scope.actions = {
      submit: function(form, credentials){
        if (form.$valid) {

          AuthService.register(credentials).then(
            function(res){
              console.log(res);
                AuthService.assign(res.token, res.user, true);
                $state.go('system.entries');
            },
            function(res){
                form.serverErrors = res.data.errors;
                $scope.$broadcast('show-errors-check-validity');
            });
        } else {
          $scope.$broadcast('show-errors-check-validity');
        }

      }
    };
  })
  .controller('LogoutCtrl', function ($scope, $state,  AuthService) {
    AuthService.destroy();
    $state.go('login');
  })
  .controller('LoginCtrl', function ($scope, $state,  AuthService) {
    $scope.credentials = {};
    $scope.actions = {
      submit: function(form, credentials){
        if (form.$valid) {

          AuthService.authenticate(credentials).then(
            function(res){
              console.log(res);
                AuthService.assign(res.token, res.user, true);
                $state.go('system.entries');
            },
            function(res){
                form.serverErrors = res.data.errors;
                $scope.$broadcast('show-errors-check-validity');

            });
        }

      }
    };
  });
