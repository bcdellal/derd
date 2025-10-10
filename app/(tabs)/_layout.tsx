import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A7C7E7',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
        },
        // Tüm sekmeler için genel başlık ayarlarını buraya da ekleyebiliriz
        headerStyle: {
          backgroundColor: '#1C1C1E', // Başlık çubuğu arkaplanı
        },
        headerTintColor: '#FFFFFF', // Başlık yazı rengi
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
          headerTitle: 'Home', // Ana Sayfa'nın başlığı
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
          headerTitle: 'My Diary', // Günlük ekranının başlığı
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <FontAwesome name="compass" size={28} color={color} />,
          headerTitle: 'Explore', // Keşfet ekranının başlığı
        }}
      />
    </Tabs>
  );}
