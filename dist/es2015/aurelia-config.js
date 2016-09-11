var _dec, _class, _dec2, _class2;

import * as LogManager from 'aurelia-logging';
import { Homefront } from 'homefront';
import { Loader } from 'aurelia-loader';
import { inject, Container, resolver } from 'aurelia-dependency-injection';
import { Aurelia } from 'aurelia-framework';

export let Config = class Config extends Homefront {};

export let ConfigManager = (_dec = inject(Config, Loader), _dec(_class = class ConfigManager {
  constructor(config, loader) {
    this.config = config;
    this.loader = loader;
  }

  loadExported(moduleId, exported) {
    return this.loader.loadModule(moduleId).then(loadedModule => {
      if (!(exported in loadedModule)) {
        throw new Error(`${ exported } not found for ${ moduleId }`);
      }

      return loadedModule[exported];
    });
  }

  mergeDefault(plugin) {
    let load = () => Promise.resolve(plugin);

    if (typeof plugin === 'string') {
      load = () => this.loadExported(plugin, 'defaults');
    } else if (typeof plugin === 'object' && plugin.moduleId && plugin.exported) {
      load = () => this.loadExported(plugin.moduleId, plugin.exported);
    }

    return load().then(defaults => this.config.merge(defaults));
  }

  mergeDefaultsSynchronous(pluginsOrConfigs) {
    if (pluginsOrConfigs.length === 0) {
      return Promise.resolve(this.config);
    }

    let plugin = pluginsOrConfigs.shift();

    return this.mergeDefault(plugin).then(() => this.mergeDefaultsSynchronous(pluginsOrConfigs));
  }

  configurePlugins(aurelia, plugins) {
    if (plugins.length === 0) {
      return Promise.resolve();
    }

    let plugin = plugins.shift();
    let configure = () => {};

    if (typeof plugin === 'string') {
      LogManager.getLogger('aurelia-config').info(`Configured ${ plugin }.`);

      configure = () => this.loadExported(plugin, 'configure').then(conf => conf(aurelia, this.config.data));
    } else if (typeof plugin === 'object' && plugin.moduleId && plugin.exported) {
      LogManager.getLogger('aurelia-config').info(`Configured ${ plugin.moduleId }.`);

      configure = () => this.loadExported(plugin.moduleId, 'configure').then(conf => conf(aurelia, this.config.data));
    }

    return Promise.resolve(configure()).then(() => this.configurePlugins(aurelia, plugins));
  }
}) || _class);

export let Configuration = (_dec2 = resolver(), _dec2(_class2 = class Configuration {
  constructor(namespace) {
    this._namespace = namespace;
  }

  get(container) {
    return container.get(Config).fetch(this._namespace);
  }

  static of(namespace) {
    return new Configuration(namespace);
  }
}) || _class2);

export function configure(aurelia, configureOrConfig) {
  let configManager = new ConfigManager(aurelia.container.get(Config), aurelia.loader);
  aurelia.container.registerInstance(ConfigManager, configManager);

  if (Array.isArray(configureOrConfig)) {
    return configManager.mergeDefaultsSynchronous(configureOrConfig).then(() => configManager.configurePlugins(aurelia, configureOrConfig));
  } else if (typeof configureOrConfig === 'function') {
    return configureOrConfig(configManager);
  }
}