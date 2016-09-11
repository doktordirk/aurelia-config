import * as LogManager from 'aurelia-logging';
import {Homefront} from 'homefront';
import {Loader} from 'aurelia-loader';
import {inject,Container,resolver} from 'aurelia-dependency-injection';
import {Aurelia} from 'aurelia-framework';

/**
 * @extends Homefront
 * Config class
 */
export class Config extends Homefront {}

/**
 * The ConfigManager class
 * Loads and merges configs
 */
@inject(Config, Loader)
export class ConfigManager {
  /**
  * The config instance
  * @param {Config}
   */
  config: Config;

  /**
  * The Config loader
  * @param {Loader}
   */
  loader: Loader;

  /**
  * Creates an instance of the ConfigManager
  * @param {Config} config The Config instance to load into
  * @param {Loader} loader The loader for the Configs
  */
  constructor(config: Config, loader: Loader) {
    this.config = config;
    this.loader = loader;
  }

  /**
   * Load a exported function or object from a plugin by moduleId
   * @param  {string} moduleId The module to load from
   * @param  {string} exported The name of object or function to load
   * @return {Promise<{}|function>}
   */
  loadExported(moduleId: string, exported: string): Promise<> {
    return this.loader.loadModule(moduleId).then(loadedModule => {
      if (!(exported in loadedModule)) {
        throw new Error(`${exported} not found for ${moduleId}`);
      }

      return loadedModule[exported];
    });
  }

  /**
   * Load and merge a plugin default
   * @param {string|{moduleId: string, exported: string}|{}} plugin The moduleId, {moduleId, exported} or object
   * @return {Promise<Homefront>}
   */
  mergeDefault(plugin: string|{moduleId: string, exported: string}|{}): Promise<Homefront> {
    let load = () => Promise.resolve(plugin);

    if (typeof plugin === 'string') {
      load = () => this.loadExported(plugin, 'defaults');
    } else if (typeof plugin === 'object' && plugin.moduleId && plugin.exported) {
      load = () => this.loadExported(plugin.moduleId, plugin.exported);
    }

    return load().then(defaults => this.config.merge(defaults));
  }

  /**
   * Load and merge plugin defaults sequentially
   * @param {[string|{moduleId: string, exported: string}|{}]} pluginsOrConfigs Array of moduleIds, {moduleId, exported} or objects
   * @return {Promise<Homefront>}
   */
  mergeDefaultsSynchronous(pluginsOrConfigs: Array<string|{moduleId: string, exported: string}|{}>): Promise<Homefront> {
    if (pluginsOrConfigs.length === 0) {
      return Promise.resolve(this.config);
    }

    let plugin = pluginsOrConfigs.shift();

    return this.mergeDefault(plugin).then(() => this.mergeDefaultsSynchronous(pluginsOrConfigs));
  }

  /**
   * Sequentially load plugins configure function and call with this.config.data
   * @param {Aurelia} aurelia The Aurelia instance
   * @param {[string|{moduleId: string, exported: string}|{}]} plugins Array of moduleIds, {moduleId, exported} or objects. Objects will be ignored
   * @return {Promise<>}
   */
  configurePlugins(aurelia: Aurelia, plugins: Array<string>): Promise<> {
    if (plugins.length === 0) {
      return Promise.resolve();
    }

    let plugin    = plugins.shift();
    let configure = () => {};

    if (typeof plugin === 'string') {
      LogManager.getLogger('aurelia-config').info(`Configured ${plugin}.`);

      configure = () => this.loadExported(plugin, 'configure').then(conf => conf(aurelia, this.config.data));
    } else if (typeof plugin === 'object' && plugin.moduleId && plugin.exported) {
      LogManager.getLogger('aurelia-config').info(`Configured ${plugin.moduleId}.`);

      configure = () => this.loadExported(plugin.moduleId, 'configure').then(conf => conf(aurelia, this.config.data));
    }

    return Promise.resolve(configure()).then(() => this.configurePlugins(aurelia, plugins));
  }
}

/**
 * Configuration class. A resolver for config namespaces which allows injection of the corresponding config segement into a class
 */
@resolver()
export class Configuration {
  /**
   * @param {string} _namespace  The namespace
   */
  _namespace: string;

  /**
   * Construct the resolver with the specified namespace.
   *
   * @param {string} namespace
   */
  constructor(namespace: string) {
    this._namespace   = namespace;
  }

  /**
   * Resolve for namespace.
   *
   * @param {Container} container The container
   *
   * @return {}
   */
  get(container: Container): {} {
    return container.get(Config).fetch(this._namespace);
  }

  /**
   * Get a new resolver for `namespace`.
   *
   * @param {string} namespace The namespace
   *
   * @return {Configuration}  Resolves to the config segement of the namespace
   */
  static of(namespace: string): Configuration {
    return new Configuration(namespace);
  }
}

/**
 * configure function for aurelia-config
 * @param {Aurelia} aurelia The aurelia instance
 * @param {[]|Function)} configureOrConfig Array with plugins to load or function(configManager)
 * @return {Promise<>}
 */
export function configure(aurelia: Aurelia, configureOrConfig: []|Function): Promise<> {
  let configManager = new ConfigManager(aurelia.container.get(Config), aurelia.loader);
  aurelia.container.registerInstance(ConfigManager, configManager);

  if (Array.isArray(configureOrConfig)) {
    return configManager.mergeDefaultsSynchronous(configureOrConfig)
      .then(() => configManager.configurePlugins(aurelia, configureOrConfig));
  } else if (typeof configureOrConfig === 'function') {
    return configureOrConfig(configManager);
  }
}
