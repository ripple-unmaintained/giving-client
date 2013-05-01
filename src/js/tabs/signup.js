var util = require('util');
var Tab = require('../client/tab').Tab;

var SignupTab = function() {
  Tab.call(this);
};

util.inherits(SignupTab, Tab);

SignupTab.prototype.pageMode = 'single';
SignupTab.prototype.parent = 'main';

SignupTab.prototype.generateHtml = function() {
  return require('../../jade/tabs/signup.jade')();
};

SignupTab.prototype.angular = function(module) {
  var app = this.app;

  module.controller('SignupCtrl', ['$scope', '$location', 'rpId', 'rpGiveaway', '$routeParams',

  function($scope, $location, $id, $giveaway, $routeParams) {

    if ($routeParams.errors) {
      $scope.step = 'errors';
      $scope.errors = $routeParams.errors;
    } else if ($routeParams.register) {
      $scope.step = 'two';
      $scope.name = $routeParams.name;
      $scope.email = $routeParams.email;
    } else {
      $scope.step = 'one';
    }

    $scope.oauth = function(provider) {
      window.location = Options.giveawayServer + Options.githubOauth;
    };

    $scope.step_two = function() {
      console.log('hi');
      // update confirmation info
      $.ajax({
        data: {
          register: $routeParams.register,
          name: 'Just testing',
          email: 'this@email.com'
        },
        url: Options.giveawayServer + '/users/' + $routeParams.id,
        type: 'PUT',
        success: function(result) {
          console.log(result);
        }
      });

      $scope.step = 'three';
    };

      $scope.step_three = function() {
        $scope.mode = 'welcome';
      };

      // hook into popup service
      $scope.developerProgram = function() {

      };

      $scope.getRipple = function() {
        $location.path('/getripple');
      };

    }]);
  };


  module.exports = SignupTab;