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
  var app = this.app;

  module.controller('SignupCtrl', ['$scope', '$location', 'rpId', 'rpGiveaway', '$routeParams',

  function($scope, $location, $id, $giveaway, $routeParams) {
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
      $scope.$apply();

    } else {
      // test to see if user has confirmed
      $.post(Options.giveawayServer + '/user/' + $routeParams.id, {
        action: 'associated',
        register: $routeParams.register
      }, function(d) {
        if (d.associated) webutil.redirect('/login');
      });
      $scope.step = 'one';
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
        console.log("CONFIRM DONE, SENDING EMAILS?");
        $.post("http://us4.api.mailchimp.com/1.3/", {
          method: 'listSubscribe',
          apikey: '940ca2c03a350c9b7c3304243cb1ec9b-us4',
          id: '909cceb341', //Github developer giveaway
          double_optin: true,
          email_address: $scope.email,
          merge_vars : {
            FNAME: $scope.name,
            LNAME: ""
          }
        }, function(data) {
          //No need to do anythingc here. Emails will either send or they won't.
          console.log("SENT EMAIL?", data);
        });
        $scope.step = 'three';
        // necessary to apply variable within a callback
        $scope.$apply();
      });
    };

    $scope.step_three = function() {
      $scope.mode = 'welcome';
      $scope.$apply();   
    };
  }]);
};


module.exports = SignupTab;