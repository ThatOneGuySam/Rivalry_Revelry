import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import RootingChooser from "./components/RootingChooser";
import GiveAReason from "./components/GiveAReason";
import WebVisualizer from "./components/WebVisualizer";

const tabRoutes = ["/web", "/root", "/reason"];

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabIndex = tabRoutes.indexOf(location.pathname);
  const handleChange = (_: any, newValue: number) => {
    navigate(tabRoutes[newValue]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Rivalry Revelry</Typography>
        </Toolbar>
        <Tabs
          value={tabIndex === -1 ? 1 : tabIndex}
          onChange={handleChange}
          centered
          indicatorColor="secondary"
          textColor="inherit"
        >
          <Tab label="Rivalry Web" />
          <Tab label="Who should I root for?" />
          <Tab label="Give me a reason..." />
        </Tabs>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          margin: "0 auto",
          paddingY: 4,
          overflowY: "visible",
        }}
      >
        <Routes>
          <Route path="/web" element={<WebVisualizer />} />
          <Route path="/root" element={<RootingChooser />} />
          <Route path="/reason" element={<GiveAReason />} />
          <Route path="*" element={<RootingChooser />} />
        </Routes>
      </Box>

      <Box
        component="footer"
        sx={{ textAlign: "center", padding: 2, bgcolor: "#f5f5f5" }}
      >
        <Typography variant="body2">My App Footer</Typography>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
