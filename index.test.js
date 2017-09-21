import resizer, {
  __RewireAPI__ as resizerRewireAPI,
} from '.';

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


  describe('when generating image', () => {
    const generateImage = resizerRewireAPI.__GetDependency__('generateImage');
    const scaleToFit = jest.fn(() => 'scaled_image');
    const sourceImage = { scaleToFit };
    const imageSetup = {};
    const imageResolution = { width: 256, height: 128 };
    const getImageResolution = jest.fn(() => imageResolution);
    const applyFilters = jest.fn();

    beforeAll(() => {
      resizerRewireAPI.__Rewire__({
        getImageResolution, applyFilters,
      });
    });

    afterAll(() => {
      resizerRewireAPI.__ResetDependency__('getImageResolution');
      resizerRewireAPI.__ResetDependency__('applyFilters');
    });

    beforeEach(() => {
      generateImage(sourceImage, imageSetup);
    });

    test('should figure out new size of image', () => { expect(getImageResolution).toHaveBeenCalledWith(imageSetup); });
    test('should scale image', () => { expect(sourceImage.scaleToFit).toHaveBeenCalledWith(256, 128); });
    test('should apply filters', () => { expect(applyFilters).toHaveBeenCalledWith('scaled_image', imageSetup); });
  });


  describe('when calculating file resolution', () => {
    const getImageResolution = resizerRewireAPI.__GetDependency__('getImageResolution');
    const imageResolution = { width: 1000, height: 500 };
    const sizeOf = jest.fn(() => imageResolution);

    beforeAll(() => {
      resizerRewireAPI.__Rewire__({ sizeOf });
    });

    afterAll(() => {
      resizerRewireAPI.__ResetDependency__('sizeOf');
    });

    test('should choose resolution from the setup', () => {
      const imageSetup = { width: 256, height: 128 };
      expect(getImageResolution(imageSetup)).toEqual(imageSetup);
    });

    test('should reuse actual resolution if none in setup', () => {
      expect(getImageResolution({})).toEqual(imageResolution);
    });

    test('should figure out size from incomplete data', () => {
      expect(getImageResolution({ width: 256 })).toEqual({
        width: 256,
        height: 500,
      });
    });
  });


  describe.skip('when applying filters', () => {
    test('should normalize image', () => {});
    test('should update contrast', () => {});
    test('should update brightness', () => {});
    test('should compress image by setting up quality', () => {});
  });


  describe.skip('when creating file names', () => {
    test('should return file name with full path', () => {});
    test('should return file name with prefix', () => {});
    test('should return file name with suffix', () => {});
  });
});
