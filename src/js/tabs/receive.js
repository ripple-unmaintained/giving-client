var util = require('util');
var Tab = require('../client/tab').Tab;

var ReceiveTab = function ()
{
  Tab.call(this);

  this.on('afterrender', this.onAfterRender.bind(this));
};

util.inherits(ReceiveTab, Tab);

ReceiveTab.prototype.mainMenu = 'receive';

ReceiveTab.prototype.angular = function (module) {
  module.controller('ReceiveCtrl', ['$scope', 'rpId',
                                     function ($scope, $id)
  {
    if (!$id.loginStatus) return $id.goId();

    $scope.redemption_success = false;
    $scope.redeem_code = function () {
      $("#redemption_status").addClass("literal throbber").html("");
      console.log("ADDRESS:", $scope.address);
      console.log("CODE:", $scope.redemption_code);
      $.ajax({
          type: 'POST',
          url: 'http://127.0.0.1:8000/json',
          data: {
            code: $scope.redemption_code,
            ripple_address: $scope.address,
            first_name: "!!!CLIENT!!!",
            last_name: "!!!RIPPLE.COM!!!"
          }
      }).done(function(data) {
          console.log(data);
          if (data.error == "success") {
            $scope.redemption_code = "";
            $("#redemption_status").removeClass().css("color","green").html("Success!");
          } else {
            var errorMessage = {
              "ALREADY_REDEEMED":"Code has already been redeemed.",
              "EXPIRED_CODE":"Code is expired.",
              "INVALID_CODE":"Code is invalid."
            }[data.error] || "An error occurred. Try again later."
            $("#redemption_status").removeClass().css("color","red").html(errorMessage);
          }
        })
        .fail(function(data) {
          $("#redemption_status").removeClass().css("color","red").html("An error occurred. Try again later.");
        })
        .always(function(){});

    };



     // watch the address function and detect when it changes so we can inject the qr
    $scope.$watch('address', function(){
      if ($scope.address !== undefined)
      // use jquery qr code library to inject qr code into div
        $('#qr-code').qrcode('https://ripple.com//contact?to=' + $scope.address);
    }, true);
  }]);
};

ReceiveTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/receive.jade')();
};

ReceiveTab.prototype.onAfterRender = function ()
{
  var self = this;
  this.el.find('.btn').click(function (e) {
    e.preventDefault();

    var address = self.el.find('.address').text();

    highlightAnimation();

    // TODO: Actually copy (using Flash)
  });

  this.el.find('.select').click(function (e) {
    e.preventDefault();

    self.el.find('.address input').select();
  });

  function highlightAnimation() {
    // Trigger highlight animation
    self.el.find('.address')
      .stop()
      .css('background-color', '#fff')
      .effect('highlight', {
        color: "#8BC56A",
        easing: jQuery.easing.easeOutSine()
      }, 800);
  }
};

module.exports = ReceiveTab;
