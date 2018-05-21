// CQUTILS - A set of additions to Playground/Canvasquery HTML5 libraries by @rezoner
// Copyright 2015 Diego F. Goberna - http://feiss.be
// It may be freely distributed under the MIT license.


Timer= function(){
	this.time= 0;
	this.table= {};
	this.paused= false;
	this.dt= 0;
}
Timer.prototype={
	step: function(dt){
		if (!this.paused){
			this.time+= dt;
			this.dt= dt;
		}
	},
	reset: function(){
		this.table= {};
		this.time= 0;
		this.dt= 0;
	},
	pause: function(p){
		this.paused= p===undefined?true:p;
	},
	resume: function(){
		this.paused= false;
	},
	on: function(){
		var args= arguments;
		if (args.length==1 && typeOf(args[0])=='array') args= args[0];
		for(var i=0; i<args.length; i++){
			if (this.time >= args[i])
				if (this.table[args[i]]===undefined){
					this.table[args[i]]= true;
					return 1;
				}
		}
		return 0;
	},
	fromDuring: function(start, duration){
		return saturate((this.time-start)/duration, 0, 1);
	},
	fromTo: function(start,end){
		return saturate((this.time-start)/(end-start), 0, 1);
	}
};


function saturate(n, min, max){
	var m= (min>n?min:n);
	return max<m?max:m;
}

function wrap(n, min, max){
	if (n>max) return min+((n-min)%(max+1-min));
	if (n<min) return min+((n+(max-min)-1)%(max+1-min)); //MAL
	return n;
}

function sequence(min,max,step){
	var s= [];
	if (!step) step= 1;
	for(var i=min; i<=max; i+= step) s.push(i);
	return s;
}

M= Math;
F= Math.floor;

function rand(n){
	return Math.floor(Math.random()*n);
}

function randc(n){
	return Math.floor(Math.random()*n)*(Math.random()<0.5?-1:1);
}


function frand(n){
	return Math.random()*n;
}

function frandc(n){
	return Math.random()*n*(Math.random()<0.5?-1:1);
}

function dist(x,y,xx,yy){
	var dx= x-xx, dy= y-yy;
	return Math.sqrt(dx*dx+dy*dy);
}
function dist2(x,y,xx,yy){
	var dx= x-xx, dy= y-yy;
	return dx*dx+dy*dy;
}

function intersection(x1,y1,w1,h1,x2,y2,w2,h2){
	//if point, rect of size 1
	if (arguments.length==6){
		w2= 1;
		h2= 1;
	}
	//array with point
	else if (arguments.length==3){
		var a= x1;
		x2= y1;
		y2= w1;
		w2= 1;
		h2= 1;
		x1= a[0];
		y1= a[1];
		w1= a[2];
		h1= a[3];
	}
	else if (arguments.length==2){
		var a= x1, b= y1;
		x1= a[0];
		y1= a[1];
		w1= a[2];
		h1= a[3];
		x2= b[0];
		y2= b[1];
		w2= b[2]===undefined?1:b[2];
		h2= b[3]===undefined?1:b[3];
	}
		
	return (x1<=x2+w2 && x1+w1>=x2 && y1<=y2+h2 && y1+h1>=y2);
}

function setCursor(h){
	app.layer.canvas.style.cursor= h;
}

