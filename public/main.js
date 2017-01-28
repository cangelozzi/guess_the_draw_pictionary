var pictionary = function() {

    // variables needed
    var nickName = null;
    var canvas, context;
    var drawing = false;
    var drawerCtls = $('#drawer');
    var guessCtls = $('#guess');
    var isDrawer = false;

    // add message to the DOM
    var addMessage = function(message) {
        $('#messages').append('<div>' + message + '</div>');
    };
    
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
        context.fill();
    };

    var clearCanvas = function() {
        canvas[0].width = canvas[0].offsetWidth;
    };

    drawerCtls.hide();
    guessCtls.hide();

    // setup canvas 
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousemove', function(event) {
        if (!drawing  || !isDrawer) {return;}
        var offset = canvas.offset();
        var position = {x: event.pageX - offset.left, y: event.pageY - offset.top};
        draw(position);
        socket.emit('draw', position);
    });

    canvas.on('mousedown', function() {
        drawing = true;
    });

    canvas.on('mouseup', function(){
        drawing = false;
    });

    // get user's nickname and store
    while (!nickName) {
        nickName = window.prompt("Please enter your nickname:", "");
    }
    $('#nickName').html(nickName);

    var socket = io();

    socket.on('connected', function(drawList) {
        drawList.forEach(function(position) {
            draw(position);
        });
    });

    // register with the game server
    socket.emit('regUser', nickName);

    // handle the draw event
    socket.on('draw', draw);

    // handle the clear event
    socket.on('clear', clearCanvas);

    // handle game messages
    socket.on('gameMsg', function(msg) {
        addMessage(msg);
    });

    /*
        Handle the gameChanged event.  This is where the client
        will do most of its work.  We need to:
        1. Update player list (put an * by the drawer).
        2. Change the UI based on of client player type (drawer, guesser)
        3. Update the word on the drawer's controls
     */
    socket.on('gameChanged', function(gameInfo) {
        // update player list
        $('#playerList').empty();
        var html = "";
        for(var index in gameInfo.players) {
            if (gameInfo.players.hasOwnProperty(index)) {
                if (gameInfo.drawerID === index) {
                    html += "<li>" + gameInfo.players[index] + '*' + "</li>";
                } else {
                    html += "<li>" + gameInfo.players[index] + "</li>";
                }

            }
        }
        $('#playerList').html(html);

        // update drawer's word
        $('#drawerWord').html('Your word is ' + gameInfo.currentWord);
        // update isDrawer and UI components
        isDrawer = (gameInfo.drawerID === socket.id);

        if (isDrawer) {
            drawerCtls.show();
            guessCtls.hide();
        } else {
            drawerCtls.hide();
            guessCtls.show();
        }
    });


    // Guess box
    var guessBox = $('#guess input');
    guessBox.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        socket.emit('guess', guessBox.val());
        guessBox.val('');
    });


    // Clear canvas button
    $('#clearButton').on('click', function(){
        clearCanvas();
        socket.emit('clear');
    });

};



$(document).ready(function() {
    pictionary();
});