import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { auth } from '../firebaseConfig';

// --- GOOGLE İLE İLGİLİ KISIMLAR DEVRE DIŞI BIRAKILDI ---

// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

/*
GoogleSignin.configure({
  webClientId: 'SENIN-WEB-CLIENT-IDN',
});
*/

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user
        Alert.alert('Login Success', `Welcome back, ${user.email}`)
        router.replace('/(tabs)')
      })
      .catch(error => {
        const errorMessage = error.message
        Alert.alert('Login Error', errorMessage)
      })
  }

  /*
  const handleGoogleSignIn = async () => {
    // Bu fonksiyon geçici olarak devre dışı
  };
  */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#556B55"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#556B55"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          {/* Google Butonu geçici olarak kaldırıldı */}
          {null}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a9c2a9',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#2F4F4F',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#556B55',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 15,
    color: '#2F4F4F',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#556B55',
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#556B55',
  },
  linkText: {
    fontSize: 14,
    color: '#2F4F4F',
    fontWeight: 'bold',
  },
});