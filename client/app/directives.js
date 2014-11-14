'use strict';
angular.module('dnuApp')
.filter('breakword', function () {

  /**
   * @author dkhayzin
   * @date 2009-10-08
   * @see https://gist.github.com/3416770#file-breakword-js
   */

  /**
   * A JavaScript solution for word-wrapping long lines of text.
   * Inserts invisible characters that imitate hyphenation, in words that are longer than the threshold size
   * @param {String} str source
   * @param {Number} largestWordLength (optional) threshold size
   * @param {Number} wordPartSize (optional) characters in between hyphen character
   * @param {String} wordBreaker (optional) hyphenating character
   * @return {String} processed string
   */
  return function(str, largestWordLength, wordPartSize, wordBreaker) {
      if( typeof str !== "string") {
          return str;
      }
      else {
          str = String(str);
      }

      largestWordLength = largestWordLength  || 20;
      wordPartSize = wordPartSize            || 5;

      var userAgent;
      if (wordBreaker) {
          // do nothing
      } else if((userAgent = navigator.userAgent.match(/Firefox\/([0-9\.]+)/i)) && parseInt(userAgent[1], 10) < 3) {  // FF 2 does not have &shy; support, but does support &#8203;
          wordBreaker = "&#8203;";
      } else {
          wordBreaker = "&shy;";
      }

      var regex = new RegExp("([a-z0-9\\-_]{" + largestWordLength + ",})([^<]*?>)?", "gi");
      return str.replace(regex, function() {
          var match = arguments[1];
          var result = [];
          var i = 0;

          if(match.indexOf(wordBreaker) !== -1 || arguments[2]) {
              if(arguments[2])
                  match += arguments[2];    // the word has already been split or we're inside a long tag
              return match;
          }

          while (match.length > 0) {
              result.push(match.substring(0, wordPartSize));
              match = match.substring(wordPartSize);
          }
          return result.join(wordBreaker);
      });
  };
})
.directive('passwordVerify', function() {
   return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue;
            }
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
})
