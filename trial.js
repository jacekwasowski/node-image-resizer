/* eslint no-console:0 */

const resizer = require('./');

const versions = [{
  suffix: '_large',
  width: 1000,
  quality: 60,
}, {
  suffix: '_medium',
  height: 500,
  contrast: 0.06,
}, {
  suffix: '_small',
  height: 250,
}];

const setup = {
  all: {
    brightness: 0,
    path: './test/images/results/',
    normalize: true,
    quality: 80,
    contrast: 0.045,
  },
  versions,
};


resizer('./test-images/6.jpg', setup).then((savedFiled) => {
  console.log(savedFiled);
}).catch((err) => {
  console.log('error:', err.message);
});

//
// resizer('./test-images/1.png', setup).then(() => {
//   console.log(': 1');
// });
//
// (async () => {
//   const xxx = await resizer('./test-images/2.png', setup);
//   console.log(xxx)
//   console.log(': 2');
// })();
//
// resizer('./test-images/3.png', setup).then(() => {
//   console.log(': 3');
// });
//
//
// resizer('./test-images/4.jpg', setup).then(() => {
//   console.log(': 4');
// });
//
// (async () => {
//   await resizer('./test-images/5.jpg', setup);
//   console.log(': 5');
// })();
//
//
// (async () => {
//   await resizer('./xtest-images/7.jpg', setup);
//   console.log(': 7');
// })();
