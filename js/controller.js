var fattyApp = angular.module('fattyApp', ['ngRoute']);

fattyApp.factory('Workout', function() {
	return {
		sequenceIdx: -1,
		sequences: [
	    	{
	    		id: 0,
	    		exercice: 10,
	    		rest: 10
	    	},
	    	{
	    		id: 1
	    	}
		],
		roundIdx: 0,
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

    $scope.showAddSequence = function(seq) {
    	return seq.id == $scope.workout.sequences.length - 1;
    };

    $scope.showLabel = function(seq) {
    	return seq.id == 0;	
    };
});

fattyApp.controller('workoutController', function($scope, $http, Workout) {
	$scope.workout = Workout;
	
	// prepare sounds
	$scope.beep = createBeeper("asset/beep.mp3");
	$scope.bleep = createBeeper("asset/bleep.mp3");
	$scope.tada = createBeeper("asset/tada.mp3");


	// Clean sequences array
	$scope.workout.sequences = $scope.workout.sequences.filter(function (e) {
		return !isNaN(parseFloat(e.exercice));
	});

	/*
	 * Compute sequence duration
	 */
	var sequences = $scope.workout.sequences;
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
	var rounds = $scope.workout.rounds;
	var totalDuration = (sequencesDuration * rounds.total) + (rounds.rest * (rounds.total - 1));

	// Prepare general clock
	$scope.generalCounter = $('#general-counter').FlipClock(totalDuration, {
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false
    });

    // Prepare sequence clock
    $scope.callbacks = {
    	sequence: {
    		start: function() {},
    		stop: function() {}
    	}
    }
    var cbSequenceStart = function() {
    	$scope.callbacks.sequence.start();
    }

	var cbSequenceStop = function() {
    	$scope.callbacks.sequence.stop();
    }

    $scope.sequenceCounter = $('#sequence-counter').FlipClock(0, {
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false,
        callbacks: {
        	start: cbSequenceStart,
        	stop:  cbSequenceStop
        }
    });



	$scope.startWorkout = function() {
		$scope.generalCounter.start();
		$scope.nextSequence();
	};

	$scope.endWorkout = function() {
		$scope.tada();
	};

	/**
	 * Starts the next sequence or starts then next round 
	 * if all sequences are ended.
	 */
	$scope.nextSequence = function() {
		if (hasNextSequence()) {
			// start next exercice and increment the sequence index
			var nextSequence = $scope.workout.sequences[ ++$scope.workout.sequenceIdx ];
			$scope.startExercice( nextSequence );
		} 

		// if we're already done the last sequence
		// start the next round
		else if (hasNextRound()) {
			// round rest before run the next round
			$scope.startRest($scope.workout.rounds.rest, $scope.nextRound);		
		} 

		// ends workout
		else {
			$scope.endWorkout();
		}
	};

	/**
	 * Starts the next round or ends the workout 
	 * if the last round is over.
	 */
	$scope.nextRound = function() {
		$scope.workout.roundIdx++;
		$scope.workout.sequenceIdx = 0;
		$scope.nextSequence();
	}

	/**
	 * Starts exercice and start rest after counter ends, 
	 * or starts the next sequence if no rest
	 */
	$scope.startExercice = function(sequence) {

		$scope.callbacks.sequence = {
			start: function() {
				//$scope.sequenceMessage = 'Exercice';
        		$scope.bleep();
        	},
        	stop: function() {
        		// for the last sequence we do only the 
        		// round rest, not the sequence rest
        		if (!isLastSequence() && sequence.rest != 0) {
        			$scope.startRest(sequence.rest, $scope.nextSequence);
        		} else {
        			$scope.nextSequence();
        		}
        	}
		};

		$scope.sequenceCounter.setTime(sequence.exercice);
		$scope.sequenceCounter.start();
	};

	/**
	 * Start a rest period and run the 
	 * `next` function after the counter stop
	 */
	$scope.startRest = function(duration, next) {
		$scope.callbacks.sequence = {
			start: function() {
				//$scope.sequenceMessage = 'Rest';
        		$scope.beep();
        	},
        	stop: function() {
        		next();
        	}
		};

		$scope.sequenceCounter.setTime(duration);
		$scope.sequenceCounter.start();
	};

	var isLastSequence = function() {
		return $scope.workout.sequenceIdx == $scope.workout.sequences.length - 1;
	}

	var isLastRound = function() {
		return $scope.workout.roundIdx == $scope.workout.rounds.total - 1;
	}

	var hasNextSequence = function() {
		return $scope.workout.sequenceIdx < $scope.workout.sequences.length - 1;
	}

	var hasNextRound = function() {
		return $scope.workout.roundIdx < $scope.workout.rounds.total - 1;
	}
});