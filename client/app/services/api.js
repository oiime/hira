'use strict';
angular.module('dnuApp')
    .constant('API_NOTIFICATIONS', {
      endpointMissing: 'api-404',
      notAuthenticated: 'api-401',
      notAuthorized: 'api-403',
      notAcceptable: 'api-406',
      internalError: 'api-500',
      unknownStatus: 'api-x'
    })
    .factory('API', function($http, $q, $rootScope, ENV, API_NOTIFICATIONS, SessionService){

        var onSuccess = function(defer, data){
            defer.resolve(data);
            // update angular's scopes
            //$rootScope.$$phase || $rootScope.$apply();
        };
        var onError = function(defer, data, status){
            switch(status){
                case 400:
                    defer.reject({status: status, data: data});
                    return;
                case 401:
                    // missing token
                    $rootScope.$broadcast(API_NOTIFICATIONS.notAuthenticated , data);
                    defer.reject({status: status, data: {}});
                    break;
                case 403:
                    // bad role?
                    $rootScope.$broadcast(API_NOTIFICATIONS.notAuthorized , data);
                    defer.reject({status: status, data: {}});
                    break;
                case 404:
                    if(typeof data.messages !== 'undefined'){
                        defer.reject({status: status, data: data});
                    }
                    else {
                        // actually missing
                        $rootScope.$broadcast(API_NOTIFICATIONS.endpointMissing , data);
                        defer.reject({status: status, data: data});
                    }
                    break;
                case 406:
                    // bad json sent
                    $rootScope.$broadcast(API_NOTIFICATIONS.notAcceptable , data);
                    defer.reject({status: status, data: data});
                    break;
                case 502:
                case 500:
                    $rootScope.$broadcast(API_NOTIFICATIONS.internalError , data);
                    defer.reject({status: status, data: data});
                    break;
                default:
                    $rootScope.$broadcast(API_NOTIFICATIONS.unknownStatus , data);
                    defer.reject({status: status, data: {}});
                    break;
            }
        };
        function makeRequest(verb, uri, data){
            var defer = $q.defer();
            verb = verb.toLowerCase();

            $rootScope.$broadcast(API_NOTIFICATIONS.callPromise , defer.promise);

            if(verb === 'upload'){

            }
            else {
                var httpArgs = [ENV.apiEndpoint + uri];
                if (verb.match(/post|put/)){
                    httpArgs.push( data );
                }
                if(SessionService.token){
                    httpArgs.push({headers: {'Authorization' : 'Bearer ' + SessionService.token}});
                }
                $http[verb].apply(null, httpArgs)
                    .success(function(data){
                        onSuccess(defer, data);
                    })
                    .error(function(data, status){
                        onError(defer, data, status);
                    });
            }

            return defer.promise;
        }

        return {
            get: function( uri ){
                return makeRequest( 'get', uri );
            },
            post: function( uri, data ){
                return makeRequest( 'post', uri, data );
            },
            put: function( uri, data ){
                return makeRequest( 'put', uri, data );
            },
            delete: function( uri ){
                return makeRequest( 'delete', uri );
            },
            upload: function(uri, data, $files){
                return makeRequest( 'upload', uri, data, $files );
            }
        };
  });
