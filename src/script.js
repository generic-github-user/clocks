// Settings
circleNum = 200;
order = 0;
attraction = 2;
nStrength = 0.001;
mass = 0.1
radius = 3
color = randColor();
viewWidth = 300;
viewHeight = 300;
initVelocity = 0.1;
iv = initVelocity;
restitution = 0.99;

$('.js-tilt').tilt({
    glare: true,
    maxGlare: .1,
    scale: 1.1,
	maxTilt: 20,
	perspective: 500,
	reset: true
})

// Pick a random number between a minimum and maximum
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randColor() {
	return 'hsla('+rand(0, 360)+', 100%, 50%, 1)';
}

var renderer = Physics.renderer('canvas', {
	el: 'viewport',
	width: viewWidth,
	height: viewHeight,
	meta: false, // don't display meta data
	styles: {
		// set colors for the circle bodies
		'circle' : {
			strokeStyle: '#351024',
			lineWidth: 1,
			fillStyle: '#d33682',
			angleIndicator: '#351024'
		}
	}
});

Physics(function(world){
	// #
	handsLayer = renderer.addLayer('hands');
	dotLayer = renderer.addLayer('dot');
	
	world.add(renderer);
	world.on('step', function(){
		world.render();
	});

  // bounds of the window
  var viewportBounds = Physics.aabb(0, 0, 300, 300);

  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: restitution,
      cof: 0.99
  }));

  // ensure objects bounce when edge collision is detected
  world.add( Physics.behavior('body-impulse-response') );
  
	// create some bodies
	circles = [];

    for ( var i = 0, l = circleNum; i < l; ++i ){
        circles.push(
            Physics.body('circle', {
                x: rand(0, viewWidth),
                y: rand(0, viewHeight),
                mass: mass,
                radius: radius,
                vx: rand(-iv, iv),
                vy: rand(-iv, iv),
                restitution: restitution,
                styles: {
                    fillStyle: color
                }
            })
        );
    }

    // add things to world
    world.add(circles);
	
	dot = Physics.body('circle', {
			x: viewWidth/2,
			y: viewHeight/2,
			mass: 0.001,
			treatment: 'static',
			radius: 5,
			styles: {
				fillStyle: 'white'
			}
		})
	world.add(dot);
	
	var handInfo = {
		'name': ['second', 'minute', 'hour'],
		'width': [3, 5, 8],
		'length': [100, 100, 75],
		//'offset': [50, 50, 75/2]
	}
	
	for (var i = 0; i < 3; i ++) {
		handName = handInfo.name[i] + 'Hand';
		// hand
		window[handName] = Physics.body('rectangle', {
			x: viewWidth/2,
			y: viewHeight/2,
			offset: Physics.vector(0, handInfo.length[i] / 2),
			mass: 0.001,
			treatment: 'static',
			width: handInfo.width[i],
			height: handInfo.length[i],
			styles: {
				fillStyle: '#DDD'
			}
		});
		
		world.add(window[handName]);
	}

	// Add clock hands to hand layer
	handsLayer.addToStack([
		secondHand,
		minuteHand,
		hourHand
	]);
	// Add center dot to its own layer
	dotLayer.addToStack([dot]);
	
	// Only display particles on main rendering layer
	//renderer._layers.main.bodies = circles;
	//renderer._layers.main.removeFromStack([]);
	renderer._layers.main.addToStack(circles)
	
    // add some fun interaction
    var attractor = Physics.behavior('attractor', {
        order: order,
        strength: attraction
    });
    world.on({
        'interact:poke': function( pos ){
            world.wakeUpAll();
            attractor.position( pos );
            world.add( attractor );
        }
        ,'interact:move': function( pos ){
            attractor.position( pos );
        }
        ,'interact:release': function(){
            world.wakeUpAll();
            world.remove( attractor );
        }
    });

    // add things to the world
    world.add([
        Physics.behavior('newtonian', { strength: nStrength })
        ,Physics.behavior('sweep-prune')
        ,Physics.behavior('body-collision-detection', { checkAll: false })
        ,Physics.behavior('body-impulse-response')
        //,edgeBounce
    ]);
	
	// Don't let any physics bodies sleep
	world.options({
		sleepDisabled: true
	});
  
  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){
      world.step( time );
	  //secondHand.state.angular.set({'pos': 50});
	  //secondHand.state.pos.set(1, -1);
  });
  
	// Update positions of hands to match current time
	function updateHands() {
		// Get current time and date
		d = new Date();
		
		// Breakdown:
		// Current seconds: d.getSeconds()
		// Part of a second (for smooth motion): d.getMilliseconds()/1000
		// Composite second value: (d.getSeconds() + d.getMilliseconds()/1000) / 60)
		// Fraction of one minute : ((d.getSeconds() + d.getMilliseconds()/1000) / 60)
		// Value translated to rotation in radians: ((d.getSeconds() + d.getMilliseconds()/1000) / 60) * (2*Math.PI)
		// Radian value offset to display correctly: (d.getSeconds() + d.getMilliseconds()/1000) / 60) * (2*Math.PI) + Math.PI
		// This is extended to minutes and hours below
		
		secondHand.state.angular.pos = ((d.getSeconds() + d.getMilliseconds()/1000) / 60) * (2*Math.PI) + Math.PI;
		minuteHand.state.angular.pos = ((d.getMinutes() + d.getSeconds()/60) / 60) * (2*Math.PI) + Math.PI;
		hourHand.state.angular.pos = ((d.getHours() + d.getMinutes()/60) / 12) * (2*Math.PI) + Math.PI;
	}
	// Update physics
	world.on('step', () => {
		//((d.getSeconds() + d.getMilliseconds()/1000) / 60)

		secondHand.state.angular.vel = 0.000001;
		updateHands();

		//secondHand.state.angular.pos = d / 1000 / 6
		//secondHand.state.angular.pos
		
		//if (new Date().getSeconds() == 15) {
			
		//}
	})

	// start the ticker
	Physics.util.ticker.start();
});

function updateColors() {
	color = randColor();
	
	circles.forEach((circle) => {
		// See https://stackoverflow.com/a/48891494
		circle.styles.fillStyle = color;
		circle.view = null;
	});
}

function m(s) {
	return s * 1000;
}

// Without this logic, we would have to somehow call the function in the exact frame when the time changed to the next minute
// See https://stackoverflow.com/a/4455310
var now = new Date();
var wait = new Date(
	now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0
) - now;
// do we need this?
if (wait < 0) {
     wait += m(60);
}
// See https://stackoverflow.com/questions/4455282/call-a-javascript-function-at-a-specific-time-of-day#comment4867489_4455310
setTimeout(
	() => {
		updateColors(),
		setInterval(updateColors, m(60))
	},
	wait
);
