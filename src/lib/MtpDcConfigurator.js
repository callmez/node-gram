const Config = require('./Config')

// .factory('MtpDcConfigurator', function () {
  var sslSubdomains = ['pluto', 'venus', 'aurora', 'vesta', 'flora']

  var dcOptions = Config.Modes.test
    ? [
      {id: 1, host: '149.154.175.10',  port: 80},
      {id: 2, host: '149.154.167.40',  port: 80},
      {id: 3, host: '149.154.175.117', port: 80}
    ]
    : [
      {id: 1, host: '149.154.175.50',  port: 80},
      {id: 2, host: '149.154.167.51',  port: 80},
      {id: 3, host: '149.154.175.100', port: 80},
      {id: 4, host: '149.154.167.91',  port: 80},
      {id: 5, host: '149.154.171.5',   port: 80}
    ]

  var chosenServers = {}

  function chooseServer (dcID, upload) {
    if (chosenServers[dcID] === undefined) {
      var chosenServer = false,
        i, dcOption

      if (Config.Modes.ssl || !Config.Modes.http) {
        var subdomain = sslSubdomains[dcID - 1] + (upload ? '-1' : '')
        var path = Config.Modes.test ? 'apiw_test1' : 'apiw1'
        chosenServer = 'https://' + subdomain + '.web.telegram.org/' + path
        return chosenServer
      }

      for (i = 0; i < dcOptions.length; i++) {
        dcOption = dcOptions[i]
        if (dcOption.id == dcID) {
          chosenServer = 'http://' + dcOption.host + (dcOption.port != 80 ? ':' + dcOption.port : '') + '/apiw1'
          break
        }
      }
      chosenServers[dcID] = chosenServer
    }

    return chosenServers[dcID]
  }

  // return {
  module.exports = {
    chooseServer: chooseServer
  }
// })
