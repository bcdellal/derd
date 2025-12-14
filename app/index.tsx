import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.replace("/login");
      })
      .catch((error) => {
        console.error(error);
        alert("Logout Error: " + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Derd</Text>
      <Text style={styles.subtitle}>
        Zihinsel rahatlama ve farkındalık yolculuğun burada başlıyor.
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#556B55" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 18,
    color: "#CCCCCC",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 30,
  },
});
