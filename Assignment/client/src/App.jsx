import { Outlet } from "react-router-dom";
import Dashboard from "./components/Dashboard";

export default function App() {

  return (
    <div className="app">
      <Dashboard>
        <Outlet/>
      </Dashboard>
    </div>
  );
}