var typeOf = function (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function atlasFromSpritesheet(img, numframes, fw, fh){
	var atlas= {image: img, frames: []};
	var nw= F(img.width/fw);
	for(var i= 0; i< numframes; i++){
		atlas.frames.push({
			region: [(i%nw)*fw, F(i/nw)*fh, fw, fh],
			offset: [0,0],
			width: fw,
			height: fh
		});
	}
	return atlas;
}

Sprite= function(img, x, y){
	this.isAtlas= false;
	this.img= null;
	switch(typeOf(img)){
		case 'array': this.img= img; break;
		case 'htmlimageelement': this.img= [img]; break;
		case 'object': this.img= img; this.isAtlas= true; break;
	}
	//public
	this.x= x || 0;
	this.y= y || 0;
	this.fliph= false;
	this.flipv= false;
	this.rotation= 0;
	this.anchor= {x:0, y:0};
	this.animspeed= 1;
	
	//private
	this.w= this.isAtlas?this.img.frames[0].width:this.img[0].width;
	this.h= this.isAtlas?this.img.frames[0].height:this.img[0].height;
	this._width= this.w;
	this._height= this.h;
	this.w2= F(this.w/2);
	this.h2= F(this.h/2);
	this._scalex= 1;
	this._scaley= 1;
	this.anims={};
	this.anim= '';
	this.currentframe= 0;
	this.frame= 0;
	this.t;
	
	this.debug= false;
}
Sprite.prototype= {
	tars: function(x,y,ax,ay,r,s){
		this.x= x;
		this.y= y;
		this.anchor.x= ax;
		this.anchor.y= ay;
		this.rotation= r;
		this._scalex= s;
		this._scaley= s;
	},
	getBoundingBox: function(){
		return [
			this.x-this.anchor.x*this.w,
			this.y-this.anchor.y*this.h,
			this.w,
			this.h
			];
	},
	scale: function(sx, sy){
		this._scalex= sx;
		this._scaley= sy || sx;
		this.w= this._width * this._scalex;
		this.h= this._height * this._scaley;
		this.w2= F(this.w/2);
		this.h2= F(this.h/2);
	},
	addAnimation: function(name, frames, loop, fps){
		if (!frames) frames= sequence(0, this.isAtlas?this.img.frames.length-1:this.img.length-1);
		this.anims[name]= {
			frames: frames,
			loop: loop || true,  
			fps: fps || 30
		};
	},
	play: function(name, frame){
		if (this.anims[name]===undefined) return;
		this.anim= name;
		this.currentframe= frame!==undefined?frame:0;
		this.t= 0;
	},
	step: function(dt){
		this.t+= dt*this.animspeed;
				
		var anim= this.anims[this.anim];
		if (dt>0 && this.t >= 1/anim.fps){
			this.t= 0;
			this.currentframe++;
			if (this.currentframe >= anim.frames.length){
				if (anim.loop) this.currentframe= 0;
				else this.currentframe= anim.frames.length;
			}
		}
		else if (dt<0 && this.t<= -1/anim.fps){
			this.t= 0;
			this.currentframe--;
			if (this.currentframe<0){
				if (anim.loop) this.currentframe= anim.frames.length-1;
				else this.currentframe= 0;
			} 
		}
		this.frame= anim.frames[this.currentframe];
	},
	hitTest: function(px, py){
		var x= this.x-this.w*this.anchor.x;
		var y= this.y-this.h*this.anchor.y;
		if (arguments.length==1)
			 return intersection(x, y, this.w, this.h, px.x, px.y, px.w, px.h);
		else return intersection(x, y, this.w, this.h, px, py);
	}
}

cq.Layer.prototype.drawSprite= function(spr){
	this.stars(
		spr.x,
		spr.y,
		spr.anchor.x,
		spr.anchor.y,
		spr.rotation, 
		spr._scalex*(spr.fliph?-1:1), 
		spr._scaley*(spr.flipv?-1:1)
		); 
	if (spr.isAtlas) 
		 this.drawAtlasFrame(spr.img, spr.frame, 0, 0);
	else this.drawImage(spr.img[spr.frame], 0, 0);
	
	this.restore();

	if (spr.debug){
		var bb= spr.getBoundingBox();
		this.strokeStyle('#fff').strokeRect(bb[0],bb[1],bb[2],bb[3]);
	}
	
	return this;
}


ParticleSystem= function(x, y, size, num, vx, vy, vvar, drag, gravity, color, colorvar, parsize, parsizevar, life, lifevar, respawn, delay){
	this.x= x||0;
	this.y= y||0;
	this.size= size||0;
	this.num= num||10;
	this.vx= vx||0;
	this.vy= vy||0;
	this.vvar= vvar||1;
	this.drag= drag||1;
	this.gravity= gravity||0;
	this.color= color||'#f00';
	this.colorvar= colorvar||.5;
	this.parsize= parsize||2;
	this.parsizevar= parsizevar||0;
	this.life= life||5;
	this.lifevar= lifevar||0;
	this.respawn= respawn||true;
	this.delay= delay||5;
	this.sprite= null;
	this.p= [];
	
	if (arguments.length==3 && typeof size=='object'){
		this.preset(arguments[2]);
	}
	this.init();
}
ParticleSystem.prototype={
	preset: function(p){
		for (var i in p) this[i]= p[i];
	},
	_initparticle: function(i){
		var p= this.p[i];
		p.x= this.x+frandc(this.size/2);
		p.y= this.y+frandc(this.size/2);
		p.vx= this.vx+frandc(this.vvar);
		p.vy= this.vy+frandc(this.vvar);
		p.color= cq.color(this.color).shiftHsl(M.random()*this.colorvar, M.random()*this.colorvar, M.random()*this.colorvar).toHex();
		p.size= M.max(1, F(this.parsize+frandc(this.parsizevar)));
		p.life= this.life+frand(this.lifevar)+M.random()*.1;
	},
	init: function(){
		for (var i=0; i< this.num; i++){
			this.p.push({id:i,x:0,y:0,vx:0,vy:0,color:0,size:0,life:0});
			this._initparticle(i);
			this.p[i].life+= this.delay*M.random();
		}
	},
	setSprite: function(spr){
		this.sprite= spr;
	},
	respawnAllDeath: function(){
		for (var i=0; i< this.num; i++){
			if (this.p[i].life<0){
				this._initparticle(i);
				this.p[i].life+= this.delay*M.random();
			}
		}
	},
	respawnRandom: function(n){
		for (var i=0; i< n; i++){
			var j= rand(n);
			this._initparticle(j);
			this.p[j].life+= this.delay*M.random();
		}
	},
	step: function(dt, func){
		var p;

		for (var i=0; i< this.num; i++){
			p= this.p[i];
			if (p.life<0) continue;
			p.life-= dt;
			if (p.life>this.life) continue;
			if (p.life<0){
				if (this.respawn) this._initparticle(i);
				continue;
			}
			p.x+= p.vx*dt;
			p.y+= p.vy*dt;
			p.vx*= this.drag;
			p.vy*= this.drag;
			if (func!== undefined) func(dt, p);
		}
	}
};

cq.Layer.prototype.drawParticleSystem= function(ps){
	for(var i= 0; i< ps.num; i++){
		var p= ps.p[i];
		if (p.life<0 || p.life > ps.life) continue;
		if (ps.sprite) this.a(p.life/ps.life).stars(p.x, p.y, 0.5, 0.5, 0, p.size/ps.size).drawImage(ps.sprite, 0,0).restore().ra();
		else this.a(p.life/ps.life).fillStyle(p.color).fillRect(p.x, p.y, F(p.size), F(p.size)).ra();
	}
	return this;
};

SmokeParticleSystem= {
	size: 10,
	num: 5,
	vx: 0,
	vy: -40,
	vvar: 20,
	drag: 1.01,
	gravity: 0,
	color: '#777',
	colorvar: .4,
	parsize: 10,
	parsizevar: 4,
	life: .5,
	lifevar: 0,
	respawn: false,
	delay: 0.1
};



function parseBitmapFont(image, letters, lwidth, bgcolor){
	var settings= {}, x1, x2, col, x1found, x2found;
	settings['image']= image;
	settings['spacewidth']= F(lwidth*.5);
	settings['letterspacing']= 1;
	settings['lineheight']= F(image.height*1.2);
	var img= cq(image.width, image.height).drawImage(image,0,0);
	for (var l in letters){
		//get bbox
		x1= l*lwidth;
		x2= x1+lwidth;
		x1found= x2found= false;
		for (var i= 0; i< lwidth; i++){
			for (var y= img.height-1; y>=0 ; y--){
				if (!x1found){
					col= img.getPixel(x1, y);
					if(!col.equalsTo(bgcolor)) x1found= true; 
				}
				if (!x2found){
					col= img.getPixel(x2, y);
					if(!col.equalsTo(bgcolor)) x2found= true; 
				}
				if(x1found && x2found) break;
			}		
			if(x1found && x2found) break;
			if (!x1found) x1++;
			if (!x2found) x2--;
		}
		
		if(!x1found || !x2found) continue;
		
		settings[letters[l]]= {
			x: x1, 
			y:0,
			width: x2-x1+1,
			height: img.height
		};
	}
	return settings;
}


cq.Color.prototype.equalsTo= function(c){
	return this[0]===c[0] && this[1]===c[1] && this[2]===c[2] && this[3]===c[3];
};

cq.Layer.prototype.print= function(fs, text, x, y, time){
	var px= x, py= y, c;
	var num= time===undefined?text.length: F(text.length*saturate(time,0,1));
	for(var i=0; i< num; i++){
		c= text[i];
		if (c===' ' || c==='\t'){
			px+= fs.spacewidth;
			continue;
		}
		if (c==='\n'){
			px= x;
			py+= fs.lineheight;
			continue;
		}
		c= fs[c];
		if (c===undefined) continue;
		this.drawRegion(fs.image, [c.x, c.y, c.width, c.height], px, py);
		px+= c.width+fs.letterspacing;
	}
	return this;
};


cq.Layer.prototype.addImage= function(l, x, y){
	this.globalCompositeOperation('lighter');
	this.drawImage(l, x, y);
	this.globalCompositeOperation('source-over');
	return this;
}
cq.Layer.prototype.mulImage= function(l, x, y){
	this.globalCompositeOperation('multiply');
	this.drawImage(l, x, y);
	this.globalCompositeOperation('source-over');
	return this;
}

function debug(){
	var txt= [];
	for (var i= 0; i< arguments.length; i++)
	{
		var a= arguments[i];
		switch(typeOf(a)){
			case 'array': txt.push( '['+a.join(', ')+']' ); break;
			case 'object': 
				var t= [];
				for (var j in a) t.push( j+' '+a[j]);
				txt.push('{'+t.join(', ')+'}');
				break;
			default: txt.push(a); break;
		}
	}
	txt= txt.join(' ');
	app.layer.font('10px arial').fillStyle('#fff').wrappedText(txt, 2,10, app.width);
}

TIME= window.performance&&window.performance.now?window.performance.now.bind(performance):Date.now;


// post production filters


function TintFilter(layer, color){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	this.filter= cq(layer.width, layer.height).clear(cq.color(color));
	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		this.layer.a(t).drawImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
};

//////////////////////////////////////////


function RealNoiseFilter(layer){
	this.intensity= 1;
	this.layer= layer;
	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		var im= this.layer.context.getImageData(0,0, this.layer.width, this.layer.height);
		var imd= im.data;
		var i, t2= 1-t, t= 255*t;
		for (i=0; i< imd.length; i+=4){
			imd[i  ]= Math.floor(imd[i  ]*t2 + M.random()*t);
			imd[i+1]= Math.floor(imd[i+1]*t2 + M.random()*t);
			imd[i+2]= Math.floor(imd[i+2]*t2 + M.random()*t);
		}
		this.layer.context.putImageData(im,0,0);
	}
}

