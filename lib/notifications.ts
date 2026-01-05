import * as Notifications from "expo-notifications";

// Bildirim uygulamaya geldiğinde nasıl davranacağını belirler
// Banner, liste ve ses açık; uygulama badge sayısı kapalı
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Ekranın üstünde banner olarak gösterilir
    shouldShowList: true,   // Bildirim listesine eklenir
    shouldPlaySound: true,  // Bildirim sesi çalar
    shouldSetBadge: false,  // App icon üzerinde sayı gösterilmez
  }),
});

// Kullanıcıdan bildirim izni ister
// true dönerse izin verilmiştir
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Test amaçlı anlık bildirim gönderir
// trigger null olduğu için hemen gösterilir
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Take a breath",
      body: "A short breathing exercise can help you relax.",
    },
    trigger: null,
  });
}

/* Daily scheduled reminder */
// Her gün belirli bir saatte tekrar eden bildirim ayarlar
export async function scheduleDailyReminder(
  hour: number,
  minute: number
) {
  // Önceden planlanmış bildirimler varsa temizlenir
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Günlük tekrar eden bildirim oluşturulur
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Calm down with Derd 🌿",
      body: "Take a moment for yourself today.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,    // Bildirimin gönderileceği saat
      minute,  // Bildirimin gönderileceği dakika
      repeats: true, // Her gün tekrar eder
    },
  });
}

// Demo veya test için gecikmeli bildirim
// Belirtilen saniye sonra bir kez çalışır
export async function scheduleDemoNotification(seconds: number) {
  // Önceki planlanmış bildirimler iptal edilir
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Belirli saniye sonra tetiklenen bildirim
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Take a short break",
      body: "Calm down with Derd 🌿",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,     // Kaç saniye sonra çalışacağı
      repeats: false, // Tek seferliktir
    },
  });
}

