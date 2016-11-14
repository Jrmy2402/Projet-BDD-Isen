'use strict';

/**
 * @ngdoc function
 * @name coursExoApp.controller:InfoCtrl
 * @description
 * # InfoCtrl
 * Controller of the coursExoApp
 */
angular.module('coursExoApp')
  .controller('InfoCtrl', function($scope, $routeParams, serviceAjax, $cookieStore, $mdDialog, $mdToast, $mdMedia) {
    var mail = $cookieStore.get('mail');

    var serviceInfo = function() {
      serviceAjax.info(mail).success(function(result) {
        console.log(result);
        $scope.user = result.info_peronne;
        if ($scope.user.statut === "Musicien") {
          if (result.info_groupe !== "Pas de groupe") {
            $scope.groupe = result.info_groupe;
            result.info_groupe.forEach(function(m) {
              serviceAjax.infoGroupe(m.nom_groupe).success(function(result) {
                var toto = _.filter($scope.groupe, {
                  'nom_groupe': result.mail[0].nom_groupe
                });
                toto[0].membre = result.mail;
              }).error(function(err) {
                console.log(err.message);
              });

              serviceAjax.infoGroupeMusique(m.nom_groupe).success(function(result) {
                var toto = _.filter($scope.groupe, {
                  'nom_groupe': result.morceau[0].nom_groupe
                });
                toto[0].morceau = result.morceau;
              }).error(function(err) {
                console.log(err.message);
              });

            });
          }
        } else {
          $scope.groupeEnComp = [];
          serviceAjax.groupeEnComp().success(function(result) {
            result.groupe.forEach(function(g) {
              serviceAjax.infoGroupeMusique(g.nom_groupe).success(function(result) {
                $scope.groupeEnComp.push(result.morceau);
              }).error(function(err) {
                console.log(err.message);
              });

            });
          }).error(function(err) {
            console.log(err.message);
          });
        }
      }).error(function(err) {
        console.log(err.message);
      });
    };

    serviceInfo();

    $scope.addMusique = function(ev, groupe) {
      console.log(groupe);
      $mdDialog.show({
        controller: DialogController3,
        templateUrl: '/views/addmusique.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          groupe: groupe
        },
      }).finally(function() {
        serviceInfo();
      });
    };

    function DialogController3($scope, $mdDialog, serviceAjax, $mdToast, groupe) {
      $scope.groupe = groupe;
      $scope.cancel = function() {
        $mdDialog.hide();
      };
      $scope.answer = function(morseau) {
        serviceAjax.addMusique({
          titre: morseau.nom,
          style: morseau.style,
          groupe: groupe
        }).success(function(result) {
          console.log(result);
          var toast = $mdToast.simple()
            .textContent('Musique ajouté!')
            .action('OK')
            .highlightAction(false)
            .position("bottom left");
          $mdToast.show(toast);
          $mdDialog.hide();
        }).error(function(err) {
          console.log(err.message);
        });
      };

      serviceAjax.styleMusique().success(function(result) {
        console.log(result);
        $scope.stylesMusc = result.style;
        console.log($scope.stylesMusc);
      }).error(function(err) {
        console.log(err.message);
      });
    }

    $scope.addGroupe = function(ev) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
          parent: parentEl,
          targetEvent: ev,
          template: '<md-dialog aria-label="List dialog">' +
            '<md-toolbar >' +
            '<div class="md-toolbar-tools">' +
            '<h2>Ajouter un groupe</h2>' +
            '<span flex></span>' +
            '<md-button class="md-icon-button" aria-label="Annuler" ng-click="closeDialog()" >' +
            '<i class="material-icons">&#xE14C;</i>' +
            '</md-button>' +
            '</div>' +
            '</md-toolbar>' +
            '  <md-dialog-content layout-padding>' +
            '<div style="text-align: center;" ng-if="error">{{error}}</div>' +
            '<form name="inscriptionForm">' +
            ' <md-input-container class="md-icon-float md-block">' +
            ' <label>Nom du groupe</label>' +
            ' <md-icon class="material-icons" ng-class="{iconred: inscriptionForm.nom.$touched && !inscriptionForm.nom.$valid}">person</md-icon>' +
            ' <input ng-model="user.nom"  ng-required="true" type="text" name="nom">' +
            ' <div ng-messages="inscriptionForm.nom.$error" ng-if="inscriptionForm.nom.$touched && !inscriptionForm.nom.$valid">' +
            ' <div ng-message="required">Requis.</div>' +
            ' </div>' +
            ' </md-input-container>' +
            '<div layout="row" layout-align="space-around center">' +
            '<div flex="45">' +
            '  <md-input-container class="md-icon-float md-block">' +
            '<label>Code Postal</label>' +
            '<md-icon class="material-icons" ng-class="{iconred: inscriptionForm.numrue.$touched && !inscriptionForm.numrue.$valid}">location_on</md-icon>' +
            '<input ng-model="user.codepostal" type="number" name="codepostal" required>' +
            '<div ng-messages="inscriptionForm.codepostal.$error" ng-if="inscriptionForm.codepostal.$touched && !inscriptionForm.codepostal.$valid">' +
            '  <div ng-message="required">Requis.</div>' +
            '</div>' +
            '  </md-input-container>' +
            '</div>' +
            '<div flex="45">' +
            '  <md-input-container class="md-icon-float md-block">' +
            '<label>Ville</label>' +
            '<input ng-model="user.ville" type="text" name="ville" required>' +
            '<div ng-messages="inscriptionForm.ville.$error" ng-if="inscriptionForm.ville.$touched && !inscriptionForm.ville.$valid">' +
            '  <div ng-message="required">Requis.</div>' +
            '</div>' +
            '  </md-input-container>' +
            '</div>' +
            '  </div>' +
            '<div layout="row" layout-align="space-around center">' +
            '<md-input-container flex="80">' +
            '<label>Membre :</label>' +
            '<md-select ng-model="Membresselected" multiple>' +
            '  <md-optgroup label="Email">' +
            '<md-option ng-value="user.mail" ng-repeat="user in usersMusc">{{user.mail}}</md-option>' +
            '  </md-optgroup>' +
            '</md-select>' +
            '</md-input-container>' +
            '</div>' +
            '</form>' +
            '  </md-dialog-content>' +
            '  <md-dialog-actions>' +
            '    <md-button ng-click="closeDialog()" class="md-primary">' +
            '      Annuler' +
            '    </md-button>' +
            '    <md-button class="md-raised md-primary" ng-click="inscription()" ng-disabled="!inscriptionForm.$valid">Valider</md-button>' +
            '  </md-dialog-actions>' +
            '</md-dialog>',
          locals: {
            mail: mail
          },
          controller: DialogController
        })
        .finally(function() {
          serviceInfo();
        });

      function DialogController($scope, $mdDialog, mail, serviceAjax, $mdToast) {
        $scope.mail = mail;

        serviceAjax.personneMusc().success(function(result) {
          console.log(result);
          $scope.usersMusc = result.mail;
          for (var i = $scope.usersMusc.length - 1; i >= 0; i--) {
            if ($scope.usersMusc[i].mail === mail) {
              $scope.usersMusc.splice(i, 1);
            }
          }
          console.log($scope.usersMusc);
        }).error(function(err) {
          console.log(err.message);
        });

        $scope.Membresselected = [];

        $scope.closeDialog = function() {
          $mdDialog.hide();
        };
        $scope.inscription = function() {
          $scope.Membresselected.push($scope.mail);
          console.log($scope.Membresselected);
          serviceAjax.addGroupe({
            groupe: $scope.user,
            mails: $scope.Membresselected
          }).success(function(result) {
            var toast = $mdToast.simple()
              .textContent('Groupe ajouté!')
              .action('OK')
              .highlightAction(false)
              .position("bottom left");
            $mdToast.show(toast);
            $mdDialog.hide();
            console.log(result);

          }).error(function(err) {
            $scope.error = err.message;
            console.log(err.message);
          });
        };
      }

    };

    var audio = new Audio('Daft Punk - Instant Crush ft. Julian Casablancas.mp3');
    $scope.musiquePlay = function() {
      audio.play();
    }
    $scope.musiquePause = function() {
      audio.pause();
    }
    $scope.statistique = function(ev) {
      $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
      $mdDialog.show({
        controller: DialogController5,
        templateUrl: '/views/statistique.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      }).finally(function() {

      });
    };

    function DialogController5($scope, $mdDialog, serviceAjax, $mdToast) {
      console.log("ciic");
      serviceAjax.statistique().success(function(result) {
        console.log(result);
        $scope.statistique = result;
      });
      $scope.cancel = function() {
        $mdDialog.hide();
      };
    };

    $scope.noteMusique = function(ev, nomMusique, nomGroupe) {
      console.log(nomMusique, nomGroupe);
      $mdDialog.show({
        controller: DialogController2,
        templateUrl: '/views/notemusique.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          groupe: nomGroupe,
          nomMusique: nomMusique
        },
      }).finally(function() {

      });
    }

    function DialogController2($scope, $mdDialog, serviceAjax, $mdToast, groupe, nomMusique) {
      $scope.groupe = groupe;
      $scope.nomMusique = nomMusique;
      var mail = $cookieStore.get('mail');
      $scope.morceau = {
        critere1: '',
        critere2: '',
        critere3: '',
        critere4: '',
        critere5: '',
        critere6: '',
        critere7: '',
        critere8: '',
        critere9: '',
        critere10: ''
      };
      $scope.dejaValider = false;
      serviceAjax.getnoteMusique({
        nomMusique: nomMusique,
        groupe: groupe,
        mail: mail
      }).success(function(result) {
        console.log(result);
        if (result.note.length > 0) {
          $scope.dejaValider = true;
          $scope.morceau.critere1 = result.note[0].critere_1;
          $scope.morceau.critere2 = result.note[0].critere_2;
          $scope.morceau.critere3 = result.note[0].critere_3;
          $scope.morceau.critere4 = result.note[0].critere_4;
          $scope.morceau.critere5 = result.note[0].critere_5;
          $scope.morceau.critere6 = result.note[0].critere_6;
          $scope.morceau.critere7 = result.note[0].critere_7;
          $scope.morceau.critere8 = result.note[0].critere_8;
          $scope.morceau.critere9 = result.note[0].critere_9;
          $scope.morceau.critere10 = result.note[0].critere_10;
        }
      }).error(function(err) {
        console.log(err.message);
      });
      $scope.cancel = function() {
        $mdDialog.hide();
      };
      $scope.answer = function(morceau) {
        console.log(morceau);
        serviceAjax.noteMusique({
          note: morceau,
          nomMusique: nomMusique,
          groupe: groupe,
          mail: mail
        }).success(function(result) {
          console.log(result);
          var toast = $mdToast.simple()
            .textContent('Note ajouté!')
            .action('OK')
            .highlightAction(false)
            .position("bottom left");
          $mdToast.show(toast);
          $mdDialog.hide();
          // $mdDialog.hide();
        }).error(function(err) {
          var toast = $mdToast.simple()
            .textContent('Problème pour ajouté la note!')
            .action('OK')
            .highlightAction(false)
            .position("bottom left");
          $mdToast.show(toast);
          console.log(err.message);
        });
      };


    }

  });