//////////////////////////////////////////

function NoiseFilter(layer, numlayers){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	this.filters= [];
	if (numlayers==undefined || numlayers <1) numlayers=1;
	for (var j=0; j< numlayers; j++){
		var f= cq(layer.width, layer.height);
		var im= f.context.getImageData(0, 0, f.width, f.height);
		var imd= im.data;
		for (var i=0; i< imd.length; i+=4){
			imd[i  ]= F(M.random()*255);
			imd[i+1]= F(M.random()*255);
			imd[i+2]= F(M.random()*255);
			imd[i+3]= 255;
		}
		f.context.putImageData(im, 0, 0);
		this.filters.push(f);
	}
	this.filteri=0;

	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		this.layer.a(t).drawImage(this.filters[F(this.filteri)].canvas, 0, 0).ra();
		this.filteri= (this.filteri+1)%this.filters.length;
	}
}


//////////////////////////////////////////

function ScanlinesFilter(layer, color){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	this.filter= cq(layer.width, layer.height);
	this.filter.strokeStyle(cq.color(color||'#000')).lineWidth(1);
	for (var i=0.5; i< this.filter.height; i+=2){
		this.filter.strokeLine(0, i, this.filter.width, i);
	}
	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		this.layer.a(t).drawImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
}

//////////////////////////////////////////

