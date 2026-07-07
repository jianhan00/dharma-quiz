const CACHE_NAME = 'quiz-app-v2';
const ASSETS = [
  './',
  './index.html',
  './questions.json',
  './manifest.json'
];

// 1. 安裝 Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. 啟動並清理舊快取（含舊版本殘留的 ?t= 快取）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(() => self.clients.claim())
  );
});

// 3. 攔截請求：網路優先 (Network First)，離線時退回快取
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return res;
      })
      .catch(() => {
        // ignoreSearch: 忽略網址查詢字串，確保離線時仍能命中題庫快取
        return caches.match(e.request, { ignoreSearch: true });
      })
  );
});
