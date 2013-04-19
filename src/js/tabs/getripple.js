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

  module.controller('GetRippleCtrl', ['$scope', '$routeParams', 'rpId',
                                 function ($scope, $routeParams, $id)
  {
    // check if logged in
    if (!$id.loginStatus) return $id.goId();

    console.log('loaded');
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