function VignetteFilter(layer, radius, color){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	if (radius===undefined) radius= 0.5;
	if (color===undefined) color= cq.color('#000'); else color= cq.color(color);
	this.filter= cq(layer.width, layer.height);
	var w= app.center.x, h= app.center.y;
	var r= dist(0, 0, w, h);
	var gradient= this.filter.createRadialGradient(w, h, r, w, h, r*radius);
	gradient.addColorStop(0, color.toRgba());
	gradient.addColorStop(1, color.alpha(0).toRgba());
	this.filter.fillStyle(gradient);
	this.filter.fillRect(0, 0, layer.width, layer.height);


	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		this.layer.a(t).drawImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
}

//////////////////////////////////////////

function PixelateFilter(layer, pixelsize){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	if (pixelsize===undefined) pixelsize= 2;
	this.pixelsize= saturate(F(pixelsize), 1, layer.height);
	this.filter= cq(layer.width, layer.height);

	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		this.filter.drawImage(layer.canvas,0,0).resize(1/this.pixelsize).resize(this.pixelsize);
		this.layer.a(t).drawImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
}
//////////////////////////////////////////

function FastBlurFilter(layer, radius){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	if (radius===undefined) radius= 2;
	this.radius= saturate(F(radius), 1, layer.height);
	this.filter= cq(layer.width, layer.height);

	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		cq.smoothing= true;
		this.filter.drawImage(layer.canvas,0,0).resize(1/this.radius).resize(this.radius);
		cq.smoothing= false;
		this.layer.a(t).drawImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
}
//////////////////////////////////////////

