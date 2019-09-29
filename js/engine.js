const CANVAS_SELECTOR = "canvas#canvas";

function fillTextAt(context, text, x, y, w, h) {
	context.textAlign = "center";
	context.font = "15px sant-serif";
	context.fillStyle = "black";
	context.textBaseline = "middle";

	context.fillText(text, (x + w / 2) , (y + h / 2));
}

function boxCollided(box_x, box_y, box_w, box_h, x, y) {
	return x >= box_x && y >= box_y && (x - box_x) <= box_w && (y - box_y) <= box_h;
}

function CurrencyPanel(x, y, w, h, color, hintFormat, format) {
	this.color = color;

	this.format = format;
	this.hintFormat = hintFormat;
	this.currency = 0;

	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.replaceVars = function(formatString) {
		var replacement = [
			["{currency}", this.currency],
		];

		var res = formatString;

		replacement.forEach(r => res = res.replace(r[0], r[1]));
		return res;
	}

	this.getHint = function() {
		return this.replaceVars(this.hintFormat);
	}

	this.drawText = function(context) {
		context.save();

		var text = this.replaceVars(this.format);

		fillTextAt(context, text, this.x, this.y, this.w, this.h);

		context.restore();		
	}

	this.collided = function(x, y) {
		return boxCollided(this.x, this.y, this.w, this.h, x, y);
	}

	this.draw = function(context) {
		context.save();

		context.strokeStyle = "black";
		context.strokeRect(x, y, w, h);

		context.fillStyle = this.color;
		
		context.fillRect(x + 1, y + 1, (w - 2), h - 2);			

		this.drawText(context);
		
		context.restore();
	}

	this.update = function(deltaTime) {
	}
}

function Progress(x, y, w, h, color, hintFormat, format = "{percent}%") {
	this.current = 0;
	
	this.color = color;

	this.format = format;
	this.hintFormat = hintFormat;
	this.speed = 0;

	this.handlers = [];

	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.setOnFilled = function(func) {
		this.handlers.push(func);
	}

	this.onFilledIncrement = function(progress, delta) {
		this.setOnFilled(() => progress.increment(delta));
	}

	this.prettySpeed = function() {
		if(this.speed >= 1 || this.speed <= 0) {
			return parseInt(this.speed) + " bars/s";
		} else {
			return parseInt(1 / this.speed) + " s/bar";
		}
	}

	this.replaceVars = function(formatString) {
		var replacement = [
			["{percent}", parseInt(this.current * 100)],
			["{speed}", this.prettySpeed()],
		];

		var res = formatString;

		replacement.forEach(r => res = res.replace(r[0], r[1]));
		return res;
	}

	this.getHint = function() {
		return this.replaceVars(this.hintFormat);
	}

	this.drawText = function(context) {
		context.save();

		var text = this.replaceVars(this.format);

		fillTextAt(context, text, this.x, this.y, this.w, this.h);

		context.restore();		
	}

	this.collided = function(x, y) {
		return boxCollided(this.x, this.y, this.w, this.h, x, y);
	}

	this.draw = function(context) {
		context.save();

		context.strokeStyle = this.color;
		context.strokeRect(x, y, w, h);

		context.fillStyle = this.color;

		if(this.speed < 50) {
			context.fillRect(x + 2, y + 2, (w - 4) * this.current, h - 4);
		} else {
			context.fillRect(x + 2, y + 2, (w - 4), h - 4);			
		}
		this.drawText(context);
		
		context.restore();
	}

	this.update = function(deltaTime) {
		this.increment(this.speed * deltaTime);	
	}


	this.increment = function(delta) {
		this.current += delta;
		if(this.current < 0) this.current = 0;

		while(this.current >= 1) {
			this.handlers.forEach(func => func());
			this.current -= 1;
		}
	}
}

function Button(x, y, w, h, color, hintFormat, format) {
	this.color = color;

	this.format = format;
	this.hintFormat = hintFormat;

	this.handlers = []; // for click

	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.setOnClick = function(func) {
		this.handlers.push(func);
	}

	this.getHint = function() {
		return this.hintFormat;
	}

	this.drawText = function(context) {
		context.save();

		var text = this.format;

		fillTextAt(context, text, this.x, this.y, this.w, this.h);

		context.restore();		
	}

	this.collided = function(x, y) {
		return boxCollided(this.x, this.y, this.w, this.h, x, y);
	}

	this.click = function() {
		this.handlers.forEach(func => func());
	}

	this.draw = function(context) {
		context.save();

		context.strokeStyle = this.color;
		context.strokeRect(x, y, w, h);

		context.fillStyle = this.color;
		context.fillRect(x + 2, y + 2, w - 4, h - 4);

		this.drawText(context);
		
		context.restore();
	}

	this.update = function(deltaTime) {
	}
}

