'use strict';

/**
 * @ngdoc function
 * @name coursExoApp.controller:PopularCtrl
 * @description
 * # PopularCtrl
 * Controller of the coursExoApp
 */
angular.module('coursExoApp')
  .controller('HomeCtrl', function($scope, serviceAjax, $location, $cookieStore) {
    $scope.user = {
      email: '',
      password: ''
    };
    $scope.error = "";

    $scope.connection = function() {
      serviceAjax.connection($scope.user).success(function(result) {
        console.log("Fini", result);
        $cookieStore.put('mail', $scope.user.email);
        $cookieStore.put('password', $scope.user.password);
        $location.path('/info');
      }).error(function(err) {
        console.log(err.message);
        $scope.error = err.message;
      });

    };

    $scope.go = function() {
      $location.path('/inscription');
    };
  });
