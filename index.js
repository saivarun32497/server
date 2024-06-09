const express = require('express');
const cors = require('cors');
const connectDB = require("./config/databaseConnection");
const { Server } = require('socket.io');
const http = require('http');
const cron = require('node-cron');
const moment = require('moment');
const Group = require('./models/groupsModel');
const PORT = 3000;
const app = express();
connectDB();

app.use(cors({ origin: 'https://creative-lolly-4e34fe.netlify.app' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.use(express.json());

// Importing REST API routes
const userRoutes = require('./routes/userRoutes');
app.use("/api/user", userRoutes);

// Function to move timed content to group content
async function moveTimedContentToGroupContent() {
  const currentDate = moment();
  
  // Fetch all groups
  const groups = await Group.find();
  
  for (const group of groups) {
    const updatedTimedGroupContent = [];
    
    // Iterate through timedGroupContent of each group
    for (const content of group.timedGroupContent) {
      const dateToBeSentOn = moment(content.dateToBeSentOn, 'YYYY-MM-DDTHH:mm');
      
      // Check if the current time matches the scheduled time for content
      if (currentDate.isSame(dateToBeSentOn, 'minute')) {
        group.groupContent.push({
          title: content.title,
          sentBy: content.sentBy,
          fileAddress: content.fileAddress,
          otherData: content.otherData,
          dateSent: currentDate.format('DD-MM-YYYY, dddd - HH:mm'),
        });
      } else {
        updatedTimedGroupContent.push(content); // Retain non-moved content
      }
    }
    
    group.timedGroupContent = updatedTimedGroupContent; // Update the timedGroupContent
    await group.save(); // Save the updated group to the database
    
    // Emit message to the group using Socket.IO
    const groupIdString = group._id.toString();
    console.log(groupIdString);
    io.to(groupIdString).emit("receive-message", "New content added to the group.");
  }
}

// Cron job to run moveTimedContentToGroupContent every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  console.log('Running moveTimedContentToGroupContent cron job...');
  await moveTimedContentToGroupContent();
}, {
  timezone: "Asia/Kolkata"
});

// Server listening
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running at port:", PORT);
});

