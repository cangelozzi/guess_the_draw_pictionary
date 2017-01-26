var pictionary = function () {
  var canvas, context;

  var draw = function (position) {
    context.beginPath();
    context.arc(position.x, position.y,
      6, 0, 2 * Math.PI);
    context.fill();
  };

  
  
  var drawing = false;

  canvas = $('canvas');
  context = canvas[0].getContext('2d');
  canvas[0].width = canvas[0].offsetWidth;
  canvas[0].height = canvas[0].offsetHeight;
  canvas.on('mousedown', function (event) {
    drawing = true;
  })
  canvas.on('mouseup', function (event) {
    drawing = false;
  })
  canvas.on('mousemove', function (event) {
    if (drawing) {
      var offset = canvas.offset();
      var position = {
        x: event.pageX - offset.left,
        y: event.pageY - offset.top
      };
      draw(position);
      console.log(position);
      socket.emit('draw', position);
    }
  });
  socket.on('position', draw);

  var guessBox;

  var onKeyDown = function (event) {
    if (event.keyCode != 13) { // Enter
      return;
    }

    console.log(guessBox.val());
    $('#word').html('The word is: ' + guessBox.val());
    var theGuess = guessBox.val();
    socket.emit('guess', guessBox.val());
    guessBox.val('');

  };
  guessBox = $('#guess input');
  guessBox.on('keydown', onKeyDown);
};



$(document).ready(function () {
  pictionary();
});