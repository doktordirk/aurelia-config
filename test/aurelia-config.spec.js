import {Container} from 'aurelia-dependency-injection';
import {DefaultLoader} from 'aurelia-loader-default';
import {configure} from 'src/aurelia-config';
import {ConfigManager} from 'src/config-manager';
import {Config} from 'src/config';

function getAurelia() {
  return {container: new Container, loader: new DefaultLoader};
}

describe('configure', () => {
  it('Should configure with a array', done =>{
    let aurelia = getAurelia();
    let data = [{key: 'value'}];

    configure(aurelia, data).then(() => {
      let config = aurelia.container.get(Config);

      expect(JSON.stringify(config.data)).toBe('{"key":"value"}');
    }).then(done);
  });

  it('Should configure with a function', () =>{
    let aurelia = getAurelia();

    configure(aurelia, configManager => {
      expect(configManager instanceof ConfigManager).toBe(true);
    });
  });
});
