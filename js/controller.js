var fattyApp = angular.module('fattyApp', ['ngRoute']);

fattyApp.factory('Workout', function() {
	return {
		sequences: [
	    	{
	    		id: 0,
	    		exercice: 20,
	    		rest: 10
	    	},
	    	{
	    		id: 1
	    	}
		],
		rounds: {
			total: 1,
			rest: 60
		}
	}
});

// configure our routes
fattyApp.config(function($routeProvider) {
	$routeProvider

		// home page
		.when('/', {
			templateUrl : 'pages/home.html',
			controller  : 'mainController'
		})

        // report page
		.when('/workout', {
			templateUrl : 'pages/workout.html',
			controller  : 'workoutController'
		})
});

fattyApp.controller('mainController', function($scope, Workout) {
	$scope.workout = Workout;

    $scope.addSequence = function() {
    	var sequenceId = $scope.workout.sequences.length;
    	$scope.workout.sequences.push({
    		id: sequenceId
    	});
    };

    $scope.copySequence = function(seq) {
    	var sequenceId = $scope.workout.sequences.length;
    	$scope.workout.sequences.push({
    		id: sequenceId,
    		exercice: seq.exercice,
    		rest: seq.rest
    	});
    };

    $scope.showAddSequence = function(seq) {
    	return seq.id == $scope.workout.sequences.length - 1;
    };

    $scope.showLabel = function(seq) {
    	return seq.id == 0;	
    };
});

fattyApp.controller('workoutController', function($scope, $http, Workout) {
	$scope.workout = Workout;
	$scope.sequenceMessage = '';

	// prepare sounds
	var beep  = createBeeper("asset/beep.mp3");
	var bleep = createBeeper("asset/bleep.mp3");
	var tada  = createBeeper("asset/tada.mp3");


	/*
	 * Get the quote and display it
	 */
	$http.get("http://api.theysaidso.com/qod.json")
     	.success(function(data) {
            $scope.quote = {
            	text: data.contents.quote,
            	author: data.contents.author
            };
        })
        .error(function() {
            console.log("Unable to get the quote!");
        });

	/*
	 * Compute sequence duration
	 */
	var sequenceIdx = 0;

	// Clean sequences array
	var sequences = $scope.workout.sequences.filter(function (e) {
		return !isNaN(parseFloat(e.exercice));
	});

	var sequencesDuration = sequences
		.map(function (e) {
			if (isNaN(parseFloat(e.rest))) {
				e.rest = 0;
			}

			return e.exercice + e.rest;
		})
		.reduce(function (a, b) {
			return a + b;
		})
		// remove the last rest time
		- sequences[ sequences.length - 1].rest;

	/*
	 * Computes the total duration
	 */
	var roundIdx = 0;
	var rounds = $scope.workout.rounds;
	var totalDuration = (sequencesDuration * rounds.total) + (rounds.rest * (rounds.total - 1));

	/*
	 * Prepare general clock
	 */
	var generalCounter = $('#general-counter').FlipClock(totalDuration, {
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false
    });

    /*
     * Prepare sequence clock
     * Callback functions are used to edit
     * start & stop whitout recreat the clock
     */
    var callbacks = {
    	sequence: {
    		start: function() {},
    		stop: function() {}
    	}
    }
    var cbSequenceStart = function() {
    	callbacks.sequence.start();
    }

	var cbSequenceStop = function() {
    	callbacks.sequence.stop();
    }

    var sequenceCounter = $('#sequence-counter').FlipClock(0, {
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false,
        callbacks: {
        	start: cbSequenceStart,
        	stop:  cbSequenceStop
        }
    });


    /***********************
     * Functions
     ***********************/

	$scope.startWorkout = function() {
		generalCounter.start();
		nextSequence();
	};

	$scope.endWorkout = function() {
		setSequenceMessage('Bravo!')
		tada();
	};

	var setSequenceMessage = function(message) {
		$('#sequenceMessage').text(message);
	};

	var getQuote = function() {
		
	};

	/**
	 * Starts the next sequence or starts then next round 
	 * if all sequences are ended.
	 */
	var nextSequence = function() {
		if (hasSequence()) {
			// start next exercice and increment the sequence index
			var nextSequence = sequences[ sequenceIdx++ ];
			startExercice( nextSequence );
		} else {
			nextRound();
		}		
	};

	/**
	 * Starts the next round or ends the workout 
	 * if the last round is over.
	 */
	var nextRound = function() {
		if (hasNextRound()) {
			roundIdx++;
			sequenceIdx = 0;

			// round rest before run the next sequence
			startRest(rounds.rest, nextSequence);		
		} else {
			$scope.endWorkout();
		}
	}

	/**
	 * Starts exercice and start rest after counter ends, 
	 * or starts the next sequence if no rest
	 */
	var startExercice = function(sequence) {

		callbacks.sequence = {
			start: function() {
				setSequenceMessage('Exercice');
        		bleep();
        	},
        	stop: function() {
        		/*
        			For the last sequence we do only the 
        			round rest, not the sequence rest.
        			
        			/!\ This essential to take in case that 
        			the index is actually in the 'currrent sequence' + 1
        			position. That's why we test if there is one more sequence
				*/
        		if (hasSequence() && sequence.rest != 0) {
        			startRest(sequence.rest, nextSequence);
        		} else {
        			nextSequence();
        		}
        	}
		};

		sequenceCounter.setTime(sequence.exercice);
		sequenceCounter.start();
	};

	/**
	 * Start a rest period and run the 
	 * `next` function after the counter stop
	 */
	var startRest = function(duration, next) {
		callbacks.sequence = {
			start: function() {
				setSequenceMessage('Rest');
        		beep();
        	},
        	stop: function() {
        		next();
        	}
		};

		sequenceCounter.setTime(duration);
		sequenceCounter.start();
	};


	/*
	 * There is a sequence at idx
	 */
	var hasSequence = function() {
		return sequenceIdx < sequences.length;
	}

	/*
	 * There is one more round
	 */
	var hasNextRound = function() {
		return roundIdx < rounds.total - 1;
	}
});