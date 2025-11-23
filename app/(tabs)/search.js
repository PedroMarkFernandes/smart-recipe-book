import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Search() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // 1. Fetch Categories on Load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
        setCategories(response.data.meals || []);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Search by Text
  const searchMeals = async () => {
    if (!query) return;
    setLoading(true);
    setActiveCategory(''); // Clear category if searching manually
    Keyboard.dismiss();
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Filter by Category
  const filterByCategory = async (category) => {
    setLoading(true);
    setQuery(''); // Clear text search
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
    <View style={styles.container}>
      {/* Category Filter Chips */}
      <View style={{ height: 50, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.strCategory} 
              style={[
                styles.chip, 
                activeCategory === cat.strCategory && styles.activeChip
              ]}
              onPress={() => filterByCategory(cat.strCategory)}
            >
              <Text style={[
                styles.chipText,
                activeCategory === cat.strCategory && styles.activeChipText
              ]}>
                {cat.strCategory}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Or search by name (e.g. Pie)" 
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMeals}
        />
        <TouchableOpacity style={styles.button} onPress={searchMeals}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.item} 
              onPress={() => router.push(`/recipe/${item.idMeal}`)}
            >
              <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.strMeal}</Text>
                {/* Note: The 'filter' API doesn't return category names, so we hide it if filtering */}
                {item.strCategory ? <Text style={styles.sub}>{item.strCategory}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && (activeCategory || query) ? 
            <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>No recipes found.</Text> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  
  // Chip Styles
  chip: { backgroundColor: '#eee', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, height: 35 },
  activeChip: { backgroundColor: '#ff6347' },
  chipText: { color: '#333', fontWeight: '500' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },

  // Search Box
  searchBox: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10 },
  button: { backgroundColor: '#ff6347', padding: 12, borderRadius: 8, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  // List Item
  item: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, alignItems: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { justifyContent: 'center', flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  sub: { color: '#666' }
});