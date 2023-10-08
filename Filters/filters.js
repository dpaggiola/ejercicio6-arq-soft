const {
  incrTaskId,
  connectToRedis,
  insertTask,
  quitRedis,
  getItemFromKey,
} = require("../Access/redis");

const checkTaskBody = (input) => {
  if (!input.title || !input.description || !input.assigned) {
    return new Error(
      "Los campos Título, Descripción y Asignado son obligatorios."
    );
  }
  return input;
};

const formatBody = (input) => {
  const formattedTitle = input.title.toUpperCase();
  const formattedDescription =
    input.description.charAt(0).toUpperCase() +
    input.description.slice(1) +
    ".";
  const creationDate = input?.creationDate ?? new Date().toISOString();
  const status = input?.status ?? "abierta";

  const task = {
    id: input.taskId,
    tittle: formattedTitle,
    description: formattedDescription,
    assigned: input.assigned,
    creationDate,
    status,
  };

  return task;
};

const mergeTasks = async (input) => {
  await connectToRedis();
  const task = await getItemFromKey(`task:${input.id}`);
  if (!task) {
    return new Error(
      "Los campos Título, Descripción y Asignado son obligatorios."
    );
  }
  const updatedTask = { ...JSON.parse(task), ...input };
  return updatedTask;
};

const getTaskId = async (input) => {
  await connectToRedis();
  const taskId = await incrTaskId();
  return { ...input, taskId };
};

const createTask = async (input) => {
  await insertTask(input);
  await quitRedis();
  return input;
};

module.exports = {
  checkTaskBody,
  formatBody,
  getTaskId,
  createTask,
  mergeTasks,
};
