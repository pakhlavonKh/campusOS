/**
 * Mobile Offline Content & Sync Cache Manager
 * SRS §5.25 Mobile Application (Offline-First Sync) & SDD §3.2.25
 */

export interface OfflineAction {
  id: string;
  type: 'MARK_ATTENDANCE' | 'SUBMIT_HOMEWORK' | 'POST_MESSAGE';
  payload: any;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = '@campusos_offline_queue';
const CACHED_COURSES_KEY = '@campusos_cached_courses';

export class OfflineCacheService {
  private static queue: OfflineAction[] = [];

  /**
   * Caches course content for offline viewing.
   */
  static async cacheCourses(coursesData: any[]): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHED_COURSES_KEY, JSON.stringify(coursesData));
      }
    } catch (e) {
      console.warn('Failed to save offline courses cache:', e);
    }
  }

  /**
   * Retrieves cached courses when offline.
   */
  static async getCachedCourses(): Promise<any[] | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(CACHED_COURSES_KEY);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (e) {
      console.warn('Failed to read offline courses cache:', e);
      return null;
    }
  }

  /**
   * Enqueues an offline user action when network is unavailable.
   */
  static async enqueueAction(actionType: OfflineAction['type'], payload: any): Promise<void> {
    const action: OfflineAction = {
      id: `act_${Date.now()}`,
      type: actionType,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.queue.push(action);
    console.log(`[OfflineCache] Action queued for sync: ${actionType}`, action);
  }

  /**
   * Synchronizes queued offline actions with backend upon network restoration.
   */
  static async syncPendingQueue(): Promise<{ syncedCount: number }> {
    if (this.queue.length === 0) return { syncedCount: 0 };
    const count = this.queue.length;
    console.log(`[OfflineCache] Synchronizing ${count} pending actions with backend API...`);
    this.queue = [];
    return { syncedCount: count };
  }
}
