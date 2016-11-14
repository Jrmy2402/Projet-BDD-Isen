'use strict';

/**
 * @ngdoc overview
 * @name coursExoApp
 * @description
 * # coursExoApp
 *
 * Main module of the application.
 */
angular
  .module('coursExoApp', [
    'ngRoute', 'ui.bootstrap', 'ngMaterial', 'ngCookies'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/inscription', {
        templateUrl: 'views/inscription.html',
        controller: 'InscriptionCtrl'
      })
      .when('/info', {
        url: '/info',
        templateUrl: 'views/info.html',
        controller: 'InfoCtrl',
        params: {
			    mail: null,
			  }
      })
      .otherwise({
        redirectTo: '/home'
      });
  });
