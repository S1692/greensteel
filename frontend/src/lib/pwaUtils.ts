import React from 'react';

// PWA 성능 최적화 및 사용자 경험 향상을 위한 유틸리티 함수들

// 이미지 지연 로딩 설정
export function setupLazyLoading(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  // data-src 속성이 있는 이미지들을 찾아서 관찰
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// 컴포넌트 지연 로딩
export function lazyLoadComponent<T>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>
) {
  return React.lazy(importFunc);
}

// 오프라인 저장소 클래스
export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'GreenSteelOffline';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 오프라인 작업 저장소
        if (!db.objectStoreNames.contains('offlineTasks')) {
          const taskStore = db.createObjectStore('offlineTasks', {
            keyPath: 'id',
            autoIncrement: true,
          });
          taskStore.createIndex('type', 'type', { unique: false });
          taskStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 캐시 데이터 저장소
        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', {
            keyPath: 'key',
          });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  // 오프라인 작업 저장
  async saveOfflineTask(
    type: string,
    data: Record<string, unknown>
  ): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTasks'], 'readwrite');
      const store = transaction.objectStore('offlineTasks');

      const task = {
        type,
        data,
        timestamp: Date.now(),
        status: 'pending',
      };

      const request = store.add(task);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // 오프라인 작업 가져오기
  async getOfflineTasks(): Promise<
    Array<{
      id: number;
      type: string;
      data: Record<string, unknown>;
      timestamp: number;
      status: string;
    }>
  > {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTasks'], 'readonly');
      const store = transaction.objectStore('offlineTasks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 캐시 데이터 저장
  async cacheData(
    key: string,
    data: Record<string, unknown>,
    expiryHours: number = 24
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');

      const cacheEntry = {
        key,
        data,
        expiry: Date.now() + expiryHours * 60 * 60 * 1000,
      };

      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 캐시된 데이터 가져오기
  async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result && request.result.expiry > Date.now()) {
          resolve(request.result.data as T);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 만료된 캐시 정리
  async cleanupExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const index = store.index('expiry');

    const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }
}

// 성능 메트릭 클래스
export class PerformanceMetrics {
  // 페이지 로드 성능 측정
  static measurePageLoad(): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const metrics = {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          firstContentfulPaint:
            paint.find(p => p.name === 'first-contentful-paint')?.startTime ||
            0,
        };

        console.log('Page Load Performance:', metrics);

        // Google Analytics에 전송 (선택사항)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'page_performance', {
            event_category: 'performance',
            event_label: 'page_load',
            value: Math.round(metrics.domContentLoaded),
          });
        }
      }, 0);
    });
  }

  // 상호작용 성능 측정
  static measureInteraction(name: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const duration = performance.now() - start;

    console.log(`Interaction "${name}" took ${duration.toFixed(2)}ms`);

    // Google Analytics에 전송 (선택사항)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'interaction_performance', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(duration),
      });
    }
  }

  // 메모리 사용량 측정
  static measureMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (
        performance as Performance & {
          memory: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }
}

// PWA 설치 상태 확인
export function checkInstallStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// 앱 업데이트 확인
export function checkForAppUpdate(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      resolve(false);
      return;
    }

    navigator.serviceWorker.getRegistration().then(registration => {
      if (!registration) {
        resolve(false);
        return;
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            resolve(true);
          }
        });
      });

      resolve(false);
    });
  });
}

// 설치 프롬프트 표시
export async function showInstallPrompt(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise(resolve => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      resolve(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5초 후 자동으로 false 반환
    setTimeout(() => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      resolve(false);
    }, 5000);
  });
}

// 전역 타입 확장
declare global {
  interface Window {
    // gtag는 analytics.ts에서 정의됨
  }
}
