import {Config} from './config';
import {configFor, GetConfig} from './decorators';
import {configurator} from './configurator';

const configure = configurator(Config);

export {
  configure,
  configurator,
  Config,
  configFor,
  GetConfig
};
