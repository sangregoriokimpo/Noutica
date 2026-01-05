import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewLog from "./pages/NewLog";
import LogDetail from "./pages/LogDetail";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewLog />} />
          <Route path="/logs/:id" element={<LogDetail />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
