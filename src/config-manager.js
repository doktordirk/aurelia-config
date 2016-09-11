import * as LogManager from 'aurelia-logging';
import {Config} from './config';
import {Loader} from 'aurelia-loader';
import {inject} from 'aurelia-dependency-injection';
import {Aurelia} from 'aurelia-framework';

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
