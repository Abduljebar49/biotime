export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string
) {

  if (globalThis) {
    try {
      const registration = {
        showNotification: (title: string, options: { body: string }) => {
          console.log('Notification:', title, options.body);
        },
      };

      registration.showNotification(title, { body });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    console.warn('Notification API not available');
  }
}