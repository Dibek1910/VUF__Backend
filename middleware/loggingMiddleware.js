/**
 * Middleware for logging API requests and responses
 */
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, body } = req;

  // Generate a unique request ID
  const requestId = Math.random().toString(36).substring(2, 10);

  // Log request
  console.log(
    `[${new Date().toISOString()}] [${requestId}] REQUEST: ${method} ${originalUrl} from ${ip}`
  );

  // Mask sensitive data like passwords
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) sanitizedBody.password = "********";
  if (Object.keys(sanitizedBody).length > 0) {
    console.log(
      `[${requestId}] REQUEST BODY: ${JSON.stringify(sanitizedBody)}`
    );
  }

  // Store original response methods
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);

  let statusCode = 200; // Default status code

  // Override status method
  res.status = function (code) {
    if (typeof code !== "number") {
      console.error(`[${requestId}] ERROR: Invalid status code - ${code}`);
      return originalStatus(500); // Default to 500 on invalid status
    }
    statusCode = code;
    return originalStatus(code);
  };

  // Helper function to log responses
  const logResponse = (body) => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] [${requestId}] RESPONSE: ${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`
    );

    let responseBody = body;
    if (typeof body === "string" && body.length > 500) {
      responseBody = body.substring(0, 500) + "... [truncated]";
    } else if (typeof body === "object") {
      responseBody =
        JSON.stringify(body).length > 500
          ? JSON.stringify(body).substring(0, 500) + "... [truncated]"
          : JSON.stringify(body);
    }

    console.log(`[${requestId}] RESPONSE BODY: ${responseBody}`);

    if (statusCode >= 400) {
      console.error(`[${requestId}] ERROR RESPONSE: ${responseBody}`);
    }
  };

  // Override send method
  res.send = function (body) {
    logResponse(body);
    return originalSend(body);
  };

  // Override json method
  res.json = function (body) {
    logResponse(body);
    return originalJson(body);
  };

  next();
};

module.exports = loggingMiddleware;
