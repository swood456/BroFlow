
var next_delay;

var SelectedBuilding;

function RandomSpawn () { //Finished code should take in an array such as BuildingOptions[] containing the objects/images it can choose between

	//Randomly determine a delay between calls, and call the function after that delay passes

	next_delay = GetRandomNum(1000, 3500); //Min and Max in milliseconds (1000 Milliseconds = 1 second)
	next_delay = Math.round(next_delay); //Round the delay to the nearest int

	console.log(next_delay); //Debug statement, outputs random delay

	//Insert Code here to handle selection of background object, as SelectedBuilding.

	setTimeout(RandomSpawn, next_delay /*, BuildingOptions */); //Set the function to be called again after the random delay passes


	//Code to Insert SelectedBuilding into gamespace. Should also apply anything such as movement properties to scroll with screen.

}

function GetRandomNum (min, max) { //This function handles finding a random number in a given min max range.
	return Math.random() * (max - min) + min; //Return a random number within the range of min and max
}