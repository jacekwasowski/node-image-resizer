const path = require('path');
const jimp = require('jimp');
const sizeOf = require('image-size');


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
  if (settings.normalize) {
    processedImage = processedImage.normalize();
  }
  if (settings.contast) {
    processedImage = processedImage.contast(settings.contast);
  }
  if (settings.brightness) {
    processedImage = processedImage.brightness(settings.brightness);
  }
  if (settings.quality) {
    processedImage = processedImage.quality(settings.quality);
  }
  return processedImage;
}


function saveFile(processedImage, fileNameWithPath) {
  processedImage.write(fileNameWithPath);
}


function generateAndSave(processedImage, settings) {
  const { width, height } = getImageResolution(settings);
  const scaledImage = getScaledImage(processedImage, width, height);
  const fileNameWithPath = getFileNameWithPath(settings);
  const finalImage = applyFilters(scaledImage, settings);
  saveFile(finalImage, fileNameWithPath);
  return fileNameWithPath;
}


function isInputDataValid(setup) {
  const { versions } = setup;
  return (Array.isArray(versions) && versions.length);
}


module.exports = async (source, setup = {}) => {
  let processedImage;

  if (!isInputDataValid(setup)) {
    throw new Error('Invalid input data');
  }

  try {
    processedImage = await jimp.read(source);
  } catch (error) {
    throw new Error(`Problem with reading ${source}, ${error.message}`);
  }

  return Promise.all(setup.versions.map((version) => {
    const settings = { ...(setup.all || {}), ...version, source };
    return generateAndSave(processedImage, settings);
  }));
};
