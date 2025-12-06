const express = require("express");

const app = express();
const amqplib = require("amqplib");

const port = 4002;
const mongoose = require("mongoose");

app.use(express.json());

async function connectToMongo() {
  try {
    await mongoose.connect("mongodb://mongo:27017/notifications");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

connectToMongo();

const notificationSchema = new mongoose.Schema({
  message: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

let channel, connection;

async function connectToRabbitMQ(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqplib.connect("amqp://rabbitmq");
      channel = await connection.createChannel();
      await channel.assertQueue("task_created");
      console.log("Notification Service listening for task_created messages");

      channel.consume("task_created", async (msg) => {
        const task = JSON.parse(msg.content.toString());
        const notification = new Notification({
          message: `New task created: ${task.title}`,
          userId: task.userId,
        });
        await notification.save();
        console.log("Notification created for task:", task.title);
        channel.ack(msg);
      });

      return;
    } catch (error) {
      console.error("Failed to connect to Task Service RabbitMQ:", error);
      retries--;
      console.log(`Retries left: ${retries}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

app.get("/", (req, res) => {
  res.send("Notification Service");
});

app.listen(port, () => {
  console.log(`Notification Service is running on port ${port}`);
  connectToRabbitMQ();
});
