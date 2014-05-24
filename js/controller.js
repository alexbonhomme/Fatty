var fattyApp = angular.module('fattyApp', ['ngRoute']);

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

fattyApp.controller('mainController', function($scope) {
    $scope.sequences = [
    	{
    		id: 0,
    		exercice: 20,
    		rest: 0
    	},
    	{
    		id: 1
    	}
    ];

    $scope.addSequence = function() {
    	var sequenceId = $scope.sequences.length;
    	$scope.sequences.push({
    		id: sequenceId
    	});
    };

    $scope.showAddSequence = function(seq) {
    	return seq.id == $scope.sequences.length - 1;
    };

    $scope.showLabel = function(seq) {
    	return seq.id == 0;	
    };
});

fattyApp.controller('workoutController', function($scope, $http) {
	console.log($scope.sequences)
	$scope.sequences = $scope.sequences.filter(function (e) {
		return !isNaN(parseFloat(e.exercice));
	});

	console.log($scope.sequences)

	var generalCount = $scope.sequences.reduce(function (a, b) { 
		return {
			exercice: a.exercice + b.exercice, 
			rest: b.rest+ a.rest
		};
	});

	console.log(generalCount)

	clock = $('#general-counter').FlipClock(generalCount, {
        clockFace: 'MinuteCounter',
        countdown: true,
        callbacks: {
        	stop: function() {
        		$('.message').html('The clock has stopped!');
        	}
        }
    });
});