
minsize.addEventListener('change', (event) => {
  localStorage.setItem('size', event.target.value);
  const container = document.getElementById('imageContainer');
  container.textContent = '';
  load()
});

hasaltcheckbox.addEventListener('change', (event) => {
  localStorage.setItem('hasalt', event.target.checked || false);
  const container = document.getElementById('imageContainer');
  container.textContent = '';
  load()
});

const load = function () {
  var size = localStorage.getItem('size');
  if (size === null) {
    size = 320;
  }

  minsize.value = size;

  var hasalt = JSON.parse(localStorage.getItem('hasalt'));
  if (!hasalt) {
    hasalt = false;
  }

  hasaltcheckbox.checked = hasalt;

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab.url.startsWith('chrome://')) {
      const container = document.getElementById('imageContainer');
      container.textContent = 'Cannot fetch images from a chrome:// URL.';
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (size, hasalt) => {
          return Array.from(document.images)
            .filter(
              img => (img.naturalWidth >= size ||
                img.naturalHeight >= size) &&
                (!hasalt || img.alt)
            )
            .map(img => ({ src: img.src, alt: img.alt, width: img.naturalWidth, height: img.naturalHeight }));
        },
        args: [size, hasalt]
      }, (result) => {
        const container = document.getElementById('imageContainer');
        if (!result || result.length === 0 || result[0].result?.length === 0) {
          container.textContent = `No images larger than ${size}px found on this page.`;
        } else {
          result[0].result?.forEach(({ src, alt, width, height }) => {
            const div = document.createElement('div');
            const img = document.createElement('img');
            img.src = src;
            div.appendChild(img);

            if (alt) {
              const p = document.createElement('p');
              p.textContent = `width:${width}, height:${height
                }, alt: ${alt}`;
              div.appendChild(p);
            }

            container.appendChild(div);
          });
        }
      });
    }
  });

}


load()