function BlurFilter(layer, radius){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	if (radius===undefined) radius= 2;
	this.radius= saturate(F(radius), 1, layer.height);
	this.filter= cq(layer.width, layer.height);

	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		this.filter.drawImage(this.layer.canvas, 0, 0);
		stackBoxBlurCanvasRGBA(this.layer.context, 0, 0, this.filter.width, this.filter.height, this.radius, 2 );
		this.layer.a(t).drawImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
}
//////////////////////////////////////////

function BloomFilter(layer, radius, threshold){
	this.intensity= 1;
	this.layer= layer;
	this.mode= 'normal';
	if (radius===undefined) radius= 2;
	this.radius= saturate(F(radius), 1, layer.height);
	if (threshold===undefined) threshold= 128;
	this.threshold= saturate(threshold*3, 0, 255*3);
	this.filter= cq(layer.width, layer.height);

	this.render= function(intensity){
		var t= intensity===undefined? this.intensity: intensity;
		if (t<=0) return;
		//cq.smoothing= true;
		this.filter.drawImage(layer.canvas, 0, 0);//.resize(1/this.radius);
		//cq.smoothing= false;
		var im= this.filter.context.getImageData(0,0, this.filter.width, this.filter.height);
		var imd= im.data;
		var i;
		for (i=0; i< imd.length; i+=4){
			var l= (imd[i]+imd[i+1]+imd[i+2]);
			if (l<this.threshold){
				imd[i  ]= 0;
				imd[i+1]= 0;
				imd[i+2]= 0;
			}
/*			else{
				imd[i  ]= M.min(255, F(imd[i]*1.5));
				imd[i+1]= M.min(255, F(imd[i+1]*1.5));
				imd[i+2]= M.min(255, F(imd[i+2]*1.5));
			}
*/		}
		this.filter.context.putImageData(im,0,0);

		cq.smoothing= true;
		this.filter.resize(1/this.radius);
		//too slow.. :_(
		//stackBoxBlurCanvasRGBA(this.filter.context, 0, 0, this.filter.width, this.filter.height, 1, 1 );
		this.filter.resize(this.radius);
		cq.smoothing= false;

		this.layer.a(t).addImage(this.filter.canvas, 0, 0).ra();
//		this.layer.blend(this.filter, this.mode, t);
	}
}






