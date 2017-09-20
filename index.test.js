import resizer, {
  __RewireAPI__ as resierRewireAPI,
} from './';

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

const jimpReadSpy = jest.fn().mockReturnValue('sourceImage');
const pathParseSpy = jest.fn().mockReturnValue({
  name: 'name',
  ext: '.jpg',
});
const generateImageSpy = jest.fn();
const saveFileSpy = jest.fn();
const getFileNameWithPathSpy = jest.fn();
const isInputDataValidSpy = jest.fn().mockReturnValue(true);

describe('node-images-resizer npm module', () => {
  describe('when calling', () => {
    let result;

    beforeEach(async () => {
      resierRewireAPI.__Rewire__('read', jimpReadSpy);
      resierRewireAPI.__Rewire__('parse', pathParseSpy);
      resierRewireAPI.__Rewire__('isInputDataValid', isInputDataValidSpy);
      resierRewireAPI.__Rewire__('generateImage', generateImageSpy);
      resierRewireAPI.__Rewire__('saveFile', saveFileSpy);
      resierRewireAPI.__Rewire__('getFileNameWithPath', getFileNameWithPathSpy);

      result = await resizer('test-images/6.jpg', setup);
    });

    afterEach(() => {
      resierRewireAPI.__ResetDependency__('read');
      resierRewireAPI.__ResetDependency__('parse');
      resierRewireAPI.__ResetDependency__('isInputDataValid');
      resierRewireAPI.__ResetDependency__('generateImage');
      resierRewireAPI.__ResetDependency__('saveFile');
      resierRewireAPI.__ResetDependency__('getFileNameWithPath');
      jest.clearAllMocks();
    });

    test('should validate input data', () => {
      expect(isInputDataValidSpy).toHaveBeenCalledTimes(1);
    });
    test('should read source image', () => {
      expect(jimpReadSpy).toHaveBeenCalledTimes(1);
    });
    test('should create file name with path for new file', () => {
      expect(getFileNameWithPathSpy).toHaveBeenCalledTimes(3);
    });
    test('should generate images', () => {
      expect(generateImageSpy).toHaveBeenCalledTimes(3);
    });

    test.skip('should return names of created files', () => {});
  });

  describe.skip('when validating data', () => {
    test('should throw error if input data are invalid', () => {});
    test('should NOT throw error if input data are valid', () => {});
  });

  describe.skip('when reading file', () => {
    test('should throw error if problem with reading file', () => {});
    test('should NOT throw error if NO problem with reading file', () => {});
  });

  describe.skip('when processing image', () => {
    test('should read image', async () => {});
    test('should scale image', () => {});
    test('should apply filters', () => {});
    test('should create proper file name with path', () => {});
  });

  describe.skip('when applying filters', () => {
    test('should normalize image', () => {});
    test('should update contrast', () => {});
    test('should update brightness', () => {});
    test('should compress image by setting up quality', () => {});
  });
});
