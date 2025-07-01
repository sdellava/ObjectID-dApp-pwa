import { AppBar, Toolbar, Box, Typography } from "@mui/material";
import { useAppContext } from "../context/AppContext";

export default function Topbar() {
  const { credits } = useAppContext();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: "64px",
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        {/* Logo a sinistra */}
        <Box sx={{ display: "flex", alignItems: "center", width: 210 }}>
          <img src="/ObjectID_darkmode.svg" alt="ObjectID Logo" style={{ height: 32 }} />
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", pr: 2, mr: "20px" }}>
          <Typography sx={{ color: "white", textAlign: "right" }}>Credits: {credits}</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
