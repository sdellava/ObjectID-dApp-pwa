import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Link } from "@mui/material";
import { useAppContext } from "../context/AppContext";
// import { getObjectInfo, validateObject } from "../utils/utils";
import { graphqlUrl } from "../constants/config";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";

export function ExplorerURL(network: string, objectID: string): string {
  if (network == "testnet") return `https://explorer.iota.org/object/${objectID}?network=testnet`;
  else return `https://explorer.iota.org/object/${objectID}?network=testnet`;
}

export default function ViewObject() {
  const { objectID, network, client } = useAppContext();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [object, setObject] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const graphql_url = graphqlUrl(network);

  useEffect(() => {
    if (!network || !objectID) {
      setError("Missing ObjectID or Network.");
      setStatus("error");
      return;
    }
  }, [network, objectID]);

  if (!objectID || !network) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Missing required context values.</Alert>
      </Box>
    );
  }

  if (status === "loading") {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading ObjectID...
        </Typography>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        ObjectID: {objectID}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Network: {network}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Link href={ExplorerURL(network, objectID)} target="_blank" rel="noopener">
          View on Explorer
        </Link>
      </Box>

      <pre>{JSON.stringify(object, null, 2)}</pre>

      {validation && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Validation Result:</Typography>
          <pre>{JSON.stringify(validation, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}
