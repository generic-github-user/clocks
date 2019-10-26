circleNum = 200;
order = 2;
attraction = 2;
nStrength = 0.01;
mass = 0.1
radius = 3
color = 'hsla(50, 100%, 50%, 1)'

Physics(function(world){

  var viewWidth = 300;
  var viewHeight = 300;

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

  // add the renderer
  world.add( renderer );
  // render on each step
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
  
  
  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){
      world.step( time );
  });

  // start the ticker
  Physics.util.ticker.start();

});
