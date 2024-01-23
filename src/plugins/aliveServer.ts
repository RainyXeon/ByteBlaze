import express from "express";
import logger from "./logger.js";
import express_status_monitor from "express-status-monitor";

export async function AliveServer() {
  const app = express();
  const config: any = (await import("./config.js")).default;
  const port = config.features.ALIVE_SERVER.port;

  app.use(
    express_status_monitor({
      title: "Dreamvast Realtime Status", // Default title
      path: "/",
      chartVisibility: {
        cpu: true,
        mem: true,
        load: false,
        heap: true,
        responseTime: false,
        rps: false,
        statusCodes: false,
      },
    }),
  );

  app.listen(port);

  logger.info(`Running alive server in port: ${port}`);
}
