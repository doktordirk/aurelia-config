'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Configuration = exports.ConfigManager = exports.Config = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _dec, _class, _dec2, _class2;

exports.configure = configure;

var _aureliaLogging = require('aurelia-logging');

var LogManager = _interopRequireWildcard(_aureliaLogging);

var _homefront = require('homefront');

var _aureliaLoader = require('aurelia-loader');

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaFramework = require('aurelia-framework');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }



function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Config = exports.Config = function (_Homefront) {
  _inherits(Config, _Homefront);

  function Config() {
    

    return _possibleConstructorReturn(this, _Homefront.apply(this, arguments));
  }

  return Config;
}(_homefront.Homefront);

var ConfigManager = exports.ConfigManager = (_dec = (0, _aureliaDependencyInjection.inject)(Config, _aureliaLoader.Loader), _dec(_class = function () {
  function ConfigManager(config, loader) {
    

    this.config = config;
    this.loader = loader;
  }

  ConfigManager.prototype.loadExported = function loadExported(moduleId, exported) {
    return this.loader.loadModule(moduleId).then(function (loadedModule) {
      if (!(exported in loadedModule)) {
        throw new Error(exported + ' not found for ' + moduleId);
      }

      return loadedModule[exported];
    });
  };

  ConfigManager.prototype.mergeDefault = function mergeDefault(plugin) {
    var _this2 = this;

    var load = function load() {
      return Promise.resolve(plugin);
    };

    if (typeof plugin === 'string') {
      load = function load() {
        return _this2.loadExported(plugin, 'defaults');
      };
    } else if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.moduleId && plugin.exported) {
      load = function load() {
        return _this2.loadExported(plugin.moduleId, plugin.exported);
      };
    }

    return load().then(function (defaults) {
      return _this2.config.merge(defaults);
    });
  };

  ConfigManager.prototype.mergeDefaultsSynchronous = function mergeDefaultsSynchronous(pluginsOrConfigs) {
    var _this3 = this;

    if (pluginsOrConfigs.length === 0) {
      return Promise.resolve(this.config);
    }

    var plugin = pluginsOrConfigs.shift();

    return this.mergeDefault(plugin).then(function () {
      return _this3.mergeDefaultsSynchronous(pluginsOrConfigs);
    });
  };

  ConfigManager.prototype.configurePlugins = function configurePlugins(aurelia, plugins) {
    var _this4 = this;

    if (plugins.length === 0) {
      return Promise.resolve();
    }

    var plugin = plugins.shift();
    var configure = function configure() {};

    if (typeof plugin === 'string') {
      LogManager.getLogger('aurelia-config').info('Configured ' + plugin + '.');

      configure = function configure() {
        return _this4.loadExported(plugin, 'configure').then(function (conf) {
          return conf(aurelia, _this4.config.data);
        });
      };
    } else if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object' && plugin.moduleId && plugin.exported) {
      LogManager.getLogger('aurelia-config').info('Configured ' + plugin.moduleId + '.');

      configure = function configure() {
        return _this4.loadExported(plugin.moduleId, 'configure').then(function (conf) {
          return conf(aurelia, _this4.config.data);
        });
      };
    }

    return Promise.resolve(configure()).then(function () {
      return _this4.configurePlugins(aurelia, plugins);
    });
  };

  return ConfigManager;
}()) || _class);
var Configuration = exports.Configuration = (_dec2 = (0, _aureliaDependencyInjection.resolver)(), _dec2(_class2 = function () {
  function Configuration(namespace) {
    

    this._namespace = namespace;
  }

  Configuration.prototype.get = function get(container) {
    return container.get(Config).fetch(this._namespace);
  };

  Configuration.of = function of(namespace) {
    return new Configuration(namespace);
  };

  return Configuration;
}()) || _class2);
function configure(aurelia, configureOrConfig) {
  var configManager = new ConfigManager(aurelia.container.get(Config), aurelia.loader);
  aurelia.container.registerInstance(ConfigManager, configManager);

  if (Array.isArray(configureOrConfig)) {
    return configManager.mergeDefaultsSynchronous(configureOrConfig).then(function () {
      return configManager.configurePlugins(aurelia, configureOrConfig);
    });
  } else if (typeof configureOrConfig === 'function') {
    return configureOrConfig(configManager);
  }
}