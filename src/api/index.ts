import * as http from "http";
import * as url from "url";
import { addTime, deleteTime, getPricesFromTimeId } from "./times";

const PORT = 3000;
const CONTENT_TYPE_JSON: Record<string, string> = { "Content-Type": "application/json" };

const server = http.createServer(async (req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);
  await routeRequests(req, res, parsedUrl);
});

const routeRequests = async (req: http.IncomingMessage, res: http.ServerResponse, parsedUrl: url.UrlWithStringQuery) => {
  if (!parsedUrl.pathname) {
    sendResponse(res, 400, CONTENT_TYPE_JSON, { error: "No route available" });
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname.match(/time\/([0-9]+)\/prices/) !== null) {
    await getPricesFromTimeId(req, res);
  } else if (req.method === "POST" && parsedUrl.pathname.match(/time\/add/) !== null) {
    await addTime(req, res);
  } else if (req.method === "DELETE" && parsedUrl.pathname.match(/time\/([0-9]+)/) !== null) {
    await deleteTime(req, res);
  } else {
    // Return a 404 response if the method is not allowed
    sendResponse(res, 404, CONTENT_TYPE_JSON, { error: "Method not allowed" });
  }
};

const sendResponse = (res: http.ServerResponse, statusCode: number, contentType: Record<string, string>, data: any) => {
  res.writeHead(statusCode, contentType);
  res.end(JSON.stringify(data));
};

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Product server listening on ${PORT}`);
});
