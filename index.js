const path = require('path');
const jimp = require('jimp');
const sizeOf = require('image-size');

function getFileName(file, settings) {
  const prefix = settings.prefix || '';
  const suffix = settings.suffix || '';
  const extension = path.extname(file);
  const nameWithoutExtension = path.basename(file, extension);
  return `${prefix}${nameWithoutExtension}${suffix}${extension}`;
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

function writeFile(processedImage, fileName, filePath = '') {
  return processedImage.write(`${filePath}${fileName}`);
}

module.exports = (image, setup) => {
  setup.versions.forEach(async (version) => {
    const settings = Object.assign({}, setup.all, version);
    const processedImage = await getProcessedImage(image, settings);
    const fileName = getFileName(image, settings);
    return writeFile(processedImage, fileName, settings.path);
  });
};
