// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// ① BrowserRouter, Routes, Route provide page routing
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ② Import each page component
import Welcome from './Welcome.jsx';
import Dashboard from './Dashboard.jsx';
import IncomeStatement from './IncomeStatement.jsx';
import SalesInput from './SalesInput.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap your app in a router */}
    <BrowserRouter>
      <Routes>
        {/* “/” shows Welcome page */}
        <Route path="/" element={<Welcome />} />
        {/* “/dashboard” shows your button menu */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* “/income-statement” shows the income calculator */}
        <Route path="/income-statement" element={<IncomeStatement />} />
        <Route path="/sales" element={<SalesInput />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
