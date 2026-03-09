// Open newTab+ on new window (replaces default blank page)
browser.windows.onCreated.addListener((win) => {
  if (win.type !== 'normal') return;
  browser.tabs.query({ windowId: win.id }).then((tabs) => {
    if (tabs.length === 1 && tabs[0].url === 'about:blank') {
      browser.tabs.update(tabs[0].id, { url: browser.runtime.getURL('index.html') });
    }
  });
});
