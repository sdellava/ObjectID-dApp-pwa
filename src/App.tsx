import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import ViewObject from "./pages/ViewObject";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SplashScreen from "./components/SplashScreen";
import Scanner from "./pages/Scanner";
import { AppProvider } from "./context/AppContext";

function App() {
  const [accepted, setAccepted] = useState(false);

  // opzionale: salva la scelta su localStorage
  useEffect(() => {
    const acceptedBefore = localStorage.getItem("accepted") === "true";
    setAccepted(acceptedBefore);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("accepted", "true");
    setAccepted(true);
  };

  if (!accepted) {
    return <SplashScreen onAccept={handleAccept} />;
  }

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ViewObject />} />
          <Route path="view-object" element={<ViewObject />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;
