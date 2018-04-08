const { SecureRandom, rng_seed_time } = require('../vendor/jsbn/jsbn_combined')

// .service('MtpSecureRandom', function ($window) {
//   $($window).on('click keydown', rng_seed_time)
rng_seed_time()
//   return new SecureRandom()
module.exports = new SecureRandom()
// })
