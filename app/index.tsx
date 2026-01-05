import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function HomeScreen() {
  // Sayfa yönlendirmeleri için Expo Router kullanılır
  const router = useRouter();

  // Kullanıcı logout butonuna bastığında çalışan fonksiyon
  const handleLogout = () => {
    // Firebase Authentication üzerinden çıkış yapılır
    signOut(auth)
      .then(() => {
        // Çıkış başarılı olursa login ekranına yönlendirilir
        router.replace("/login");
      })
      .catch((error) => {
        // Çıkış sırasında hata olursa konsola yazılır ve kullanıcı bilgilendirilir
        console.error(error);
        alert("Logout Error: " + error.message);
      });
  };

  // Basit bir ana ekran UI yapısı
  return (
    <View style={styles.container}>
      {/* Uygulama adı */}
      <Text style={styles.title}>Derd</Text>

      {/* Uygulamanın amacı hakkında kısa açıklama */}
      <Text style={styles.subtitle}>
        Your journey to mental relaxation and mindfulness begins here.
      </Text>

      {/* Logout işlemini başlatan buton */}
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#556B55" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ekranı ortalayan ana container
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },

  // Uygulama başlığı
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Alt açıklama metni
  subtitle: {
    fontSize: 18,
    color: "#CCCCCC",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Logout butonunun konumlandığı alan
  buttonContainer: {
    marginTop: 30,
  },
});
