const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);


// Polyfill for os.availableParallelism if not available (Node < 19.4.0)
// const os = require('os');
// if (!os.availableParallelism) {
//   os.availableParallelism = () => os.cpus().length;
// }
