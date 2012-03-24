var Card={ N:1, E:2, S:4, W:8, NE:3, NW:9, SE:6, SW: 12};
var States={ MOVING:1, STUNNED: 2, DEAD: 4 } ;
var Events={ ATTACK:1, SMOKE:2 };



var rand = function(max) {
	return Math.abs(Math.round(Math.random() * upper));
}