//bigSquare is the variable containing the big div-Container which contains the smaller 100x1ßß grid of squares
let bigSquare = document.getElementById("bigger square");
//containers is a 2D-Array holding references to the 100x100 div-Container.
let containers = [];
//fields is a 2D-Array holding references to objects of the class Field.
let fields = [];

//declaration of an RNG value for global scope
let myRNG;

/*The class field contains one div-container from containers[] and the containers type
type(colour)changes are made through this class
type is instantly set to gras since it's the default type*/
class Field{
    constructor(pContainer){
        this.type = "gras";
        this.container = pContainer;
        this.special = false;
    }

    changeType(pNewType){
        this.container.classList.remove(this.type);
        this.container.classList.add(pNewType);
        this.type = pNewType
    }
}

//here the 100x100 containers are being made, saved into containers[] then given to new Field-objects which are then put into fields[]
for(let i = 0;i<100;i++){
    let horizontalContainerArray = [];
    let horizontalFieldsArray = [];
    for(let j=0; j<100; j++){
        let newDiv = document.createElement("div");
        newDiv.innerHTML = " ";
        newDiv.classList.add("square");
        newDiv.classList.add("gras");
        bigSquare.appendChild(newDiv);
        horizontalContainerArray[j] = newDiv;
        horizontalFieldsArray[j] = new Field(newDiv);   
    }
    containers[i] = horizontalContainerArray;
    fields[i] = horizontalFieldsArray;
    let newDiv = document.createElement("div");
    newDiv.innerHTML = " ";
    newDiv.classList.add("clear");
    bigSquare.appendChild(newDiv);
}



//the generate method calls the generation layers and manages minor stuff 
//like the pseudo-random number generator
//a seed based number generator is used to get the same results for the same seed everytime
function generate(){
    clearAll();
    let seed = document.getElementById("seed").value;
    myRNG = new Math.seedrandom(seed.toString())
    noise.seed(seed);
    streets();
    areas();
    //endClear();
}

//if generate is called again the map needs to be reset
function clearAll(){
    for(let i = 0;i<100;i++){
        for(let j=0; j<100; j++){
            fields[i][j].changeType("gras");
        }
    }
}

//since the outer edges are not affected by the generation they are
//blanked out at the end  Doesnt work
function endClear(){
    for(let i=0 ; i<100;i++){
    for(let j=0 ; j<100; j++){
        if(i==0 || i==99 || j==0 || j==99){
            fields[i][j].changeType("border");
        }
    }
    }
    
}


