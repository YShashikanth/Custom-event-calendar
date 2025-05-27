// src/App.tsx
import React from "react";
import "./styles.css";

import Calendar from "./components/Calendar";

function App() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6"></h1>
      <Calendar />
    </div>
  );
}

export default App;
