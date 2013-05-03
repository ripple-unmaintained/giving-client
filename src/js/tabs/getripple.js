var util = require('util'),
    webutil = require('../util/web'),
    Tab = require('../client/tab').Tab,
    Amount = ripple.Amount;

var GetRippleTab = function ()
{
  Tab.call(this);

  //this.on('retrigger', this.handleRetrigger.bind(this));
};

util.inherits(GetRippleTab, Tab);

GetRippleTab.prototype.mainMenu = 'getripple';

GetRippleTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/getripple.jade')();
};

GetRippleTab.prototype.angularDeps = Tab.prototype.angularDeps.concat(['books']);
GetRippleTab.prototype.angular = function (module)
{
  var self = this,
      app = this.app;

  module.controller('GetRippleCtrl', ['rpBooks', '$scope', '$routeParams', '$rootScope', 'rpId',
                                 function (books, $scope, $routeParams, $rootScope, $id)
  {
    if (!$id.loginStatus) return $id.goId(); //Don't see this page until you log in.
    $scope.bounty = 500; //Define this here for consistency.
    function loadOffers() {
      // Make sure we unsubscribe from any previously loaded orderbook
      if ($scope.book &&
          "function" === typeof $scope.book.unsubscribe) {
        $scope.book.unsubscribe();
      }

      $scope.asum = [];
      $scope.book = books.get({
        currency: "USD",
        issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      }, {
        currency: "XRP"//,
      }, $scope.address);
    }
    loadOffers();

    function currentTime() {
      var currentdate = new Date(); 
      var hour = currentdate.getHours();
      var meridian = (hour >= 12 ? "pm" : "am");
      if (hour == 0) {hour = 12;}
      else if (hour > 12) { hour -= 12;}
      return hour + ":" + currentdate.getMinutes() + meridian;
    }
    
    var ask, bid, unrounded;
    $scope.$watch('book.asks', function (asks) {
      if (!(asks.length)) return;
      ask = asks[0].quality/1000000;
      if (!ask) return;
      unrounded = $scope.bounty/((ask+bid)/2);
      $scope.usd_equivalent=(Math.round(unrounded*100)/100).toFixed(2); //TODO: Round using filter, not in this code
      $scope.updated_time = currentTime();
    }, true);

    $scope.$watch('book.bids', function (bids) {
      if (!(bids.length)) return;
      bid = 0.000001/bids[0].quality;
      if (!bid) return;
      unrounded = $scope.bounty/((ask+bid)/2);
      $scope.usd_equivalent=(Math.round(unrounded*100)/100).toFixed(2);
      $scope.updated_time = currentTime();
    }, true);




    $scope.clickCode = function() {
      $rootScope.codeClass='done';
      areWeDoneYet();
    }
    $scope.clickWiki = function() {
      $rootScope.wikiClass='done';
      areWeDoneYet();
    }
    $scope.clickVideo = function() {
      $rootScope.videoClass='done';
      areWeDoneYet();
    }
    $scope.clickList = function() {
      $rootScope.listClass='done';
      areWeDoneYet();
    }

    function areWeDoneYet() {
      $scope.finish = (
        !($rootScope.claim) &&
        $rootScope.codeClass=='done' && 
        $rootScope.wikiClass=='done' && 
        $rootScope.videoClass=='done' &&
        $rootScope.listClass=='done');
    }
    areWeDoneYet();


    $scope.congrats = function(){
      $rootScope.claim = true;
      areWeDoneYet();
      if ($scope.book &&
          "function" === typeof $scope.book.unsubscribe) {
        $scope.book.unsubscribe();
      }
    };

  }]);
};

GetRippleTab.prototype.handleRetrigger = function () {
  var $scope = $('#t-send').data('$scope');
  if ($scope && $scope.mode !== 'form') {
    $scope.reset();
    $scope.$digest();
  }
};

module.exports = GetRippleTab;
