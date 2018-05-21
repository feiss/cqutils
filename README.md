# cqutils

A set of additions to Playground/Canvasquery HTML5 libraries by @rezoner

## Functions

```javascript
saturate(n, min, max) //clamps number n between min, max
wrap(n, min, max)     //wraps n around min, max
sequence(min, max, step)   //returns array [min, min+step, ..., max]

rand(n)   // random integer [0, n)
randc(n)  // random integer (-n, n)
frand(n)  // random float   [0, n)
frandc(n) // random float   (-n, n)

dist (x, y, x', y')  // distance between (x,y) - (x',y')
dist2(x, y, x', y')  // distance^2 between (x,y) - (x',y')

//this intersection() functions return true or false
intersection(x,y,w,h, x',y',w',h') //between two rectangles
intersection(x,y,w,h, px,py) //between rectangle and point
intersection([x,y,w,h], px,py) //between rectangle (array format) and point
intersection(r1, r2)  //between two rectangles in array format (x,y,w,h)

//intersection between 2 sprites:
if (intersection(a.getBoundingBox(), b.getBoundingBox())) ...
//or:
if (a.hitTest(b)) ...


setCursor(name) //set canvas mouse pointer. [auto|none|pointer...]

typeOf(a) //better typeof

atlasFromSpritesheet(image, numframes, framewidth, frameheight) //returns atlas object from a spritesheet

/* 
parseBitmapfont() searches image for letters separated by lwidth pixels, trims horizontally based on bgcolor, and return font settings object:
{
	image,         //source image
	spacewidth     // width of space character. Default: lwidth*.5
	letterspacing, // default: 1
	lineheight,    // default image.height*1.2
	a:{x,y,width,height}, //an object for each letter
	b:{...}
	c:{...}
	...
}
*/
fontSettings= parseBitmapFont(image, letters, lwidth, bgcolor) 
app.layer.print(fontSettings, 'hello world!', 0, 0);

debug(...)  // preety prints arguments in screen
```

## Classes

### Timer

```javascript
t= new Timer()

t.time  //current time
t.dt    //last dt

t.step(dt)  //advance timer
t.reset()   //restart from 0
t.pause(p)  //pause (if p[true|false] not set, timer is paused)
t.resume()  //resume from pause

t.on(1,2,3...)  //returns true when timer hits giving seconds
t.fromDuring(start, duration)  //returns true if  start <= t.time <= start+duration
t.fromTo(start, end)  //returns true if start<= t.time <= end

```

### Sprite

Useful for managing animations

```javascript
s= new Sprite(img, x, y) //img can be a single image, an array of images, or an atlas. Initial position (x,y) optional

/** Properties: **/
s.x, s.y           // sprite position
s.fliph, s.flipv   // if true, flips horizontal or vertically
s.rotation         // in radians
s.anchor.x, s.anchor.y //position of the origin in the sprite (relative 0-1)
s.w, s.h           // width and height
s.w2, s.h2         // width/2 and height/2
s.animspeed        // relative speed factor for all animations
s.debug            // draws bounding box too

/** Methods: **/

s.tars(x, y, anchorx, anchory, rotation, scale) //to set all these values at once
s.getBoundingBox()   // returns array [x,y,w,h]
s.scale(sx, sy)      // sets horizontal and vertical scale (relative, 0-1)

s.addAnimation(name, frames, loop, fps) //adds new animation with specified frames (null or none for all frames). Loop is true by default, fps is 30
s.play(anim)    // starts and plays anim animation
s.step(dt)      // advances animation

s.hitTest(spr)     // collision test with another sprite
s.hitTest(px, py)  // collision test with point (x,y)

```

### ParticleSystem

Generic particle system manager

	
	
```javascript
ps= new ParticleSystem(x, y, size, num, vx, vy, vvar, drag, gravity, color, colorvar, parsize, parsizevar, life, lifevar, respawn, delay)
```
Where:
* x,y: source starting position (default: 0,0)
* size: source size (diameter, default: 0)
* num: max number of particles (default: 10)
* vx, vy: initial velocity (default: 0,0)
* vvar: initial velocity variance (vx+frandc(vvar), default: 1)
* drag: a/deceleration (1 for none, constant speed, default: 1)
* gravity: not used yet 
* color: initial color (default: #f00)
* colorvar: color variance (default: 0.5)
* parsize: initial particle size (default: 2)
* parsizevar: size variance (default: 0)
* life: living time of particles (default: 5)
* lifevar: life variance (default: 0)
* respawn: restart particle when dead (default: true)
* delay: seconds to wait before initial creation of particles (rand(delay), default, 5)

You can use presets:

```javascript
ps= new ParticleSystem(50, 50, SmokeParticleSystem);
```

Methods:
```javascript
ps.setSprite(spr)     //set particle sprite
ps.respawnAllDeath()  //restart all dead particles
ps.respawnRandom(n)   //restart n random particles (dead or alive)
ps.step(dt, func)     //advance particle system. Optional, a function(dt, particle)

```

## Canvasquery extensions
```javascript
app.layer.drawSprite(spr)
app.layer.drawParticleSystem(ps)
app.layer.print(fontsetting, text, x, y, time) // draws text using font settings. Time from [0-1]

cq.color.equalsTo(c)  //compares one color with another
```
