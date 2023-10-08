const express = require("express");
const { Pipeline } = require("./Pipelines/Pipeline");
const {
    checkTaskBody,
    formatBody,
    getTaskId,
    createTask,
    mergeTasks,
  } = require("./Filters/filters");
  const {
    connectToRedis,
    quitRedis,
    getTasks,
    getItemFromKey,
    delTask,
  } = require("./Access/redis");

  const app = express();
  const port = 3000;

  app.use(express.json());

  app.get("/api/tasks", async (req, res) => {
    try {
        await connectToRedis();

        const returnedTask = await getTasks();
        const tasks = [];

        returnedTask.forEach(async (key) => {
          const task = await getItemFromKey(key);
          tasks.push(task);
          if (tasks.length === returnedTask.length) {
            res.json(tasks);
          }
        });

        await quitRedis();
    } catch (error) {
      console.log("Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const { title, description, assigned } = req.body;

      const pipeline = new Pipeline();
      pipeline.use(checkTaskBody);

      pipeline.use(getTaskId);
      pipeline.use(formatBody);
      pipeline.use(createTask);
      const data = await pipeline.run({ title, description, assigned });

      return res.status(201).json(data);
    } catch (error) {
      console.log("Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/api/tasks/:taskId", async (req, res) => {
    const { taskId } = req.params;
    const updatedFields = req.body;
    console.log("updatedFields", updatedFields);
    console.log("taskId", taskId);

    const pipeline = new Pipeline();
    pipeline.use(checkTaskBody);

    pipeline.use(mergeTasks);
    pipeline.use(formatBody);
    pipeline.use(createTask);

    const data = await pipeline.run({ ...updatedFields, taskId });
    res.json(data);
  });

  app.delete("/api/tasks/:taskId", async (req, res) => {
    const { taskId } = req.params;
    await connectToRedis();

    await delTask(
      taskId,
      (result) => {
        if (result === 0) {
          return res.status(404).json({ error: "Tarea no encontrada." });
        }
        res.status(204).send();
      },
      (err) => {
        return res.status(500).json({ error: "Error al eliminar la tarea." });
      }
    );

    await quitRedis();
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });