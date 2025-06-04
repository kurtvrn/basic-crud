const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path'); // Ensure the `path` module is imported

try {
  // Construct the path to the service account key JSON file
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

  // Read and parse the JSON file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // Initialize the Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:');
  console.error(error.message);

  if (error instanceof SyntaxError) {
    console.error('\n⚠️  Your serviceAccountKey.json contains invalid JSON');
    console.error('   Please regenerate it from Firebase Console');
  } else if (error.code === 'ENOENT') {
    console.error('\n⚠️  The serviceAccountKey.json file was not found.');
    console.error(`   Expected path: ${path.resolve(__dirname, 'serviceAccountKey.json')}`);
  }

  process.exit(1); // Exit the process if Firebase fails to initialize
}

// Initialize Firestore and export it
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // Optional: Configure Firestore settings

module.exports = db;
