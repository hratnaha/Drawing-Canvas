var mousePressed = false;
var lastX, lastY;
var ctx;
var ctx2;
var xArray = [];
var yArray = [];
var labelQuestion = ['What is this'];
var questions = ['Why did you draw this', 'How does this make you feel?'];
var labels = [];
var answers = [];
var xBox = [];
var yBox = [];
var wBox = [];
var hBox = [];
var index = 0;
var mode = ["Draw", "Circle", "Discuss"]; //needs to be set of strings
var img; //Image of canvas
//Bounding box width and height and last mousex, last mousey
var width, height;
var last_mousex, last_mousey;
var socket;

function InitThis() {
    ctx = document.getElementById('myCanvas').getContext("2d");
    ctx2 = document.getElementById('canvas2').getContext('2d');
    //Need to send identification number to the server as well
    socket = io();
    // socket.on('drawingmodedatabegin', begin);
    socket.on('drawingmodedatabegin', end);
    socket.on('labelmodedatabegin', submitLabel);
    socket.on('discussionmodedatabegin', outputInformation);
    
    $('#myCanvas').mousedown(function (e) {
        mousePressed = true;
        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
    });

    $('#myCanvas').mousemove(function (e) {
        if (mousePressed) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });

    $('#myCanvas').mouseup(function (e) {
        mousePressed = false;
    });
	    $('#myCanvas').mouseleave(function (e) {
        mousePressed = false;
    });
}

function Draw(x, y, isDown) {
	
    if (isDown) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = $('#selColor').val();
        ctx.lineWidth = $('#selWidth').val();
        ctx.lineJoin = "round";
        ctx.closePath();
        ctx.stroke();
        // socket.emit('drawing', {
        //     x: x,
        //     y: y
        // });
        xArray.push([x]);
        yArray.push([y]);
        // console.log(x, y);

    }

    lastX = x; lastY = y;
   	

}
	
function clearArea() {
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height); //clear canvas 1
    ctx2.clearRect(0,0,canvas2.width,canvas2.height); //clear canvas 2
    $("#canvas2").css("z-index", "0")
    $("#myCanvas").css("z-index", "1") //put drawing canvas over encapsulate canvas
    console.clear();//clear console
    $('#questions').val('');
    $('#answer').val('');
    document.getElementById('answer').readOnly = true;
}


function begin(){
    //Set Mode to "Draw"
    $("#canvas2").css("z-index", "0")
    $("#myCanvas").css("z-index", "1") //put drawing canvas over encapsulate canvas
    $('#questions').val('Draw Mode');
    var dt = new Date().getTime();
    var img = myCanvas.toDataURL();
    console.log(img);
    // socket.emit('drawingmodedatabegin', {
    //     PNG: img, 
    //     Timestamp: dt
    // });
    var DrawingModeData =  {
        PNG: img,
        Timestamp: dt
    };
    console.log(DrawingModeData)
}
function end(){
    $('#questions').val('');
    var dt = new Date().getTime();
    img = myCanvas.toDataURL();
    console.log(img);
    socket.emit('drawingmodedatabegin', {
        PNG: img, 
        Timestamp: dt
    });
    var DrawingModeData =  {
        PNG: img,
        Timestamp: dt
    };
    console.log(DrawingModeData);
    //Set Mode to Label
    
}

