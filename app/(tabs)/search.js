import axios from 'axios';
import { useState } from 'react';
import { FlatList, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Search() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);

  const searchMeals = async () => {
    if (!query) return;
    Keyboard.dismiss();
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Search (e.g. Chicken)" 
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMeals}
        />
        <TouchableOpacity style={styles.button} onPress={searchMeals}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.idMeal}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.strMeal}</Text>
              <Text style={styles.sub}>{item.strCategory}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  searchBox: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10 },
  button: { backgroundColor: '#ff6347', padding: 12, borderRadius: 8, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  thumb: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { justifyContent: 'center', flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  sub: { color: '#666' }
});