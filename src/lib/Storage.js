const ConfigStorage = require('./ConfigStorage')
const { $q } = require('./angular')

// .provider('Storage', function () {
//   this.setPrefix = function (newPrefix) {
//     ConfigStorage.prefix(newPrefix)
//   }

  // this.$get = ['$q', function ($q) {
    var methods = {};
    // angular.forEach(['get', 'set', 'remove', 'clear'], function (methodName) {
    ['get', 'set', 'remove', 'clear'].map((methodName) => {
      methods[methodName] = function () {
        var deferred = $q.defer()
        var args = Array.prototype.slice.call(arguments)

        args.push(function (result) {
          deferred.resolve(result)
        })
        ConfigStorage[methodName].apply(ConfigStorage, args)

        return deferred.promise
      }
    })

    methods.noPrefix = function () {
      ConfigStorage.noPrefix()
    }

    // return methods
  module.exports = methods
  // }]
// })
