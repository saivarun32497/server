
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/databaseConnection');
const { Server } = require('socket.io');
const http = require('http');
const cron = require('node-cron');
const moment = require('moment-timezone');
const Group = require('./models/groupsModel');
const userRoutes = require('./routes/userRoutes');
const PORT = 3500;
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  path: '/socket',
  wssEngine: ['ws', 'wss'],
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*',
  },
  allowEI03: true,
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('User Connected', socket.id);

  socket.on('message', ({ room, message }) => {
    console.log({ room, message });
    socket.to(room).emit('receive-message', message);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// Function to move timed content to group content
async function moveTimedContentToGroupContent() {
  try {
    const currentDate = moment().tz('Asia/Kolkata');

    // Fetch all groups
    const groups = await Group.find();

    for (const group of groups) {
      const updatedTimedGroupContent = [];
      let contentMoved = false;

      // Iterate through timedGroupContent of each group
      for (const content of group.timedGroupContent) {
        const dateToBeSentOn = moment.tz(content.dateToBeSentOn, 'YYYY-MM-DDTHH:mm', 'Asia/Kolkata');
        // Check if the current time matches the scheduled time for content
        if (currentDate.isSame(dateToBeSentOn, 'minute')) {
          group.groupContent.push({
            title: content.title,
            sentBy: content.sentBy,
            fileAddress: content.fileAddress,
            otherData: content.otherData,
            dateSent: currentDate.format('DD-MM-YYYY, dddd - HH:mm'),
          });
          contentMoved = true; // Indicate that content has been moved
        } else {
          updatedTimedGroupContent.push(content); // Retain non-moved content
        }
      }

      group.timedGroupContent = updatedTimedGroupContent; // Update the timedGroupContent
      await group.save(); // Save the updated group to the database

      // Emit message to the group using Socket.IO if content was moved
      if (contentMoved) {
        const groupIdString = group._id.toString();
        console.log(groupIdString);
        io.to(groupIdString).emit('receive-message', 'New content added to the group.');
      }
    }
  } catch (error) {
    console.error('Error in moveTimedContentToGroupContent:', error);
  }
}

// Cron job to run moveTimedContentToGroupContent every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  console.log('Running moveTimedContentToGroupContent cron job...');
  await moveTimedContentToGroupContent();
}, {
  timezone: 'Asia/Kolkata',
});

// Server listening
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running at port:', PORT);
});