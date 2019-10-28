rld.on('step', () => {
	  d = new Date();
	  //((d.getSeconds() + d.getMilliseconds()/1000) / 60)
	  secondHand.state.angular.pos = ((d.getSeconds() + d.getMilliseconds()/1000) / 60) * (6*Math.PI) + 3*Math.PI;
	  minuteHand.state.angular.pos = ((d.getMinutes() + d.getSeconds()/60) / 60) / (6*Math.PI) + 3*Math.PI;
	  hourHand.state.angular.pos = (d.getHours() + d.getMinutes()/60) / (6*Math.PI) + 3*Math.PI;
	  //secondHand.state.angular.pos = d / 1000 / 6
	  
	  //secondHand.state.angular.pos