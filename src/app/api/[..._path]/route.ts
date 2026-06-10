const LANGGRAPH_API_URL = (process.env.LANGGRAPH_API_URL || "").replace(/\/+$/, "");
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY || "";

function buildUpstreamUrl(req: Request, pathSegments: string[]) {
  if (!LANGGRAPH_API_URL) {
    throw new Error("LANGGRAPH_API_URL is not configured");
  }

  const upstreamUrl = new URL(LANGGRAPH_API_URL);
  const upstreamBasePath = upstreamUrl.pathname.replace(/\/+$/, "");
  const extraPath = pathSegments.join("/").replace(/^\/+/, "");

  upstreamUrl.pathname = [upstreamBasePath, extraPath].filter(Boolean).join("/");
  upstreamUrl.search = new URL(req.url).search;

  return upstreamUrl;
}

async function proxyRequest(
  req: Request,
  pathSegments: string[],
): Promise<Response> {
  const upstreamUrl = buildUpstreamUrl(req, pathSegments);
  const headers = new Headers(req.headers);

  // Avoid forwarding browser auth headers or hop-by-hop headers upstream.
  headers.delete("authorization");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("host");
  headers.delete("x-api-key");
  headers.delete("x-auth-scheme");

  if (LANGSMITH_API_KEY) {
    headers.set("Authorization", `ApiKey ${LANGSMITH_API_KEY}`);
    headers.set("X-Api-Key", LANGSMITH_API_KEY);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstreamResponse = await fetch(upstreamUrl, init);
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  });
}

async function handleProxy(
  req: Request,
  params: Promise<{ _path: string[] }>,
) {
  const { _path } = await params;
  return proxyRequest(req, _path);
}

export const runtime = "edge";

export async function GET(
  req: Request,
  context: { params: Promise<{ _path: string[] }> },
) {
  return handleProxy(req, context.params);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ _path: string[] }> },
) {
  return handleProxy(req, context.params);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ _path: string[] }> },
) {
  return handleProxy(req, context.params);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ _path: string[] }> },
) {
  return handleProxy(req, context.params);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ _path: string[] }> },
) {
  return handleProxy(req, context.params);
}

export async function OPTIONS(
  req: Request,
  context: { params: Promise<{ _path: string[] }> },
) {
  return handleProxy(req, context.params);
}
