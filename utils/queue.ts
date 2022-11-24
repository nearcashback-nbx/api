import { CloudTasksClient, protos } from "@google-cloud/tasks";
import config from "../config";

const client = new CloudTasksClient({
  credentials: {
    client_email: config.GOOGLE_SERVICE_ACCOUNT.EMAIL,
    private_key: config.GOOGLE_SERVICE_ACCOUNT.PRIVATE_KEY,
  },
});

export const addTaskToQueue = async (
  path: string,
  payload: Record<string, string | number | boolean>,
  delayInSeconds = 0
): Promise<void> => {
  const project = await client.getProjectId();
  const queue = config.QUEUE.NAME;

  const location = "europe-west3";

  const domain = config.QUEUE.DOMAIN;

  const url = new URL(`/queue/${path}`, domain);

  const parent: protos.google.cloud.tasks.v2.ICreateTaskRequest["parent"] =
    client.queuePath(project, location, queue);

  const task: protos.google.cloud.tasks.v2.ICreateTaskRequest["task"] = {
    httpRequest: {
      httpMethod: "POST",
      url: url.toString(),
      body: Buffer.from(JSON.stringify(payload)),
      headers: {
        ["Content-Type"]: "application/json",
        ["X-Queue-Auth"]: config.QUEUE.SECRET,
      },
    },
  };

  if (delayInSeconds > 0) {
    task.scheduleTime = {
      seconds: Date.now() / 1000 + delayInSeconds,
    };
  }

  const request = { parent, task };

  const [response] = await client.createTask(request);
  const name = response.name;

  console.log(`Created task ${name}`);
};