/*

StackBoxBlur - a fast almost Box Blur For Canvas

Version: 	0.3
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
/*
var mul_table = [ 1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];
        
   
var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];
*/

var mul_table = [ 1,171,205,293,57,373,79,137,241,27,391,357,41,19,283,265,497,469,443,421,25,191,365,349,335,161,155,149,9,278,269,261,505,245,475,231,449,437,213,415,405,395,193,377,369,361,353,345,169,331,325,319,313,307,301,37,145,285,281,69,271,267,263,259,509,501,493,243,479,118,465,459,113,446,55,435,429,423,209,413,51,403,199,393,97,3,379,375,371,367,363,359,355,351,347,43,85,337,333,165,327,323,5,317,157,311,77,305,303,75,297,294,73,289,287,71,141,279,277,275,68,135,67,133,33,262,260,129,511,507,503,499,495,491,61,121,481,477,237,235,467,232,115,457,227,451,7,445,221,439,218,433,215,427,425,211,419,417,207,411,409,203,202,401,399,396,197,49,389,387,385,383,95,189,47,187,93,185,23,183,91,181,45,179,89,177,11,175,87,173,345,343,341,339,337,21,167,83,331,329,327,163,81,323,321,319,159,79,315,313,39,155,309,307,153,305,303,151,75,299,149,37,295,147,73,291,145,289,287,143,285,71,141,281,35,279,139,69,275,137,273,17,271,135,269,267,133,265,33,263,131,261,130,259,129,257,1];
        
   
var shg_table = [0,9,10,11,9,12,10,11,12,9,13,13,10,9,13,13,14,14,14,14,10,13,14,14,14,13,13,13,9,14,14,14,15,14,15,14,15,15,14,15,15,15,14,15,15,15,15,15,14,15,15,15,15,15,15,12,14,15,15,13,15,15,15,15,16,16,16,15,16,14,16,16,14,16,13,16,16,16,15,16,13,16,15,16,14,9,16,16,16,16,16,16,16,16,16,13,14,16,16,15,16,16,10,16,15,16,14,16,16,14,16,16,14,16,16,14,15,16,16,16,14,15,14,15,13,16,16,15,17,17,17,17,17,17,14,15,17,17,16,16,17,16,15,17,16,17,11,17,16,17,16,17,16,17,17,16,17,17,16,17,17,16,16,17,17,17,16,14,17,17,17,17,15,16,14,16,15,16,13,16,15,16,14,16,15,16,12,16,15,16,17,17,17,17,17,13,16,15,17,17,17,16,15,17,17,17,16,15,17,17,14,16,17,17,16,17,17,16,15,17,16,14,17,16,15,17,16,17,17,16,17,15,16,17,14,17,16,15,17,16,17,13,17,16,17,17,16,17,14,17,16,17,16,17,16,17,9
];




