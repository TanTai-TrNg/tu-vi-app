import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerHoroscopeTools } from "./tools/horoscope.js"

const server = new McpServer({
    name: "mcp-tuvi",
    version: "1.0.0",
})

registerHoroscopeTools(server)

async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error("MCP server started: mcp-tuvi v1.0.0")
}

main()
