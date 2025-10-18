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
          borderTopColor: '#333', // Üst çizgiyi hafif belirgin yapalım
        },
        
        headerStyle: {
          backgroundColor: '#1C1C1E', 
        },
        headerTintColor: '#FFFFFF', 
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
          headerTitle: 'Home',
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
          headerTitle: 'My Diary',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <FontAwesome name="compass" size={28} color={color} />,
          headerTitle: 'Explore',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={28} color={color} />,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}