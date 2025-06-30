import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar />
      <Sidebar isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          ...(isMobile ? {} : { ml: "240px" }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
