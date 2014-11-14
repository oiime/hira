'use strict';

angular.module('dnuApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('system.entries', {
        url: '/entries',
        templateUrl: 'app/controllers/entries/entries.html',
        controller: 'EntriesCtrl'
      })
      .state('system.entry_edit', {
        url: '/entry/:id',
        templateUrl: 'app/controllers/entries/entry.html',
        controller: 'EntryCtrl',
        resolve: {
            focusEntry: function(EntryService, $stateParams){
              return EntryService.getById($stateParams.id);
            }
        }
      })
      .state('system.entry_new', {
        url: '/entry?source_id',
        templateUrl: 'app/controllers/entries/entry.html',
        controller: 'EntryCtrl',
        resolve: {
            focusEntry: function(EntryService){
              var entry = EntryService.empty();
              entry.slocations = [{}];
              return entry;
            }
        }
      });
  });
