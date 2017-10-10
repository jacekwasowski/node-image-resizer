# node-image-resizer
> Get some image and generate its smaller copies. 
You can also control the quality, brightness and contrast. Asynchronously.


## Installation
```sh
npm i -D node-image-resizer
```

## Usage
```javascript
import resizer from 'node-image-resizer';

(async () => {
  await resizer('./image.jpg', setup);
})();
```
Returns array of file names (with path) for generated thumbnails.


## Setup
You can create as many thumbnails from your image as you wish. 

All definitions (for each thumbnail separately) are grouped in one object with following structure:

```javascript
const setup = { 
  all: {},                 // general settings to apply on each thumbnail
  versions: [{}, {}, {}]   // unique settings for each thumbnail; will overwrite general setting
};
```

for example:
```javascript
const setup = { 
  all: {
    path: './thumbnails/',
    quality: 80
  },
  versions: [{
    prefix: 'big_',
    width: 1024,
    height: 768
  }, {
    prefix: 'medium_',
    width: 512,
    height: 256
  }, {
    quality: 100,
    prefix: 'small_',
    width: 128,
    height: 64
  }]
};

// create thumbnails
const thumbs = await resizer('./image.jpg', setup);
```
Settings from `versions` overwrite values from `all`.


## Options
All options are optional.

name | type | default | description
---|---|---|---
path | string |  | Destination path for generated image.
prefix | string |  | Used to create file name based on source file name. Will overwrite a file with the same name if exists. 
suffix | string |  | Used to create file name based on source file name. Will overwrite a file with the same name if exists.
width | number | source image width | Width of the new image (in px).
height | number | source image height | Height of the new image (in px).
contrast | number |  | Adjust the contrast by a value -1 to +1.
brightness | number |  | Adjust the brightness by a value -1 to +1.
quality | number |  | Set the quality of saved JPEG by a value 0 - 100.
normalize | boolean | false | Normalize the channels in the new image.


## License

MIT