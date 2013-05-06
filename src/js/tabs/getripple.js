var util = require('util'),
  webutil = require('../util/web'),
  Tab = require('../client/tab').Tab,
  Amount = ripple.Amount,
  giveawayTotal = 4;

var GetRippleTab = function() {
  Tab.call(this);

  //this.on('retrigger', this.handleRetrigger.bind(this));
};

util.inherits(GetRippleTab, Tab);

GetRippleTab.prototype.mainMenu = 'getripple';

GetRippleTab.prototype.generateHtml = function() {
  return require('../../jade/tabs/getripple.jade')();
};

GetRippleTab.prototype.angularDeps = Tab.prototype.angularDeps.concat(['books']);
GetRippleTab.prototype.angular = function(module) {
  var self = this,
    app = this.app;

  module.controller('GetRippleCtrl', ['rpBooks', '$scope', '$routeParams', '$rootScope', 'rpId',

  function(books, $scope, $routeParams, $rootScope, $id) {

    if (!$id.loginStatus) return $id.goId(); //Don't see this page until you log in.

    var stateUpdated = false;
    $scope.register = false;
    $scope.address = false;
    $scope.payout = false;

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
            if (user.funded) $scope.claim = true;

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
            $scope.$apply();
          });
        }
      }
    });

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


    //$scope.bounty = 500; //Define this here for consistency.

    function loadOffers() {
      // Make sure we unsubscribe from any previously loaded orderbook
      if ($scope.book &&
        "function" === typeof $scope.book.unsubscribe) {
        $scope.book.unsubscribe();
      }
      $scope.book = books.get({
        currency: "USD",
        issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      }, {
        currency: "XRP" //,
      }, $scope.address);
    }
    loadOffers();

    function currentTime() {
      var currentdate = new Date();
      var hour = currentdate.getHours();
      var meridian = (hour >= 12 ? "pm" : "am");
      if (hour === 0) {
        hour = 12;
      } else if (hour > 12) {
        hour -= 12;
      }
      return hour + ":" + currentdate.getMinutes() + meridian;
    }

    // watch for payout variable to updated
    $scope.$watch('payout', function() {
      var ask, bid, unrounded;
      $scope.$watch('book.asks', function(asks) {
        if (!(asks.length)) return;
        ask = asks[0].quality / 1000000;
        if (!ask) return;
        unrounded = $scope.payout / ((ask + bid) / 2);
        $scope.usd_equivalent = (Math.round(unrounded * 100) / 100).toFixed(2); //TODO: Round using filter, not in this code
        $scope.updated_time = currentTime();
      }, true);

      $scope.$watch('book.bids', function(bids) {
        if (!(bids.length)) return;
        bid = 0.000001 / bids[0].quality;
        if (!bid) return;
        unrounded = $scope.payout / ((ask + bid) / 2);
        $scope.usd_equivalent = (Math.round(unrounded * 100) / 100).toFixed(2);
        $scope.updated_time = currentTime();
      }, true);
    });

    // update payout variable
    $.get(Options.giveawayServer + '/user/payout', function(d){
      $scope.payout = d.payout;
    });

    // do funding
    $scope.congrats = function() {
      $scope.finish = false;
      $scope.claim = true;
      $.post(Options.giveawayServer + '/user/' + $scope.register.id, {
        action: 'fund',
        register: $scope.register.hash,
        address: $scope.address
      }, function(res) {
        // update payout variable just in case
        $scope.payout = res.funded;
        if ($scope.book &&
          "function" === typeof $scope.book.unsubscribe) {
          $scope.book.unsubscribe();
        }
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



//==============================