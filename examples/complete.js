// complete example with many things :P
// use cursors to move and jump. 
// f1/f2 to decrease/increase time speed
// r to reset time

var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position='absolute';
stats.domElement.style.left='160px';
document.body.appendChild( stats.domElement );
			
app= playground(
{
	smoothing: false,
	width: 320,
	height: 200,
	scale: 2,
	container: document.getElementById('content'),
	
	create: function(){
		this.loadImages('dude','glow','fontblue');
		this.loadAtlases('planet');
	},
	ready: function(){
		this.setState(Game);
	}
}
);

Game= {
x: this.app.center.x,
enter:function(){
	this.t= new Timer();
	this.speed= 1;
	this.bluefont= parseBitmapFont(this.app.images.fontblue, 'abcdefghijklmnopqrstuvwxyz0123456789.,?!', 20, cq.color([0,0,0,0]));
	this.planet= new Sprite(this.app.atlases.planet);
	this.planet.addAnimation('loop', null, true, 60);
	this.planet.play('loop');
	this.planet.tars(this.app.width-50, 50, 0.5, 0.5, 0, 0);
	
	this.filterintensity= 0;

	this.vy= 0;
	this.dude= new Sprite(atlasFromSpritesheet(this.app.images.dude, 27, 130, 150), 0, 205);
	this.dude.anchor.x= 0.5;
	this.dude.anchor.y= 1;
	this.dude.scale(0.5);
	this.dude.addAnimation('all', null, true, 30); 
	this.dude.addAnimation('jump', [0,1,2,1], true, 20);
	this.dude.play('all');
	
	this.R1= [0,0,80,50];
	this.R2= [150,80,30,80];
	
	this.ps= new ParticleSystem(50,50, SmokeParticleSystem);
	this.ps.setSprite(this.app.images.glow);
	
	this.steplist= [this.t, this.dude, this.planet, this.ps];
},
render:function(dt){
	stats.begin();
	
	dt*= this.speed;
	for (var i in this.steplist) this.steplist[i].step(dt);	
	
	this.dude.x= wrap(this.dude.x+dt*100*(this.dude.fliph?-1:1), -this.dude.w2, this.app.width+this.dude.w2);
	this.dude.y+= this.vy;
	if (this.vy!=0) this.vy+= 40*dt;
	if (this.vy > 0 && this.dude.y>205){
		this.dude.y= 205;
		this.ps.respawnAllDeath();
		this.ps.respawnRandom(2);
		this.dude.play('all', 6);
		this.vy= 0;
	}
	
	this.ps.x= this.dude.x+(this.dude.fliph?1:-1);
	this.ps.y= this.dude.y-8;
	
	this.planet.scale(0.3+M.abs(M.sin(this.t.time))*0.7);
	this.planet.rotation= this.t.time*3;

	this.app.layer
		.clear('#223')
		.print(this.bluefont, 'gamelib test', 2,2, this.t.fromDuring(1,2))
		.drawSprite(this.planet)
		.drawParticleSystem(this.ps)
		.drawSprite(this.dude)
		.print(this.bluefont, ''+this.dude.frame,1,180);

		if (this.t.on(sequence(2,10))){
			this.filterintensity= .5;
		}
		this.filterintensity= saturate(this.filterintensity-this.t.dt*3, 0, 1);
		this.app.layer.tint(this.filterintensity, 200,200,200);
		this.app.layer.noise(this.filterintensity);
		this.app.layer.scanlines(.2);
	
	if (intersection(this.dude.getBoundingBox(), this.planet.getBoundingBox()))
		debug('hit');
		
	stats.end();
},
keydown: function(ev){
	if (ev.key=='f1') this.speed-=.5;
	if (ev.key=='f2') this.speed+=.1;
	if (ev.key=='r') this.t.reset();
	if (ev.key=='left') this.dude.fliph= true;
	if (ev.key=='right') this.dude.fliph= false;
	if (ev.key=='up' && this.vy==0) {
		this.dude.play('jump');
		this.vy= -5;
	}
}
};
