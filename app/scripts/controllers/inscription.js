'use strict';

/**
 * @ngdoc function
 * @name coursExoApp.controller:InfoCtrl
 * @description
 * # InfoCtrl
 * Controller of the coursExoApp
 */
angular.module('coursExoApp')
  .controller('InscriptionCtrl', function($scope, serviceAjax, $filter, $location) {
    $scope.user = {
      sexe: '',
      nom: '',
      prenom: '',
      email: '',
      password: '',
      phone: '',
      numrue: '',
      rue: '',
      codepostal: '',
      ville: '',
      birthday: new Date(),
      age: '',
      statut: ''
    };
    $scope.error = "";

    $scope.inscription = function() {
      $scope.user.age = $filter('date')($scope.user.birthday, "shortDate");
      serviceAjax.inscription($scope.user).success(function(result) {
        console.log("Fini", result);
        $location.path('/info');
      }).error(function(err) {
        console.log(err.message);
        $scope.error = err.message;
      });

    };

  });
