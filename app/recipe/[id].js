import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Added useRouter
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter(); // Init router
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  
  const { colors, fontSizeMultiplier } = useTheme(); 

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const mealData = response.data.meals[0];
        setMeal(mealData);
        checkIfFavorite();
        addToRecentlyViewed(mealData);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  const addToRecentlyViewed = async (mealItem) => {
    try {
      const history = await AsyncStorage.getItem('recentlyViewed');
      let list = history ? JSON.parse(history) : [];
      list = list.filter(item => item.idMeal !== mealItem.idMeal);
      list.unshift({
        idMeal: mealItem.idMeal,
        strMeal: mealItem.strMeal,
        strMealThumb: mealItem.strMealThumb,
        strCategory: mealItem.strCategory
      });
      if (list.length > 5) list = list.slice(0, 5);
      await AsyncStorage.setItem('recentlyViewed', JSON.stringify(list));
    } catch (error) {
      console.error(error);
    }
  };

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
        Alert.alert("Removed", "Recipe removed from Favorites");
      } else {
        const mealToSave = { idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb };
        list.push(mealToSave);
        setIsFavorite(true);
        Alert.alert("Saved", "Recipe added to your Favorites!");
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(list));
    } catch (error) {
      console.error(error);
    }
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `Check out this recipe for ${meal.strMeal}! \n\nSee it on YouTube: ${meal.strYoutube || 'No link available'}` });
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={colors.tint} style={{marginTop: 50}} />;
  if (!meal) return <Text style={{color: colors.text}}>Recipe not found</Text>;

  const instructions = meal.strInstructions
    ? meal.strInstructions.split(/\r\n|\n/).filter((text) => text.trim().length > 0).map((text) => text.replace(/^\d+\.\s*/, '').trim())
    : [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* HEADER IMAGE WITH BACK BUTTON */}
      <View>
        <Animated.Image source={{ uri: meal.strMealThumb }} style={[styles.image, { opacity: fadeAnim }]} />
        {/* NEW BACK BUTTON OVERLAY */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()} // <-- Goes back to previous screen
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontSizeMultiplier }]}>{meal.strMeal}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onShare} style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={28} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={32} color={isFavorite ? "red" : colors.subText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.subtitle, { fontSize: 20 * fontSizeMultiplier }]}>Ingredients</Text>
        <View style={[styles.ingredientsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {Array.from({ length: 20 }).map((_, i) => {
            const ingredient = meal[`strIngredient${i + 1}`];
            const measure = meal[`strMeasure${i + 1}`];
            if (ingredient && ingredient.trim()) {
              return (
                <View key={i} style={styles.ingredientRow}>
                  <Text style={[styles.measure, { fontSize: 16 * fontSizeMultiplier }]}>{measure}</Text>
                  <Text style={[styles.ingredientName, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>{ingredient}</Text>
                </View>
              );
            }
            return null;
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.subtitle, { fontSize: 20 * fontSizeMultiplier }]}>Instructions</Text>
        {instructions.map((para, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={[styles.instructionText, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>{para}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 300 },
  
  // New Back Button Styles
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  title: { fontWeight: 'bold', flex: 1, marginRight: 10 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 15 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { fontWeight: 'bold', marginBottom: 15, color: '#ff6347' },
  ingredientsBox: { padding: 15, borderRadius: 10, borderWidth: 1 },
  ingredientRow: { flexDirection: 'row', marginBottom: 8, paddingBottom: 4 },
  measure: { fontWeight: 'bold', marginRight: 10, color: '#ff6347', minWidth: 60 },
  ingredientName: { flex: 1 },
  stepContainer: { flexDirection: 'row', marginBottom: 20 },
  stepBadge: { width: 30, height: 30, backgroundColor: '#ff6347', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 2 },
  stepNumber: { color: 'white', fontWeight: 'bold' },
  instructionText: { lineHeight: 28, flex: 1 }
});