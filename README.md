# 🍳 Smart Recipe Book

A cross-platform mobile application built with React Native (Expo) that allows users to discover, search, view, share and save recipes. This project was developed for the MAB001 Mobile App Development module.

The application demonstrates modern mobile development practices including API integration, Authentication, Local Storage, State Management, and Accessibility.


## 📱 Key Features

Core Functionality

User Authentication: Secure Sign Up and Login using Firebase Auth.

API Integration: Dynamic data fetching from TheMealDB API (Public JSON API).

Local Storage: "Favorites" and "Recently Viewed" lists are persisted locally on the device using AsyncStorage.

Search & Filter: Users can search recipes by name or filter by category (e.g., "Beef", "Vegan").


User Experience (UX) & Design

Visual Polish: Hero headers, card-based layouts, and smooth fade-in animations for images.

Smart History: The app remembers the user's last 5 searches and recently viewed recipes for quick access.

Interactive Elements: Pull-to-refresh functionality on the home screen, social sharing, and touchable feedback.


Accessibility & Settings

Dark Mode: Full theme toggle support (Light/Dark) via a custom ThemeContext.

Dynamic Type: Adjustable text size settings (Normal, Large, Huge) for better readability.

Navigation: Intuitive Tab-based navigation using expo-router with a persistent stack history for "Back" navigation.


## 🛠 Tech Stack

Frontend: React Native, Expo, Expo Router

Backend/Auth: Firebase (Google Identity Platform)

API: TheMealDB (JSON API)

Storage: @react-native-async-storage/async-storage

Testing: Jest (Unit Testing)


## 🚀 Installation & Setup Guide

Prerequisites:

Node.js (LTS version recommended) installed.

Expo Go app installed on your iOS or Android device (available on App Store/Play Store).

1. Clone the Repository

git clone [https://github.com/PedroMarkFernandes/smart-recipe-book.git](https://github.com/PedroMarkFernandes/smart-recipe-book.git)
cd smart-recipe-book


2. Install Dependencies

npm install


3. Configure Environment Variables

This app uses Firebase for authentication. To run it, you must create a local environment file.

Create a new file named .env in the root directory of the project.

Populate it with the Firebase API keys.

The format should match .env.example
(Note: If you do not have the keys, the app will launch but Authentication will fail).


4. Run the Application

Start the Expo development server:

npx expo start --clear


5. Run on Your Device

Android: Open the Expo Go app and scan the QR code displayed in your terminal.

iOS: Open your Camera app, scan the QR code, and tap the prompt to open in Expo Go.


## 🧪 Testing & Verification

Unit Tests

The project includes unit tests for utility functions (specifically the instruction cleaning logic). To run the test suite:

npm test


Expected Output:

PASS  utils/helpers.test.js
  cleanInstructions
    √ returns an empty array for null input (2 ms)
    √ splits text by new lines
    √ removes leading numbers from instructions (1 ms)
    √ removes empty lines

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total



Author: Pedro Fernandes
Module: Mobile App Development (MAB001)

