// PWA 성능 최적화 및 사용자 경험 향상을 위한 유틸리티 함수들

/**
 * 이미지 지연 로딩을 위한 Intersection Observer 설정
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      }
    });
  });

  // 지연 로딩 이미지들 관찰
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

/**
 * 코드 스플리팅을 위한 동적 임포트 헬퍼
 */
export function lazyLoadComponent(importFunc: () => Promise<any>) {
  return importFunc().then((module) => module.default);
}

/**
 * 오프라인 상태에서 데이터 저장을 위한 IndexedDB 헬퍼
 */
export class OfflineStorage {
  private dbName = 'GreenSteelOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 오프라인 작업 저장소
        if (!db.objectStoreNames.contains('offlineTasks')) {
          const taskStore = db.createObjectStore('offlineTasks', { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('type', 'type', { unique: false });
          taskStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 캐시된 데이터 저장소
        if (!db.objectStoreNames.contains('cachedData')) {
          const dataStore = db.createObjectStore('cachedData', { keyPath: 'key' });
          dataStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  async saveOfflineTask(type: string, data: any): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTasks'], 'readwrite');
      const store = transaction.objectStore('offlineTasks');

      const task = {
        type,
        data,
        timestamp: Date.now(),
        status: 'pending'
      };

      const request = store.add(task);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineTasks(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTasks'], 'readonly');
      const store = transaction.objectStore('offlineTasks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOfflineTask(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTasks'], 'readwrite');
      const store = transaction.objectStore('offlineTasks');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(key: string, data: any, expiryHours: number = 24): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');

      const cacheEntry = {
        key,
        data,
        expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
      };

      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const index = store.index('expiry');
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * 앱 성능 메트릭 수집
 */
export class PerformanceMetrics {
  static measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        };

        console.log('Performance Metrics:', metrics);
        
        // Google Analytics에 전송
        if (window.gtag) {
          window.gtag('event', 'performance_metrics', {
            event_category: 'performance',
            event_label: 'page_load',
            value: Math.round(metrics.loadComplete),
            custom_parameters: metrics
          });
        }
      }, 0);
    });
  }

  static measureInteraction(name: string, callback: () => void) {
    if (typeof window === 'undefined') return callback();

    const start = performance.now();
    callback();
    const duration = performance.now() - start;

    console.log(`Interaction "${name}" took ${duration.toFixed(2)}ms`);
    
    // Google Analytics에 전송
    if (window.gtag) {
      window.gtag('event', 'interaction_timing', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(duration)
      });
    }
  }
}

/**
 * 앱 설치 상태 확인
 */
export function checkInstallStatus(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * 앱 업데이트 확인
 */
export function checkForAppUpdate(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      resolve(false);
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              resolve(true);
            }
          });
        }
      });
      
      // 업데이트가 없으면 false 반환
      setTimeout(() => resolve(false), 1000);
    });
  });
}

/**
 * 앱 설치 프롬프트 표시
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const deferredPrompt = (window as any).deferredPrompt;
  if (!deferredPrompt) return false;

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('App installation accepted');
      return true;
    } else {
      console.log('App installation declined');
      return false;
    }
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  } finally {
    (window as any).deferredPrompt = null;
  }
}

// 전역 타입 확장
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    deferredPrompt: any;
  }
}