//This method manages the creation of the street system and is Layer 1
function streets(){
    //first of all with help of Perlinnoise streets are spread
    for(let i = 0;i<100;i++){
        for(let j=0; j<100; j++){
            if(noise.perlin2(i/5,j/5) > 0.55){
                fields[i][j].changeType("street");
            }
        }
    }

    //this for loop discards of street bits that are one square big
    //due to it being based on neighbours the outer edges are not effected
    for(let i = 1;i<99;i++){
        for(let j=1; j<99; j++){

            if(fields[i-1][j].type == "gras" && fields[i+1][j].type == "gras" && 
            fields[i][j-1].type == "gras" && fields[i][j+1].type == "gras"){
            fields[i][j].changeType("gras");
            }
        }
    }

    /*streets are connected by having them expand, first each line gets
    scanned horizontally and has chance to expand to the sides until it hits another street
    or gets stopped by the cancelChance which increases with every step*/

    //expanding streets to the right
	for(let i = 1;i<99;i++){
        let cancelChance = 0;
        let cancelIncrease = 0.004;

        for(let j = 1;j<99;j++){
            if(fields[i][j-1].type == "street" && myRNG.quick() > cancelChance
            &&fields[i+1][j+1].type != "street" && fields[i-1][j+1].type != "street"){
                fields[i][j].changeType("street");
                cancelChance += cancelIncrease;
            }
            else{
                cancelChance = 0;
            }
        }
	}

    //expanding streets to the left
    for(let i = 98;i>0;i--){
        let cancelChance = 0;
        let cancelIncrease = 0.004;

        for(let j = 98;j>0;j--){
            if(fields[i][j+1].type == "street" && myRNG.quick() > cancelChance
            &&fields[i+1][j-1].type != "street" && fields[i-1][j-1].type != "street"){
                fields[i][j].changeType("street");
                cancelChance += cancelIncrease;
            }
            else{
                cancelChance = 0;
            }
        }
    }

    //from here on the streets will expand upward and then downward
    //here the street have a certain chance to expand upwards with the same rules as before
    for(let j = 1;j<99;j++){
        let cancelChance = 0;
        let cancelIncrease = 0.002;
        let verticalChance = 0.02;
        
        for(let i = 1;i<99;i++){
            if(fields[i+1][j].type == "street" && myRNG.quick() > cancelChance
            &&fields[i-1][j+1].type != "street" && fields[i-1][j-1].type != "street"
            && myRNG.quick() < verticalChance){
                let o = i;
                while(fields[o][j].type = "gras" && o>0 && myRNG.quick() > cancelChance){
                    fields[o][j].changeType("street");
                    cancelChance += cancelIncrease;
                    o--;
                }
            }
            else{
                cancelChance = 0;
            }
        }
	}

    //downwards
    for(let j = 98;j>0;j--){
        let cancelChance = 0;
        let cancelIncrease = 0.002;
        let verticalChance = 0.02;
        
        for(let i = 98;i>0;i--){
            if(fields[i-1][j].type == "street" && myRNG.quick() > cancelChance
            &&fields[i+1][j+1].type != "street" && fields[i+1][j-1].type != "street"
            && myRNG.quick() < verticalChance){
                let o = i;
                while(fields[o][j].type = "gras" && o<99 && myRNG.quick() > cancelChance){
                    fields[o][j].changeType("street");
                    cancelChance += cancelIncrease;
                    o++;
                }
            }
            else{
                cancelChance = 0;
            }
        }
	}

    //one square big streets are once again removed
    for(let i = 1;i<99;i++){
        for(let j=1; j<99; j++){

            if(fields[i-1][j].type == "gras" && fields[i+1][j].type == "gras" && 
            fields[i][j-1].type == "gras" && fields[i][j+1].type == "gras"){
            fields[i][j].changeType("gras");
            }
        }
    }
}

//In Layer 2 rough areas like forest, buildings and similar are set
function areas(){
    //all areas within two squares of streets are set to be building areas
    for(let i = 2; i<98; i++){
    for(let j = 2; j<98; j++){
        if(fields[i][j].type == "street"){
            for(let o=i-2; o<i+3; o++){
            for(let u=j-2; u<j+3; u++){
                if(fields[o][u].type != "street"){
                    fields[o][u].changeType("building");
                }        
            }
            }
        }
    }
    }

    //forest areas are set on every grass field not having a street/building
    //in its surroundings withing two squares
    //the search begins in a smaller radius to minimize errors
    for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        if (fields[i][j].type === "gras") {
            let obstruction = false;
            for (let radius = 1; radius <= 2; radius++) {
                for (let x = i - radius; x <= i + radius; x++) {
                for (let y = j - radius; y <= j + radius; y++) {
                    if (x >= 0 && x < 100 && y >= 0 && y < 100) {
                        if (fields[x][y].container.classList.contains("street")
                            || fields[x][y].container.classList.contains("building")) {
                            obstruction = true;
                            break;
                        }
                    }
                }
                    if (obstruction) break;
                }
                if (obstruction) break;
            }
            if (!obstruction) {
                fields[i][j].changeType("forest");
            }
        }
    }
    }

    //the procedure is repeated once again to place deep forest
    for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        if (fields[i][j].type === "forest") {
            let obstruction = false;
            for (let radius = 1; radius <= 2; radius++) {
                for (let x = i - radius; x <= i + radius; x++) {
                for (let y = j - radius; y <= j + radius; y++) {
                    if (x >= 0 && x < 100 && y >= 0 && y < 100) {
                        if (fields[x][y].container.classList.contains("gras")) {
                            obstruction = true;
                            break;
                        }
                    }
                }
                    if (obstruction) break;
                }
                    if (obstruction) break;
            }
            if (!obstruction) {
                fields[i][j].changeType("deepforest");
            }
        }
    }
    }

    
}

