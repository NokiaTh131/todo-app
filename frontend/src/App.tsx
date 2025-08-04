import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import BoardComponent from "./components/BoardComponent";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todo" element={<BoardComponent />} />
      </Routes>
    </>
  );
}

export default App;
