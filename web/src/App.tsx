import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MeetingPage } from "./pages/MeetingPage";
import { JoinPage } from "./pages/JoinPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <div className="flex-col" style={{ minHeight: "100vh" }}>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join/:id" element={<JoinPage />} />
        <Route path="/:id" element={<JoinPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/meeting"  element={<MeetingPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="container" style={{ padding: "4rem 0" }}>
              <h1>404</h1>
              <p>Page not found.</p>
            </div>
          }
        />
      </Routes>

      <footer
        style={{
          padding: "3rem 0",
          marginTop: "auto",
          borderTop: "1px solid var(--glass-border)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      ></footer>
    </div>
  );
}

export default App;
