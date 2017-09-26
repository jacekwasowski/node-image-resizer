const sizeOf = require('image-size');
const { parse } = require('path');
const { read } = require('jimp');


function getFileNameWithPath(setup) {
  const prefix = setup.prefix || '';
  const suffix = setup.suffix || '';
  const { name, ext } = parse(setup.source);
  return `${setup.path || ''}${prefix}${name}${suffix}${ext}`;
}


function getImageResolution(setup) {
  const { width, height } = sizeOf(setup.source);
  return {
    width: setup.width || width,
    height: setup.height || height,
  };
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
  const scaledImage = sourceImage.scaleToFit(width, height);
  return applyFilters(scaledImage, setup);
}


function isInputDataValid(settings) {
  return (settings &&
    Array.isArray(settings.versions) &&
    settings.versions.length);
}


/**
 * Get image and generate its smaller copies asynchronously based on settings.
 *
 * @param {String} source - Path to source file.
 * @param {Object} settings - List af settings.
 * @param {Object} settings.all - List of common settings to applied on each generated image.
 *
 * @param {Object[]} settings.versions - Set of settings, separate for each images.
 *   Each general setting (from settings.all) can be overwritten.
 * @param {String} settings.versions[].path - Destination path for generated image.
 * @param {String} settings.versions[].prefix - Prefix for source file name to create new file name.
 * @param {String} settings.versions[].suffix - Suffix for source file name to create new file name.
 * @param {String} settings.versions[].width - The width of the image in px.
 * @param {String} settings.versions[].height - The height of the image in px.
 * @param {Boolean} settings.versions[].normalize - Normalize the channels in an image.
 * @param {Number} settings.versions[].contrast - Adjust the contrast by a value -1 to +1.
 * @param {Number} settings.versions[].brightness - Adjust the brightness by a value -1 to +1.
 * @param {Number} settings.versions[].quality - Set the quality of saved JPEG by a value 0 - 100.
 *
 * @returns {Promise.<String[]>} - Array with generated file names with paths.
 */
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
