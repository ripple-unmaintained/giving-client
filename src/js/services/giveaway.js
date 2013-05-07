/**
 * RIPPLE.TXT
 *
 * The ripple.txt service looks up and caches ripple.txt files.
 *
 * These files are used to do DNS-based verifications autonomously on the
 * client-side. Quite neat when you think about it and a decent solution until
 * we have a network-internal nickname system.
 */

var module = angular.module('giveaway', []);

module.factory('rpGiveaway', ['$q', '$rootScope',

function($q, $scope) {

  return {
    oauth: function(provider) {


    }
  };
}]);