const redis = require("redis");
const RedisClient = redis.createClient();

const connectToRedis = async () => {
  await RedisClient.connect();
};

const quitRedis = async () => {
  await RedisClient.quit();
};

const incrTaskId = async () => {
  try {
    const taskId = await RedisClient.incr("task_id_counter");
    return taskId;
  } catch (error) {
    throw new Error("Error al generar el ID de la tarea.");
  }
};

const insertTask = async (task) => {
  try {
    await RedisClient.set(`task:${task.id}`, JSON.stringify(task));
  } catch (error) {
    throw new Error("Error insertando la tarea en redis");
  }
};

const getTasks = async () => {
  const tasks = await RedisClient.keys("task:*");
  return tasks;
};

const getItemFromKey = async (key) => {
  const item = await RedisClient.get(key);
  return item;
}

const delTask = async (taskId, onSuccess, onError) => {
  await RedisClient.del(`task:${taskId}`).then(onSuccess).catch(onError);
}

module.exports = {
  connectToRedis,
  incrTaskId,
  quitRedis,
  insertTask,
  getTasks,
  getItemFromKey,
  delTask,
  RedisClient,
};