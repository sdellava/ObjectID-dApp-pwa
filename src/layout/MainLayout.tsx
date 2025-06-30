import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

const drawerWidth = 240;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Topbar />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar isMobile={isMobile} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: "64px", // lascia spazio per la Topbar
            width: "100%",
            display: "flex",
            justifyContent: "center", // centra orizzontalmente
            px: 2, // padding laterale
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 700 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
