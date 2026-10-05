// Guardian Dashboard Data - Sample data for child performance tracking
export const GuardianDashboardData = {
  // Child Information
  childInfo: {
    name: "Alex Johnson",
    age: 8,
    grade: "3rd Grade",
    avatar: "../../images/profile.jpg",
    joinDate: "2024-01-15",
    totalLearningTime: "45 hours",
    currentStreak: 7
  },

  // Performance Overview
  performanceOverview: {
    totalScore: 2840,
    averageScore: 85,
    lessonsCompleted: 24,
    totalLessons: 30,
    accuracy: 78,
    improvement: "+12%"
  },

  // Learning Progress by Category
  categoryProgress: [
    {
      category: "Animal Signs",
      completed: 8,
      total: 10,
      score: 920,
      accuracy: 82,
      lastActivity: "2024-01-20"
    },
    {
      category: "Static Signs",
      completed: 6,
      total: 8,
      score: 750,
      accuracy: 75,
      lastActivity: "2024-01-19"
    },
    {
      category: "Text to Sign",
      completed: 5,
      total: 7,
      score: 680,
      accuracy: 85,
      lastActivity: "2024-01-18"
    },
    {
      category: "Traffic Signs",
      completed: 3,
      total: 5,
      score: 490,
      accuracy: 70,
      lastActivity: "2024-01-17"
    }
  ],

  // Recent Activities
  recentActivities: [
    {
      id: 1,
      activity: "Completed Lion Sign Practice",
      category: "Animal Signs",
      score: 95,
      date: "2024-01-20",
      time: "14:30"
    },
    {
      id: 2,
      activity: "Learned New Static Signs",
      category: "Static Signs",
      score: 88,
      date: "2024-01-19",
      time: "16:15"
    },
    {
      id: 3,
      activity: "Text to Sign Conversion",
      category: "Text to Sign",
      score: 92,
      date: "2024-01-18",
      time: "10:45"
    },
    {
      id: 4,
      activity: "Traffic Sign Recognition",
      category: "Traffic Signs",
      score: 78,
      date: "2024-01-17",
      time: "13:20"
    },
    {
      id: 5,
      activity: "Cat Sign Practice",
      category: "Animal Signs",
      score: 85,
      date: "2024-01-16",
      time: "15:10"
    }
  ],

  // Weekly Progress
  weeklyProgress: [
    { day: "Mon", score: 85, time: 45 },
    { day: "Tue", score: 92, time: 60 },
    { day: "Wed", score: 78, time: 30 },
    { day: "Thu", score: 88, time: 50 },
    { day: "Fri", score: 95, time: 75 },
    { day: "Sat", score: 82, time: 40 },
    { day: "Sun", score: 90, time: 55 }
  ],

  // Achievements
  achievements: [
    {
      id: 1,
      title: "First Steps",
      description: "Completed first lesson",
      icon: "🎯",
      earned: "2024-01-15",
      unlocked: true
    },
    {
      id: 2,
      title: "Animal Whisperer",
      description: "Mastered 5 animal signs",
      icon: "🐾",
      earned: "2024-01-18",
      unlocked: true
    },
    {
      id: 3,
      title: "Consistent Learner",
      description: "7-day learning streak",
      icon: "🔥",
      earned: "2024-01-20",
      unlocked: true
    },
    {
      id: 4,
      title: "Perfect Score",
      description: "Get 100% on any lesson",
      icon: "⭐",
      earned: null,
      unlocked: false
    },
    {
      id: 5,
      title: "Speed Learner",
      description: "Complete 10 lessons in a week",
      icon: "⚡",
      earned: null,
      unlocked: false
    }
  ],

  // Recommendations
  recommendations: [
    {
      id: 1,
      title: "Practice Dog Signs",
      description: "Alex struggled with dog signs in the last session. Consider extra practice.",
      priority: "high",
      category: "Animal Signs"
    },
    {
      id: 2,
      title: "Review Traffic Signs",
      description: "Traffic sign accuracy is below average. More practice needed.",
      priority: "medium",
      category: "Traffic Signs"
    },
    {
      id: 3,
      title: "Advanced Static Signs",
      description: "Ready for more challenging static signs based on current progress.",
      priority: "low",
      category: "Static Signs"
    }
  ],

  // Learning Goals
  learningGoals: [
    {
      id: 1,
      goal: "Complete all Animal Signs",
      progress: 80,
      target: 100,
      deadline: "2024-02-15"
    },
    {
      id: 2,
      goal: "Achieve 90% accuracy",
      progress: 78,
      target: 90,
      deadline: "2024-02-01"
    },
    {
      id: 3,
      goal: "Learn 50 new signs",
      progress: 35,
      target: 50,
      deadline: "2024-03-01"
    }
  ]
};

// Guardian Settings
export const GuardianSettings = {
  notifications: {
    weeklyReport: true,
    achievementAlerts: true,
    lowPerformanceAlerts: true,
    milestoneCelebrations: true
  },
  privacy: {
    shareProgress: false,
    allowLeaderboard: true,
    dataCollection: true
  }
};
