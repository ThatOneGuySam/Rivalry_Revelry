import { Box } from "@mui/material";
import "./App.css";
import RootingChooser from "./components/RootingChooser";

function App() {
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <h1>Vite + React</h1>
      <RootingChooser />
    </Box>
  );
}

export default App;
