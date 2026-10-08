import { Route, Routes, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NetworkBanner from "./components/NetworkBanner";
import Home from "./pages/Home";
import Election from "./pages/Election";
import Candidates from "./pages/Candidates";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import About from "./pages/About";
import { useTheme } from "./context/ThemeContext";

function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-black text-gradient">404</p>
      <p className="mt-4 text-muted">This page does not exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <NetworkBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/election" element={<Election />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4500,
          style: {
            background: theme === "dark" ? "#141a2e" : "#ffffff",
            color: theme === "dark" ? "#f1f5f9" : "#0f172a",
            border: "1px solid rgba(127,127,160,0.25)",
            borderRadius: "14px",
            fontSize: "14px",
            maxWidth: "420px",
          },
        }}
      />
    </div>
  );
}
