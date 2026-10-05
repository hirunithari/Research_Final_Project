import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

class GuardianDataService {
  // Get current user's child data
  async getChildInfo() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Calculate age from birth date if available
      let age = null;
      if (userData.birthDate) {
        const birthDate = userData.birthDate.toDate();
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      // Calculate learning streak
      const streak = await this.calculateLearningStreak(user.uid);

      return {
        name: userData.name || 'Student',
        age: age || 'Not specified',
        grade: userData.grade || 'Not specified',
        avatar: userData.avatar || '/images/default-avatar.jpg',
        joinDate: userData.createdAt?.toDate() || new Date(),
        totalLearningTime: await this.calculateTotalLearningTime(user.uid),
        currentStreak: streak
      };
    } catch (error) {
      console.error('Error fetching child info:', error);
      return null;
    }
  }

  // Get performance overview
  async getPerformanceOverview() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const scores = await this.getUserScores(user.uid);
      const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
      const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;
      const lessonsCompleted = scores.length;
      const totalLessons = 30; // Total available lessons
      const accuracy = await this.calculateOverallAccuracy(user.uid);
      const improvement = await this.calculateImprovement(user.uid);

      return {
        totalScore,
        averageScore,
        lessonsCompleted,
        totalLessons,
        accuracy,
        improvement
      };
    } catch (error) {
      console.error('Error fetching performance overview:', error);
      return {
        totalScore: 0,
        averageScore: 0,
        lessonsCompleted: 0,
        totalLessons: 30,
        accuracy: 0,
        improvement: '0%'
      };
    }
  }

  // Get category progress
  async getCategoryProgress() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const categories = [
        { name: 'Animal Signs', total: 10, path: 'animalSigns' },
        { name: 'Static Signs', total: 8, path: 'staticSigns' },
        { name: 'Text to Sign', total: 7, path: 'textToSign' },
        { name: 'Traffic Signs', total: 5, path: 'trafficSigns' }
      ];

      const progress = await Promise.all(
        categories.map(async (category) => {
          const scores = await this.getCategoryScores(user.uid, category.path);
          const completed = scores.length;
          const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
          const accuracy = completed > 0 ? Math.round(totalScore / completed) : 0;
          const lastActivity = scores.length > 0 ? scores[0].timestamp.toDate() : null;

          const result = {
            category: category.name,
            completed,
            total: category.total,
            score: totalScore,
            accuracy,
            lastActivity: lastActivity?.toISOString() || null
          };

          return result;
        })
      );
      return progress;
    } catch (error) {
      console.error('Error fetching category progress:', error);
      return [];
    }
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const activitiesQuery = query(
        collection(db, 'userActivities'),
        where('userId', '==', user.uid)
        // Removed orderBy to avoid composite index requirement
      );

      const snapshot = await getDocs(activitiesQuery);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      // Sort by timestamp in JavaScript and limit
      activities.sort((a, b) => b.timestamp - a.timestamp);
      const limitedActivities = activities.slice(0, limit);

      return limitedActivities.map(activity => ({
        id: activity.id,
        activity: activity.activityName,
        category: activity.category,
        date: activity.timestamp.toISOString(),
        time: activity.timestamp.toLocaleTimeString(),
        score: activity.score || 0
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get achievements
  async getAchievements() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const achievementsQuery = query(
        collection(db, 'achievements'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(achievementsQuery);
      const userAchievements = snapshot.docs.map(doc => doc.data());

      // Define all possible achievements
      const allAchievements = [
        {
          id: 'first_lesson',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          unlocked: userAchievements.some(a => a.achievementId === 'first_lesson'),
          earned: userAchievements.find(a => a.achievementId === 'first_lesson')?.earnedDate?.toDate()
        },
        {
          id: 'streak_7',
          title: 'Consistent Learner',
          description: 'Maintain a 7-day learning streak',
          icon: '🔥',
          unlocked: userAchievements.some(a => a.achievementId === 'streak_7'),
          earned: userAchievements.find(a => a.achievementId === 'streak_7')?.earnedDate?.toDate()
        },
        {
          id: 'score_1000',
          title: 'Score Master',
          description: 'Achieve a total score of 1000 points',
          icon: '🏆',
          unlocked: userAchievements.some(a => a.achievementId === 'score_1000'),
          earned: userAchievements.find(a => a.achievementId === 'score_1000')?.earnedDate?.toDate()
        },
        {
          id: 'accuracy_90',
          title: 'Accuracy Expert',
          description: 'Achieve 90% accuracy in any category',
          icon: '🎯',
          unlocked: userAchievements.some(a => a.achievementId === 'accuracy_90'),
          earned: userAchievements.find(a => a.achievementId === 'accuracy_90')?.earnedDate?.toDate()
        },
        {
          id: 'all_categories',
          title: 'Category Explorer',
          description: 'Try all learning categories',
          icon: '🗺️',
          unlocked: userAchievements.some(a => a.achievementId === 'all_categories'),
          earned: userAchievements.find(a => a.achievementId === 'all_categories')?.earnedDate?.toDate()
        },
        {
          id: 'perfect_score',
          title: 'Perfect Score',
          description: 'Get 100% on any lesson',
          icon: '⭐',
          unlocked: userAchievements.some(a => a.achievementId === 'perfect_score'),
          earned: userAchievements.find(a => a.achievementId === 'perfect_score')?.earnedDate?.toDate()
        }
      ];

      return allAchievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // Get learning goals
  async getLearningGoals() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const goalsQuery = query(
        collection(db, 'learningGoals'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(goalsQuery);
      const goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate()
      }));

      // If no goals exist, create default goals
      if (goals.length === 0) {
        const defaultGoals = await this.createDefaultGoals(user.uid);
        return defaultGoals;
      }

      return goals.map(goal => ({
        id: goal.id,
        goal: goal.title,
        progress: goal.progress || 0,
        target: goal.target,
        deadline: goal.deadline?.toISOString() || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching learning goals:', error);
      return [];
    }
  }

  // Get recommendations
  async getRecommendations() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const categoryProgress = await this.getCategoryProgress();
      const recommendations = [];

      // Analyze performance and generate recommendations
      categoryProgress.forEach(category => {
        if (category.accuracy < 70) {
          recommendations.push({
            id: `low_accuracy_${category.category.toLowerCase().replace(/\s+/g, '_')}`,
            title: `Improve ${category.category} Accuracy`,
            description: `Your accuracy in ${category.category} is ${category.accuracy}%. Consider practicing more to improve.`,
            priority: 'high',
            category: category.category
          });
        }

        if (category.completed < category.total * 0.5) {
          recommendations.push({
            id: `complete_${category.category.toLowerCase().replace(/\s+/g, '_')}`,
            title: `Complete More ${category.category}`,
            description: `You've completed ${category.completed} of ${category.total} lessons. Keep going!`,
            priority: 'medium',
            category: category.category
          });
        }
      });

      // Add general recommendations
      const performance = await this.getPerformanceOverview();
      if (performance.averageScore < 80) {
        recommendations.push({
          id: 'improve_overall',
          title: 'Improve Overall Performance',
          description: 'Your average score is below 80%. Focus on accuracy and practice regularly.',
          priority: 'high',
          category: 'General'
        });
      }

      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Helper methods
  async getUserScores(userId) {
    const scoresQuery = query(
      collection(db, 'userScores'),
      where('userId', '==', userId)
      // Removed orderBy to avoid composite index requirement
    );
    const snapshot = await getDocs(scoresQuery);
    const scores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));
    
    // Sort by timestamp in JavaScript instead of Firestore
    scores.sort((a, b) => b.timestamp - a.timestamp);
    
    return scores;
  }

  async getCategoryScores(userId, category) {
    try {
      const scoresQuery = query(
        collection(db, 'userScores'),
        where('userId', '==', userId),
        where('category', '==', category)
        // Removed orderBy to avoid composite index requirement
      );
      const snapshot = await getDocs(scoresQuery);
      
      const scores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
      
      // Sort by timestamp in JavaScript instead of Firestore
      scores.sort((a, b) => b.timestamp - a.timestamp);
      
      return scores;
    } catch (error) {
      console.error(`Error fetching scores for category ${category}:`, error);
      return [];
    }
  }

  async calculateLearningStreak(userId) {
    try {
      const activitiesQuery = query(
        collection(db, 'userActivities'),
        where('userId', '==', userId)
        // Removed orderBy to avoid composite index requirement
      );
      const snapshot = await getDocs(activitiesQuery);
      const activities = snapshot.docs.map(doc => doc.data().timestamp.toDate());
      
      // Sort by timestamp in JavaScript instead of Firestore
      activities.sort((a, b) => b - a);

      if (activities.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < activities.length; i++) {
        const activityDate = activities[i];
        activityDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today - activityDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === streak) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating learning streak:', error);
      return 0;
    }
  }

  async calculateTotalLearningTime(userId) {
    try {
      const activitiesQuery = query(
        collection(db, 'userActivities'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(activitiesQuery);
      const activities = snapshot.docs.map(doc => doc.data());

      const totalMinutes = activities.reduce((total, activity) => {
        return total + (activity.duration || 0);
      }, 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating total learning time:', error);
      return '0h 0m';
    }
  }

  async calculateOverallAccuracy(userId) {
    try {
      const scores = await this.getUserScores(userId);
      if (scores.length === 0) return 0;

      const totalAccuracy = scores.reduce((sum, score) => sum + (score.accuracy || 0), 0);
      return Math.round(totalAccuracy / scores.length);
    } catch (error) {
      console.error('Error calculating overall accuracy:', error);
      return 0;
    }
  }

  async calculateImprovement(userId) {
    try {
      const scores = await this.getUserScores(userId);
      if (scores.length < 2) return '+0%';

      const recentScores = scores.slice(0, 5);
      const olderScores = scores.slice(5, 10);

      if (olderScores.length === 0) return '+0%';

      const recentAvg = recentScores.reduce((sum, score) => sum + score.score, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, score) => sum + score.score, 0) / olderScores.length;

      // Avoid division by zero and handle edge cases
      if (olderAvg === 0) return '+0%';
      
      const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      // Cap the improvement to reasonable bounds (-100% to +1000%)
      const cappedImprovement = Math.max(-100, Math.min(1000, improvement));
      
      // Always show the sign (+ or -) for clarity
      return `${cappedImprovement >= 0 ? '+' : ''}${Math.round(cappedImprovement)}%`;
    } catch (error) {
      console.error('Error calculating improvement:', error);
      return '+0%';
    }
  }

  async createDefaultGoals(userId) {
    try {
      const defaultGoals = [
        {
          title: 'Complete all Animal Signs',
          target: 100,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          progress: 0
        },
        {
          title: 'Achieve 90% accuracy',
          target: 90,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          progress: 0
        },
        {
          title: 'Learn 50 new signs',
          target: 50,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          progress: 0
        }
      ];

      const createdGoals = [];
      for (const goal of defaultGoals) {
        const goalRef = await addDoc(collection(db, 'learningGoals'), {
          userId,
          ...goal,
          createdAt: serverTimestamp()
        });
        createdGoals.push({
          id: goalRef.id,
          goal: goal.title,
          progress: goal.progress,
          target: goal.target,
          deadline: goal.deadline.toISOString()
        });
      }

      return createdGoals;
    } catch (error) {
      console.error('Error creating default goals:', error);
      return [];
    }
  }

  // Record user activity
  async recordActivity(activityData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user found for recording activity');
        throw new Error('No authenticated user');
      }

      const docRef = await addDoc(collection(db, 'userActivities'), {
        userId: user.uid,
        ...activityData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error; // Re-throw to handle in calling component
    }
  }

  // Record user score
  async recordScore(scoreData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user found for recording score');
        throw new Error('No authenticated user');
      }

      const docRef = await addDoc(collection(db, 'userScores'), {
        userId: user.uid,
        ...scoreData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error recording score:', error);
      throw error; // Re-throw to handle in calling component
    }
  }

  // Check and award achievements
  async checkAchievements() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const performance = await this.getPerformanceOverview();
      const categoryProgress = await this.getCategoryProgress();
      const scores = await this.getUserScores(user.uid);

      const achievements = [];

      // Check for first lesson achievement
      if (scores.length === 1) {
        achievements.push('first_lesson');
      }

      // Check for score master achievement
      if (performance.totalScore >= 1000) {
        achievements.push('score_1000');
      }

      // Check for perfect score achievement
      const hasPerfectScore = scores.some(score => score.score === 100);
      if (hasPerfectScore) {
        achievements.push('perfect_score');
      }

      // Check for accuracy expert achievement
      const hasHighAccuracy = categoryProgress.some(category => category.accuracy >= 90);
      if (hasHighAccuracy) {
        achievements.push('accuracy_90');
      }

      // Check for all categories achievement
      const hasAllCategories = categoryProgress.every(category => category.completed > 0);
      if (hasAllCategories) {
        achievements.push('all_categories');
      }

      // Award achievements
      for (const achievementId of achievements) {
        await this.awardAchievement(user.uid, achievementId);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  async awardAchievement(userId, achievementId) {
    try {
      // Check if achievement already awarded
      const existingQuery = query(
        collection(db, 'achievements'),
        where('userId', '==', userId),
        where('achievementId', '==', achievementId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(collection(db, 'achievements'), {
          userId,
          achievementId,
          earnedDate: serverTimestamp()
        });

        // Create notification for achievement
        await this.createNotification(userId, {
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          message: `Congratulations! You've earned a new achievement.`,
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }

  // Create notification
  async createNotification(userId, notificationData) {
    try {
      await addDoc(collection(db, 'guardianNotifications'), {
        userId,
        ...notificationData,
        read: false,
        active: true,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Create performance alert notification
  async createPerformanceAlert(userId, category, accuracy) {
    if (accuracy < 70) {
      await this.createNotification(userId, {
        type: 'performance',
        title: 'Performance Alert',
        message: `Your accuracy in ${category} has dropped to ${accuracy}%. Consider extra practice.`,
        priority: 'medium'
      });
    }
  }

  // Create milestone notification
  async createMilestoneNotification(userId, milestone) {
    await this.createNotification(userId, {
      type: 'milestone',
      title: 'Learning Milestone Reached!',
      message: milestone,
      priority: 'low'
    });
  }

  // Create goal progress notification
  async createGoalProgressNotification(userId, goal, progress) {
    if (progress >= 80) {
      await this.createNotification(userId, {
        type: 'goal',
        title: 'Goal Progress Update',
        message: `Great progress! You're ${progress}% towards completing "${goal}".`,
        priority: 'low'
      });
    }
  }
}

export default new GuardianDataService();
