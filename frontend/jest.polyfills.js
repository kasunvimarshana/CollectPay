// Polyfills for Jest
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (callback) => setTimeout(callback, 0);
}

if (typeof global.clearImmediate === 'undefined') {
  global.clearImmediate = (id) => clearTimeout(id);
}
