import express from "express";
import cors from "cors";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CREA MCP SERVER
const mcpServer = new Server(
  { name: "test-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ✅ TOOL DISPONIBILI
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "say_hello",
        description: "Usa questo tool quando l'utente vuole salutare qualcuno",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" }
          },
          required: ["name"]
        }
      },
      {
        name: "sum_numbers",
        description: "Usa questo tool per fare somme o calcoli matematici",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" }
          },
          required: ["a", "b"]
        }
      },
      {
        name: "get_time",
        description: "Usa questo tool quando l'utente chiede che ore sono",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// ✅ LOGICA TOOL
mcpServer.setRequestHandler(CallToolRequestSchema, async (req) => {
  const nome = req.params.name;

  if (nome === "say_hello") {
    return {
      content: [
        { type: "text", text: `Ciao ${req.params.arguments.name}! 👋` }
      ]
    };
  }

  if (nome === "sum_numbers") {
    const { a, b } = req.params.arguments;
    return {
      content: [
        { type: "text", text: `Risultato: ${a + b}` }
      ]
    };
  }

  if (nome === "get_time") {
    return {
      content: [
        { type: "text", text: `Ora: ${new Date().toLocaleTimeString()}` }
      ]
    };
  }

  throw new Error("Tool non trovato");
});

// ✅ ENDPOINT MCP
app.post("/mcp", async (req, res) => {
  try {
    const response = await mcpServer.handleRequest(req.body);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore");
  }
});

// ✅ AVVIO SERVER
app.listen(3000, () => {
  console.log("✅ MCP pronto su http://localhost:3000/mcp");
});