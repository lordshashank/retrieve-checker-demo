import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChallengeDeal from "./pages/ChallengeDeal";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/challenge-deal" element={<ChallengeDeal />} />
      </Routes>
    </Router>
  );
}

export default App;
