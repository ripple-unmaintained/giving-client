/**
 * ID
 *
 * The id service is used for user identification and authorization.
 */

var util = require('util'),
    Base58Utils = require('../util/base58'),
    RippleAddress = require('../util/types').RippleAddress,
    registered = false,
    webutil = require('../util/web');

var module = angular.module('id', ['blob']);

module.factory('rpId', ['$rootScope', '$location', '$route', '$routeParams', 'rpBlob',
                        function($scope, $location, $route, $routeParams, $blob)
{
  /**
   * Identity manager
   *
   * This class manages the encrypted blob and all user-specific state.
   */
  var Id = function ()
  {
    this.account = null;
    this.loginStatus = false;

    this.blobBackends = store.get('ripple_blobBackends')
      ? store.get('ripple_blobBackends')
      : ['vault', 'local'];
  };

  // This object defines the minimum structure of the blob.
  //
  // This is used to ensure that the blob we get from the server has at least
  // these fields and that they are of the right types.
  Id.minimumBlob = {
    data: {
      contacts: [],
      preferred_issuer: {},
      preferred_second_issuer: {}
    },
    meta: []
  };

  // The default blob is the blob that a new user gets.
  //
  // Right now this is equal to the minimum blob, but we may define certain
  // default values here in the future.
  Id.defaultBlob = Id.minimumBlob;

  /**
   * Reduce username to standardized form.
   *
   * Strips whitespace at beginning and end.
   */
  Id.normalizeUsername = function (username) {
    username = ""+username;
    username = username.trim();
    //we should display username with same capitalization as how they enter it in open wallet
    // toLowerCase used in all blob requests
    // username = username.toLowerCase();
    return username;
  };

  /**
   * Reduce password to standardized form.
   *
   * Strips whitespace at beginning and end.
   */
  Id.normalizePassword = function (password) {
    password = ""+password;
    password = password.trim();
    return password;
  };

  Id.prototype.init = function ()
  {
    var register = webutil.getRegisterHash($routeParams);

    // Initializing sjcl.random doesn't really belong here, but there is no other
    // good place for it yet.
    for (var i = 0; i < 8; i++) {
      sjcl.random.addEntropy(Math.random(), 32, "Math.random()");
    }

    $scope.blobBackendCollections = [
      {name: 'Payward', 'value':'vault'},
      {name: 'Payward, Local Browser', 'value':'vault,local'},
      {name: 'Local Browser', 'value':'local'}
    ];

    var blobBackend = store.get('ripple_blobBackends')
          ? $.grep($scope.blobBackendCollections, function(e){ return e.value == store.get('ripple_blobBackends'); })[0]
        : $scope.blobBackendCollections[1];

    $scope.blobBackendCollection = {something: blobBackend};

    $scope.userBlob = Id.defaultBlob;
    $scope.userCredentials = {};

    $scope.$watch('userBlob',function(){
      // XXX Maybe the blob service should handle this stuff?
      $scope.$broadcast('$blobUpdate');

      // if register exists will overwrite current blog register
      if (register)
        $scope.userBlob.data.giveaway_register = register;

      if (self.username && self.password) {
        $blob.set(self.blobBackends,
                  self.username.toLowerCase(), self.password,
                  $scope.userBlob,function(){
                    $scope.$broadcast('$blobSave');
                  });
      }
    },true);

    $scope.$on('$blobUpdate', function(){
      // Account address
      if (!$scope.address && $scope.userBlob.data.account_id) {
        $scope.address = $scope.userBlob.data.account_id;
      }
    });

    if (Options.persistent_auth && !!store.get('ripple_auth')) {
      var auth = store.get('ripple_auth');

      this.login(auth.username, auth.password);
      this.loginStatus = true;
    }
  };

  Id.prototype.setUsername = function (username)
  {
    this.username = username;
    $scope.userCredentials.username = username;
    $scope.$broadcast('$idUserChange', {username: username});
  };

  Id.prototype.setPassword = function (password)
  {
    this.password = password;
    $scope.userCredentials.password = password;
  };

  Id.prototype.setGiveaway = function (register)
  {
    this.giveaway_register = register;
    $scope.userCredentials.giveaway_register = register;
  };

  // do a post here to associate ripple giveaway address to id
  Id.prototype.giveawayAddress = function(register, address)
  {
    // if registration has already been run
    if (registered)
      return false;

    var self = this;
    $.post(Options.giveawayServer + '/user/' + register.id, {
        action: 'address',
        register: register.hash,
        address: address
    }, function(data){
      registered = true;
      $scope.$broadcast('$giveawayAddress', data);
    });
  };

  Id.prototype.setAccount = function (accId, accKey)
  {
    if (this.account !== null) {
      $scope.$broadcast('$idAccountUnload', {account: accId});
    }
    this.account = accId;
    $scope.userCredentials.account = accId;
    $scope.userCredentials.master_seed = accKey;
    $scope.$broadcast('$idAccountLoad', {account: accId, secret: accKey});
  };

  Id.prototype.isReturning = function ()
  {
    return !!store.get('ripple_known');
  };

  Id.prototype.isLoggedIn = function ()
  {
    return this.loginStatus;
  };

  Id.prototype.storeLogin = function (username, password)
  {
    if (Options.persistent_auth) {
      store.set('ripple_auth', {username: username, password: password});
    }
  };

  Id.prototype.register = function (username, password, register, callback, masterkey)
  {
    var self = this;

    // If Secret Account Key is not present, generate one
    masterkey = !!masterkey
      ? masterkey
      : Base58Utils.encode_base_check(33, sjcl.codec.bytes.fromBits(sjcl.random.randomWords(4)));

    // Callback is optional
    if ("function" !== typeof callback) callback = $.noop;

    // Blob data
    username = Id.normalizeUsername(username);
    password = Id.normalizePassword(password);

    var data = {
      data: {
        master_seed: masterkey,
        account_id: (new RippleAddress(masterkey)).getAddress(),
        contacts: [],
        giveaway_register: register
      },
      meta: {
        created: (new Date()).toJSON(),
        modified: (new Date()).toJSON()
      }
    };

    // Add user to blob
    $blob.set(self.blobBackends, username.toLowerCase(), password, data, function () {
      self.giveawayAddress(register, data.data.account_id);
        $scope.$on('$giveawayAddress', function(res){
        $scope.userBlob = data;
        self.setUsername(username);
        self.setPassword(password);
        self.setGiveaway(register);
        self.setAccount(data.data.account_id, data.data.master_seed);
        self.storeLogin(username, password);
        self.loginStatus = true;
        $scope.$broadcast('$blobUpdate');
        store.set('ripple_known', true);
        callback(data.data.master_seed);
      });
    });
  };

  Id.prototype.login = function (username,password,register,callback)
  {
    var self = this;

    // Callback is optional
    if ("function" !== typeof callback) callback = $.noop;

    username = Id.normalizeUsername(username);
    password = Id.normalizePassword(password);

    $blob.get(self.blobBackends, username.toLowerCase(), password, function (backendName, err, blob) {
      if (err) {
        callback(backendName,err);
        return;
      }

      $scope.$on('$giveawayAddress', function(res){
        // Ensure certain properties exist
        $.extend(true, blob, Id.minimumBlob);

        $scope.userBlob = {
          data: blob.data,
          meta: blob.meta
        };
        self.setUsername(username);
        self.setPassword(password);
        self.setGiveaway(blob.data.giveaway_register);
        self.setAccount(blob.data.account_id, blob.data.master_seed);
        self.storeLogin(username, password);
        self.loginStatus = true;
        $scope.$broadcast('$blobUpdate');
        store.set('ripple_known', true);

        callback(backendName, null, !!blob.data.account_id);
      });

      // if register exists will overwrite current blog register
      if (register) {
        // if register_hash doesn't exist update or if register
        // hash in blob if not equal to current register hash
        if ((!blob.data.hasOwnProperty('giveaway_register'))
          || blob.data.giveaway_register.hash != register.hash)
        {
          blob.data.giveaway_register = register;
          // update blob
          $blob.set(self.blobBackends, username, password, blob, function(){
            // associate ripple address with oauthed account
            self.giveawayAddress(register, blob.data.account_id);
          });
        } else {
          // associate ripple address with oauthed account
          self.giveawayAddress(register, blob.data.account_id);

        }
      // if not updating register hash then call giveawayaddress to advance login process
      } else
        $scope.$broadcast('$giveawayAddress', {});

    });
  };

  Id.prototype.logout = function ()
  {
    store.remove('ripple_auth');

    // problem?
    // reload will not work, as some pages are also available for guests.
    // Logout will show the same page instead of showing login page.
    // This line redirects user to root (login) page
    location.href = location.protocol + '//' + location.hostname + location.pathname;
  };

  /**
   * Go to an identity page.
   *
   * Redirects the user to a page where they can identify. This could be the
   * login or register tab most likely.
   */
  Id.prototype.goId = function () {
    if (!this.isLoggedIn()) {
      if (_.size($routeParams)) {
        var tab = $route.current.tabName;
        $location.search('tab', tab);
      }
      if (this.isReturning()) {
        $location.path('/signup');
      } else {
        $location.path('/signup');
      }
    }
  };

  Id.prototype.updateBlob = function(index, data) {
    // index blob index
    _.extend($scope.userBlob.data[index], data);
    // set blob
    $blob.set(this.blobBackends,
    this.username, this.password,
    $scope.userBlob, function() {
      $scope.$broadcast('$blobSave');
    });
  };

  // smart redirecting

  return new Id();
}]);