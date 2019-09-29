// Базовые структуры
// точка
function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype.add = function(point) {
	return new Point(this.x + point.x, this.y + point.y);
}
// прямоугольник
function Box(p, w, h) {
	this.p = p;
	this.rd = p.add(new Point(w, h))

	this.w = w;
	this.h = h;
}
Box.prototype.intersect = function(box) {
	if(box instanceof Box) {
		return box.p.x <= this.rd.x && box.p.y <= this.rd.y && this.p.x <= box.rd.x && this.p.y <= box.rd.y;
	}

	return false;
}

// Воспомогательные методы контекста
CanvasRenderingContext2D.prototype.strokeBox = function(box) {
	this.strokeRect(box.p.x, box.p.y, box.w, box.h);
}
CanvasRenderingContext2D.prototype.fillBox = function(box) {
	this.fillRect(box.p.x, box.p.y, box.w, box.h);
}
CanvasRenderingContext2D.prototype.fillTextAtCenter = function(box, text) {
	this.fillText(text, (box.p.x + box.w / 2) , (box.p.y + box.h / 2));
}

// Коллайдеры
function Collider() {}
Collider.prototype.collided = notImplemented;
// BoxCollider - прямоугольный коллайдер
function BoxCollider(box) {
	this.box = box;
}
BoxCollider.prototype = Object.create(Collider.prototype);
BoxCollider.prototype.collided = function(collider) {
	if(collider instanceof BoxCollider) {
		return this.box.intersect(collider.box);
	}

	return false
}
// MouseCollider - коллайдер мыши
function MouseCollider(point) {
	BoxCollider.call(this, new Box(point, 1, 1));
}
MouseCollider.prototype = Object.create(BoxCollider.prototype);


// GameObject - базовый класс для всех игровых объектов
function GameObject() {}
var notImplemented = function() { throw new Error("method not implemented"); }
GameObject.prototype.update = notImplemented; // обновление состояния
GameObject.prototype.draw = notImplemented; // отрисовка
GameObject.prototype.isCollided = function(collider) {
	return this.collider.collided(collider);
}


// Базовые элементы управления
function Control() {
	this.zIndex = 0; // для порядка отрисовки
}
Control.prototype = Object.create(GameObject.prototype);
Control.prototype.click = notImplemented; // клик по объекту
Control.prototype.hint = notImplemented; // подсказка
// Кнопка
function Button(box, caption, hint) {
	this.collider = new BoxCollider(box);
	this._caption = caption;
	this._hint = hint;
	this.handlers = [];// for click
}
Button.prototype = Object.create(Control.prototype);
Button.prototype.hint = function() { return this._hint }
Button.prototype.setOnCLick = function(handler) { this.handlers.push(handler); }
Button.prototype.click = function() { this.handlers.forEach(h => h()) } 
Button.prototype.draw = function(context) { 
	context.save();

	context.strokeStyle = "grey";
	context.strokeBox(this.collider.box);

	context.fillStyle = "yellow";
	context.fillBox(this.collider.box);

	context.textAlign = "center";
	context.font = "15px sant-serif";
	context.fillStyle = "black";
	context.textBaseline = "middle";
	context.fillTextAtCenter(this.collider.box, this._caption);

	context.restore();
}
Button.prototype.update = function() {}


// Frame - игровое окно, например меню или режим боя
function Frame() {}
Frame.prototype = Object.create(GameObject.prototype);
Frame.prototype.mousemove = notImplemented;
Frame.prototype.click = notImplemented;

function MainFrame() {
	this.testButton = new Button(new Box(new Point(10, 10), 150, 20), "Test");
	this.testButton.setOnCLick(() => alert("test"))
}
MainFrame.prototype = Object.create(Frame.prototype);
MainFrame.prototype.mousemove = function(point) {
	if(this.testButton.isCollided(new MouseCollider(point))) {
		//
	}
}
MainFrame.prototype.click = function(point) {
	if(this.testButton.isCollided(new MouseCollider(point))) {
		this.testButton.click();
	}
}
MainFrame.prototype.update = function(deltaTime) {
	this.testButton.update(deltaTime)
}
MainFrame.prototype.draw = function(context) {
	this.testButton.draw(context);
}





// Game - главный класс игры
function Game() {
	const CANVAS_SELECTOR = "canvas#canvas";

	this.frame = new MainFrame();
	var canvas = document.querySelector(CANVAS_SELECTOR);
	canvas.onmousemove = event => this.mousemove(event);
	canvas.onclick = event => this.click(event);


	this.context = canvas.getContext("2d");
}

// перемещение мыши
Game.prototype.mousemove = function(event) {
	var x = event.layerX, y = event.layerY;

	this.frame.mousemove(new Point(x, y));
}

// клики
Game.prototype.click = function(event) {
	var x = event.layerX, y = event.layerY;

	this.frame.click(new Point(x, y));
}

// loop - главный цикл
Game.prototype.loop = function() {
	var currTime = Date.now();
	this.frame.update((currTime - this.currTime) / 1000)
	this.frame.draw(this.context);
	this.currTime = currTime;

	requestAnimationFrame(() => this.loop())
}

// смена текущего фрейма
Game.prototype.changeFrame = function(frame) {
	var isFrame = frame instanceof Frame;

	console.assert(isFrame, "failed to change frame to non-frame object");

	if(isFrame) {
		this.frame = frame;
	}
}

// run - запуск игры
Game.prototype.run = function() {
	this.currTime = Date.now();
	this.loop();
}


var g = new Game();
g.run()
