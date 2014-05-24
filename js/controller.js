var fattyApp = angular.module('fattyApp', ['ngRoute']);

fattyApp.factory('Workout', function() {
	return {
		sequences: [
	    	{
	    		id: 0,
	    		exercice: 20,
	    		rest: 0
	    	},
	    	{
	    		id: 1
	    	}
		],
		rounds: 1
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

	$scope.workout.sequences = $scope.workout.sequences.filter(function (e) {
		return !isNaN(parseFloat(e.exercice));
	});

	var sequences = $scope.workout.sequences;
	var generalCount = sequences
		.map(function (e) {
			if (isNaN(parseFloat(e.rest))) {
				e.rest = 0;
			}

			return e.exercice + e.rest;
		})
		.reduce(function (a, b) {
			return a + b;
		});

	clock = $('#general-counter').FlipClock(generalCount, {
        clockFace: 'MinuteCounter',
        countdown: true,
        callbacks: {
        	start: function() {
        		$('.message').html('The clock has started!');
        	},
        	stop: function() {
        		$('.message').html('The clock has stopped!');
        	}
        }
    });
});