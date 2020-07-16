// Files to cache
var cacheName = "todo2";
var contentToCache = [
  ".",
  "fn.js",
  "icon.png",
  "index.html",
  "main.css",
  "qrcode.js"
];

// Delete old caches
self.addEventListener("activate", function(e) {
  console.log("[Service Worker] Activate");
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log("[Service Worker] Deleting cache: "+key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Installing Service Worker
self.addEventListener("install", function(e) {
  console.log("[Service Worker] Install");
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("[Service Worker] Caching all: app shell and content");
      return cache.addAll(contentToCache);
    })
  );
});

// Fetching content using Service Worker
self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(e.request).then(function(r) {
        console.log("[Service Worker] Fetching resource: "+e.request.url);
        return r || fetch(e.request).then(function(response) {
          console.log("[Service Worker] Caching new resource: "+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      })
    })
  );
});
