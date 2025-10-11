import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser; // O an giriş yapmış olan kullanıcıyı al

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.replace('/login');
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Logout Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      
      {/* Kullanıcının emailini gösterelim */}
      {user && <Text style={styles.email}>{user.email}</Text>}
      
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#FF6347" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
  }
});