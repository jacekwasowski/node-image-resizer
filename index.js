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
 * @param {string} source - Path to source file.
 * @param {Object} settings - List af settings.
 * @param {Object} settings.all - Common settings to applied on each generated image.
 * @param {Object[]} settings.versions - Set of settings, separate for each generated images.
 *   Each setting from settings.all can be overwritten by setting from here.
 *
 * @param {string} settings.versions[].path - Destination path for generated image.
 * @param {string} settings.versions[].prefix - Used to create file name based on source file name.
 * @param {string} settings.versions[].suffix - Used to create file name based on source file name.
 * @param {number} settings.versions[].width - Width of the new image (in px).
 * @param {number} settings.versions[].height - Height of the new image (in px).
 * @param {number} settings.versions[].contrast - Adjust the contrast by a value -1 to +1.
 * @param {number} settings.versions[].brightness - Adjust the brightness by a value -1 to +1.
 * @param {number} settings.versions[].quality - Set the quality of saved JPEG by a value 0 - 100.
 * @param {boolean} settings.versions[].normalize - Normalize the channels in the new image.
 *
 * @returns {Promise.<String[]>} - Generated file names with paths.
 * @throws {Error} - When an error has occurred.
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
