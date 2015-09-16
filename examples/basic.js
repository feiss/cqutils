// Basic sprite load & paint

app= playground(
{
	smoothing: false,
	width: 320,
	height: 200,
	container: document.getElementById('content'),
	
	create: function(){
		this.loadImages('monster');
	},
	ready: function(){
		this.monster= new Sprite(this.images.monster, this.center.x, this.center.y);
		this.monster.anchor.x= 0.5;
		this.monster.anchor.y= 0.5;
	},
	render: function(dt){
		this.layer.clear('#ffd0c0');
		this.layer.drawSprite(this.monster);
	}
}
);
