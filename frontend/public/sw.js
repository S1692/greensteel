// Service Worker for GreenSteel PWA
const CACHE_NAME = 'greensteel-v1';
const STATIC_CACHE = 'greensteel-static-v1';
const DYNAMIC_CACHE = 'greensteel-dynamic-v1';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
];

// 네트워크 우선 전략을 사용할 API 엔드포인트
const API_ROUTES = ['/api/auth', '/api/lca', '/api/cbam', '/api/datagather'];

// 설치 시 정적 리소스 캐시
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 정적 리소스 (Cache First)
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API 요청 (Network First)
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML 페이지 (Network First)
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 기타 요청은 네트워크 우선
  event.respondWith(networkFirst(request));
});

// Cache First 전략
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Network First 전략
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// 푸시 알림 처리
self.addEventListener('push', event => {
  console.log('Push event received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '새로운 업데이트가 있습니다.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'greensteel-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'GreenSteel', options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action) {
    // 액션 버튼 클릭 처리
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // 알림 자체 클릭 처리
    event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
  }
});

// 알림 액션 처리
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view':
      clients.openWindow(data?.url || '/');
      break;
    case 'dismiss':
      // 알림 닫기 (이미 처리됨)
      break;
    default:
      console.log('Unknown action:', action);
  }
}

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('Background sync event:', event);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 작업
async function doBackgroundSync() {
  try {
    // IndexedDB에서 오프라인 작업 가져오기
    const offlineTasks = await getOfflineTasks();

    for (const task of offlineTasks) {
      try {
        await processOfflineTask(task);
        await removeOfflineTask(task.id);
      } catch (error) {
        console.error('Failed to process offline task:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB에서 오프라인 작업 가져오기 (간단한 구현)
async function getOfflineTasks() {
  // 실제 구현에서는 IndexedDB를 사용
  return [];
}

// 오프라인 작업 처리
async function processOfflineTask(task) {
  // 실제 구현에서는 서버에 데이터 전송
  console.log('Processing offline task:', task);
}

// 오프라인 작업 제거
async function removeOfflineTask(taskId) {
  // 실제 구현에서는 IndexedDB에서 제거
  console.log('Removing offline task:', taskId);
}

// 메시지 처리
self.addEventListener('message', event => {
  console.log('Message received:', event);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
