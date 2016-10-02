var start_delay;
var next_delay

function RandomSpawn () {

	next_delay = GetRandomNum(1000, 4500); //Min and Max in milliseconds (1000 Milliseconds = 1 second)

	console.log(next_delay);

	setTimeout(RandomSpawn, next_delay); //Set the function to be called again after the random delay passes
}

function GetRandomNum (min, max) {
	return Math.random() * (max - min) + min; //Return a random number within the range of min and max
}