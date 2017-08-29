const path = require('path');
const jimp = require('jimp');
const sizeOf = require('image-size');
const log = require('./log');
const fileExists = require('./file-exists');

function getFileNameWithPath(file, settings) {
  const prefix = settings.prefix || '';
  const suffix = settings.suffix || '';
  const fileInfo = path.parse(file);

  return `${settings.path}${prefix}${fileInfo.name}${suffix}${fileInfo.ext}`;
}

function applyFilters(image, settings) {
  let processedImage = image;
  if (settings.normalize) processedImage = processedImage.normalize();
  if (settings.contast) processedImage = processedImage.contast(settings.contast);
  if (settings.brightness) processedImage = processedImage.brightness(settings.brightness);
  if (settings.quality) processedImage = processedImage.quality(settings.quality);

  return processedImage;
}

async function getProcessedImage(image, settings) {
  const img = await jimp.read(image);
  const resolution = sizeOf(image);
  const width = settings.width || resolution.width;
  const height = settings.height || resolution.height;
  const scaledImage = img.scaleToFit(width, height);

  return applyFilters(scaledImage, settings);
}

function writeFile(processedImage, fileNameWithPath) {
  return processedImage.write(fileNameWithPath);
}

module.exports = async (image, setup) => {
  if (!await fileExists(image)) {
    log.error(`Source file ${image} does not exists`);
    return false;
  }

  return setup.versions.forEach(async (version) => {
    try {
      const settings = Object.assign({}, setup.all, version);
      const processedImage = await getProcessedImage(image, settings);
      const fileNameWithPath = getFileNameWithPath(image, settings);

      writeFile(processedImage, fileNameWithPath);
      log.info(`Saved: ${fileNameWithPath}`);
    } catch (e) {
      log.error(`\nProblem with processing ${image}`);
      log.error(` • error log: ${e}\n`);
    }
  });
};
