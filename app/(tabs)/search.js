import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ImageBackground, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function Search() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useTheme();

  // Load Categories once on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load History & Recently Viewed every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
      loadRecentlyViewed();
    }, [])
  );

  const loadCategories = async () => {
    try {
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
      setCategories(response.data.meals || []);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) setRecentSearches(JSON.parse(history));
    } catch (error) {
      console.error(error);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const history = await AsyncStorage.getItem('recentlyViewed');
      if (history) setRecentlyViewed(JSON.parse(history));
    } catch (error) {
      console.error(error);
    }
  };

  const saveToHistory = async (term) => {
    try {
      let newHistory = [term, ...recentSearches.filter(item => item !== term)];
      newHistory = newHistory.slice(0, 5);
      setRecentSearches(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error(error);
    }
  };

  const clearHistory = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem('searchHistory');
  };

  const clearRecentlyViewed = async () => {
    setRecentlyViewed([]);
    await AsyncStorage.removeItem('recentlyViewed');
  };

  const searchMeals = async (searchTerm = query) => {
    if (!searchTerm) return;
    setQuery(searchTerm);
    setLoading(true);
    setActiveCategory(''); 
    Keyboard.dismiss();
    saveToHistory(searchTerm);

    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not fetch recipes. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  // --- FIXED TOGGLE LOGIC HERE ---
  const filterByCategory = async (category) => {
    // If clicking the SAME category again, turn it OFF
    if (activeCategory === category) {
      setActiveCategory(''); // Turn off highlight
      setMeals([]); // Clear results
      setQuery(''); // Clear text
      return; // Stop here
    }

    // Otherwise, proceed as normal
    setLoading(true);
    setQuery(''); 
    setActiveCategory(category);
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not fetch recipes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://www.transparenttextures.com/patterns/food.png' }} 
      style={[styles.container, { backgroundColor: colors.background }]}
      imageStyle={{ opacity: 0.05 }}
    >
      {/* Category Filter Chips */}
      <View style={{ height: 50, marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 5 }}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.strCategory} 
              style={[
                styles.chip, 
                { backgroundColor: activeCategory === cat.strCategory ? colors.tint : colors.card, borderColor: colors.border },
                activeCategory === cat.strCategory && styles.activeChip
              ]}
              onPress={() => filterByCategory(cat.strCategory)}
            >
              <Text style={[
                styles.chipText,
                { color: activeCategory === cat.strCategory ? '#fff' : colors.text }
              ]}>
                {cat.strCategory}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.subText} style={{ marginRight: 10 }} />
        <TextInput 
          style={[styles.input, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]} 
          placeholder="Find a recipe..." 
          placeholderTextColor={colors.subText}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => searchMeals(query)}
        />
        {/* Clear Button works for both Text AND Category now */}
        {(query.length > 0 || activeCategory.length > 0) && (
          <TouchableOpacity onPress={() => { setQuery(''); setActiveCategory(''); setMeals([]); }}>
            <Ionicons name="close-circle" size={20} color={colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* DASHBOARD VIEW (Shows when not searching) */}
      {!loading && meals.length === 0 && !activeCategory && (
        <ScrollView>
          
          {/* 1. RECENT SEARCHES */}
          {recentSearches.length > 0 && (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={[styles.clearText, { color: colors.tint }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.historyChips}>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.historyChip, { backgroundColor: colors.card, borderColor: colors.border }]} 
                    onPress={() => searchMeals(term)}
                  >
                    <Ionicons name="time-outline" size={14} color={colors.subText} style={{ marginRight: 5 }} />
                    <Text style={{ color: colors.text }}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 2. RECENTLY VIEWED */}
          {recentlyViewed.length > 0 && (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>Recently Viewed 👁️</Text>
                <TouchableOpacity onPress={clearRecentlyViewed}>
                  <Text style={[styles.clearText, { color: colors.tint }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentlyViewed.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.viewedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/recipe/${item.idMeal}`)}
                >
                  <Image source={{ uri: item.strMealThumb }} style={styles.viewedThumb} />
                  <View style={styles.viewedInfo}>
                    <Text style={[styles.viewedTitle, { color: colors.text }]} numberOfLines={1}>{item.strMeal}</Text>
                    <Text style={[styles.viewedCategory, { color: colors.subText }]}>{item.strCategory}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* SEARCH RESULTS LIST */}
      {(loading || meals.length > 0) && (
        <>
          {loading ? (
            <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={meals}
              keyExtractor={(item) => item.idMeal}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.item, { backgroundColor: colors.card }]} 
                  onPress={() => router.push(`/recipe/${item.idMeal}`)}
                >
                  <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>{item.strMeal}</Text>
                    {item.strCategory ? <Text style={[styles.sub, { color: colors.subText }]}>{item.strCategory}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loading && (activeCategory || query) ? 
                <View style={styles.emptyState}>
                  <Text style={{ textAlign: 'center', color: colors.subText, fontSize: 16 }}>No recipes found.</Text> 
                </View> : null
              }
            />
          )}
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  
  // Chip Styles
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, height: 38, borderWidth: 1, justifyContent: 'center' },
  activeChip: { borderWidth: 0 },
  chipText: { fontWeight: '500' },

  // Search Box
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 20, borderWidth: 1 },
  input: { flex: 1 },

  // History Section
  historyContainer: { marginBottom: 25 }, // Increased margin for spacing
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold' },
  clearText: { fontSize: 14, fontWeight: '600' },
  historyChips: { flexDirection: 'row', flexWrap: 'wrap' },
  historyChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, marginRight: 8, marginBottom: 8, borderWidth: 1 },

  // Recently Viewed Cards (New Style)
  viewedCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  viewedThumb: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
  viewedInfo: { flex: 1 },
  viewedTitle: { fontWeight: 'bold', fontSize: 15 },
  viewedCategory: { fontSize: 12 },

  // List Item (Search Results)
  item: { flexDirection: 'row', marginBottom: 15, padding: 10, borderRadius: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  thumb: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { flex: 1 },
  name: { fontWeight: 'bold' },
  sub: { fontSize: 14, marginTop: 2 },
  emptyState: { marginTop: 50, alignItems: 'center' }
});