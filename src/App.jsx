import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Scrapper from "./pages/Scrapper";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Scrapper />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
