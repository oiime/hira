'use strict';

angular.module('dnuApp')
  .constant('USER_ROLES', {
    admin: 2,
    user: 1
  })
  .constant('AUTH_EVENTS', {
      signinSuccess: 'auth-signin-success',
      signinFailed: 'auth-signin-failed',
      signoutSuccess: 'auth-signout-success',
      sessionTimeout: 'auth-session-timeout',
      notAuthenticated: 'auth-not-authenticated',
      notAuthorized: 'auth-not-authorized'
  })
  .service('AuthService',function($cookies, $rootScope, $q, API, SessionService, AUTH_EVENTS){
    this.init = function(){
      if($cookies.session){
          SessionService.unserialize(JSON.parse(($cookies.session)));
          $rootScope.$broadcast(AUTH_EVENTS.signinSuccess);
      }
    };
    this.authenticate = function(credentials){
      var defer = $q.defer();

      API.post('/api/auth/token', credentials).then(
          function(res) {
              defer.resolve(res);
          },
          function(res) {
              defer.reject(res);
          });
      return defer.promise;
    };
    this.register = function(credentials){
      var defer = $q.defer();

      API.post('/api/auth/register', credentials).then(
          function(res) {
              defer.resolve(res);
          },
          function(res) {
              defer.reject(res);
          });
      return defer.promise;
    };
    this.assign = function(token, user, save){
      SessionService.create(token, user);
      if(save){
        $cookies.session = JSON.stringify(SessionService.serialize());
      }
      $rootScope.$broadcast(AUTH_EVENTS.signinSuccess);
    };
    this.failed = function(){
      $rootScope.$broadcast(AUTH_EVENTS.signinFailed);
    };
    this.isAuthenticated = function () {
      return !!SessionService.user;
    };
    this.isAuthorized =  function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (this.isAuthenticated() &&
        authorizedRoles.indexOf(parseInt(SessionService.user.role)) !== -1);
    };
    this.destroy = function(){
      SessionService.destroy();
      if($cookies.session){
        delete $cookies.session;
      }
      $rootScope.$broadcast(AUTH_EVENTS.signoutSuccess);
    };
  });
