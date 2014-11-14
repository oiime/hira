'use strict';

angular.module('dnuApp')
  .constant('SEVERITY',[
    {level: 1, name: 'Normal or near normal situation'},
    {level: 2, name: 'Minor problem / disruptions'},
    {level: 3, name: 'Stressed / situation of concern'},
    {level: 4, name: 'Serious problems / not life threatening'},
    {level: 5, name: 'Severe problems / potentially life threatening.'},
    {level: 6, name: 'Critical problem / life threatening'}
  ])
  .constant('RELIABILITY',[
    {level: 1, name: 'Completely reliable'},
    {level: 2, name: 'Usually reliable'},
    {level: 3, name: 'Fairly reliable'},
    {level: 4, name: 'Not usually reliable'},
    {level: 5, name: 'Unreliable'},
    {level: 6, name: 'Cannot be judged'}
  ])
  .controller('EntryCtrl', function ($scope, $location, $state, notify, dialogs, focusEntry, RELIABILITY, SEVERITY, SlocationsService, SourceService, GeoService, EntryService, PaginatedTable, DefinitionService) {
    $scope.entry = focusEntry;
    angular.extend($scope.entry, $location.search());
    $scope.loadingLocations = false;
    $scope.SEVERITY = SEVERITY;
    $scope.RELIABILITY = RELIABILITY;

    SourceService.getById($scope.entry.source_id).then(function(res){
      $scope.entry.source = res;
    });

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };
    $scope.currentDate = new Date();
    $scope.definitions = DefinitionService.getCompound();
    $scope.countries = GeoService.getCountries();

    $scope.actions = {
      cancel: function(){
        $scope.entry = EntryService.empty();
        $state.go('system.sources');
      },
      submit: function(form, entry, extras){
        EntryService.save(entry).then(
          function(res){
            form.serverErrors = null;
            //$scope.entry = res;
            $scope.entry = EntryService.empty();
            $scope.entry.slocations = [{}];
            $scope.entry.source_id = res.source_id;
            angular.forEach(extras, function(value, key){
              $scope.entry[key] = value;
            });

            notify({classes: ['alert-success'], message: '`Entry ' + res.id + '` Saved.'});
            if(typeof extras === 'undefined' || Object.keys(extras).length === 0){
              $state.go('system.sources');
            }
          },
          function(res){
              form.serverErrors = res.data.errors;
              $scope.$broadcast('show-errors-check-validity');
          });
      },
      submitCarryExcerpt: function(formEntry, entry){
        $scope.actions.submit(formEntry, entry, {excerpt: entry.excerpt});
      },
      openDatepicker: function($event,source) {
        $event.preventDefault();
        $event.stopPropagation();

        source.datepickerOpened = true;
      },
      addSource: function(entry){
        entry.addEmptySource();
      },
      deleteSource: function(entry, $index){
        entry.source.splice($index, 1);
      },
      getLocation: function(val, countryCode){
        return SlocationsService.finder({q: val, country: countryCode, _meta: {limit: {offset:0, limit:25}}}).then(function(res){
            return res.records.map(function(entry){
              return entry;
            });
        });
      },
      slocSelect: function(slocation, $item){
        if($item.id){
          angular.copy($item, slocation);
        }
      },
      addLocation: function(entry){
        entry.slocations.push({});
      },
      deleteLocation: function(entry, $index){
        entry.slocations.splice($index, 1);
      }
    };

  })
  .controller('EntriesCtrl', function ($scope, dialogs, GeoService, EntryService, PaginatedTable, DefinitionService) {
    $scope.statuses = [
      {id: null, name: 'All'},
      {id: 1, name: 'Active'},
      {id: 2, name: 'Inactive'}
    ];
    $scope.geo = {
      center: {
        longitude: 0,
        latitude: 0
      }
    };
    $scope.filters = {
      order: 'createdAt',
      status: 1
    };
    $scope.table = new PaginatedTable({
      'filters': $scope.filters,
      'getDataFn': EntryService.finder
    });
    $scope.table.setup(function(tableParams){
      $scope.tableParams = tableParams;
    });

    $scope.countries = [{name: 'All Countries', code: ''}].concat(GeoService.getCountries());

    $scope.definitions = DefinitionService.getCompound();
    $scope.definitionStrings = DefinitionService.getStrings();

    $scope.actions = {
      filter: function(){
        $scope.table.reload();
      },
      sort: function(fieldname){
        if( fieldname === $scope.filters.order && $scope.filters.order_dir === 'DESC'){
          $scope.filters.order_dir = 'ASC';
        }
        else {
          $scope.filters.order_dir = 'DESC';
        }

        $scope.filters.order = fieldname;
        $scope.table.reload();
      },
      inactivate: function(entry){
        EntryService.changeStatus(entry.id, 2, function(){
          $scope.table.reload();
        });
      },
      activate: function(entry){
        EntryService.changeStatus(entry.id, 1, function(){
          $scope.table.reload();
        });
      },
      delete: function(entry){
        dialogs.confirm('Delete', 'Delete this entry?').result.then(function(){
          EntryService.remove(entry.id, function(){
            $scope.table.reload();
          });
        });
      }
    };
  });
