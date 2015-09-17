// Fun with filters. Click or tap for next filter


var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position='absolute';
stats.domElement.style.left='170px';
document.body.appendChild( stats.domElement );
			

app= playground(
{
	smoothing: false,
	width: 355,
	height: 200,
	scale: 2,
	container: document.getElementById('content'),
	
	create: function(){
		this.loadImages('orionbg');
		var t= TIME();
		this.filters=[
			new BloomFilter(this.layer,8),
			new FastBlurFilter(this.layer,8),
			new PixelateFilter(this.layer,8),
			new VignetteFilter(this.layer, 0.3, '#f05'),
			new NoiseFilter(this.layer, 7+7),
			new RealNoiseFilter(this.layer),
			new TintFilter(this.layer, '#f0a'),
			new ScanlinesFilter(this.layer, '#222')
		];
		console.log((TIME()-t)+' ms. init');
		this.filter= 0;
		this.t= 0;
		
		this.f= cq(100, 50).clear('#f00');

	},
	render: function(dt){
		stats.begin();
		this.t+= dt;
		this.layer.clear('#000');
		this.layer.drawImage(this.images.orionbg, 0, 0);
		var t= (M.sin(this.t*2)+1)/2;
		if (this.filters[this.filter]['pixelsize']){
			this.filters[this.filter]['pixelsize']= F(2+t*16);
		}
		this.filters[this.filter].render(t);
		debug(this.filters[this.filter].constructor.name+' '+M.round(t*10)/10);
		stats.end();
	},
	pointerdown: function(ev){
		this.filter= (this.filter+1) % this.filters.length;
		this.t=0;
	}
}
);
