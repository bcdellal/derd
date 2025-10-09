import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "diaries"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: DiaryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) { // createdAt null değilse devam et
            entriesData.push({ 
                id: doc.id, 
                title: data.title, 
                content: data.content,
                createdAt: data.createdAt.toDate()
            });
        }
      });
      setEntries(entriesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (title.trim().length === 0 || content.trim().length === 0) {
      Alert.alert('Error', 'Please fill in both title and content.');
      return;
    }

    try {
      if (editingId) {
        const entryRef = doc(db, "diaries", editingId);
        await updateDoc(entryRef, {
          title: title,
          content: content
        });
        Alert.alert('Success', 'Entry updated successfully!');
      } else {
        await addDoc(collection(db, "diaries"), {
          title: title,
          content: content,
          createdAt: new Date()
        });
        Alert.alert('Success', 'Entry saved successfully to the cloud!');
      }
      
      setTitle('');
      setContent('');
      setEditingId(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error saving document: ", error);
      Alert.alert('Error', 'Could not save the entry.');
    }
  };
  
  const handleEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <Text style={styles.header}>{editingId ? 'Edit Your Entry' : 'How Are You Feeling Today?'}</Text>
          
          <TextInput 
            style={styles.inputTitle} 
            placeholder="Title" 
            placeholderTextColor="#556B55"
            value={title} 
            onChangeText={setTitle} 
          />
          <TextInput 
            style={styles.inputContent} 
            placeholder="Write your thoughts here..." 
            placeholderTextColor="#556B55"
            multiline={true} 
            value={content} 
            onChangeText={setContent} 
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <FontAwesome name={editingId ? "save" : "check"} size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>{editingId ? 'Update Entry' : 'Save Entry'}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {entries.map(entry => (
            <View key={entry.id} style={styles.entryContainer}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <TouchableOpacity onPress={() => handleEdit(entry)}>
                   <FontAwesome name="pencil" size={20} color="#556B55" />
                </TouchableOpacity>
              </View>
              <Text style={styles.entryDate}>{entry.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              <Text style={styles.entryContent}>{entry.content}</Text>
            </View>
          ))}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// --- DİĞER HATALAR İÇİN TAM VE DÜZELTİLMİŞ STİLLER ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#a9c2a9' },
    header: { fontSize: 28, fontWeight: '300', color: '#2F4F4F', textAlign: 'center', marginBottom: 25, paddingTop: 60, },
    inputTitle: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 15, padding: 15, color: '#2F4F4F', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginHorizontal: 20, },
    inputContent: { height: 150, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 15, padding: 15, color: '#2F4F4F', fontSize: 16, textAlignVertical: 'top', marginBottom: 20, marginHorizontal: 20, },
    button: { flexDirection: 'row', backgroundColor: '#556B55', padding: 15, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20, },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10, },
    divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginVertical: 30, marginHorizontal: 20, },
    entryContainer: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 15, padding: 15, marginHorizontal: 20, marginBottom: 15, },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, },
    entryTitle: { fontSize: 20, fontWeight: 'bold', color: '#2F4F4F', },
    entryDate: { fontSize: 12, color: '#556B55', marginBottom: 10, }, // Bu ve altındaki eksikti
    entryContent: { fontSize: 16, color: '#333333', },
});