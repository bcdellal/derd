import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
// <<< EKLENDİ: Firebase importları
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // <<< GÜNCELLENDİ: Gerçek kayıt fonksiyonu
  const handleRegister = () => {
    // Email ve şifre boş mu diye kontrol et
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    // Firebase ile yeni kullanıcı oluştur
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Kayıt başarılı olduğunda...
        const user = userCredential.user;
        Alert.alert('Success', `Account created for ${user.email}`);
        // Kayıt sonrası kullanıcıyı direkt ana ekrana yönlendir
        router.replace('/(tabs)'); 
      })
      .catch((error) => {
        // Bir hata olursa... (Örn: şifre 6 karakterden az, email formatı yanlış vb.)
        const errorMessage = error.message;
        Alert.alert('Registration Error', errorMessage);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your journey with us</Text>

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

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Stillerde bir değişiklik yok
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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