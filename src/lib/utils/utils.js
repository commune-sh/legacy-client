import { PUBLIC_API_URL, PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
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

export function isInViewport(element) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          resolve(true);
        } else {
          resolve(false);
        }
        observer.disconnect();
      });
    });

    observer.observe(element);
  });
}

export const getPreviewImage = async (videoFile) => {
  const videoElement = document.createElement('video');
  videoElement.src = URL.createObjectURL(videoFile);

  return new Promise((resolve, reject) => {
    videoElement.oncanplay = () => {
      videoElement.currentTime = 3;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      setTimeout(() => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      }, 100)

      // Clean up
      videoElement.oncanplay = null;
      videoElement.currentTime = null;
      videoElement.remove();
      canvas.remove();
      URL.revokeObjectURL(videoElement.src);
    };

    videoElement.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
};

export const formatBytes = (a,b) => {if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}


export function generateInitials(items) {
  const initialsMap = new Map();

  items.forEach((item) => {
    const firstChar = item.alias.charAt(0);
    let initials = firstChar;

    if (initialsMap.has(firstChar)) {
      let index = 1;
      while (index < item.alias.length && initialsMap.has(initials)) {
        initials = item.alias.substr(0, index + 1);
        index++;
      }
    }

    if (initialsMap.has(initials)) {
      const count = initialsMap.get(initials);
      initialsMap.set(initials, count + 1);
    } else {
      initialsMap.set(initials, 1);
    }

    item.initials = initials;
  });
}

export function isSafari() {
    return (navigator.userAgent.match(/iPad|iPhone|iPod/) && !window.MSStream) || /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function escapeXML(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
}

const render = (items) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>${PUBLIC_APP_NAME}</title>
<link>${PUBLIC_BASE_URL}/rss</link>
<description>${PUBLIC_APP_NAME} RSS feed</description>
<image>
<url>${PUBLIC_BASE_URL}/favicon.png</url>
<title>${PUBLIC_APP_NAME}</title>
<link>${PUBLIC_BASE_URL}/rss</link>
</image>
${items
.map(
(item) => `
<item>
<title>${escapeXML(item.content.title || '')}</title>
<description>${escapeXML(item.content.body || '')}</description>
<link>${PUBLIC_BASE_URL}/${item.room_alias}/post/${escapeXML(item.slug)}</link>
</item>
`
)
.join('')}
</channel>
</rss>`;


export function processFeed(items) {
  return render(items)
}

