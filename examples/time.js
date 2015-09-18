// Timer class
// click or tap to pause/resume

app= playground(
{
	smoothing: false,
	width: 320,
	height: 200,
	scale: 2,
	container: document.getElementById('content'),
	
	create: function(){
		this.loadImages('monster');
		this.t= new Timer();
		this.jump= 0;
	},
	ready: function(){
		this.monster= new Sprite(this.images.monster, 0, 50);
		this.monster.anchor.x= 0.5;
	},
	render: function(dt){
		this.t.step(dt);

		//between 0-10 animate monster's x. After that, reset time and start again
		if (this.t.fromDuring(0,10)<1){
			this.monster.x= this.center.x + M.sin(this.t.time*2)*100;
		}
		else this.t.reset();

		this.monster.y= 50-this.jump;

		//jump on exactly secs 2,3,4
		if (this.t.on(2,3,4)){
			this.jump= 30;
		}
		//intervals 2-3, 3-4, 5-10 s.
		var interval= this.t.fromTo(2,3);
		var interval2= this.t.fromDuring(3,1);
		var fading= this.t.fromDuring(5,5);

		//change global alpha from 5 to 10
		this.layer.a(fading==0? 1: fading);

		//clear in red from 2 to 3
		if (interval>0 && interval<1){
			this.layer.clear('#f00');
		}
		//clear in blue from 2 to 3
		else if (interval2>0 && interval2<1){
			this.layer.clear('#00f');
		}
		else{
			this.layer.clear('#ffd0c0');	
		} 

		this.layer.drawSprite(this.monster);
		
		this.layer.ra();
		
		this.jump= saturate(this.jump-3, 0,100);
	},
	pointerdown: function(ev){
		if (this.t.paused) this.t.resume(); else this.t.pause();
	}
}
);
