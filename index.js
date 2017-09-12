const path = require('path');
const jimp = require('jimp');
const sizeOf = require('image-size');
const log = require('./log');


function getFileNameWithPath(settings) {
  const prefix = settings.prefix || '';
  const suffix = settings.suffix || '';
  const fileInfo = path.parse(settings.source);
  return `${settings.path}${prefix}${fileInfo.name}${suffix}${fileInfo.ext}`;
}


function getScaledImage(image, width, height) {
  return image.scaleToFit(width, height);
}


function getImageResolution(settings) {
  const resolution = sizeOf(settings.source);
  return {
    width: settings.width || resolution.width,
    height: settings.height || resolution.height,
  };
}


function applyFilters(image, settings) {
  let processedImage = image;
  if (settings.normalize) processedImage = processedImage.normalize();
  if (settings.contast) processedImage = processedImage.contast(settings.contast);
  if (settings.brightness) processedImage = processedImage.brightness(settings.brightness);
  if (settings.quality) processedImage = processedImage.quality(settings.quality);
  return processedImage;
}


function saveFile(processedImage, fileNameWithPath) {
  processedImage.write(fileNameWithPath);
}


function generateAndSave(processedImage, settings) {
  try {
    const { width, height } = getImageResolution(settings);
    const scaledImage = getScaledImage(processedImage, width, height);
    const fileNameWithPath = getFileNameWithPath(settings);
    const finalImage = applyFilters(scaledImage, settings);
    saveFile(finalImage, fileNameWithPath);
    log.info(`Saved: ${fileNameWithPath}`);
  } catch (e) {
    log.error(`Problem with processing ${settings.source}: ${e}`);
  }
}


async function getImageToProcess(source) {
  try {
    return await jimp.read(source);
  } catch (e) {
    log.error(`Problem with reading ${source}: ${e}`);
    return null;
  }
}


function areInputDataValid(setup) {
  const { versions } = setup;
  return (Array.isArray(versions) && versions.length);
}


module.exports = async (source, setup = {}) => {
  const processedImage = await getImageToProcess(source);

  if (!processedImage) {
    // http://thecodebarbarian.com/unhandled-promise-rejections-in-node.js.html
    return Promise.reject(new Error()).catch(() => {});
  }

  if (!areInputDataValid(setup)) {
    log.error('Please specify input data');
    return Promise.reject(new Error()).catch(() => {});
  }

  return Promise.all(setup.versions.map((version) => {
    const settings = { ...(setup.all || {}), ...version, source };
    return generateAndSave(processedImage, settings);
  }));
};
