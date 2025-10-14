import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

const CLOUD_NAME = "dk32tfnnz";
const UPLOAD_PRESET = "kfrtlndy";
const API_KEY = "234656893643222";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.profilePictureURL) {
            setImage(userData.profilePictureURL);
          }
        }
      });
    }
  }, [user]);

  const pickImage = async () => {
    if (!user) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const source = result.assets[0];
      const uri = source.uri;
      
      setImage(uri); 

      const data = new FormData();
      data.append('file', {
        uri: uri,
        type: `image/${uri.split('.').pop()}`,
        name: `profile-${user.uid}.${uri.split('.').pop()}`
      } as any);
      data.append('upload_preset', UPLOAD_PRESET);
      data.append('api_key', API_KEY);
      data.append("cloud_name", CLOUD_NAME);

      fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "post",
        body: data,
      }).then(res => res.json()).then(async (data) => {
        if (data && data.secure_url) {
          const imageUrl = data.secure_url;
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, { profilePictureURL: imageUrl }, { merge: true });
          Alert.alert("Success", "Profile picture updated!");
        } else {
          if (data.error && data.error.message) {
            throw new Error(`Cloudinary Error: ${data.error.message}`);
          }
          throw new Error("Cloudinary did not return a secure URL.");
        }
      }).catch(err => {
        Alert.alert("An Error Occured While Uploading", err.message);
        console.error(err);
      });
    }
  };

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
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <FontAwesome name="user" size={60} color="#c0c0c0" />
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.changePictureText}>Change Picture</Text>
      </TouchableOpacity>

      {user && <Text style={styles.email}>{user.email}</Text>}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    backgroundColor: 'transparent',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: '#e1e1e1',
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changePictureText: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
  },
  logoutButton: {
      backgroundColor: '#FF3B30',
      padding: 15,
      borderRadius: 25,
      alignItems: 'center',
  },
  logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
  }
});