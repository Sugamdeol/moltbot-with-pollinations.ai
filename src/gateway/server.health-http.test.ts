import { createGatewayHttpServer } from "./server-http.js";
import { describe, expect, test, vi, afterAll } from "vitest";
import { AddressInfo } from "net";

vi.mock("../config/config.js", () => ({
  loadConfig: () => ({
    gateway: {
      trustedProxies: [],
    },
  }),
}));

// Mock other dependencies to avoid side effects or heavy imports
vi.mock("../canvas-host/a2ui.js", () => ({
  handleA2uiHttpRequest: async () => false,
}));
vi.mock("../slack/http/index.js", () => ({
  handleSlackHttpRequest: async () => false,
}));
vi.mock("./control-ui.js", () => ({
  handleControlUiAvatarRequest: () => false,
  handleControlUiHttpRequest: () => false,
}));
vi.mock("./openai-http.js", () => ({
  handleOpenAiHttpRequest: async () => false,
}));
vi.mock("./openresponses-http.js", () => ({
  handleOpenResponsesHttpRequest: async () => false,
}));
vi.mock("./tools-invoke-http.js", () => ({
  handleToolsInvokeHttpRequest: async () => false,
}));

describe("createGatewayHttpServer", () => {
  let server: ReturnType<typeof createGatewayHttpServer>;

  afterAll(() => {
    if (server) server.close();
  });

  test("GET /health returns 200 OK", async () => {
    server = createGatewayHttpServer({
      canvasHost: null,
      controlUiEnabled: false,
      controlUiBasePath: "",
      openAiChatCompletionsEnabled: false,
      openResponsesEnabled: false,
      handleHooksRequest: async () => false,
      resolvedAuth: { mode: "none", allowTailscale: false },
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const addr = server.address() as AddressInfo;
    const port = addr.port;

    const res = await fetch(`http://127.0.0.1:${port}/health`);

    // This is expected to fail initially as /health is not implemented
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
  });
});
