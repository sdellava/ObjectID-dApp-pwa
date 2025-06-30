import React, { useState } from "react";
import { Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";

import { NavLink } from "react-router-dom";

interface SidebarProps {
  isMobile: boolean;
}

export default function Sidebar({ isMobile }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const drawerWidth = 240;

  const drawer = (
    <List>
      <ListItemButton component={NavLink} to="/scanner" onClick={() => isMobile && setOpen(false)}>
        <ListItemIcon>
          <QrCodeIcon />
        </ListItemIcon>
        <ListItemText primary="Scanner" />
      </ListItemButton>
      <ListItemButton component={NavLink} to="/" onClick={() => isMobile && setOpen(false)}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton component={NavLink} to="/reports" onClick={() => isMobile && setOpen(false)}>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Reports" />
      </ListItemButton>
      <ListItemButton component={NavLink} to="/settings" onClick={() => isMobile && setOpen(false)}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
    </List>
  );

  return (
    <>
      {/* Menu button visibile solo su mobile */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{ position: "fixed", top: 16, left: 16, zIndex: 2000 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // migliora performance su mobile
        }}
        sx={{
          width: isMobile ? undefined : drawerWidth,
          flexShrink: 0,
          zIndex: (theme) => (isMobile ? theme.zIndex.drawer : theme.zIndex.appBar - 1),
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: isMobile ? 0 : "64px",
            height: isMobile ? "100%" : "calc(100% - 64px)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
