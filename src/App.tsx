import Home from "./pages/Home";
import Resume from "./pages/Resume";

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "/resume" ? <Resume /> : <Home />;
}
