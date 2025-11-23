import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import StatsPage from "./components/StatsPage";
import HealthCheck from "./components/HealthCheck";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/code/:code" element={<StatsPage />} />
        <Route path="/healthz" element={<HealthCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
