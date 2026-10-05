// Script to delete TrafficSigns test data from Firebase
// Run this in your browser console or as a Node.js script

import { db, auth } from './src/firebase.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc 
} from 'firebase/firestore';

async function deleteTrafficSignsData() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Deleting TrafficSigns data for user:', user.email);

    // Delete from userScores collection
    const scoresQuery = query(
      collection(db, 'userScores'),
      where('userId', '==', user.uid),
      where('category', '==', 'trafficSigns')
    );
    
    const scoresSnapshot = await getDocs(scoresQuery);
    console.log(`Found ${scoresSnapshot.docs.length} TrafficSigns scores to delete`);
    
    for (const doc of scoresSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log('Deleted score:', doc.id);
    }

    // Delete from userActivities collection
    const activitiesQuery = query(
      collection(db, 'userActivities'),
      where('userId', '==', user.uid),
      where('category', '==', 'Traffic Signs')
    );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    console.log(`Found ${activitiesSnapshot.docs.length} TrafficSigns activities to delete`);
    
    for (const doc of activitiesSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log('Deleted activity:', doc.id);
    }

    console.log('✅ TrafficSigns data deletion completed successfully!');
    
  } catch (error) {
    console.error('Error deleting TrafficSigns data:', error);
  }
}

// Run the deletion
deleteTrafficSignsData();
