import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Animation Value
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        setMeal(response.data.meals[0]);
        checkIfFavorite();
        // Start Fade In Animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
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

  // NEW: Share Feature
  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe for ${meal.strMeal}! \n\nSee it on YouTube: ${meal.strYoutube || 'No link available'}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#ff6347" style={{marginTop: 50}} />;
  if (!meal) return <Text>Recipe not found</Text>;

  // FIX: Regex removes leading numbers (e.g., "1. " or "0. ")
  const instructions = meal.strInstructions
    ? meal.strInstructions
        .split(/\r\n|\n/)
        .filter((text) => text.trim().length > 0)
        .map((text) => text.replace(/^\d+\.\s*/, '').trim()) // <--- THE MAGIC FIX
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Animated Image Fade In */}
      <Animated.Image 
        source={{ uri: meal.strMealThumb }} 
        style={[styles.image, { opacity: fadeAnim }]} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>{meal.strMeal}</Text>
        <View style={styles.actions}>
          {/* Share Button */}
          <TouchableOpacity onPress={onShare} style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={28} color="#333" />
          </TouchableOpacity>
          
          {/* Favorite Button */}
          <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={32} 
              color={isFavorite ? "red" : "gray"} 
            />
          </TouchableOpacity>
        </View>
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
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{para}</Text>
          </View>
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
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 15 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#ff6347' },
  ingredientsBox: { backgroundColor: '#fff5f2', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ffe0d6' },
  ingredientRow: { flexDirection: 'row', marginBottom: 8, paddingBottom: 4 },
  measure: { fontWeight: 'bold', marginRight: 10, color: '#ff6347', minWidth: 60 },
  ingredientName: { flex: 1, color: '#333' },
  // Improved Instruction Styling
  stepContainer: { flexDirection: 'row', marginBottom: 20 },
  stepBadge: { width: 30, height: 30, backgroundColor: '#ff6347', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 2 },
  stepNumber: { color: 'white', fontWeight: 'bold' },
  instructionText: { fontSize: 16, lineHeight: 24, color: '#444', flex: 1 }
});