import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { WebSocketServer } from "ws";

// 1. Inisialisasi Server MCP
const server = new Server(
    {
        name: "Azgaar-MCP-Commander",
        version: "1.0.0",
    },
    {
        capabilities: { tools: {} },
    }
);

// 2. Inisialisasi WebSocket (Jalur ke Browser)
const wss = new WebSocketServer({ port: 8080 });
let browserSocket = null;

wss.on('connection', function connection(ws) {
    browserSocket = ws;
    console.error("🟢 [MCP] Browser Azgaar berhasil terhubung ke Server!");

    ws.on('close', () => {
        browserSocket = null;
        console.error("🔴 [MCP] Browser Azgaar terputus.");
    });
});

// ==========================================
// 3. DAFTAR MENU TOOLS UNTUK CLAUDE
// ==========================================
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "perintah_peta",
                description: "Mengeksekusi kode JavaScript kustom di runtime browser Azgaar untuk memanipulasi parameter peta.",
                inputSchema: {
                    type: "object",
                    properties: {
                        kode_js: { type: "string", description: "Kode JavaScript yang akan dieksekusi" },
                    },
                    required: ["kode_js"],
                },
            },
            {
                name: "lihat_ringkasan_peta",
                description: "Membaca seluruh data terstruktur dari peta yang sedang aktif (Negara, Kota, Populasi, Budaya) agar kamu bisa melihat kondisi visual peta lewat data.",
                inputSchema: { type: "object", properties: {} }, // Tanpa parameter, tinggal panggil!
            },
            {
                name: "radar_lidar_wilayah",
                description: "Menembakkan sensor radar/LiDAR ke koordinat X dan Y spesifik untuk memeriksa ketinggian tanah, jenis medan, kondisi alam, dan kepemilikan negara di titik tersebut.",
                inputSchema: {
                    type: "object",
                    properties: {
                        x: { type: "number", description: "Koordinat X yang ingin dipindai" },
                        y: { type: "number", description: "Koordinat Y yang ingin dipindai" }
                    },
                    required: ["x", "y"]
                }
            }
        ],
    };
});

// ==========================================
// 4. EKSEKUSI MENU TOOLS
// ==========================================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // --- Tool 1: perintah_peta ---
    if (request.params.name === "perintah_peta") {
        const { kode_js } = request.params.arguments;
        return kirimKeBrowser(kode_js);
    }

    // --- Tool 2: KODE BARU untuk lihat_ringkasan_peta ---
    if (request.params.name === "lihat_ringkasan_peta") {
        // Memanggil fungsi window.getMapSummary() yang sudah kita tanam di browser
        return kirimKeBrowser("window.getMapSummary();");
    }

    // --- Tool 3: radar_lidar_wilayah ---
    if (request.params.name === "radar_lidar_wilayah") {
        const { x, y } = request.params.arguments;
        return kirimKeBrowser(`window.scanRemoteLidar(${x}, ${y});`);
    }

    throw new Error("Tool tidak ditemukan!");
});

// Helper function supaya kode index.js lebih rapi
function kirimKeBrowser(kode) {
    if (!browserSocket) {
        return { content: [{ type: "text", text: "❌ Browser Azgaar belum terhubung!" }], isError: true };
    }
    return new Promise((resolve) => {
        const handleResponse = (message) => {
            const response = JSON.parse(message);
            browserSocket.off('message', handleResponse);
            if (response.status === "success") {
                resolve({ content: [{ type: "text", text: response.result }] });
            } else {
                resolve({ content: [{ type: "text", text: `❌ Browser Error: ${response.error}` }], isError: true });
            }
        };
        browserSocket.on('message', handleResponse);
        browserSocket.send(JSON.stringify({ action: "execute_js", code: kode }));
    });
}
// 5. Jalankan Mesin    
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 [MCP] Azgaar Commander Server siap dengan amunisi Tools!");
}

main().catch(console.error);