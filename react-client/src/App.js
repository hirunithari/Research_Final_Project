import { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import TextSign from "./pages/textSign/TextSign";
import Welcome from "./pages/welcome/Welcome";
import DashboardAnimals from "./pages/animals/Dashboard-animals";
import LearnCat from "./pages/animals/cat/Learncat";
import LearnDog from "./pages/animals/dog/Learndog";
import LearnLion from "./pages/animals/lion/Learnlion";
import StaticSignDashboard from "./pages/staticSign/staticSignDashboard/StaticSignDashboard";
import StaticSignGame from "./pages/staticSign/StaticSignGame/StaticSignGame";
import Layout from "./components/layout/Layout";
import LearnStaticSign from "./pages/staticSign/learnStaticSign/LearnStaticSign";
import PractiseCat from "./pages/animals/cat/Practisecat";
import Bot from "./pages/bot/Bot";
import LearnColors from "./pages/colors/LearnColors";
import LeaderBoard from "./pages/staticSign/leaderboard/LeaderBoard";
import BotTeach from "./pages/colors/BotTeach";
import PracticeStaticSign from "./pages/staticSign/learnStaticSign/PractiseStaticSign";
import DynamicSignResult from "./pages/animals/cat/DynamicSignResult";
import PractiseDog from "./pages/animals/dog/PractiseDog";
import PractiseLion from "./pages/animals/lion/PractiseLion";
import LearnCow from "./pages/animals/cow/Learncow";
import PractiseCow from "./pages/animals/cow/PractiseCow";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { AuthProvider } from "./AuthProvider"; // Import AuthProvider
import ProtectedRoute from "./ProtectedRoute"; // Import ProtectedRoute
import SignSentenceBuilder from "./pages/textSign/SignSentenceBuilder";
import SignToWord from "./pages/textSign/SignToWord";
import TrafficSigns from "./pages/traffic/TrafficSigns";
import GuardianDashboard from "./components/guardian/GuardianDashboard";
import GuardianSettings from "./components/guardian/GuardianSettings";
import GuardianNotifications from "./components/guardian/GuardianNotifications";
import ProfileSettings from "./components/profile/ProfileSettings";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        {" "}
        {/* Wrap with AuthProvider */}
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Welcome />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Welcome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/textSign"
                element={
                  <ProtectedRoute>
                    <TextSign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboardChatbot"
                element={
                  <ProtectedRoute>
                    <BotTeach />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learnColor"
                element={
                  <ProtectedRoute>
                    <LearnColors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <Bot />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign-sentence-builder"
                element={
                  <ProtectedRoute>
                    <SignSentenceBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign-to-word"
                element={
                  <ProtectedRoute>
                    <SignToWord />
                  </ProtectedRoute>
                }
              />

              {/* Traffic Signs */}
              <Route path="/traffic-signs" element={<TrafficSigns />} />

              {/* Guardian Dashboard Routes */}
              <Route
                path="/guardian-dashboard"
                element={
                  <ProtectedRoute>
                    <GuardianDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guardian-settings"
                element={
                  <ProtectedRoute>
                    <GuardianSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guardian-notifications"
                element={
                  <ProtectedRoute>
                    <GuardianNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile-settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard-animals"
                element={
                  <ProtectedRoute>
                    <DashboardAnimals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn-cat"
                element={
                  <ProtectedRoute>
                    <LearnCat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn-dog"
                element={
                  <ProtectedRoute>
                    <LearnDog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn-lion"
                element={
                  <ProtectedRoute>
                    <LearnLion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn-cow"
                element={
                  <ProtectedRoute>
                    <LearnCow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practise-cat"
                element={
                  <ProtectedRoute>
                    <PractiseCat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practise-dog"
                element={
                  <ProtectedRoute>
                    <PractiseDog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practise-lion"
                element={
                  <ProtectedRoute>
                    <PractiseLion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practise-cow"
                element={
                  <ProtectedRoute>
                    <PractiseCow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/static-sign-dashboard"
                element={
                  <ProtectedRoute>
                    <StaticSignDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/static-sign-game"
                element={
                  <ProtectedRoute>
                    <StaticSignGame />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn-static-sign"
                element={
                  <ProtectedRoute>
                    <LearnStaticSign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practise-static-sign/:id"
                element={
                  <ProtectedRoute>
                    <PracticeStaticSign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <LeaderBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result"
                element={
                  <ProtectedRoute>
                    <DynamicSignResult />
                  </ProtectedRoute>
                }
              />
              <Route>404 Not Found</Route>
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>{" "}
      {/* End AuthProvider */}
    </Suspense>
  );
}

export default App;
