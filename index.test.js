import resizer, {
  __RewireAPI__ as resizerRewireAPI,
} from '.';

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

const sourceImage = {
  scaleToFit: jest.fn(() => sourceImage),
  normalize: jest.fn(() => sourceImage),
  contrast: jest.fn(() => sourceImage),
  brightness: jest.fn(() => sourceImage),
  quality: jest.fn(() => sourceImage),
  write: jest.fn(),
};

let result;

describe('node-images-resizer', () => {
  describe('when calling', () => {
    const source = '/source/image.jpg';
    const read = jest.fn(() => sourceImage);
    const generateImage = jest.fn(() => sourceImage);
    const isInputDataValid = jest.fn().mockReturnValue(true);

    beforeAll(() => {
      resizerRewireAPI.__Rewire__({
        read, isInputDataValid, generateImage,
      });
    });

    afterAll(() => {
      resizerRewireAPI.__ResetDependency__('read');
      resizerRewireAPI.__ResetDependency__('isInputDataValid');
      resizerRewireAPI.__ResetDependency__('generateImage');
    });

    beforeEach(async () => {
      result = await resizer(source, setup);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should validate input data', () => { expect(isInputDataValid).toHaveBeenCalledTimes(1); });
    test('should read source image', () => { expect(read).toHaveBeenCalledWith(source); });
    test('should generate images', () => { expect(generateImage).toHaveBeenCalledTimes(3); });
    test('should return array of file names', () => {
      expect(result).toEqual(expect.arrayContaining([
        './results/image_large.jpg',
        './results/image_medium.jpg',
        './results/image_small.jpg',
      ]));
    });
  });


  describe('when validating data', () => {
    test('should throw error if input data is invalid', async () => {
      const source = '/source/testImage.jpg';

      try {
        await resizer(source, 'invalid_param');
      } catch (err) {
        expect(err.name).toEqual('Error');
        expect(err.message).toEqual('Invalid input data.');
      }

      try {
        await resizer(source, null);
      } catch (err) {
        expect(err.name).toEqual('Error');
        expect(err.message).toEqual('Invalid input data.');
      }

      try {
        await resizer(source);
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
        await resizer('./fileDoesNotExist.jpg', setup);
      } catch (err) {
        expect(err.name).toEqual('Error');
        expect(err.message).toEqual('Problem with reading ./fileDoesNotExist.jpg, ERROR_MESSAGE.');
      }

      resizerRewireAPI.__ResetDependency__('read');
    });
  });


  describe('when generating image', () => {
    const generateImage = resizerRewireAPI.__GetDependency__('generateImage');
    const scaleToFit = jest.fn(() => 'scaled_image');
    const sourceImageToScale = { scaleToFit };
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
      generateImage(sourceImageToScale, {});
    });

    test('should figure out new size of image', () => { expect(getImageResolution).toHaveBeenCalledWith({}); });
    test('should scale image', () => { expect(sourceImageToScale.scaleToFit).toHaveBeenCalledWith(256, 128); });
    test('should apply filters', () => { expect(applyFilters).toHaveBeenCalledWith('scaled_image', {}); });
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
      expect(getImageResolution({ width: 256 })).toEqual({ width: 256, height: 500 });
    });
  });


  describe('when applying filters', () => {
    const applyFilters = resizerRewireAPI.__GetDependency__('applyFilters');
    const image = {
      normalize: jest.fn(() => image),
      contrast: jest.fn(() => image),
      brightness: jest.fn(() => image),
      quality: jest.fn(() => image),
    };
    const imageSetup = {
      normalize: true,
      contrast: 10,
      brightness: 20,
      quality: 90,
    };

    afterEach(() => {
      image.normalize.mockReset();
      image.contrast.mockReset();
      image.brightness.mockReset();
      image.quality.mockReset();
    });

    test('should normalize image, update contrast and brightness and compress image', () => {
      applyFilters(image, imageSetup);
      expect(image.normalize).toHaveBeenCalledTimes(1);
      expect(image.contrast).toHaveBeenCalledWith(10);
      expect(image.brightness).toHaveBeenCalledWith(20);
      expect(image.quality).toHaveBeenCalledWith(90);
    });

    test('should NOT normalize image, update contrast and brightness and compress image', () => {
      applyFilters(image, {});
      expect(image.normalize).not.toHaveBeenCalled();
      expect(image.contrast).not.toHaveBeenCalled();
      expect(image.brightness).not.toHaveBeenCalled();
      expect(image.quality).not.toHaveBeenCalled();
    });
  });


  describe('when creating file name', () => {
    const getFileNameWithPath = resizerRewireAPI.__GetDependency__('getFileNameWithPath');

    test('should return file name with full path', () => {
      const imageSetup = {
        source: '/image/in/some/folder/fileName.jpg',
        path: '/destination/',
      };
      expect(getFileNameWithPath(imageSetup)).toBe('/destination/fileName.jpg');
    });

    test('should return file name with prefix', () => {
      const imageSetup = {
        source: '/image/in/some/folder/fileName.jpg',
        prefix: 'prefix_',
      };
      expect(getFileNameWithPath(imageSetup)).toBe('prefix_fileName.jpg');
    });

    test('should return file name with suffix', () => {
      const imageSetup = {
        source: '/image/in/some/folder/fileName.jpg',
        suffix: '_suffix',
      };
      expect(getFileNameWithPath(imageSetup)).toBe('fileName_suffix.jpg');
    });
  });
});
