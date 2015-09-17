// Fun with filters. Click or tap for next filter

app= playground(
{
	smoothing: false,
	width: 355,
	height: 200,
	scale: 2,
	container: document.getElementById('content'),
	
	create: function(){
		this.loadImages('orionbg');
		this.filters=[
			new TintFilter(this.layer, '#00f'),
			new TintFilter(this.layer, '#f00'),
			new ScanlinesFilter(this.layer, '#000'),
			new NoiseFilter(this.layer)
		];
		this.filter= 0;
		this.t= 0;
		
		this.f= cq(100, 50).clear('#f00');

	},
	render: function(dt){
		this.t+= dt;
		this.layer.clear('#000');
		this.layer.drawImage(this.images.orionbg, 0, 0);
		this.filters[this.filter].render((M.sin(this.t*2)+1)/2);
//		this.layer.fillStyle('#fff').fillText(''+F((M.sin(this.t)+1)/2*10)/10, 10, 10);
	},
	pointerdown: function(ev){
		this.filter= (this.filter+1) % this.filters.length;
	}
}
);
