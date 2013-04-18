var util = require('util');
var Tab = require('../client/tab').Tab;
var githubOauth = 'http://l:3001/login/github';

var SignupTab = function ()
{
  Tab.call(this);
};

util.inherits(SignupTab, Tab);

SignupTab.prototype.pageMode = 'single';
SignupTab.prototype.parent = 'main';

SignupTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/signup.jade')();
};

SignupTab.prototype.angular = function (module) {
  var app = this.app;

  module.controller('SignupCtrl', ['$scope', '$location', 'rpId', 'rpGiveaway',
                                     function ($scope, $location, $id, $giveaway)
  {

    $scope.step = 'one';

    $scope.oauth = function(provider){
      //window.location = githubOauth;
      $scope.step = 'two';
    };

    $scope.confirm = function(){
      $scope.step = 'three';
      // set cookie info here

    };

    // hook into popup service
    $scope.developerProgram = function(){
      alert('hi developer');
    };

  }]);
};


module.exports = SignupTab;