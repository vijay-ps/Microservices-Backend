const express = require("express");

const app = express();
const amqplib = require("amqplib");
const port = 4001;
const mongoose = require("mongoose");

app.use(express.json());

async function connectToMongo() {
  try {
    await mongoose.connect("mongodb://mongo:27017/tasks");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

connectToMongo();

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

let channel, connection;

async function connectToRabbitMQ(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqplib.connect("amqp://rabbitmq");
      channel = await connection.createChannel();
      await channel.assertQueue("task_created");
      console.log("Connected to RabbitMQ");
      return;
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      retries--;
      console.log(`Retries left: ${retries}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

app.get("/", (req, res) => {
  res.send("Task Service");
});

app.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    const message = {
      id: task._id,
      title: task.title,
      description: task.description,
      userId: task.userId,
      createdAt: task.createdAt,
    };

    if (!channel) {
      return res
        .status(503)
        .json({ error: "RabbitMQ channel is not established" });
    }

    channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)));
    console.log("Sent task_created message to RabbitMQ");

    res.status(201).send(task);
  } catch (error) {
    console.error("Failed to create task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).send(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.listen(port, () => {
  console.log(`Task Service is running on port ${port}`);
  connectToRabbitMQ();
});
