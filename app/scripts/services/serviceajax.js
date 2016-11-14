'use strict';

/**
 * @ngdoc service
 * @name coursExoApp.serviceAjax
 * @description
 * # serviceAjax
 * Factory in the coursExoApp.
 */
angular.module('coursExoApp')
  .factory('serviceAjax', function($http, $q) {
    return {
      addGroupe: function(params) {
        return $http({
          url: "http://localhost:3000/addGroupe",
          method: "POST",
          headers: {
            'Accept': 'application/json'
          },
          params: {
            groupe: params.groupe,
            mails: params.mails
          }
        });
      },
      info: function(mail) {
        return $http.get("http://localhost:3000/info?mail=" + mail);
      },
      connection: function(user) {
        return $http.post("http://localhost:3000/connection?mail=" + user.email + "&password=" + user.password);
      },
      inscription: function(user) {
        console.log(user);
        return $http.post("http://localhost:3000/inscription?mail=" + user.email + "&ville=" + user.ville + "&cp=" + user.codepostal + "&password=" + user.password + "&sexe=" + user.sexe + "&nom=" + user.nom + "&prenom=" + user.prenom + "&phone=" + user.phone + "&numrue=" + user.numrue + "&rue=" + user.rue + "&age=" + user.age + "&statut=" + user.statut);
      },
      personneMusc: function() {
        return $http.get("http://localhost:3000/personneMusc");
      },
      styleMusique: function() {
        return $http.get("http://localhost:3000/styleMusique");
      },
      addMusique: function(params) {
        return $http.post("http://localhost:3000/addMusique?titre=" + params.titre + "&nom_groupe=" + params.groupe + "&style=" + params.style);
      },
      infoGroupe: function(nomGroupe) {
        return $http.get("http://localhost:3000/infoGroupe?nom_groupe=" + nomGroupe);
      },
      infoGroupeMusique: function(nomGroupe) {
        return $http.get("http://localhost:3000/infoGroupeMusique?nom_groupe=" + nomGroupe);
      },
      groupeEnComp: function() {
        return $http.get("http://localhost:3000/groupeEnComp");
      },
      noteMusique: function(params) {
        return $http({
          url: "http://localhost:3000/noteMusique",
          method: "POST",
          headers: {
            'Accept': 'application/json'
          },
          params: {
            note: params.note,
            titre: params.nomMusique,
            nom_groupe: params.groupe,
            mail: params.mail
          }
        });
      },
      getnoteMusique: function(params) {
        return $http({
          url: "http://localhost:3000/getnoteMusique",
          method: "Get",
          params: {
            titre: params.nomMusique,
            nom_groupe: params.groupe,
            mail: params.mail
          }
        });
      },
      statistique: function() {
        return $http({
          url: "http://localhost:3000/statistique",
          method: "Get"
        });
      }




    };
  });
