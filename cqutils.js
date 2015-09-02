
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
		thid.dt= 0;
	},
	pause: function(p){
		this.paused= p===undefined?true:p;
	},
	resume: function(){
		this.paused= false;
	},
	on: function(){
		for(var i=0; i<arguments.length; i++){
			if (this.time >= arguments[i])
				if (this.table[arguments[i]]===undefined){
					this.table[arguments[i]]= true;
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
