const path = require('path');
const rewire = require('rewire');

const resizer = rewire('./');

const setup = {
  all: {
    brightness: 0,
    path: './test/images/results/',
    normalize: true,
    quality: 80,
    contrast: 0.045,
  },
  versions: [{
    suffix: '_large',
    width: 1800,
    quality: 60,
  }, {
    suffix: '_medium',
    height: 600,
    contrast: 0.06,
  }, {
    suffix: '_small',
    height: 250,
  }],
};

describe('node-images-resizer', () => {
  describe('when calling', () => {
    test('should generate and save images', () => {
      const generateAndSaveSpy = jest.fn();
      resizer.__set__('generateAndSave', generateAndSaveSpy);
      resizer('/test.jpg', setup);
      expect(generateAndSaveSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('when processing image', () => {
    beforeEach(() => {
      path.parse = jest.fn(() => {
        return {
          ext: '.jpg',
          name: 'test',
        };
      });
    });

    test.only('should read image', async () => {});
    test('should scale image', () => {});
    test('should apply filters', () => {});
    test('should create proper file name with path', () => {});
  });

  describe('when applying filters', () => {
    test('should normalize image', () => {});
    test('should update contrast', () => {});
    test('should update brightness', () => {});
    test('should compress image by setting up quality', () => {});
  });
});