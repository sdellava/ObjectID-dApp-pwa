import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

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
            mt: "64px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            px: 2,
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
