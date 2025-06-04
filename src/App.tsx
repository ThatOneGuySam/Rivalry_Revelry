import { useState } from "react";
import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import "./App.css";
import RootingChooser from "./components/RootingChooser";
import GiveAReason from "./components/GiveAReason";
import WebVisualizer from "./components/WebVisualizer";

function App() {
  const [tabIndex, setTabIndex] = useState(1);

  const handleChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const renderContent = () => {
    switch (tabIndex) {
      case 0:
        return <WebVisualizer />;
      case 1:
        return <RootingChooser />;
      case 2:
        return <GiveAReason />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <AppBar position="static" sx={{ marginBottom: "50px" }}>
        <Toolbar>
          <Typography variant="h6">Rivalry Revelry</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ bgcolor: "background.paper" }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Rivalry Web" />
          <Tab label="Who should I root for?" />
          <Tab label="Give me a reason..." />
        </Tabs>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: "90vw", // 90% of viewport width
          margin: "0 auto", // Center horizontally
          overflowY: "visible",
          paddingY: 4,
        }}
      >
        {renderContent()}
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

export default App;
