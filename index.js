const sizeOf = require('image-size');
const { parse } = require('path');
const { read } = require('jimp');


function getFileNameWithPath(settings) {
  const fileInfo = parse(settings.source);
  const prefix = settings.prefix || '';
  const suffix = settings.suffix || '';
  return `${settings.path}${prefix}${fileInfo.name}${suffix}${fileInfo.ext}`;
}


function getImageResolution(settings) {
  const resolution = sizeOf(settings.source);
  return {
    width: settings.width || resolution.width,
    height: settings.height || resolution.height,
  };
}


function getScaledImage(sourceImage, width, height) {
  return sourceImage.scaleToFit(width, height);
}


function applyFilters(image, settings) {
  let processedImage = image;
  if (settings.normalize) processedImage = processedImage.normalize();
  if (settings.contast) processedImage = processedImage.contast(settings.contast);
  if (settings.brightness) processedImage = processedImage.brightness(settings.brightness);
  if (settings.quality) processedImage = processedImage.quality(settings.quality);
  return processedImage;
}


function saveFile(generatedImage, fileNameWithPath) {
  generatedImage.write(fileNameWithPath);
}


function generateImage(sourceImage, settings) {
  const { width, height } = getImageResolution(settings);
  const scaledImage = getScaledImage(sourceImage, width, height);
  return applyFilters(scaledImage, settings);
}


function isInputDataValid(setup = {}) {
  const { versions } = setup;
  return (Array.isArray(versions) && versions.length);
}


module.exports = async (source, setup = {}) => {
  let sourceImage;

  if (!isInputDataValid(setup)) {
    throw new Error('Invalid input data');
  }

  try {
    sourceImage = await read(source);
  } catch (error) {
    throw new Error(`Problem with reading ${source}, ${error.message}`);
  }

  return setup.versions.map((version) => {
    const settings = { ...(setup.all || {}), ...version, source };
    const fileName = getFileNameWithPath(settings);
    const generatedImage = generateImage(sourceImage, settings);
    saveFile(generatedImage, fileName);
    return fileName;
  });
};
