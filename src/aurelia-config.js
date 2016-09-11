import {Aurelia} from 'aurelia-framework';
import {ConfigManager} from './config-manager';
import {Config} from './config';

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
