var util = require('util');
var Tab = require('../client/tab').Tab;
var webutil = require('../util/web');

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
  module.controller('SignupCtrl', ['$scope', '$location', 'rpId', '$routeParams',

  function($scope, $location, $id, $routeParams) {
    // check every 5 seconds when server is down
    var giveawayIntervalTime = 5000;
    // set errors
    $scope.errors = ($routeParams.errors) ? $routeParams.errors.split(',') : [];

    // handle cutoff error
    if (_.contains($scope.errors, 'cutoff')) {
      $scope.step = 'errors';
    } else if ($routeParams.register) {
      // if already confirmed redirect to register page
      if (_.contains($scope.errors, 'already_confirmed')) $location.path('/register');
      // if an address is already associated redirect to login
      else if (_.contains($scope.errors, 'address_associated')) $location.path('/login');

      $scope.step = 'two';
      $scope.name = $routeParams.name;
      $scope.email = $routeParams.email;

    } else {
      if ($routeParams.id) {
        // test to see if user has confirmed
        $.post(Options.giveawayServer + '/user/' + $routeParams.id, {
          action: 'associated',
          register: $routeParams.register
        }, function(d) {
          if (d.associated) webutil.redirect('/login');
        });
      }
      // regular landing page
      $scope.step = 'one';
      // create interval to keep checking status
      setInterval(function() {
        checkGiveawayServer();
      }, giveawayIntervalTime);
      checkGiveawayServer();
    }

    $scope.oauth = function() {
      $scope.sending = false;
      window.location = Options.giveawayServer + Options.githubOauth;
    };

    $scope.step_two = function() {
      $.post(Options.giveawayServer + '/user/' + $routeParams.id, {
        action: 'confirm',
        register: $routeParams.register,
        name: $scope.name,
        email: $scope.email
      }, function(data) {
        $scope.step = 'three';
        // necessary to apply variable within a callback
        $scope.$apply();
      });
    };

    $scope.step_three = function() {
      $scope.mode = 'welcome';
      $scope.$apply();
    };

    // handy function to check if server is down

    function checkGiveawayServer() {
      // check if server is up
      webutil.giveawayServerStatus(function(status) {
        var button_text = (status) ? 'git started' : 'server offline';
        $scope.offline = !status;
        $('#git-started').val(button_text);
        $scope.$apply();
      });
    }

  }]);
};


module.exports = SignupTab;