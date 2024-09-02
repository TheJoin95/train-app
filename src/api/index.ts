import * as http from "http";
import * as url from "url";
import { addTime, deleteTime, getPricesFromTimeId, getTimes } from "./times";

const PORT = 3000;
const CONTENT_TYPE_JSON: Record<string, string> = { "Content-Type": "application/json" };

const server = http.createServer(async (req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);
  console.log(`Receiving ${req.method} - ${req.url}`);
  await routeRequests(req, res, parsedUrl);
});

const routeRequests = async (req: http.IncomingMessage, res: http.ServerResponse, parsedUrl: url.UrlWithStringQuery) => {
  if (!parsedUrl.pathname) {
    sendResponse(res, 400, CONTENT_TYPE_JSON, { error: "No route available" });
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname.match(/times\/([\w]+)\/prices/) !== null) {
    await getPricesFromTimeId(req, res);
  } else if (req.method === "POST" && parsedUrl.pathname.match(/times\/add/) !== null) {
    await addTime(req, res);
  } else if (req.method === "DELETE" && parsedUrl.pathname.match(/times\/([\w]+)/) !== null) {
    await deleteTime(req, res);
  } else if (req.method === "GET" && parsedUrl.pathname.match(/times$/) !== null) {
    await getTimes(req, res);
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
  console.log(`Server listening on ${PORT}`);
});
