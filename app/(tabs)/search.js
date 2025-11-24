import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function Search() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useTheme();

  // 1. Load Data (Categories + History)
  useEffect(() => {
    loadCategories();
    loadRecentSearches();
  }, []);

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

  // 2. Helper to Save Search History
  const saveToHistory = async (term) => {
    try {
      let newHistory = [term, ...recentSearches.filter(item => item !== term)];
      newHistory = newHistory.slice(0, 5); // Keep only top 5
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

  // 3. Search Logic
  const searchMeals = async (searchTerm = query) => {
    if (!searchTerm) return;
    
    setQuery(searchTerm); // Update input if clicked from history
    setLoading(true);
    setActiveCategory(''); 
    Keyboard.dismiss();
    
    saveToHistory(searchTerm); // <--- Save it!

    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category) => {
    setLoading(true);
    setQuery(''); 
    setActiveCategory(category);
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://www.transparenttextures.com/patterns/food.png' }} 
      style={[styles.container, { backgroundColor: colors.background }]}
      imageStyle={{ opacity: 0.05 }} // Subtle texture effect
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
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setMeals([]); }}>
            <Ionicons name="close-circle" size={20} color={colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* RECENT SEARCHES (Only show if no results and not loading) */}
      {!loading && meals.length === 0 && recentSearches.length > 0 && !activeCategory && (
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

      {/* Results List */}
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
  historyContainer: { marginBottom: 20 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold' },
  clearText: { fontSize: 14, fontWeight: '600' },
  historyChips: { flexDirection: 'row', flexWrap: 'wrap' },
  historyChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, marginRight: 8, marginBottom: 8, borderWidth: 1 },

  // List Item
  item: { flexDirection: 'row', marginBottom: 15, padding: 10, borderRadius: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  thumb: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { flex: 1 },
  name: { fontWeight: 'bold' },
  sub: { fontSize: 14, marginTop: 2 },
  emptyState: { marginTop: 50, alignItems: 'center' }
});