function circleObject() {
    //Check if mode is in label
    $('#questions').val('Label Mode');
    $("#canvas2").css("z-index", "1")
    $("#myCanvas").css("z-index", "0") //put encapsulate canvas over drawing canvas
    var canvasx = $(canvas2).offset().left;
    var canvasy = $(canvas2).offset().top;
    last_mousex = last_mousey = 0;
    var mousex = mousey = 0;
    var mousedown = false;

//Mousedown
    $(canvas2).on('mousedown', function(e) {
    last_mousex = parseInt(e.clientX-canvasx);
    last_mousey = parseInt(e.clientY-canvasy);
    mousedown = true;
    });

//Mouseup
    $(canvas2).on('mouseup', function(e) {
    mousedown = false;
    console.log(canvasx);
    console.log(canvasy);
    $('#questions').val(labelQuestion[0]);
    });

//Mousemove
    $(canvas2).on('mousemove', function(e) {
    mousex = parseInt(e.clientX-canvasx);
    mousey = parseInt(e.clientY-canvasy);
    if(mousedown) {
        ctx2.clearRect(0,0,canvas2.width,canvas2.height); //clear canvas
        ctx2.beginPath();
        width = mousex-last_mousex;
        height = mousey-last_mousey;
        ctx2.rect(last_mousex,last_mousey,width,height);
        ctx2.strokeStyle = 'black';
        ctx2.lineWidth = 10;
        ctx2.stroke();
    }
    //Output
    $('#output').html('current: '+mousex+', '+mousey+'<br/>last: '+last_mousex+', '+last_mousey+'<br/>mousedown: '+mousedown);
    });
    
}
//undo rectangle https://stackoverflow.com/questions/17150610/undo-redo-for-paint-program-canvas
function undo(){
    ctx2.clearRect(xBox[xBox.length -1], yBox[yBox.length -1], width, height);
    console.log('Rectangle cleared');
}

function submitLabel(){

	inputvalue = document.getElementById('answer').value;
    labels.push(inputvalue);
    xBox.push(last_mousex);
    yBox.push(last_mousey);
    wBox.push(Math.abs(width));
    hBox.push(Math.abs(height));
	$('#answer').val('');
    $('#questions').val('');
    img = myCanvas.toDataURL();
    socket.emit('labelmodedata', {
        Label: inputvalue,
        BoundingBox: {StartX: last_mousex, StartY: last_mousey, Width: Math.abs(width), Height: Math.abs(height)},
        PNG: img
    });
    var LabelModeData =  {
        Label: inputvalue,
        BoundingBox: {StartX: last_mousex, StartY: last_mousey, Width: Math.abs(width), Height: Math.abs(height)}, 
        PNG: img
    };
    //Emit from socket.io
    console.log(LabelModeData);
    ctx2.clearRect(0,0,canvas2.width,canvas2.height);
    console.log(labels);
    console.log('Start of Box at x: ' + xBox);
    console.log('Start of Box at y: ' + yBox);
    console.log('Width of Box: ' + wBox);
    console.log('Height of Box: ' + hBox);
}

// var counter = 0;
function conversationMode(){
    //Iterate over each label
    //on each label call outputInformation
    
    if (index < labels.length){
        
        $('#questions').val(questions[index]);
        ctx2.strokeRect(xBox[index], yBox[index], wBox[index], hBox[index]);
    }

    document.getElementById('submitButton').onclick = outputInformation;
    
    
}

function outputInformation(){
    
    answers.push($('#answer').val());
    socket.emit('discussionmodedata', {
        Label: labels[index],
        BoundingBox: {StartX: xBox[index], StartY: yBox[index], Width: wBox[index], Height: hBox[index]},
        Question: questions[index],
        Answer: answers[index] 
    });
    var DiscussionModeData = {
            Label: labels[index],
            BoundingBox: {StartX: xBox[index], StartY: yBox[index], Width: wBox[index], Height: hBox[index]},
            Question: questions[index],
            Answer: answers[index] 
    };
    console.log(DiscussionModeData);
    console.log(answers)
    console.log('Data has been outputted');
    $('answer').val('');
    ctx2.clearRect(0,0,canvas2.width, canvas2.height);
    index++;
    conversationMode();
    
    
}

// function submitAnswer(){
//     ctx2.rect(xBox[i], yBox[i], wBox[i], hBox[i]);
// ctx2.stroke();
// $('#questions').val(questions[1]);
//     answers.push($('#answer'.val()));
//     var DiscussionModeData = {
//             Label: labels[i],
//             BoundingBox: {StartX: xBox[i], StartY: yBox[i], Width: wBox[i], Height: hBox[i]},
//             Question: questions[i],
//             Answer: answers[i] 
//     };
//     console.log(DiscussionModeData);
//     ctx2.clearRect(0,0,canvas2.width, canvas2.height);
// }



