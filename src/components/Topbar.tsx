import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: "64px",
        paddingLeft: "240px", // lascia spazio per la sidebar
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          My PWA App
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
