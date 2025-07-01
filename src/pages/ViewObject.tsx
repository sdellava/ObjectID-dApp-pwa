import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Link, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { useAppContext } from "../context/AppContext";
import { getObject } from "../utils/getObject";

export function ExplorerURL(network: string, objectID: string): string {
  return `https://explorer.iota.org/object/${objectID}?network=${network}`;
}

const preferredOrder = [
  "id",
  "description",
  "object_type",
  "creator_did",
  "agent_did",
  "owner_did",
  "object_did",
  "creation_date",
  "last_update",
  "geo_location",
  "product_img_url",
  "product_url",
];

function formatLabel(key: string): string {
  if (key === "id") return "ObjectID";
  if (key === "product_url") return "Product web page";
  return key
    .replace(/_/g, " ")
    .replace(/url/i, "")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function renderValue(key: string, val: any, network: string): React.ReactNode {
  if (key === "id") {
    let idValue: string | null = null;

    if (typeof val === "string") {
      idValue = val;
    } else if (typeof val === "object" && val !== null && "id" in val) {
      idValue = val.id;
    }

    if (idValue) {
      const url = ExplorerURL(network, idValue);
      return (
        <Link href={url} target="_blank" rel="noopener">
          {idValue}
        </Link>
      );
    } else {
      return (
        <Typography variant="body2" color="text.secondary">
          N/A
        </Typography>
      );
    }
  }

  if (key === "geo_location" && typeof val === "string") {
    return (
      <Link href={`https://maps.google.com/?q=${encodeURIComponent(val)}`} target="_blank">
        {val}
      </Link>
    );
  }
  if (key === "creation_date" && !isNaN(Number(val))) {
    const ts = Number(val);
    return new Date(ts < 1000000000000 ? ts * 1000 : ts).toLocaleString();
  }
  if (key.includes("img") && typeof val === "string" && val.startsWith("http")) {
    return (
      <span style={{ display: "inline-block", maxWidth: 300, maxHeight: 300 }}>
        <img
          src={val}
          alt="Product"
          style={{ maxWidth: 300, maxHeight: 300, border: "1px solid #ccc" }}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = "none";
            const sibling = img.nextElementSibling as HTMLElement | null;
            if (sibling) sibling.style.display = "inline";
          }}
        />
        <span style={{ display: "none", fontStyle: "italic", color: "#999" }}>not available</span>
      </span>
    );
  }
  if (typeof val === "string" && val.startsWith("http")) {
    return (
      <Link href={val} target="_blank">
        {val}
      </Link>
    );
  }
  return String(val);
}

function MetadataTable({ title, data, network }: { title: string; data: Record<string, any>; network: string }) {
  const keys = Object.keys(data || {});
  if (!keys.length) return null;

  const sortedKeys = [
    ...preferredOrder.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !preferredOrder.includes(k)).sort(),
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        <strong>{title}</strong>
      </Typography>
      <Table size="small">
        <TableBody>
          {sortedKeys.flatMap((key, index) => {
            const rows = [];

            if (index === 1) {
              // Inserisci "Network" come seconda riga
              rows.push(
                <TableRow key="network">
                  <TableCell sx={{ fontWeight: "bold", width: "40%" }}>Network</TableCell>
                  <TableCell>{network}</TableCell>
                </TableRow>
              );
            }

            rows.push(
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>{formatLabel(key)}</TableCell>
                <TableCell>{renderValue(key, data[key], network)}</TableCell>
              </TableRow>
            );

            return rows;
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function ViewObject() {
  const { objectID, network, client } = useAppContext();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [fields, setFields] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!network || !objectID || !client) {
      setError("Missing ObjectID or Network.");
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const result = (await getObject(client, objectID)) as any;
        const rawFields = result?.content?.fields || {};
        const fields = { ...rawFields };

        // Unisci immutable_metadata e mutable_metadata dentro fields
        ["immutable_metadata", "mutable_metadata"].forEach((metaKey) => {
          try {
            const metaRaw = fields[metaKey];
            if (metaRaw && typeof metaRaw === "string") {
              const meta = JSON.parse(metaRaw);
              if (typeof meta === "object" && meta !== null) {
                for (const [k, v] of Object.entries(meta)) {
                  if (!(k in fields)) {
                    fields[k] = v;
                  }
                }
              }
            }
          } catch (e) {
            console.warn(`Error parsing ${metaKey}:`, e);
          }
          delete fields[metaKey];
        });

        setFields(fields);

        setStatus("ok");
      } catch (e) {
        console.error("Error loading object:", e);
        setError("Failed to load ObjectID.");
        setStatus("error");
      }
    })();
  }, [network, objectID]);

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

  if (network && objectID)
    return (
      <Box sx={{ p: 3 }}>
        <MetadataTable title="Object data:" data={fields} network={network} />
      </Box>
    );
  else return <></>;
}
