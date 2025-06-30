import { AppBar, Toolbar, Box, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { useAppContext } from "../context/AppContext";

export default function Topbar() {
  const { objectID, network } = useAppContext();

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

        {/* Tabella a destra */}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          <Table size="small" sx={{ color: "white", minWidth: 400 }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: "white", borderBottom: "none" }}>ObjectID: {objectID}</TableCell>
                <TableCell sx={{ color: "white", borderBottom: "none" }}>Network: {network}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: "white", borderBottom: "none" }}>DID:</TableCell>
                <TableCell sx={{ color: "white", borderBottom: "none" }}>Credits:</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
