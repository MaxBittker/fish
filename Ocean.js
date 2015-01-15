


Ocean = (function() {
  // Constant properties for all Ocean displays
  // Possibly should be passable as a options hash, but instead making file-global
  var width = 100;
  var height = 100;

  var population = 5;
  var capacity = 120;
  var growthFactor = .6;
  var interval = 1000 / (20 /* fps */);
  var region = [6,13];
                     //   [-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4, 5, 6, 7] 
  var SegmentWrapLogicLUT=[ 1, 1, 1, 9,-1,-1,-1,0,1,1,1,9,-1,-1,-1];

  var Sprite=[[0,0,0,0,0, //(yes, this is what you think it is)
               1,0,1,1,0,
               1,1,1,1,1,
               1,0,1,1,0,
               0,0,0,0,0],//0

              [0,0,1,1,1,
               0,0,1,1,1,
               0,1,1,1,1,
               1,1,1,0,0,
               0,1,0,0,0],//1

              [0,0,1,0,0,
               0,1,1,1,0,
               0,1,1,1,0,
               0,0,1,0,0,
               0,1,1,1,0],//2//

              [1,1,1,0,0,
               1,1,1,0,0,
               1,1,1,1,0,
               0,0,1,1,1,
               0,0,0,1,0],//3//

              [0,0,0,0,0,
               0,1,1,0,1,
               1,1,1,1,1,
               0,1,1,0,1,
               0,0,0,0,0],//4//

              [0,0,0,1,0,
               0,0,1,1,1,
               1,1,1,1,0,
               1,1,1,0,0,
               1,1,1,0,0],//5//

              [0,1,1,1,0,
               0,0,1,0,0,
               0,1,1,1,0,
               0,1,1,1,0,
               0,0,1,0,0],//6//

              [0,1,0,0,0,
               1,1,1,0,0,
               0,1,1,1,1,
               0,0,1,1,1,
               0,0,1,1,1],//7
               ]

  window.addEventListener("keydown", onKeyDown, false);
  window.addEventListener("keyup", onKeyUp, false);

  var keyW = false;
  var keyA = false;
  var keyS = false;
  var keyD = false;

  var keyUp = false;   
  var keyLeft = false;
  var keyDown = false;
  var keyRight = false;


function onKeyDown(event) {
      var keyCode = event.keyCode;
       // console.log(keyCode);
      switch (keyCode) {
        case 68: //d
          keyD = true;
          break;
        case 83: //s
          keyS = true;
          break;
        case 65: //a
          keyA = true;
          break;
        case 87: //w
          keyW = true;
          break;
        case 39: //d
          keyRight = true;
          break;
        case 40: //s
          keyDown = true;
          break;
        case 37: //a
          keyLeft = true;
          break;
        case 38: //w
          keyUp = true;
          break;
      }
    }

    function onKeyUp(event) {
      var keyCode = event.keyCode;

      switch (keyCode) {
        case 68: //d
          keyD = false;
          break;
        case 83: //s
          keyS = false;
          break;
        case 65: //a
          keyA = false;
          break;
        case 87: //w
          keyW = false;
          break;
        case 39: //up
          keyRight = false;
          break;
        case 40: //down
          keyDown = false;
          break;
        case 37: //left
          keyLeft = false;
          break;
        case 38: //up
          keyUp = false;
          break;
      }
    }
    

     function decodeSegment(segment){
        var delta = [0,0];

        segment = (segment+8)%8;
          switch(segment) {
              case 0:
                  delta = [1,0];
                  break;
              case 1:
                  delta = [1,1];
                  break;
              case 2:
                  delta = [0,1];
                  break;
              case 3:
                  delta = [-1,1];
                  break;
              case 4:
                  delta = [-1,0];
                  break;
              case 5:
                  delta = [-1,-1];
                  break;
              case 6:
                  delta = [0,-1];
                  break;
              case 7:
                  delta = [1,-1];
                  break;
              case 8:
                  delta = [1,0];
                  break;
              default:
                   console.log("weirdsegment");
                   break;
          }

        return(delta);
        }




function fish(x, y, color){
         this.x = x;
         this.y = y;
         this.dx = -1;//smarter later
         this.dy = 1;
         this.segment =  Math.round((Math.random() * 100))%8;
         this.color = color;
          // console.log(this.color);
      } 

      fish.prototype = {

        getClosestWall: function(){

        var wallpoint = [0,0];
        var workingvector = [0,0];
        // var r = width/2
        // var theta = Math.atan2((this.y-r), (this.x-r));
        // wallpoint = [Math.round((r-2)*Math.cos(theta))+r,Math.round((r-2)*Math.sin(theta))+r];

        if( this.x > (width/2) ) //on right side
          workingvector[0] = width-this.x;
        else
          workingvector[0] = -this.x; //on the left side

        if( this.y > (height/2) ) //on bottom side
          workingvector[1] = height-this.y;
        else
          workingvector[1] = -this.y;

        if( Math.abs(workingvector[0]) < Math.abs(workingvector[1])) //closer to a vertical wall
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
        return(Math.sqrt(Math.pow((this.x - point[0]),2)+Math.pow((this.y- point[1]),2)));
        },

        swim: function(listOfFish, boats) {
          var distance = [0,0];
          var tempFish;
          var tempdistance;
          var closestThing = this; 
          var closestPoint; 
          var closestDistance = 999999; 
          var AngleOfAttack = 0; //180=away, 0 = towards, 90= perpendicularly


          var desiredSegment;
          var alone =false;

          var workingvector = [0,0];
          var sumvector =[0,0];
          var unitvector = [0,0]; 

          for(var i=0; i<listOfFish.length; i++){

            tempFish = listOfFish[i];

            if (tempFish === this)// || (this.getDistance([tempFish.x,tempFish.y]))>30 ) //skip myself
              continue;

            tempdistance = Math.round(this.getDistance([tempFish.x,tempFish.y]));

            if( tempdistance < closestDistance) //TODO delay sqrt for perfomance
              {
               
                if(tempdistance == 0 )
                  {
                    tempFish.x=tempFish.x+(Math.random()>.5 ? -1 : 1); //massage overlaps
                    tempFish.y=tempFish.y+(Math.random()>.5 ? -1 : 1);  //listOfFish.splice(i, 1);
                  }
                else
                  {
                    closestThing = listOfFish[i];
                    closestDistance = tempdistance;
                  }
              }
            workingvector = [0,0];
              if(tempdistance<region[1]){
            workingvector[0] = (this.x == tempFish.x) ?  0 :  Math.pow((this.x-tempFish.x)/10,-1);
            workingvector[1] = (this.y == tempFish.y) ?  0 :  Math.pow((this.y-tempFish.y)/10,-1);
              }
            switch (true) {
                case (tempdistance < region[0]):
                    sumvector[0] += workingvector[0]; //180 - away //friend too close on wv[0]=(-2), so we want to go left (-2)
                    sumvector[1] += workingvector[1];
                    break;
                case (tempdistance < region[1]): 
                    tempdirection = decodeSegment(tempFish.segment);
                    sumvector[0] += tempdirection[0] * Math.pow(tempdistance/2,-1); //friend is going right(1,0) so we are too
                    sumvector[1] += tempdirection[1] * Math.pow(tempdistance/2,-1);
                    break;
                case (tempdistance > (region[1]-1) )://do nothing
                    break;
                default:
                    alert("none");
                    break;
            }
            if(!isFinite(sumvector[0]) || !isFinite(sumvector[1]))
             alert(sumvector);


          }

          if(closestThing===this)
            alone =true;

          closestPoint = [closestThing.x,closestThing.y];

          wallpoint = this.getClosestWall();

           if(this.getDistance(wallpoint)<closestDistance)
            closestPoint = wallpoint;
          
           if(this.getDistance(wallpoint)<30)
             {
            sumvector[0] += (this.x == wallpoint[0]) ?  0 :  Math.pow((this.x-wallpoint[0])/10,-1)*4; 
            sumvector[1] += (this.y == wallpoint[1]) ?  0 :  Math.pow((this.y-wallpoint[1])/10,-1)*4;

            if(!isFinite(sumvector[0]) || !isFinite(sumvector[1]))
             alert(sumvector);
            }

          for(var i =0; i < boats.length;i++)
          {
             if(this.getDistance([boats[i].x,boats[i].y])<2)
              {
                listOfFish.splice(listOfFish.indexOf(this),1);
                boats[i].haul++;
                // console.log(boats[i].player, boats[i].haul);
              }

              if(this.getDistance([boats[i].x,boats[i].y])<30)
              {
              sumvector[0] += (this.x == boats[i].x) ?  0 :  Math.pow((this.x-boats[i].x)/10,-1)*8; 
              sumvector[1] += (this.y == boats[i].y) ?  0 :  Math.pow((this.y-boats[i].y)/10,-1)*8;
              }
          }

         
           

          if(alone) //NEEDS EXTRA WORK
            AngleOfAttack = closestPoint === wallpoint ? 180: Math.floor(Math.random() * 360) ; //for solitary fish :(
          
         
          if(this.getDistance(wallpoint)<7)
            {
              theta = Math.atan2(wallpoint[1]-this.y, wallpoint[0]-this.x);
              AngleOfAttack = 180;
            }
            else
          theta = Math.atan2(sumvector[1], sumvector[0]);    

          degrees = ((theta * (180/Math.PI)) + 360 + AngleOfAttack - (45/2) )%360; //pad, flip, offset, and convert
          desiredSegment = Math.round(degrees/45)%8 ; 
      
          if(closestPoint === wallpoint && closestDistance<5)
            this.segment = desiredSegment;
          else
          {
              d = (this.segment-desiredSegment)+7; //   [-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4, 5, 6, 7] (start-end)
                                                  //    [ 1, 1, 1, 9,-1,-1,-1,0,1,1,1,9,-1,-1,-1]
              d = SegmentWrapLogicLUT[d]*-1;
                if(d==-9)
                  d=(Math.random()>.5 ? -1 : 1);
              this.segment+=d;
          }

         
          this.segment = (this.segment+8)%8;
          
          var delta = decodeSegment(this.segment);

          this.dx = delta[0];
          this.dy = delta[1];

          this.x += this.dx;
          this.y += this.dy;

          if(this.x>=width-2)
            this.x = width-2;
          if(this.x<=2)
            this.x = 2;
          if(this.y>=height-2)
            this.y = height-2;
          if(this.y<=2)
            this.y = 2;

          },

        spawn: function(listOfFish){
          var singleFish = new fish(this.x+(Math.random()>.5 ? -1 : 1),this.y+(Math.random()>.5 ? -1 : 1),this.color);
          listOfFish.push(singleFish);
        }

      };

function boat(x, y, color, player){
         this.x = x;
         this.y = y;
        
         this.player = player;
         this.color = color;

         this.haul =0;
         this.segment = 0;

          // console.log(this.color);
      } 

      boat.prototype = {

        toot: function(){
          var desiredSegment = 0;

        if(this.player == 1)
        {
          if (keyD == true) 
            this.x ++;
          
          if (keyS == true) 
            this.y ++;
        
          if (keyA == true) 
            this.x--;
          
          if (keyW == true) 
            this.y--;
        }
        else
        {
           if (keyRight == true) 
            this.x ++;
          
          if (keyDown == true) 
            this.y ++;
        
          if (keyLeft == true) 
            this.x--;
          
          if (keyUp == true) 
            this.y--;
         } 
        // if(this.player == 1)
        // {
        //   if (keyD == true) 
        //     this.x ++;
          
        //   if (keyS == true) 
        //     this.y ++;
        
        //   if (keyA == true) 
        //     this.x--;
          
        //   if (keyW == true) 
        //     this.y--;
        // }
        // else
        // {
        //    if (keyRight == true) 
        //     this.x ++;
          
        //   if (keyDown == true) 
        //     this.y ++;
        
        //   if (keyLeft == true) 
        //     this.x--;
          
        //   if (keyUp == true) 
        //     this.y--;
        //  } 

        if(this.x>=width-1)
            this.x = width-1;
          if(this.x<=1)
            this.x = 1;
          if(this.y>=height-1)
            this.y = height-1;
          if(this.y<=1)
            this.y = 1;
        }

        
        

      };



  function init(number) {
    var listOfFish = [];
    var x = 50;
    var y = 50;

    for (var i = 0; i < number; i++) { //spawn n fish and add them to list
      x = Math.floor(Math.random()*(width-60))+30;
      y = Math.floor(Math.random()*(height-60))+30;
      //check if spot is full please
      
      var singleFish = new fish(x,y, (Math.random()*0xFFFFFF<<0));

      listOfFish.push(singleFish);
      }

    return listOfFish;
    }

  function Ocean(equation, canvas) {
    this.Fishes    = init(population); // spawn new fish
    this.boats      = [new boat(10,10,10046464,1),new boat(90,90, 12373460,2)];
    this.canvas    = canvas;
    this.scale     = canvas.getAttribute('width') / width;
    console.log(this.scale);
    this.context   = canvas.getContext('2d');
    this.imageData = this.context.createImageData(width * this.scale, height * this.scale);
    this.then      = +Date.now();
    this.frame     = 1;
    this.paused    = false;
    this.GrowthAccumulator = 0;
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

    drawFish: function(fish) {
       var x = fish.x;
       var y = fish.y;
       var color = fish.color;
        var R = (color & 0xff0000) >>> 16;
        var G = (color & 0x00ff00) >>> 8;
        var B = (color & 0x0000ff) >>> 0;
       var segment = (8-fish.segment);
       for (var sx = 0; sx < this.scale; sx++) {
            for (var sy = 0; sy < this.scale; sy++) {
              if(Sprite[segment%8][sx+(5*sy)])  
              {
              var i = (((y * this.scale + sy) * width * this.scale) + (x * this.scale + sx)) * 4;
              this.imageData.data[i]   = R%255;
              this.imageData.data[i+1] = G%255;
              this.imageData.data[i+2] = B%255;
              this.imageData.data[i+3] = 255;
              }      
            }
          }


    },

   drawBoat: function(boat) {
       var x = boat.x;
       var y = boat.y;
       var color = boat.color;
        var R = (color & 0xff0000) >>> 16;
        var G = (color & 0x00ff00) >>> 8;
        var B = (color & 0x0000ff) >>> 0;
       var segment = (8-fish.segment);
       for (var sx = 0; sx < this.scale; sx++) {
            for (var sy = 0; sy < this.scale; sy++) {
              if(true)//Sprite[segment%8][sx+(5*sy)])  
              {
              var i = (((y * this.scale + sy) * width * this.scale) + (x * this.scale + sx)) * 4;
              this.imageData.data[i]   = R%255;
              this.imageData.data[i+1] = G%255;
              this.imageData.data[i+2] = B%255;
              this.imageData.data[i+3] = 255;
              }      
            }
          }


    },
    Growth: function(listOfFish) {
      population = listOfFish.length;
      var r = growthFactor; //rate of growth
      var x = population/capacity;
      
      population += Math.floor((r*x*(1-x)));
      this.GrowthAccumulator += (r*x*(1-x)) - Math.floor((r*x*(1-x)));

      while(listOfFish.length < population)
          listOfFish[  Math.floor(Math.random()*listOfFish.length)  ].spawn(listOfFish);
      if(this.GrowthAccumulator>=1)
        {
        listOfFish[  Math.floor(Math.random()*listOfFish.length)  ].spawn(listOfFish);
        this.GrowthAccumulator =0;
        }
       
        region = [Math.round(9-(population/30)),13];

        // console.log(listOfFish.length , this.GrowthAccumulator.toPrecision(3), (r*x*(1-x)).toPrecision(3));
        return(listOfFish);
    },

    drawFrame: function() {
      
      var data = this.imageData.data;

      /////////////background drawing code
      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          // Set the x, y, r and A variables
        
          // Get the color
          var color = (Math.random()*Math.random())*20+(Math.cos(x*y+ this.frame)*5)+60;
          // ((x*y)*this.frame%100)+100;
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
      this.Growth(this.Fishes);

      var tempFish;

      for(var i=0; i<this.Fishes.length; i++){
        tempFish = this.Fishes[i];
        tempFish.swim(this.Fishes,this.boats);
        this.drawFish(tempFish);
      }

      for(var i =0; i<this.boats.length; i++){
        this.boats[i].toot();
        this.drawBoat(this.boats[i]);
      }
      
      document.getElementById('score').innerHTML = 'Fish Caught:   Player 1: ' +this.boats[0].haul+'    Player 2: ' +this.boats[1].haul ;
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
