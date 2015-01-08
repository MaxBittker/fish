
 

Ocean = (function() {
  // Constant properties for all Ocean displays
  // Possibly should be passable as a options hash, but instead making file-global
  var width = 100;
  var height = 100;
  var population = 44;
  var interval = 1000 / (15 /* fps */);
  var region = [3,20];

  var Sprite=[[0,0,0,0,0,
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


function fish(x, y){
         // Add object properties like this
         this.x = x;
         this.y = y;
         this.dx = -1;//smarter later
         this.dy = 1;
         this.segment =  Math.round((Math.random() * 12345)%8);
         this.color = 11111; //unused right now
      } 

      // Add methods like this.  All Person objects will be able to invoke this
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

        // checkOccupied: function(listOfFish){
        // var distance = Math.sqrt(Math.pow((this.x - point[0]),2)+Math.pow((this.y- point[1]),2));
        // return(distance);
        // },

        getDistance: function(point){
        return(Math.sqrt(Math.pow((this.x - point[0]),2)+Math.pow((this.y- point[1]),2)));
        },

        swim: function(listOfFish) {
          var distance = [0,0];
          var tempFish;
          var tempdistance;
          var closestThing = this; 
          var closestPoint; 
          var closestDistance = 999999; 
          var AngleOfAttack = 180; //180=away, 0 = towards, 90= perpendicularly
          var desiredSegment;
          var sumvector =[0,0];
          var alone =false;


          for(var i=0; i<listOfFish.length; i++){

            tempFish = listOfFish[i];

            if (tempFish === this)// || (this.getDistance([tempFish.x,tempFish.y]))>30 ) //skip myself
              continue;

            tempdistance = Math.round(this.getDistance([tempFish.x,tempFish.y]));

             if(tempdistance<15)
             {
            sumvector[0] -= (this.x == tempFish.x) ?  0 :  Math.pow((this.x-tempFish.x),-1);
            sumvector[1] -= (this.y == tempFish.y) ?  0 :  Math.pow((this.y-tempFish.y),-1);

            if(!isFinite(sumvector[0]) || !isFinite(sumvector[1]))
             alert(sumvector);
            }


            if( tempdistance < closestDistance) //TODO delay sqrt for perfomance
              {
               
                if(tempdistance == 0 )
                  {
                    tempFish.x=tempFish.x+Math.floor(Math.random() * (2)) -1; //massage overlaps
                    tempFish.y=tempFish.y+Math.floor(Math.random() * (2)) -1;  //listOfFish.splice(i, 1);
                  }
                else
                  {
                    closestThing = listOfFish[i];
                    closestDistance = tempdistance;
                  }
              }

          }

          if(closestThing===this)
            alone =true;

          closestPoint = [closestThing.x,closestThing.y];

          wallpoint = this.getClosestWall();

          // sumvector[0] += Math.pow((this.x-wallpoint[0]),-1)*4; //count wall 25 times
          // sumvector[1] += Math.pow((this.y-wallpoint[1]),-1)*4;
          
          // if(this.getDistance(wallpoint)<10)
          // {
          // sumvector[0] -= Math.pow((this.x-wallpoint[0]),-1)*4;
          // sumvector[1] -= Math.pow((this.y-wallpoint[1]),-1)*4;
          // }
           

          if(this.getDistance(wallpoint)<6)
            {
            closestPoint = wallpoint;
            AngleOfAttack = 180; //maybe make it softer later
            }
          else if(!alone){
            closestDistance = this.getDistance(closestPoint);
            switch (true) {
                case (closestDistance < region[0]):
                    AngleOfAttack = 180;
                    break;
                case (closestDistance < region[1]): 
                    AngleOfAttack = 90; //90 = special code 
                    break;
                case (closestDistance > (region[1]-1) ):
                    AngleOfAttack = 0;
                    break;
                default:
                    alert("none");
                    break;
            }
          }
          else 
            AngleOfAttack = Math.floor(Math.random() * 360) ; //for solitary fish :(
         
            if(closestPoint === wallpoint)
              theta = Math.atan2(wallpoint[1]-this.y, wallpoint[0]-this.x);
            else
          theta = Math.atan2(sumvector[1], sumvector[0]);    

          degrees = ((theta * (180/Math.PI)) + 360 + AngleOfAttack - (45/2) )%360; //pad, flip, offset, and convert
          desiredSegment = Math.round(degrees/45)%8 ; 
          
          if(AngleOfAttack == 90 && !(closestPoint===wallpoint)) //special case, try to match direction
            desiredSegment = closestThing.segment;

          if(closestPoint === wallpoint || closestDistance<3)
            this.segment = desiredSegment;
          else if(this.segment>desiredSegment)//this is gross i'm sorry
            this.segment+=((this.segment- desiredSegment) < (((desiredSegment+8)-this.segment)%8)) ? 1 : -1;
          else if(this.segment<desiredSegment)
            this.segment+=((desiredSegment- this.segment) < (((this.segment+8)-desiredSegment)%8)) ? 1 : -1;

        
         // this.segment = desiredSegment;
          // else if((Math.random()>.9) )
          //   this.segment += Math.floor(Math.random() * (2)) -1;
          
          this.segment = (this.segment+8)%8;
          switch(this.segment) {
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
                  this.dy =  1;
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
                  this.segment = 0;
                  break;
              default:
                   console.log(this.segment);
                   break;
          }


          this.x += this.dx;
          this.y += this.dy;

          if(this.x>=width-1)
            this.x = width-1;
          if(this.x<=0)
            this.x = 0;
          if(this.y>=height-1)
            this.y = height-1;
          if(this.y<=0)
            this.y = 0;

          },

        
        // draw: function(imageData,scale){
        //   ///this doesn't get called rn :(
        //     for (var sx = 0; sx < scale; sx++) {
        //     for (var sy = 0; sy < scale; sy++) {
        //       var i = (((this.y * scale + sy) * width * scale) + (this.x * scale + sx)) * 4;
        //       imageData.data[i]   = 255;
        //       imageData.data[i+1] = 255;
        //       imageData.data[i+2] = 000;
        //       imageData.data[i+3] = 255;      
        //     }
        //   }
        // },

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
      x = Math.floor(Math.random()*(width-60))+30;
      y = Math.floor(Math.random()*(height-60))+30;
      //check if spot is full please
      
      var singleFish = new fish(x,y);

      listOfFish.push(singleFish);
      }

    return listOfFish;
    }

  function Ocean(equation, canvas) {
    this.Fishes    = init(population); // spawn new fish
    this.singleFish = new fish(50,50);
    this.canvas    = canvas;
    this.scale     = canvas.getAttribute('width') / width;
    console.log(this.scale);
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

    drawFish: function(fish) {
       var x = fish.x;
       var y = fish.y;
       var color = fish.color;
       var segment = (8-fish.segment);
       for (var sx = 0; sx < this.scale; sx++) {
            for (var sy = 0; sy < this.scale; sy++) {
              if(Sprite[segment%8][sx+(5*sy)])  
              {
              var i = (((y * this.scale + sy) * width * this.scale) + (x * this.scale + sx)) * 4;
              this.imageData.data[i]   = 255;
              this.imageData.data[i+1] = 100;
              this.imageData.data[i+2] = 000;
              this.imageData.data[i+3] = 255;
              }      
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
          var color = (Math.cos(x*y+ this.frame)*15)+100;
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

      var tempFish;

      for(var i=0; i<this.Fishes.length; i++){
        tempFish = this.Fishes[i];
        tempFish.swim(this.Fishes);
        this.drawFish(tempFish);
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
