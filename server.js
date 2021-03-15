const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');

const { PORT } = require('./data/config.json')

app.use(cors({origin: true}));
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

let users = [];
io.on('connect', socket => {

        socket.on('info', data => {
        const user = {
            id: socket.id,
            name: data.name,
            status: "online",
            image: "http://simpleicon.com/wp-content/uploads/user1.png",
            messages: [],
        };
        users.push(user);
        console.log(`A user has connected, current users: ${users.length}`);

        // Send the new user list to every user
        io.emit('usersArray', users);
    });

    socket.on('disconnect', () => {
        // Take every user except the one that just left
        users = users.filter(user => user.id !== socket.id);
        console.log(`A user has disconnected, current users: ${users.length}`);
        io.emit('usersArray', users);
    });

    // Route message
    socket.on('sendMessage', data => {
        const id = users.filter(user => user.id === data.id)[0].id;
        io.to(id).emit('receiveMessage', {id: socket.id, messageText: data.messageText});
    });
});

const port = process.env.PORT | PORT;
http.listen(port, () => {
    console.log(`Running on port ${port}`);
});