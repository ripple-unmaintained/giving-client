var util = require('util');
    Tab = require('../client/tab').Tab,
    webutil = require('../util/web');

var RegisterTab = function ()
{
  Tab.call(this);
};

util.inherits(RegisterTab, Tab);

RegisterTab.prototype.pageMode = 'single';
RegisterTab.prototype.parent = 'main';

RegisterTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/register.jade')();
};


RegisterTab.prototype.angular = function (module) {
  module.controller('RegisterCtrl', ['$scope', '$location', 'rpId', '$routeParams',
                                     function ($scope, $location, $id, $routeParams)
  {
    // if logged in redirect appropriately
    if ($id.loginStatus)
      webutil.defaultDestination($id.giveaway_register);
    //  if register hash is empty then redirect to signup
    else if ( ! $routeParams.register)
      $location.path('/signup');

    $scope.backendChange = function()
    {
      $id.blobBackends = $scope.blobBackendCollection.something.value.split(',');
      store.set('ripple_blobBackends', $id.blobBackends);
    };

    $scope.reset = function()
    {
      $scope.username = '';
      $scope.password = '';
      $scope.passwordSet = {};
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
      $id.register($scope.username, $scope.password1, {
        id: $routeParams.id,
        hash: $routeParams.register
      },
        function(key){
        $scope.password = new Array($scope.password1.length+1).join("*");
        $scope.keyOpen = key;
        $scope.key = $scope.keyOpen[0] + new Array($scope.keyOpen.length).join("*");
        $scope.mode = 'welcome';
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
      // Disable submit button
      $scope.disableSubmit = true;

      var regInProgress;

      // if register params exist create object else make it false
      var register = ($routeParams.register) ? {
        id: $routeParams.id,
        hash: $routeParams.register
      } : false;

      $id.login($scope.username, $scope.password1, register, function(backendName,error,success){
        if (!regInProgress) {
          if (!success) {
            regInProgress = true;
            $scope.register();
          }
          if (success) {
            if ($scope.masterkey && $scope.masterkey != $scope.userCredentials.master_seed) {
              $scope.mode = 'masterkeyerror';
            } else {
              webutil.defaultDestination($id.giveaway_register);
            }
          }
        }
      });
    };

    // workaround to preserve get query string
    $scope.open_wallet = function(){
      $location.path('/login');
    };

    $scope.reset();
  }]);
};

module.exports = RegisterTab;
