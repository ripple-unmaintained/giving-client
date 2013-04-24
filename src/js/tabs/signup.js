var util = require('util');
var Tab = require('../client/tab').Tab;
var githubOauth = 'http://54.225.104.89:51234/auth/github';

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

  module.controller('SignupCtrl', ['$scope', '$location', 'rpId', 'rpGiveaway', '$routeParams',
                                     function ($scope, $location, $id, $giveaway, $routeParams)
  {

    if ($routeParams.register)
    {
      $scope.step = 'two';
      $scope.name = $routeParams.name;
      $scope.email = $routeParams.email;
    }
    else
      $scope.step = 'one';


    $scope.mode = 'form';


    $scope.oauth = function(provider){
      window.location = githubOauth;
    };

    $scope.step_two = function(){
      $scope.step = 'three';
      // set cookie info here

    };

    $scope.step_three = function(){
      $scope.mode = 'welcome';
    };

    // hook into popup service
    $scope.developerProgram = function(){

    };

    $scope.getRipple = function(){
      $location.path('/getripple');
    };


    $scope.backendChange = function()
    {
      app.id.blobBackends = $scope.blobBackendCollection.something.value.split(',');
      store.set('ripple_blobBackends', app.id.blobBackends);
    };

    $scope.reset = function()
    {
      $scope.username = '';
      $scope.password = '';
      $scope.password1 = '';
      $scope.password2 = '';
      $scope.master = '';
      $scope.key = '';
      $scope.mode = 'form';
      $scope.showMasterKeyInput = false;

      if ($scope.registerForm) $scope.registerForm.$setPristine(true);
    };

    $scope.register = function()
    {
      app.id.register($scope.username, $scope.password1, function(key){
        $scope.password = new Array($scope.password1.length+1).join("*");
        $scope.keyOpen = key;
        $scope.key = $scope.keyOpen[0] + new Array($scope.keyOpen.length).join("*");

        $scope.mode = 'welcome';
        $scope.$digest();
      }, $scope.masterkey);
    };

    /**
     * Registration cases
     *
     * -- CASE --                                                            -- ACTION --
     * 1. username or/and password is/are missing ----------------------------- show error
     * 2. passwords do not match ---------------------------------------------- show error
     * 3. username and password passed the validation
     *    3.1 master key is not present
     *        3.1.1 account exists -------------------------------------------- login
     *        3.1.2 account doesn't exist ------------------------------------- register and generate master key
     *    3.3 master key is present
     *        3.3.1 account exists, and it uses the same master key ----------- login
     *        3.3.2 account exists, and it uses another master key
     *              3.3.2.1 master key is valid ------------------------------- tell him about the situation, and let him decide what to do
     *              3.3.2.2 master key is invalid ----------------------------- show error
     *        3.3.3 account doesn't exist ------------------------------------- register with given master key
     */

    $scope.submitForm = function()
    {
      var regInProgress;

      app.id.login($scope.username, $scope.password1, function(backendName,error,success){
        if (!regInProgress) {
          if (!success) {
            regInProgress = true;
            $scope.register();
          }
          if (success) {
            if ($scope.masterkey && $scope.masterkey != app.$scope.userCredentials.master_seed) {
              $scope.mode = 'masterkeyerror';
              $scope.$digest();
            } else {
              $location.path('/balance');
            }
          }
        }
      });
    };

    $scope.reset();









  }]);
};


module.exports = SignupTab;