const panelCount = 3;
const barsCount = 3;
var objects = [
	new CurrencyPanel(15, 15, 180, 20, "red", "The 1st currency.", "{currency}"),
	new CurrencyPanel(200, 15, 180, 20, "green", "The 2st currency.", "{currency}"),
	new CurrencyPanel(385, 15, 180, 20, "blue", "The 3st currency.", "{currency}"),
	// progress bars
	new Progress(15, 45, 380, 20, "red", "The 1st of progress bars. Curent progress: {percent}%. Current speed: {speed}."),
	new Progress(15, 75, 380, 20, "green", "The 2nd of progress bars. Curent progress: {percent}%."),
	new Progress(15, 105, 380, 20, "blue", "The 3rd of progress bars. Curent progress: {percent}%."),
	// buttons
	new Button(420, 45, 20, 20, "red", "Upgrade first progress.", "+"),
];

var firstProgress = objects[3];
firstProgress.speed = 0.5;
firstProgress.setOnFilled(() => objects[0].currency++);

objects[6].setOnClick(function() {
	firstProgress.speed += 0.05
})

for(var i = 0; i < barsCount - 1; i++) {
	objects[panelCount + i].onFilledIncrement(objects[panelCount + i + 1], 0.01)
}


function showHint(context, hint) {
	function groupForRows(context, text, maxwidth) {
		var words = text.split(" "), buffer = "", res = [];

		for(var i = 0; i < words.length; i++) {
			if((context.measureText(buffer).width + context.measureText(words[i]).width) >= maxwidth) {
				res.push(buffer);
				buffer = "";
			}

			buffer += " " + words[i];
		}

		res.push(buffer);
		return res;
	}

	var x = mouse.x + 5, y = mouse.y + 5;
	const maxwidth = 250;
	var height = 0, width = maxwidth;

	context.save();
	
	context.font = "15px sant-serif";
	
	var rows = groupForRows(context, hint, width - 10);
	var measure = context.measureText(hint);

	height = rows.length * 20;

	context.strokeStyle = "black";
	context.fillStyle = "#ffff4f";

	context.strokeRect(x, y, width, height);
	context.fillRect(x, y, width, height);
	context.fillStyle = "black";

	for(var i = 0; i < rows.length; i++) {
		context.fillText(rows[i], x + 5 , y + 15 + i * 20);
	}

	context.restore();
}

function update(deltaTime) {
	objects.forEach(obj => obj.update(deltaTime));
}

function draw(context) {
	context.fillStyle = "white";
	context.clearRect(0, 0, 600, 600);

	objects.forEach(obj => obj.draw(context));

	if(focusedObject && focusedObject.getHint && focusedObject.getHint()) {
		showHint(context, focusedObject.getHint());
	}
}

var mouse = {x: 0, y: 0};
var focusedObject = null;

function onMouseMove(event) {
	mouse.x = event.layerX;
	mouse.y = event.layerY;

	focusedObject = objects.reduce((acc, obj) => {
		if(obj.collided(mouse.x, mouse.y)) {
			return obj;
		}

		return acc;
	}, null);
}

function onClick(event) {
	var clickedObject = objects.reduce((acc, obj) => {
		if(obj.collided(mouse.x, mouse.y)) {
			return obj;
		}

		return acc;
	}, null);

	if(clickedObject && clickedObject.click) {
		clickedObject.click();
	} 
}

// настраиваем тег канваса
var canvas = document.querySelector(CANVAS_SELECTOR);

canvas.onmousemove = onMouseMove;
canvas.onclick = onClick;
// получаем контекст
var ctx = canvas.getContext("2d");

function loop(prevTime) {
	var currTime = Date.now();
	update((currTime - prevTime) / 1000)
	draw(ctx);

	requestAnimationFrame(function() {
		loop(currTime)
	})
}

var currTime = Date.now();
loop(currTime);