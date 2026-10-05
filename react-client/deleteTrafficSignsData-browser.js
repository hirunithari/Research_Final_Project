// Copy and paste this into your browser console while on your app
// Make sure you're logged in first

async function deleteTrafficSignsData() {
  try {
    // Get Firebase instances from your app
    const { db, auth } = await import('./src/firebase.js');
    const { 
      collection, 
      query, 
      where, 
      getDocs, 
      deleteDoc 
    } = await import('firebase/firestore');

    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found. Please log in first.');
      return;
    }

    console.log('🗑️ Starting deletion of TrafficSigns data for user:', user.email);

    // Delete from userScores collection
    const scoresQuery = query(
      collection(db, 'userScores'),
      where('userId', '==', user.uid),
      where('category', '==', 'trafficSigns')
    );
    
    const scoresSnapshot = await getDocs(scoresQuery);
    console.log(`📊 Found ${scoresSnapshot.docs.length} TrafficSigns scores to delete`);
    
    for (const doc of scoresSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log('✅ Deleted score:', doc.id);
    }

    // Delete from userActivities collection
    const activitiesQuery = query(
      collection(db, 'userActivities'),
      where('userId', '==', user.uid),
      where('category', '==', 'Traffic Signs')
    );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    console.log(`📈 Found ${activitiesSnapshot.docs.length} TrafficSigns activities to delete`);
    
    for (const doc of activitiesSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log('✅ Deleted activity:', doc.id);
    }

    console.log('🎉 TrafficSigns data deletion completed successfully!');
    console.log('💡 Refresh your Guardian Dashboard to see the changes.');
    
  } catch (error) {
    console.error('❌ Error deleting TrafficSigns data:', error);
  }
}

// Run the deletion
deleteTrafficSignsData();
