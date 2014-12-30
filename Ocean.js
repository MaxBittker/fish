
 

Ocean = (function() {
  // Constant properties for all Ocean displays
  // Possibly should be passable as a options hash, but instead making file-global
  var width = 100;
  var height = 100;
  var interval = 1000 / (10 /* fps */);

function fish(x, y){
         // Add object properties like this
         this.x = x;
         this.y = y;
         this.dx = 1;//smarter later
         this.dy = 1;
      }

      // Add methods like this.  All Person objects will be able to invoke this
      fish.prototype = {

        getClosestWall: function(){

        var wallpoint = [0,0];
        var workingvector = [0,0];

        if( this.x>(width/2) ) //on right side
          workingvector[0] = width-this.x;
        else
          workingvector[0] = -this.x; //on the left side

        if( this.y>(height/2) ) //on bottom side
          workingvector[1] = height-this.y;
        else
          workingvector[1] = -this.y;

        if( Math.abs(workingvector[0])<Math.abs(workingvector[1])) //closer to a vertical wall
        {
          wallpoint[0] = (workingvector[0]>0) ? width : 0;
          wallpoint[1] = this.y;
        }
        else //closer to a horizontal wall
        {
         wallpoint[1] = (workingvector[1]>0) ? height : 0;
         wallpoint[0] = this.x;
        }

        return(wallpoint);
        },

        getDistance: function(point){
        var distance = Math.sqrt(Math.pow((this.x - point[0]),2)+Math.pow((this.y- point[1]),2));
        return(distance);
        },

        swim: function(listOfFish) {
          var distance = [0,0];
         // var distance_x=0;
         // var distance_y=0;
          // var afish;
          // for afish in listOfFish
          //   {
          //     distance_x =(this.x-afish.x);
          //     distance_y =(this.y-afish.y);
          //     if( Math.sqrt(Math.pow(distance_x,2) + Math.pow(distance_y,2))<30 ) //closer than 10 units
          //       this.dx = (distance_x>0) ? 1 : -1; 
          //       this.dy = (distance_y>0) ? 1 : -1;
          //   }
          var tempFish;
          var closestThing; 
          var closestPoint; 
          var closestDistance = 999999; 

          for(var i=0; i<listOfFish.length; i++){
            tempFish = listOfFish[i];
           
            if( this.getDistance([tempFish.x,tempFish.y]) < closestDistance); //TODO delay sqrt for perfomance
              { closestDistance = this.getDistance([tempFish.x,tempFish.y]);
                closestThing = listOfFish[i];
              }

          }
          closestPoint = [closestThing.x,closestThing.y];

          wallpoint = this.getClosestWall();

          if(this.getDistance(wallpoint) <= closestDistance)
            closestPoint = wallpoint;
          theta = Math.atan(closestPoint[1],closestPoint[0]);
          degrees = ((theta * (180/Math.PI)) + 360 + 180 - (45/2) )%360; //pad, flip, offset, and convert
          segment = Math.floor(degrees/45); 

          switch(segment) {
              case 0:
                  this.dx =  1;
                  this.dy =  0;
                  break;
              case 1:
                  this.dx =  1;
                  this.dy =  1;
                  break;
              case 2:
                  this.dx =  0;
                  this.dy =  1;
                  break;
              case 3:
                  this.dx = -1;
                  this.dy = 1;
                  break;
              case 4:
                  this.dx = -1;
                  this.dy =  0;
                  break;
              case 5:
                  this.dx = -1;
                  this.dy = -1;
                  break;
              case 6:
                  this.dx =  0;
                  this.dy = -1;
                  break;
              case 7:
                  this.dx =  1;
                  this.dy = -1;
                  break;
              case 8:
                  this.dx =  1;
                  this.dy =  0;
                  break;
              default:
                   alert("code 9! alert!");
                   break;
          }


          // this.dx = (this.dx>0) ? 1 : -1; 
          // this.dy = (this.dy>0) ? 1 : -1;

          this.x += this.dx;
          this.y += this.dy;  
          },

        
        draw: function(imageData,scale){
          
            for (var sx = 0; sx < scale; sx++) {
            for (var sy = 0; sy < scale; sy++) {
              var i = (((this.y * scale + sy) * width * scale) + (this.x * scale + sx)) * 4;
              imageData.data[i]   = 255;
              imageData.data[i+1] = 255;
              imageData.data[i+2] = 000;
              imageData.data[i+3] = 255;      
            }
          }
        },

        spawn: function(listOfFish){
          var singleFish = new fish(this.x-this.dx,this.y-this.dy);
          listOfFish.push(singleFish);
        }

      };




  function init(number) {
    var listOfFish = [];
    var x = 50;
    var y = 50;

    for (var i = 0; i < number; i++) { //spawn n fish and add them to list
      x = Math.floor(Math.random()*(width-1));
      y = Math.floor(Math.random()*(height-1));
      //check if spot is full please
      
      var singleFish = new fish(x,y);

      listOfFish.push(singleFish);
      }

    return listOfFish;
    }

  function Ocean(equation, canvas) {
    this.Fishes    = init(155); // spawn new fish
    this.singleFish = new fish(50,50);
    this.canvas    = canvas;
    this.scale     = canvas.getAttribute('width') / width;
    this.context   = canvas.getContext('2d');
    this.imageData = this.context.createImageData(width * this.scale, height * this.scale);
    this.then      = +Date.now();
    this.frame     = 1;
    this.paused    = false;
  }


     

  Ocean.prototype = {
    play: function() {
      this.paused = false;
      this.step();
    },

    pause: function() {
      this.paused = true;
    },

    step: function() {
      // Rerun the step() function every animation frame
      if (this.paused) return;
      requestAnimFrame(this.step.bind(this));

      var now = +Date.now();
      var delta = now - this.then;
      if (delta > interval) {
        this.then = now;
        this.drawFrame();
        this.frame++;
      }
    },

    drawFish: function(x,y,color) {
      // Rerun the step() function every animation frame
       for (var sx = 0; sx < this.scale; sx++) {
            for (var sy = 0; sy < this.scale; sy++) {
              var i = (((y * this.scale + sy) * width * this.scale) + (x * this.scale + sx)) * 4;
              this.imageData.data[i]   = 100;
              this.imageData.data[i+1] = 255;
              this.imageData.data[i+2] = 000;
              this.imageData.data[i+3] = 255;      
            }
          }


    },

    drawFrame: function() {
      
      var data = this.imageData.data;

  
      /////////////old drawing code
      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          // Set the x, y, r and A variables
        
          // Get the color
          var color = ((x*y)*this.frame%100)+100;
          var R = (color & 0xff0000) >>> 16;
          var G = (color & 0x00ff00) >>> 8;
          var B = (color & 0x0000ff) >>> 0;

          for (var sx = 0; sx < this.scale; sx++) {
            for (var sy = 0; sy < this.scale; sy++) {
              var i = (((y * this.scale + sy) * width * this.scale) + (x * this.scale + sx)) * 4;
              this.imageData.data[i]   = R;
              this.imageData.data[i+1] = G;
              this.imageData.data[i+2] = B;
              this.imageData.data[i+3] = 255;
            }
          }
        }
      }

      var tempFish;

      for(var i=0; i<this.Fishes.length; i++){
        tempFish = this.Fishes[i];
        tempFish.swim(this.Fishes);
        this.drawFish(tempFish.x,tempFish.y,55555);
      }

      // this.singleFish.swim(1);
      
      // this.drawFish(this.singleFish.x,this.singleFish.y,55555);

     //  for (singleFish in this.Fishes)
     // { singleFish.swim(1);
     //  this.drawFish(singleFish.x,singleFish.y,55555);}
      //singleFish.draw(this.imageData.data,this.scale);
      //this.drawFish(22,22,55555);
       // var i = (((singleFish.y * this.scale + sy) * width * this.scale) + (singleFish.x * this.scale + sx)) * 4;
       //        this.imageData.data[i]   = 100;
       //        this.imageData.data[i+1] = 255;
       //        this.imageData.data[i+2] = 00;
       //        this.imageData.data[i+3] = 255;
    //  

      // ///////////////
      // this.Fishes[1].swim(1);
      // this.Fishes[1].draw(this.imageData.data,this.scale);

      // for (afish in this.Fishes)
      // {
      //   afish.swim(1);
      //   console.log( afish.x);
      //   afish.draw(data,this.scale);
      // }
      this.context.putImageData(this.imageData, 0, 0);
    }
  };

  var requestAnimFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 2000);
        };

  return Ocean;
})();
