import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function Settings() {
  const { isDarkMode, toggleTheme, fontSizeMultiplier, changeFontSize, colors } = useTheme();

  // Helper to determine text color for buttons
  const getTextColor = (size) => {
    return fontSizeMultiplier === size ? '#ffffff' : colors.text;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Dark Mode Toggle */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>Dark Mode</Text>
        <Switch 
          value={isDarkMode} 
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: "#ff6347" }}
        />
      </View>

      {/* Font Size Controls */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>Text Size</Text>
      </View>
      
      <View style={styles.fontControls}>
        <TouchableOpacity 
          style={[styles.fontBtn, fontSizeMultiplier === 1 && styles.activeFontBtn]} 
          onPress={() => changeFontSize(1)}
        >
          {/* DYNAMIC COLOR FIX APPLIED HERE */}
          <Text style={[styles.fontBtnText, { color: getTextColor(1) }]}>Normal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fontBtn, fontSizeMultiplier === 1.2 && styles.activeFontBtn]} 
          onPress={() => changeFontSize(1.2)}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: getTextColor(1.2) }}>Large</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fontBtn, fontSizeMultiplier === 1.4 && styles.activeFontBtn]} 
          onPress={() => changeFontSize(1.4)}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: getTextColor(1.4) }}>Huge</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="accessibility-outline" size={24} color={colors.text} />
        <Text style={[styles.infoText, { color: colors.subText }]}>
          Adjust these settings to make the app easier to read.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1 },
  label: { fontWeight: 'bold' },
  fontControls: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  fontBtn: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, flex: 1, alignItems: 'center', marginHorizontal: 5 },
  activeFontBtn: { backgroundColor: '#ff6347', borderColor: '#ff6347' },
  fontBtnText: { fontSize: 16, fontWeight: 'bold' }, // Added bold for better visibility
  infoBox: { marginTop: 50, alignItems: 'center', opacity: 0.7 },
  infoText: { marginTop: 10, textAlign: 'center' }
});