'use strict';

angular.module('dnuApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.bootstrap.showErrors',
  'ui.bootstrap.datetimepicker',
  'ui.select',
  'dialogs.main',
  'uiGmapgoogle-maps',
  'dibari.angular-ellipsis',
  'ngTable',
  'cgNotify',
  'angularMoment',
  'angularFileUpload'
])
.constant('ENV',
  {
    name:'development',
    apiEndpoint:window.location.protocol + '//' + window.location.host
  }
)
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
  $urlRouterProvider
    .otherwise('/login');

  $locationProvider.html5Mode(true);
})
.run(function($rootScope, AUTH_EVENTS,AuthService, dialogs, API_NOTIFICATIONS, $state, $http, $window){

  AuthService.init();
  // respond to api events
  $rootScope.$on(API_NOTIFICATIONS.notAuthenticated, function() {
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
  });
  $rootScope.$on(API_NOTIFICATIONS.notAuthorized, function() {
      $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
  });
  $rootScope.$on(API_NOTIFICATIONS.notAcceptable, function(event) {
      dialogs.error('Error', 'Bad request body');
      event.preventDefault();
  });
  $rootScope.$on(API_NOTIFICATIONS.endpointMissing, function(event) {
      dialogs.error('Error', 'API endpoint missing');
      event.preventDefault();
  });
  $rootScope.$on(API_NOTIFICATIONS.internalError, function(event) {
      dialogs.error('Error', 'Internal Error');
      event.preventDefault();
  });
  $rootScope.$on(API_NOTIFICATIONS.unknownStatus, function(event, status) {
      dialogs.error('Error', 'Error connecting to API. STATUS: ' + status);
      event.preventDefault();
  });

  // respond to auth events
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
      AuthService.destroy();
      $window.location.href = '/login';
      event.preventDefault();
  });
  $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {
      $window.location.href = '/login';
      event.preventDefault();
  });
  $rootScope.$on(AUTH_EVENTS.signinSuccess, function(event) {
      $window.location.href = '/entries';
      event.preventDefault();
  });
  $rootScope.$on(AUTH_EVENTS.signoutSuccess, function(event) {
      $window.location.href = '/login';
      event.preventDefault();
  });
  $rootScope.$on('$stateNotFound', function(event){
      $window.location.href = '/login';
      event.preventDefault();
  });
  $rootScope.$on('$stateChangeStart', function (event, next) {
      if(next.data && (next.data.requireAuth || next.data.authorizedRoles)){
          if (!AuthService.isAuthenticated()) {
              $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
              event.preventDefault();
          }
          // roles
          else if(next.data.authorizedRoles && !AuthService.isAuthorized(next.data.authorizedRoles)){
              $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
              event.preventDefault();
          }
      }
  });
});
