// challenge1/module1/services/firebaseService.js
// NOTE: Firebase dependencies are not installed. Install with:
// npm install firebase
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

// TODO: Replace with your Firebase config
// Uncomment when Firebase is installed
/*
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
*/

/**
 * Service to handle Firebase operations for QR code verification
 * NOTE: Firebase not installed - methods will throw errors until firebase is added
 */
export class FirebaseService {
    /**
     * Verify QR code and get associated data from Firebase
     * @param {string} qrCode - The scanned QR code
     * @returns {object|null} QR data if found, null otherwise
     */
    static async verifyQRCode(qrCode) {
        throw new Error('Firebase not configured. Install firebase package and uncomment imports.');
        /* Uncomment when Firebase is installed
        try {
            // Query the 'qr_codes' collection for the scanned code
            const q = query(
                collection(db, 'qr_codes'),
                where('code', '==', qrCode)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.log('QR code not found in Firebase');
                return null;
            }
            
            // Get the first matching document
            const docData = querySnapshot.docs[0].data();
            
            return {
                id: querySnapshot.docs[0].id,
                code: qrCode,
                ...docData,
                verifiedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error verifying QR code:', error);
            throw error;
        }
        */
    }

    /**
     * Get QR code by document ID
     * @param {string} docId - Document ID in Firestore
     * @returns {object|null} QR data if found
     */
    static async getQRById(docId) {
        throw new Error('Firebase not configured. Install firebase package and uncomment imports.');
        /* Uncomment when Firebase is installed
        try {
            const docRef = doc(db, 'qr_codes', docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                };
            } else {
                console.log('No such document!');
                return null;
            }
        } catch (error) {
            console.error('Error getting QR by ID:', error);
            throw error;
        }
        */
    }

    /**
     * Get all QR codes from Firebase
     * @returns {array} Array of QR codes
     */
    static async getAllQRCodes() {
        throw new Error('Firebase not configured. Install firebase package and uncomment imports.');
        /* Uncomment when Firebase is installed
        try {
            const querySnapshot = await getDocs(collection(db, 'qr_codes'));
            const qrCodes = [];
            
            querySnapshot.forEach((doc) => {
                qrCodes.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            
            return qrCodes;
        } catch (error) {
            console.error('Error getting all QR codes:', error);
            throw error;
        }
        */
    }
}
