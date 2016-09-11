import * as LogManager from 'aurelia-logging';
import {Homefront} from 'homefront';
import {Loader} from 'aurelia-loader';
import {inject,Container,resolver} from 'aurelia-dependency-injection';
import {Aurelia} from 'aurelia-framework';

/**
 * @extends Homefront
 * Config class
 */
export declare class Config extends Homefront {

}

/**
 * The ConfigManager class
 * Loads and merges configs
 */
export declare class ConfigManager {
  
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
  constructor(config: Config, loader: Loader);
  
  /**
     * Load a exported function or object from a plugin by moduleId
     * @param  {string} moduleId The module to load from
     * @param  {string} exported The name of object or function to load
     * @return {Promise<{}|function>}
     */
  loadExported(moduleId: string, exported: string): Promise<>;
  
  /**
     * Load and merge a plugin default
     * @param {string|{moduleId: string, exported: string}|{}} plugin The moduleId, {moduleId, exported} or object
     * @return {Promise<Homefront>}
     */
  mergeDefault(plugin: string | { moduleId: string, exported: string } | {}): Promise<Homefront>;
  
  /**
     * Load and merge plugin defaults sequentially
     * @param {[string|{moduleId: string, exported: string}|{}]} pluginsOrConfigs Array of moduleIds, {moduleId, exported} or objects
     * @return {Promise<Homefront>}
     */
  mergeDefaultsSynchronous(pluginsOrConfigs: Array<string | { moduleId: string, exported: string } | {}>): Promise<Homefront>;
  
  /**
     * Sequentially load plugins configure function and call with this.config.data
     * @param {Aurelia} aurelia The Aurelia instance
     * @param {[string|{moduleId: string, exported: string}|{}]} plugins Array of moduleIds, {moduleId, exported} or objects. Objects will be ignored
     * @return {Promise<>}
     */
  configurePlugins(aurelia: Aurelia, plugins: Array<string>): Promise<>;
}

/**
 * Configuration class. A resolver for config namespaces which allows injection of the corresponding config segement into a class
 */
export declare class Configuration {
  
  /**
     * Construct the resolver with the specified namespace.
     *
     * @param {string} namespace
     */
  constructor(namespace: string);
  
  /**
     * Resolve for namespace.
     *
     * @param {Container} container The container
     *
     * @return {}
     */
  get(container: Container): {};
  
  /**
     * Get a new resolver for `namespace`.
     *
     * @param {string} namespace The namespace
     *
     * @return {Configuration}  Resolves to the config segement of the namespace
     */
  static of(namespace: string): Configuration;
}

/**
 * configure function for aurelia-config
 * @param {Aurelia} aurelia The aurelia instance
 * @param {[]|Function)} configureOrConfig Array with plugins to load or function(configManager)
 * @return {Promise<>}
 */
export declare function configure(aurelia: Aurelia, configureOrConfig: [] | Function): Promise<>;