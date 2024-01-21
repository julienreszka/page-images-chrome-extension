chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab.url.startsWith('chrome://')) {
    const container = document.getElementById('imageContainer');
    container.textContent = 'Cannot fetch images from a chrome:// URL.';
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        return Array.from(document.images, img => img.src);
      }
    }, (result) => {
      const container = document.getElementById('imageContainer');
      if (!result || result.length === 0 || result[0].result.length === 0) {
        container.textContent = 'No images found on this page.';
      } else {
        result[0].result.forEach(src => {
          const img = document.createElement('img');
          img.src = src;
          container.appendChild(img);
        });
      }
    });
  }
});
