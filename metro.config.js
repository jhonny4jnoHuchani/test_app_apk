const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Alias clave: apuntar tslib a la versión ES Module
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") {
    return context.resolveRequest(context, "tslib/tslib.es6.js", platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
