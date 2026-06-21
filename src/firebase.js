import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

// Paste your config from:
// Firebase Console → Project Settings → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA1OEn5luPRzm-fn7bH8NyQ-8bxoXZAqE",
  authDomain: "portfolio-2716c.firebaseapp.com",
  databaseURL: "https://portfolio-2716c-default-rtdb.firebaseio.com",
  projectId: "portfolio-2716c",
  storageBucket: "portfolio-2716c.firebasestorage.app",
  messagingSenderId: "787215559019",
  appId: "1:787215559019:web:f3b3e45b721997d89c842e",
  measurementId: "G-GZC29TQDJZ"
}

const app = initializeApp(firebaseConfig)
export const auth    = getAuth(app)
export const db      = getDatabase(app)
export const storage = getStorage(app)
