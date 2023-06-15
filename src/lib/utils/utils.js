import { encode } from "blurhash";

export const debounce = function () {
  var timeoutId = null;
  return function (func, timeout, context) {
    context = context || this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      func.apply(context, arguments);
    }, timeout);

    return timeoutId;
  };
}();


const getImageData = image => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

export const encodeImageToBlurhash = async image => {
  const imageData = getImageData(image);
  return encode(imageData.data, imageData.width, imageData.height, 4, 4);
};

export function getReplyCount(event) {
  let count = 0;

  if (event.children && event.children.length > 0) {
    count += event.children.length; // Add the immediate children count

    // Recursively calculate the sum of descendant children
    for (const childEvent of event.children) {
      count += getReplyCount(childEvent);
    }
  }

  return count;
}
