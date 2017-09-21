import resizer, {
  __RewireAPI__ as resizerRewireAPI,
} from './';

const SOURCE = 'test-images/image.jpg';
const EXPECTED_OUTPUT = [
  './results/image_large.jpg',
  './results/image_medium.jpg',
  './results/image_small.jpg',
];
const setup = {
  all: {
    brightness: 0,
    path: './results/',
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

let result;

describe('node-images-resizer npm module', () => {
  describe('when calling', () => {
    const read = jest.fn().mockReturnValue('sourceImage');
    const generateImage = jest.fn();
    const saveFile = jest.fn();
    const isInputDataValid = jest.fn().mockReturnValue(true);

    beforeAll(() => {
      resizerRewireAPI.__Rewire__({
        read, isInputDataValid, generateImage, saveFile,
      });
    });

    afterAll(() => {
      resizerRewireAPI.__ResetDependency__('read');
      resizerRewireAPI.__ResetDependency__('isInputDataValid');
      resizerRewireAPI.__ResetDependency__('generateImage');
      resizerRewireAPI.__ResetDependency__('saveFile');
    });

    beforeEach(async () => {
      result = await resizer(SOURCE, setup);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should validate input data', () => { expect(isInputDataValid).toHaveBeenCalledTimes(1); });
    test('should read source image', () => { expect(read).toHaveBeenCalledWith(SOURCE); });
    test('should generate images', () => { expect(generateImage).toHaveBeenCalledTimes(3); });
    test('should return array of file names', () => { expect(result).toEqual(expect.arrayContaining(EXPECTED_OUTPUT)); });
  });

  describe('when validating data', () => {
    test('should throw error if input data are invalid', async () => {
      try {
        await resizer(SOURCE, 'invalid_param');
      } catch (err) {
        expect(err.name).toEqual('Error');
        expect(err.message).toEqual('Invalid input data.');
      }

      try {
        await resizer(SOURCE, null);
      } catch (err) {
        expect(err.name).toEqual('Error');
        expect(err.message).toEqual('Invalid input data.');
      }
    });
  });

  describe('when reading file', () => {
    test('should throw error if problem with reading file', async () => {
      const read = jest.fn(() => { throw new Error('ERROR_MESSAGE'); });
      resizerRewireAPI.__Rewire__({ read });

      try {
        await resizer('not_exists.jpg', setup);
      } catch (err) {
        expect(err.name).toEqual('Error');
        expect(err.message).toEqual('Problem with reading not_exists.jpg, ERROR_MESSAGE.');
      }

      resizerRewireAPI.__ResetDependency__('read');
    });
  });

  describe.skip('when generating image', () => {
    test('should figure out new size of image', () => {});
    test('should scale image', () => {});
    test('should apply filters', () => {});
  });

  describe.skip('when applying filters', () => {
    test('should normalize image', () => {});
    test('should update contrast', () => {});
    test('should update brightness', () => {});
    test('should compress image by setting up quality', () => {});
  });

  describe('when creating file names', () => {
    test('should ', () => {});
  });
});
