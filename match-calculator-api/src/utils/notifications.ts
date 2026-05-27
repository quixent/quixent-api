import axios from 'axios';
import PushToken from '../models/PushToken';

export async function sendPushNotification(userId: string, title: string, body: string): Promise<void> {
  try {
    const record = await PushToken.findOne({ userId });
    if (!record?.token) return;
    await axios.post(
      'https://exp.host/--/api/v2/push/send',
      { to: record.token, title, body, sound: 'default' },
      { timeout: 5000 },
    );
  } catch {
    // fire-and-forget — never fail the calling operation
  }
}
