'use strict';

angular.module('dnuApp')
  .controller('DefinitionsCtrl', function ($scope,dialogs, DefinitionService) {
    $scope.actions = {
      editValue: function(value){
        value._edit = true;
      },
      saveValue: function(tab, value){
        var exp = {};
        var nameElms = [];
        var expData = {};
        tab.columns.forEach(function(column){
          if(column.primary){
            nameElms.push(value[column.name]);
          }
          expData[column.name] = value[column.name];
        });

        exp.type = tab.name;
        exp.name = nameElms.join(' - ');
        exp.data = expData;
        if(value.id){
          exp.id = value.id;
        }
        DefinitionService.save(exp).then(function(){
          value._edit = false;
        });
      },
      addValue: function(tab){
        var empty = {_edit: true};
        tab.columns.forEach(function(column){
          empty[column.name] = null;
        });
        tab.values.push(empty);
      },
      deleteValue: function(tab, value, $index){
        dialogs.confirm('Delete', 'Delete this definition?').result.then(function(){
            DefinitionService.remove(value.id, function(){
              tab.values.splice($index, 1);
            });
        });
      },
      cancelValue : function(tab, value, $index){
        if(value.id > 0){
          value._edit = false;
        }
        else {
          tab.values.splice($index, 1);
        }
      }
    };
    $scope.tabs = DefinitionService.getCompound();
  });
