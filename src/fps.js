"use strict";
/**
 * @author fonbah / https://github.com/fonbah/, @license MIT
 */

/**
 * @param params object
 */
var FPS = function(params){

	//RAF polifill
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

	//Canvas init
	var c = document.createElement('canvas');
	c.width = c.height = params.w;
	c.style.position = 'fixed';
	c.style.bottom = 0;
	c.style.right = '10px';
	c.style.zIndex = 9000;
	document.body.appendChild(c);
	var ctx = c.getContext('2d');

	//Size init
	var r = c.width > c.height ? c.height/2 : c.width/2,
		x = c.width/2,
		y = c.height/2;

	//Vars init
	//rate - default fps, coef - relative coefficient, etn - frame duration * coefficient
	var rate = 60,
	delta = 180/rate,
	coef = 1.02,
	etn = 1000/rate*coef,
	GR = Math.PI/180,
	GRV = GR*delta,
	stack = new Array(rate),
	stackAverage = new Array(rate),
	total = 0,
	//totalAverage = 0,
	prev = new Date();

	var raf;

	var scaling = (function (){

		//font size for rate val
		var fntSize = x/4,
		fntXoffset = x - fntSize*0.61,
		fntYoffset = y + fntSize/1.8;

		return function(f){

			ctx.clearRect(0, 0, c.width, c.height);

			var path = new Path2D();

			//Arrow line
			path.arc(x, y, r-r/10, -GRV*f, -GRV*f, false);
			path.lineTo(x, y);
			ctx.lineWidth = x > 200 ? x*0.012 : 2;
			ctx.strokeStyle = 'lime';
			ctx.stroke(path);

			//center
			path = new Path2D();
			path.arc(x, y, r-r/1.25, 0, Math.PI*2, true);			
			ctx.fillStyle = '#000'; ctx.fill(path);
			ctx.font = fntSize + "px arial";
			ctx.fillStyle = "lime";
		  	ctx.fillText(
		  		rate-f, 
		  		rate-f < 10 ? fntXoffset + fntSize/3.1 : fntXoffset, 
		  		fntYoffset
		  	);
		}
	})();

	this.start = function(){
		drawBack();
		run();
	};

	this.stop = function(){
		cancelAnimationFrame(raf);
		ctx.clearRect(0, 0, c.width, c.height);
		document.body.removeChild(c.previousSibling);
	};

	function run(){
		toStack(new Date() - prev);
		prev = new Date();
		scaling(rate-total);

		raf = requestAnimationFrame(run);

		//Stack data
		//container.innerHTML += (new Date()).getTime()+' '+total+' '+JSON.stringify(stackAverage)+'\n';
	}

	function toStack(a){
		while(a > etn){
			stack[0] = 0;
			stack.push(stack.shift());
			a-= etn;
		}

		stack[0] = 1;
		stack.push(stack.shift());

		stackAverage[0] = total = rangeReduce(stack);
		stackAverage.push(stackAverage.shift());

		//totalAverage = rangeReduce(stackAverage);
	}

	function rangeReduce(range){
		return range.reduce(function(sum, current){
			return sum + (current || 0);
		}, 0);
	}

	function drawBack(){

		var path = new Path2D();

		//Main
		path.arc(x, y, r, GR*40, GR*140, true);			
		ctx.fillStyle = 'black'; ctx.fill(path);

		//Main overlay
		path = new Path2D();
		path.arc(x, y, r-r/20, GR*35, GR*145, true);		
		ctx.fillStyle = '#fff'; ctx.fill(path);

		//Scale marks
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';

		for (var i = 1; i < rate; i++) {		
			path = new Path2D();
			path.arc(x, y, r-r/6, -GRV*i, -GRV*i, false);
			path.lineTo(x, y);
			ctx.stroke(path);
		};

		//Marks overlay
		path = new Path2D();
		path.arc(x, y, r-r/3.5, 0, Math.PI, true);			
		ctx.fillStyle = '#fff'; ctx.fill(path);

		//color ranges
		var pals = ['green', 'yellow', 'red'], palVals = [rate/100*84, rate/100*8, rate/100*8], di = 0;

		for (var i = 0; i < palVals.length; i++) {		
			path = new Path2D();
			path.arc(x, y, r-r/2.5, -GRV*di, -GRV*(palVals[i]+di), true);
			path.lineTo(x, y);
			di += palVals[i];
			ctx.fillStyle = pals[i];
			ctx.fill(path);		
		};

		//Colors range overlay
		path = new Path2D();
		path.arc(x, y, r-r/2, 0, Math.PI, true);			
		ctx.fillStyle = '#fff';
		ctx.fill(path);

		//Center overlay
		path = new Path2D();
		path.arc(x, y, r-r/1.65, GR*35, GR*145, true);	
		ctx.fillStyle = '#000'; ctx.fill(path);

		if(x>=100){
	  		//font size for scale
			var rw = r-x/9,
			fntSizeSmall = x/20, 
			fntSizeSmallxOffset = fntSizeSmall/2,
			gradeVal = rate/12;

			ctx.font = fntSizeSmall + "px arial";
			ctx.fillStyle = "black";

			ctx.fillText(0, x+rw*Math.cos(Math.PI) - fntSizeSmallxOffset, y+rw*Math.sin(Math.PI));

			for (var i = 1; i < 12; i++) {
				ctx.fillText(gradeVal*i, x+rw*Math.cos(GR*-(180-i*15))-fntSizeSmallxOffset, y+rw*Math.sin(GR*-(180-i*15)));
			}

			ctx.fillText(rate, x+rw*Math.cos(0)-fntSizeSmallxOffset, y+rw*Math.sin(0));
	  	}

		var img = new Image();
		img.src = c.toDataURL();

		img.width = img.height = c.width;
		img.style.position = 'fixed';
		img.style.bottom = c.style.bottom;
		img.style.right = c.style.right;
		img.style.width = c.width+'px';
		img.style.height = c.height+'px';
		document.body.insertBefore(img, c);
	}

};

if (typeof module === 'object'){
	module.exports = FPS;
}