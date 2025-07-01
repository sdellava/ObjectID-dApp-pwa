import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { useAppContext } from "../context/AppContext";
import { useMediaQuery, useTheme } from "@mui/material";

export default function Scanner() {
  const qrRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scannedOid, setScannedOid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setObjectID, setNetwork } = useAppContext();

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const boxSize = isLargeScreen ? 600 : 300;
  const qrboxSize = isLargeScreen ? 400 : 250;

  const validateAndParseObjectID = (data: string): { oid: string; n: string | null } | null => {
    try {
      const url = new URL(data);
      const params = new URLSearchParams(url.search);
      const oid = params.get("oid");
      const n = params.get("n");

      if (!oid || !oid.startsWith("0x") || oid.length !== 66) return null;
      return { oid, n };
    } catch {
      return null;
    }
  };

  const processDecodedText = (decodedText: string) => {
    console.log(decodedText);
    const valid = validateAndParseObjectID(decodedText);
    if (valid) {
      const { oid, n } = valid;
      setNetwork(n === "testnet" ? "testnet" : "mainnet");
      setScannedOid(oid);
      setObjectID(oid);
      return true;
    } else {
      setError("Invalid ObjectID QR code.");
      return false;
    }
  };

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    let isRunning = false;

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCode
          .start(
            cameraId,
            { fps: 10, qrbox: qrboxSize },
            (decodedText) => {
              if (processDecodedText(decodedText)) {
                html5QrCode.stop();
                isRunning = false;
              }
            },
            () => {}
          )
          .then(() => {
            isRunning = true; // ✅ scanner partito con successo
          })
          .catch((err) => {
            console.error("QR init error", err);
          });
      }
    });

    return () => {
      if (isRunning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        });
      }
    };
  }, []);

  const handleRescan = () => {
    setScannedOid(null);
    setError(null);
    if (html5QrCodeRef.current) {
      Html5Qrcode.getCameras().then((devices) => {
        if (devices && devices.length) {
          html5QrCodeRef.current?.start(
            devices[0].id,
            { fps: 10, qrbox: qrboxSize },
            (decodedText) => {
              if (processDecodedText(decodedText)) {
                html5QrCodeRef.current?.stop();
              }
            },
            () => {}
          );
        }
      });
    }
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!scannedOid && (
        <Box
          sx={{
            border: "2px solid #ccc",
            borderRadius: "8px",
            padding: 1,
            width: boxSize + 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div id={qrRegionId} style={{ width: boxSize }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, width: 320 }}>
          {error}
        </Alert>
      )}

      {scannedOid && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body1">Scanned ObjectID:</Typography>
          <Typography variant="subtitle1" color="primary">
            {scannedOid}
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleRescan}>
            Scan Again
          </Button>
        </Box>
      )}
    </Box>
  );
}
