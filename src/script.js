// Settings
circleNum = 200;
order = 2;
attraction = 2;
nStrength = 0.001;
mass = 0.1
radius = 3
color = 'hsla('+rand(0, 360)+', 100%, 50%, 1)'
viewWidth = 300;
viewHeight = 300;

//$('.js-tilt').tilt({
    //glare: true,
    //maxGlare: .5,
    //scale: 1.1,
	//maxTilt: 1,
	//perspective: 10000,
	//reset: false
//})

// Pick a random number between a minimum and maximum
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

Physics(function(world){
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
	world.add(renderer);
	world.on('step', function(){
		world.render();
	});

  // bounds of the window
  var viewportBounds = Physics.aabb(0, 0, 300, 300);

  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.99,
      cof: 0.99
  }));

  // ensure objects bounce when edge collision is detected
  world.add( Physics.behavior('body-impulse-response') );
  
  // create some bodies
    var circles = [];

    for ( var i = 0, l = circleNum; i < l; ++i ){
        circles.push(
            Physics.body('circle', {
                x: Math.random()*(300 - 10) + 10
                ,y: Math.random()*(300 - 10) + 10
                ,mass: mass
                ,radius: radius
                ,vx: Math.random()*0.01 - 0.005
                ,vy: Math.random()*0.01 - 0.005
                ,restitution: 0.99
                ,styles: {
                    fillStyle: color
                }
            })
        );
    }

    // add things to world
    world.add(circles);
	
	world.add(
		Physics.body('circle', {
			x: 300/2,
			y: 300/2,
			mass: 0.001,
			treatment: 'static',
			radius: 10,
			styles: {
				fillStyle: 'white'
			}
		})
	);
	
	secondHand = Physics.body('rectangle', {
			x: 300/2,
			y: 300/2,
			offset: Physics.vector(0, 50),
			mass: 0.001,
			treatment: 'kinematic',
			width: 2,
			height: 100,
			styles: {
				fillStyle: 'white'
			},
			//view: document.querySelector('#hands')
		});
	world.add(secondHand);
	
	minuteHand = Physics.body('rectangle', {
			x: 300/2,
			y: 300/2,
			offset: Physics.vector(0, 50),
			mass: 0.001,
			treatment: 'static',
			width: 5,
			height: 100,
			styles: {
				fillStyle: 'white'
			}
		});
	world.add(minuteHand);
	
	hourHand = Physics.body('rectangle', {
			x: 300/2,
			y: 300/2,
			offset: Physics.vector(0, 75/2),
			mass: 0.001,
			treatment: 'static',
			width: 8,
			height: 75,
			styles: {
				fillStyle: 'white'
			}
		});
	world.add(hourHand);

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
		d = new Date();
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
	})

	// start the ticker
	Physics.util.ticker.start();
});