function stackBoxBlurCanvasRGBA( context, top_x, top_y, width, height, radius, iterations )
{
	if ( isNaN(radius) || radius < 1 ) return;
	radius |= 0;
	
	if ( isNaN(iterations) ) iterations = 1;
	iterations |= 0;
	if ( iterations > 3 ) iterations = 3;
	if ( iterations < 1 ) iterations = 1;
	
	var imageData = context.getImageData( top_x, top_y, width, height );
	var pixels = imageData.data;
			
	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, 
	r_out_sum, g_out_sum, b_out_sum, a_out_sum,
	r_in_sum, g_in_sum, b_in_sum, a_in_sum, 
	pr, pg, pb, pa, rbs;
			
	var div = radius + radius + 1;
	var w4 = width << 2;
	var widthMinus1  = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1  = radius + 1;
	
	var stackStart = new BlurStack();
	
	var stack = stackStart;
	for ( i = 1; i < div; i++ )
	{
		stack = stack.next = new BlurStack();
		if ( i == radiusPlus1 ) var stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null;
	
	
	
	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];
	while ( iterations-- > 0 ) {
		yw = yi = 0;
		for ( y = height; --y > -1; )
		{
			r_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_sum = radiusPlus1 * ( pb = pixels[yi+2] );
			a_sum = radiusPlus1 * ( pa = pixels[yi+3] );
			
			stack = stackStart;
			
			for( i = radiusPlus1; --i > -1; )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = pixels[p]);
				g_sum += ( stack.g = pixels[p+1]);
				b_sum += ( stack.b = pixels[p+2]);
				a_sum += ( stack.a = pixels[p+3]);
				
				stack = stack.next;
			}
			
			stackIn = stackStart;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi++] = (r_sum * mul_sum) >>> shg_sum;
				pixels[yi++] = (g_sum * mul_sum) >>> shg_sum;
				pixels[yi++] = (b_sum * mul_sum) >>> shg_sum;
				pixels[yi++] = (a_sum * mul_sum) >>> shg_sum;
				
				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
				
				r_sum -= stackIn.r - ( stackIn.r = pixels[p]);
				g_sum -= stackIn.g - ( stackIn.g = pixels[p+1]);
				b_sum -= stackIn.b - ( stackIn.b = pixels[p+2]);
				a_sum -= stackIn.a - ( stackIn.a = pixels[p+3]);
				
				stackIn = stackIn.next;
				
			}
			yw += width;
		}

		
		for ( x = 0; x < width; x++ )
		{
			yi = x << 2;
			
			r_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_sum = radiusPlus1 * ( pb = pixels[yi+2]);
			a_sum = radiusPlus1 * ( pa = pixels[yi+3]);
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}
			
			yp = width;
			
			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;
				
				r_sum += ( stack.r = pixels[yi]);
				g_sum += ( stack.g = pixels[yi+1]);
				b_sum += ( stack.b = pixels[yi+2]);
				a_sum += ( stack.a = pixels[yi+3]);
			   
				stack = stack.next;
			
				if( i < heightMinus1 )
				{
					yp += width;
				}
			}
			
			yi = x;
			stackIn = stackStart;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p+3] = pa =(a_sum * mul_sum) >>> shg_sum;
				if ( pa > 0 )
				{
					pa = 255 / pa;
					pixels[p]   = ((r_sum * mul_sum) >>> shg_sum ) * pa; 
					pixels[p+1] = ((g_sum * mul_sum) >>> shg_sum ) * pa;
					pixels[p+2] = ((b_sum * mul_sum) >>> shg_sum ) * pa;
				} else {
					pixels[p] = pixels[p+1] = pixels[p+2] = 0
				}
				
				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
				
				r_sum -= stackIn.r - ( stackIn.r = pixels[p]);
				g_sum -= stackIn.g - ( stackIn.g = pixels[p+1]);
				b_sum -= stackIn.b - ( stackIn.b = pixels[p+2]);
				a_sum -= stackIn.a - ( stackIn.a = pixels[p+3]);
			   
				stackIn = stackIn.next;
				
				yi += width;
			}
		}
	}
	context.putImageData( imageData, top_x, top_y );
}


function BlurStack()
{
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
	this.next = null;
}



