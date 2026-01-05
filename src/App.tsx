import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewLog from "./pages/NewLog";
import LogDetail from "./pages/LogDetail";
import EditLog from "./pages/EditLog";
import UrdfViewer from "./pages/UrdfViewer";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewLog />} />
          <Route path="/logs/:id" element={<LogDetail />} />
          <Route path="/logs/:id/edit" element={<EditLog />} />
          <Route path="/urdf" element={<UrdfViewer />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
