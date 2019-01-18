const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('drawingmodedatabegin', (data) => {
    let newData = JSON.stringify(data);
    fs.appendFile(__dirname + '/list.json', newData + "\n", (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  });
  socket.on('labelmodedata', (data) => {
    let newData = JSON.stringify(data);
    fs.appendFile(__dirname + '/list.json', newData + '\n', (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  });
  socket.on('discussionmodedata', (data) => {
    let newData = JSON.stringify(data);
    fs.appendFile(__dirname + '/list.json', newData + '\n', (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  });




};

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
