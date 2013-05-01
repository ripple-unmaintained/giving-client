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

GetRippleTab.prototype.angular = function (module)
{
  var self = this,
      app = this.app;

  module.controller('GetRippleCtrl', ['$scope', '$routeParams', '$rootScope', 'rpId',
                                 function ($scope, $routeParams, $rootScope, $id)
  {


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
