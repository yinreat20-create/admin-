import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Same Firebase project as the SatisPro desktop app.
export const firebaseConfig = {
  apiKey: 'AIzaSyDCxXNBny3VIP5QRKQ2HOGYgyJqJFksDSs',
  authDomain: 'satispro-13ba1.firebaseapp.com',
  projectId: 'satispro-13ba1',
  storageBucket: 'satispro-13ba1.firebasestorage.app',
  messagingSenderId: '435152468711',
  appId: '1:435152468711:web:145900d3590791a780c042',
  measurementId: 'G-RJ824DP8KJ',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Region must match functions/index.js's setGlobalOptions region in the main project.
export const functions = getFunctions(app, 'europe-west1');
export default app;
