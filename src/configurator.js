
/**
 * The configurator enables you to create a configuration function quickly
 *
 * @param {Config} Config - A plugins class method.
 * @param {string} [configureMethod='configure'] - the name of the configure
 * method can be changed in case it is not configure
 *
 * @return {<config>} instance of the <Config>
 *
 * @example
 *
 * import {Config} from './config';
 * export {configure: configurator(Config);
 */
export function configurator(Config, configureMethod = 'configure') {
  /**
   * configure aurelia-config
   * @param  {Aurelia}         aurelia           The aurelia instance
   * @param  {function|Object} configOrConfigure The configuration object or function
   * @return {Config}                            The aurelia-config Config instance
   */
  return function configure(aurelia, configOrConfigure = {}) {
    let config = aurelia.container.get(Config);

    if (typeof configOrConfigure === 'function') {
      configOrConfigure(config);
    } else {
      config[configureMethod](configOrConfigure);
    }

    return config;
  };
}

