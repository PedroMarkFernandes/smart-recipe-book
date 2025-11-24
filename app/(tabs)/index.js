import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext'; // Import theme for dark mode support

export default function Home() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  // USE THEME (Get colors and font size settings)
  const { colors, fontSizeMultiplier } = useTheme(); 

  const fetchRandomMeals = async () => {
    // If refreshing, don't show full loading spinner, just the pull-to-refresh spinner
    if (!refreshing) setLoading(true);
    try {
      // Fetch 2 random meals in parallel
      const [res1, res2] = await Promise.all([
        axios.get('https://www.themealdb.com/api/json/v1/1/random.php'),
        axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
      ]);
      setMeals([res1.data.meals[0], res2.data.meals[0]]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRandomMeals();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRandomMeals();
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      {/* HERO SECTION (Keeps brand color, but text scales) */}
      <View style={styles.heroContainer}>
        <Text style={[styles.heroTitle, { fontSize: 28 * fontSizeMultiplier }]}>What are we cooking today? 👨‍🍳</Text>
        <Text style={[styles.heroSubtitle, { fontSize: 16 * fontSizeMultiplier }]}>Discover delicious recipes below.</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 22 * fontSizeMultiplier }]}>Daily Picks 🍲</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 50 }} />
        ) : (
          <>
            {meals.map((meal, index) => (
              <TouchableOpacity 
                key={`${meal.idMeal}-${index}`}
                style={[styles.card, { backgroundColor: colors.card }]} 
                onPress={() => router.push(`/recipe/${meal.idMeal}`)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
                <View style={styles.textContainer}>
                  <Text style={[styles.mealName, { color: colors.text, fontSize: 20 * fontSizeMultiplier }]}>{meal.strMeal}</Text>
                  
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{meal.strCategory}</Text>
                  </View>
                  
                  <Text style={[styles.areaText, { color: colors.subText, fontSize: 14 * fontSizeMultiplier }]}>Origin: {meal.strArea}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.refreshButton} onPress={fetchRandomMeals}>
              <Text style={[styles.buttonText, { fontSize: 16 * fontSizeMultiplier }]}>Shuffle Recipes 🎲</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Hero Styles
  heroContainer: {
    backgroundColor: '#ff6347',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: "#ff6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  heroTitle: { fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)' },
  
  contentContainer: { padding: 20 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
  
  // Card Styles
  card: {
    width: '100%',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  image: { width: '100%', height: 180 },
  textContainer: { padding: 15 },
  mealName: { fontWeight: 'bold', marginBottom: 8 },
  badgeContainer: { 
    backgroundColor: '#fff0ec', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10, 
    marginBottom: 8 
  },
  badgeText: { color: '#ff6347', fontWeight: 'bold', fontSize: 12 },
  areaText: { fontStyle: 'italic' },

  refreshButton: { backgroundColor: '#333', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});