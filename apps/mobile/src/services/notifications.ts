/**
 * Mobile Push Notifications Service (APNs / FCM Parser)
 * SRS §5.15 & SDD §3.2.15 Notifications Context
 */

export interface MobileNotificationPayload {
  id: string;
  title: string;
  body: string;
  category: 'grade' | 'attendance' | 'message' | 'announcement';
  data?: Record<string, any>;
  receivedAt: string;
}

export class PushNotificationService {
  private static pushToken: string | null = null;
  private static listeners: ((notification: MobileNotificationPayload) => void)[] = [];

  /**
   * Registers mobile device for push notifications and returns FCM/APNs device token.
   */
  static async registerForPushNotifications(): Promise<string> {
    // Device token registration mock for Expo / APNs / FCM
    const mockToken = `ExponentPushToken[dev_${Math.random().toString(36).substring(7)}]`;
    this.pushToken = mockToken;
    console.log(`[PushNotification] Device registered. Token: ${mockToken}`);
    return mockToken;
  }

  /**
   * Subscribes a callback to incoming push notification events.
   */
  static onNotificationReceived(callback: (notification: MobileNotificationPayload) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Dispatches a push notification payload (used by incoming push handler).
   */
  static handleIncomingPayload(payload: Omit<MobileNotificationPayload, 'id' | 'receivedAt'>): void {
    const fullNotification: MobileNotificationPayload = {
      ...payload,
      id: `notif_${Date.now()}`,
      receivedAt: new Date().toISOString(),
    };
    this.listeners.forEach((cb) => cb(fullNotification));
  }
}
