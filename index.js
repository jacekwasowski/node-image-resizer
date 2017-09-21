const sizeOf = require('image-size');
const { parse } = require('path');
const { read } = require('jimp');


function getFileNameWithPath(setup) {
  const fileInfo = parse(setup.source);
  const prefix = setup.prefix || '';
  const suffix = setup.suffix || '';
  return `${setup.path}${prefix}${fileInfo.name}${suffix}${fileInfo.ext}`;
}


function getImageResolution(setup) {
  const resolution = sizeOf(setup.source);
  return {
    width: setup.width || resolution.width,
    height: setup.height || resolution.height,
  };
}


function getScaledImage(sourceImage, width, height) {
  return sourceImage.scaleToFit(width, height);
}


function applyFilters(image, setup) {
  let processedImage = image;
  if (setup.normalize) processedImage = processedImage.normalize();
  if (setup.contast) processedImage = processedImage.contast(setup.contast);
  if (setup.brightness) processedImage = processedImage.brightness(setup.brightness);
  if (setup.quality) processedImage = processedImage.quality(setup.quality);
  return processedImage;
}


function saveFile(generatedImage, fileNameWithPath) {
  generatedImage.write(fileNameWithPath);
}


function generateImage(sourceImage, setup) {
  const { width, height } = getImageResolution(setup);
  const scaledImage = getScaledImage(sourceImage, width, height);
  return applyFilters(scaledImage, setup);
}


function isInputDataValid(settings) {
  return (settings &&
    Array.isArray(settings.versions) &&
    settings.versions.length);
}


module.exports = async (source, settings = {}) => {
  let sourceImage;

  if (!isInputDataValid(settings)) {
    throw new Error('Invalid input data.');
  }

  try {
    sourceImage = await read(source);
  } catch (error) {
    throw new Error(`Problem with reading ${source}, ${error.message}.`);
  }

  return settings.versions.map((version) => {
    const setup = { ...(settings.all || {}), ...version, source };
    const generatedImage = generateImage(sourceImage, setup);
    const fileName = getFileNameWithPath(setup);
    saveFile(generatedImage, fileName);
    return fileName;
  });
};
