import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRandomMeals = async () => {
    setLoading(true);
    try {
      // Call the API twice to get 2 random meals
      const [res1, res2] = await Promise.all([
        axios.get('https://www.themealdb.com/api/json/v1/1/random.php'),
        axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
      ]);
      
      setMeals([res1.data.meals[0], res2.data.meals[0]]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMeals();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recipes of the Day 🍲</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" style={{ marginTop: 50 }} />
      ) : (
        <>
          {meals.map((meal) => (
            <TouchableOpacity 
              key={meal.idMeal}
              style={styles.card} 
              onPress={() => router.push(`/recipe/${meal.idMeal}`)}
            >
              <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.mealName}>{meal.strMeal}</Text>
                <Text style={styles.category}>{meal.strCategory} | {meal.strArea}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.refreshButton} onPress={fetchRandomMeals}>
            <Text style={styles.buttonText}>Refresh Recipes 🔄</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', width: '100%' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  image: { width: '100%', height: 200 },
  textContainer: { padding: 15, alignItems: 'center' },
  mealName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  category: { fontSize: 14, color: '#666' },
  refreshButton: { backgroundColor: '#ff6347', padding: 12, borderRadius: 25, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});