"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtdb = exports.db = exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const database_1 = require("firebase/database");
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` : undefined);
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: databaseURL
};
let app;
let auth;
let db;
let rtdb;
if (typeof window !== "undefined" && firebaseConfig.apiKey) {
    exports.app = app = (0, app_1.getApps)().length === 0 ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApps)()[0];
    exports.auth = auth = (0, auth_1.getAuth)(app);
    exports.db = db = (0, firestore_1.getFirestore)(app);
    exports.rtdb = rtdb = (0, database_1.getDatabase)(app);
}
