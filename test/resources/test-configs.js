export let defaults = {
  foo: {
    bar: 'bazzing',
    buz: 'buzzing'
  }
};

export let configure = function configure(aurelia, config) {
  throw new Error('Was called');
};

export let otherDefaults = {
  foo: {bar: 'baz'},
  keeper: 'kept'
};
