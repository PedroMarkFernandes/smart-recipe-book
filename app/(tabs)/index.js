import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Home() {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const fetchRandomMeal = async () => {
    setLoading(true);
    try {
      // HITTING THE EXTERNAL API (Rubric Requirement)
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
      setMeal(response.data.meals[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMeal();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe of the Day 🍲</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" />
      ) : meal ? (
        <View style={styles.card}>
          <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
          <Text style={styles.mealName}>{meal.strMeal}</Text>
          <Text style={styles.category}>{meal.strCategory} | {meal.strArea}</Text>
          
          <TouchableOpacity style={styles.button} onPress={fetchRandomMeal}>
            <Text style={styles.buttonText}>Get Another Random Meal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>No meal found</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f5f5f5', flexGrow: 1 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  logoutBtn: { backgroundColor: '#ff6347', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 15 },
  mealName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#333' },
  category: { fontSize: 16, color: '#666', marginBottom: 20 },
  button: { backgroundColor: '#ff6347', padding: 12, borderRadius: 25, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});