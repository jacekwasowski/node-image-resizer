const sizeOf = require('image-size');
const { parse } = require('path');
const { read } = require('jimp');


function getFileNameWithPath(setup) {
  const prefix = setup.prefix || '';
  const suffix = setup.suffix || '';
  const { name, ext } = parse(setup.source);
  return `${setup.path}${prefix}${name}${suffix}${ext}`;
}


function getImageResolution(setup) {
  const { width, height } = sizeOf(setup.source);
  return {
    width: setup.width || width,
    height: setup.height || height,
  };
}


function getScaledImage(sourceImage, width, height) {
  return sourceImage.scaleToFit(width, height);
}


function applyFilters(image, setup) {
  let processedImage = image;
  if (setup.normalize) processedImage = processedImage.normalize();
  if (setup.contrast) processedImage = processedImage.contrast(setup.contrast);
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
  } catch (err) {
    throw new Error(`Problem with reading ${source}, ${err.message}.`);
  }

  return settings.versions.map((version) => {
    const setup = { ...(settings.all || {}), ...version, source };
    const generatedImage = generateImage(sourceImage, setup);
    const fileName = getFileNameWithPath(setup);
    saveFile(generatedImage, fileName);
    return fileName;
  });
};
