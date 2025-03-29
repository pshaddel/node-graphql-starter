import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { userRouter } from "./user/user.route";
import "@total-typescript/ts-reset";
import client from "prom-client";
import http from 'node:http';
import { registerGraphQLServer } from "./graphql-server";

const app = express();
const httpServer = http.createServer(app);

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const metricsEndpoint = "/metrics";
app.get(metricsEndpoint, async (_req: Request, res: Response) => {
	res.set("Content-Type", client.register.contentType);
	res.end(await client.register.metrics());
});


app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((_req: Request, res: Response, next: NextFunction) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, AUTHORIZATION",
	);
	next();
});

app.get("/ping", (_req: Request, res: Response) => {
	res.send("pong");
});

app.get("/health", (_req: Request, res: Response) => {
	res.send("ok");
});

app.use(userRouter);

if (!config.isTestEnvironment) {
	(async () => {
		await registerGraphQLServer(app, httpServer);
		app.use((_, res) => {
			res.status(404).send("Not found");
		});
		// app.listen(config.port);
		await new Promise<void>(resolve => httpServer.listen({ port: config.port }, resolve));
		console.log(`🚀 Server ready at http://localhost:${config.port}/graphql`);
		console.info("🚀 Express App is listening on port:", config.port);
	})();
}

export { app };