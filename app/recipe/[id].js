import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        setMeal(response.data.meals[0]);
        checkIfFavorite();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      const list = favorites ? JSON.parse(favorites) : [];
      const exists = list.some(item => item.idMeal === id);
      setIsFavorite(exists);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let list = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        list = list.filter(item => item.idMeal !== id);
        setIsFavorite(false);
        Alert.alert("Removed", "Recipe removed from favorites");
      } else {
        const mealToSave = {
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strMealThumb: meal.strMealThumb
        };
        list.push(mealToSave);
        setIsFavorite(true);
        Alert.alert("Saved", "Recipe added to favorites!");
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(list));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#ff6347" style={{marginTop: 50}} />;
  if (!meal) return <Text>Recipe not found</Text>;

  // This splits the instructions into paragraphs
  const instructions = meal.strInstructions
    ? meal.strInstructions.split(/\r\n|\n/).filter((text) => text.trim().length > 0)
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{meal.strMeal}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={32} 
            color={isFavorite ? "red" : "gray"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Ingredients</Text>
        <View style={styles.ingredientsBox}>
          {Array.from({ length: 20 }).map((_, i) => {
            const ingredient = meal[`strIngredient${i + 1}`];
            const measure = meal[`strMeasure${i + 1}`];
            if (ingredient && ingredient.trim()) {
              return (
                <View key={i} style={styles.ingredientRow}>
                  <Text style={styles.measure}>{measure}</Text>
                  <Text style={styles.ingredientName}>{ingredient}</Text>
                </View>
              );
            }
            return null;
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Instructions</Text>
        {instructions.map((para, index) => (
          <Text key={index} style={styles.instructionText}>
            {index + 1}. {para}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10, color: '#333' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#ff6347' },
  ingredientsBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 },
  ingredientRow: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4 },
  measure: { fontWeight: 'bold', marginRight: 10, color: '#555', minWidth: 60 },
  ingredientName: { flex: 1, color: '#333' },
  instructionText: { fontSize: 16, lineHeight: 26, marginBottom: 15, color: '#444' }
});