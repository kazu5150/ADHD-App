import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 通知の表示方法を設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // バッジは表示しない（MVPの方針）
  }),
});

/**
 * 通知権限を取得
 * @returns {Promise<boolean>} 権限が許可されたかどうか
 */
export async function getPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 権限がまだ確定していない場合は、ユーザーに尋ねる
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('通知権限が拒否されました');
      return false;
    }

    // Android用のチャンネル設定
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90A4',
      });
    }

    return true;
  } catch (error) {
    console.error('通知権限取得エラー:', error);
    return false;
  }
}

/**
 * すべての通知をキャンセル（1件のみ保証）
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('すべての通知をキャンセルしました');
  } catch (error) {
    console.error('通知キャンセルエラー:', error);
  }
}

/**
 * 特定の通知IDの通知をキャンセル
 * @param {string} notificationId - 通知ID
 */
export async function cancelNotificationById(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ 通知をキャンセルしました:', notificationId);
  } catch (error) {
    console.error('❌ 通知キャンセルエラー:', error);
    throw error;
  }
}

/**
 * 指定時刻に通知をスケジュール
 * @param {Date} date - 通知を送る日時
 * @param {string} message - 通知メッセージ
 * @returns {Promise<string>} 通知ID
 */
export async function scheduleNotification(
  date: Date,
  message: string
): Promise<string> {
  try {
    // まず既存の通知をすべてキャンセル（1件のみ保証）
    await cancelAllNotifications();

    // 現在時刻との差分を計算
    const now = new Date();
    const triggerTime = date.getTime() - now.getTime();

    // 過去の時刻の場合はエラー
    if (triggerTime <= 0) {
      throw new Error('過去の時刻には通知を設定できません');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '思い出す時間です',
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.floor(triggerTime / 1000),
      },
    });

    console.log(`通知をスケジュールしました: ${notificationId}`, {
      date: date.toISOString(),
      message,
      triggerSeconds: Math.floor(triggerTime / 1000),
    });

    return notificationId;
  } catch (error) {
    console.error('通知スケジュールエラー:', error);
    throw error;
  }
}

/**
 * テスト用：5秒後に通知を送る
 * @param {string} message - 通知メッセージ
 * @returns {Promise<string>} 通知ID
 */
export async function scheduleTestNotification(message: string): Promise<string> {
  try {
    await cancelAllNotifications();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'テスト通知',
        body: message,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5, // 5秒後
      },
    });

    console.log(`テスト通知をスケジュールしました（5秒後）: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('テスト通知エラー:', error);
    throw error;
  }
}

/**
 * スケジュール済みの通知一覧を取得
 */
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('スケジュール済み通知:', notifications);
    return notifications;
  } catch (error) {
    console.error('通知一覧取得エラー:', error);
    return [];
  }
}
