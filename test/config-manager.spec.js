import {ConfigManager} from 'src/config-manager';
import {Config} from 'src/config';
import {Container} from 'aurelia-dependency-injection';
import {DefaultLoader} from 'aurelia-loader-default';
import {Homefront} from 'homefront';

function getAurelia() {
  return {container: new Container, loader: new DefaultLoader};
}

function getConfigManager() {
  return new ConfigManager(new Config, new DefaultLoader);
}

describe('ConfigManager', function() {
  describe('.constructor()', function() {
    it('Should set config and loader', function() {
      let config = new Config;
      let loader = new DefaultLoader;
      let configManager = new ConfigManager(config, loader);

      expect(configManager.config).toBe(config);
      expect(configManager.loader).toBe(loader);
    });
  });

  describe('.loadExported()', function() {
    it('Should throw if not found', function(done) {
      let configManager = getConfigManager();

      configManager.loadExported('test/resources/test-configs', 'xyz')
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          done();
        });
    });

    it('Should load object from local file', function(done) {
      let configManager = getConfigManager();

      configManager.loadExported('test/resources/test-configs', 'defaults')
        .then(defaults => {
          expect(defaults).toBeDefined();
          expect(typeof defaults === 'object').toBe(true);
        }).then(done);
    });

    it('Should load function from local file', function(done) {
      let configManager = getConfigManager();

      configManager.loadExported('test/resources/test-configs', 'configure')
        .then(configure => {
          expect(configure).toBeDefined();
          expect(typeof configure === 'function').toBe(true);
        }).then(done);
    });
  });

  describe('.mergeDefault()', function() {
    it('Should merge default defaults from local file', function(done) {
      let configManager = getConfigManager();

      configManager.mergeDefault('test/resources/test-configs')
        .then(config => {
          expect(config instanceof Homefront).toBe(true);
          expect(config).toBe(configManager.config);
          expect(config.data.foo.bar).toBe('bazzing');
        }).then(done);
    });

    it('Should merge custom defaults from local file', function(done) {
      let configManager = getConfigManager();

      configManager.mergeDefault({moduleId: 'test/resources/test-configs', exported: 'otherDefaults'})
        .then(config => {
          expect(config instanceof Homefront).toBe(true);
          expect(config).toBe(configManager.config);
          expect(config.data.keeper).toBe('kept');
        }).then(done);
    });

    it('Should merge object', function(done) {
      let configManager = getConfigManager();

      configManager.mergeDefault({foo: 'bar'})
        .then(config => {
          expect(config instanceof Homefront).toBe(true);
          expect(config).toBe(configManager.config);
          expect(config.data.foo).toBe('bar');
        }).then(done);
    });
  });

  describe('.mergeDefaultsSynchronous()', function() {
    it('Should merge with array in right order', function(done) {
      let configManager = getConfigManager();
      configManager.mergeDefaultsSynchronous([
        'test/resources/test-configs',
        {
          moduleId: 'test/resources/test-configs',
          exported: 'otherDefaults'
        },
        {key: 'xy', keeper: 'not-kept'}
      ])
      .then(config => {
        expect(config instanceof Homefront).toBe(true);
        expect(config).toBe(configManager.config);
        expect(JSON.stringify(config.data))
          .toBe(JSON.stringify({ foo: {bar: 'baz', buz: 'buzzing' }, keeper: 'not-kept', key: 'xy'}));
      }).then(done);
    });
  });

  describe('.configurePlugins()', function() {
    it('Should merge with array in right order', function(done) {
      let configManager = getConfigManager();
      configManager.config.data = {foo: 'bar'};

      configManager.configurePlugins(getAurelia(), ['test/resources/test-configs'])
      .catch(result => {
        expect(result.message).toBe('Was called');
        done();
      });
    });
  });
});
