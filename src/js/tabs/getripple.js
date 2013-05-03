var util = require('util'),
  webutil = require('../util/web'),
  Tab = require('../client/tab').Tab,
  Amount = ripple.Amount,
  giveawayTotal = 4,
  giveawayFunding = 500;

var GetRippleTab = function() {
  Tab.call(this);

  //this.on('retrigger', this.handleRetrigger.bind(this));
};

util.inherits(GetRippleTab, Tab);

GetRippleTab.prototype.mainMenu = 'getripple';

GetRippleTab.prototype.generateHtml = function() {
  return require('../../jade/tabs/getripple.jade')();
};


GetRippleTab.prototype.angular = function(module) {
  var self = this,
    app = this.app;

  module.controller('GetRippleCtrl', ['$scope', '$routeParams', '$rootScope', 'rpId',

  function($scope, $routeParams, $rootScope, $id) {

    var stateUpdated = false;
    $scope.register = false;
    $scope.address = false;
    $scope.payout = giveawayFunding;


    // watch user blob for changes
    $rootScope.$watch('userBlob', function() {
      // if giveaway register is set
      if ($rootScope.userBlob.data.giveaway_register) {
        // setup variables
        $scope.address = $rootScope.userBlob.data.account_id;
        $scope.register = $rootScope.userBlob.data.giveaway_register;
        // if state hasn't been updated
        if (!stateUpdated) {
          var total = 0;
          // fetch state determined by user id
          $.get(Options.giveawayServer + '/user/state/' + $scope.register.id, function(user) {

            // if user has already been funded hide page
            if (user.funded)
              $scope.claim = true;

            // iterate states
            _.each(user.state, function(v, i) {
              //  state is true then update class
              if (v) $scope.updateState(i);
              total += (v) ? 1 : 0;
            });

            // if total is giveaway total then show finish
            if (total == giveawayTotal) $scope.finish = true;
            // don't run again
            stateUpdated = true;
          });
        }
      }
    });


    if (!$id.loginStatus) return $id.goId(); //Don't see this page until you log in.

    // monitor click state
    $scope.clickState = function(item) {
      // return false if already done
      if ($rootScope[item + 'Class'] == 'done') return false;

      $.post(Options.giveawayServer + '/user/' + $scope.register.id, {
        action: 'state',
        state: item,
        register: $scope.register.hash
      }, function(data) {
        $scope.updateState(item);
        // if state has been all clicked then show claim
        if (data.count == 4) {
          $scope.finish = true;
          $scope.$apply();
        }
      });
    };

    // update state locally
    $scope.updateState = function(item) {
      // return false if already done
      if ($rootScope[item + 'Class'] == 'done') return false;

      $rootScope[item + 'Class'] = 'done';
      $rootScope.$apply();
    };

    // do funding
    $scope.congrats = function() {
      $.post(Options.giveawayServer + '/user/' + $scope.register.id, {
        action: 'fund',
        register: $scope.register.hash,
        address: $scope.address
      }, function(res) {
        $scope.finish = false;
        $scope.claim = true;
        $scope.$apply();
      });
    };

  }]);
};

GetRippleTab.prototype.handleRetrigger = function() {
  var $scope = $('#t-send').data('$scope');
  if ($scope && $scope.mode !== 'form') {
    $scope.reset();
    $scope.$digest();
  }
};

module.exports = GetRippleTab;