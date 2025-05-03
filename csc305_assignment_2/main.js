
var canvas;
var gl;

var program;

var saturnOrbit = 0.0;
var saturnSpin  = 0.0;


var near = 1;
var far = 100;
var sunPos = vec3(0, -10, 10); // The sun's position

var earthOrbit = 0.0;
var earthSpin = 0.0;
var moonAngle = 0.0;
var spaceshipAngle = 0.0; // orbit around Sun
var shipSpin       = 0.0; // rotating antenna or similar





var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;
var cameraAngle = 0.0;
var moonAngle = 0.0;




var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.6, 0.6, 0.6, 2.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;

// Angles for the demon spaceship
var OtherSSOrbitAngle = 0.0; 
var demonOrbitSpeed = 25.0;   // degrees/sec
var OtherSS0Spin       = 0.0;
var OtherSSSpinSpeed  = 50.0;   // degrees/sec
var OtherSSOrbitRadius = 7.0;   // orbit distance from Sun

// Set a common orbit radius and height for both spaceships
var commonOrbitRadius = 5.0;   // Both spaceships orbit at radius 5.0
var spaceshipOrbitHeightOffset = 1.2; // Both at sunPos[1] + 1.2

var saturnMoon1Angle = 0.0;
var saturnMoon2Angle = 0.0;



// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.
var currentRotation = [0,0,0];

var useTextures = 1;

var bgSwitchInterval = 10.0;   // seconds per background image
var bgTimeElapsed = 0.0;
var currentBgIndex = 0;
var totalBgImages = 5;     





//making a texture image procedurally
//Let's start with a 1-D array
var texSize = 8;
var imageCheckerBoardData = new Array();

// Now for each entry of the array make another array
// 2D array now!
for (var i =0; i<texSize; i++)
	imageCheckerBoardData[i] = new Array();

// Now for each entry in the 2D array make a 4 element array (RGBA! for colour)
for (var i =0; i<texSize; i++)
	for ( var j = 0; j < texSize; j++)
		imageCheckerBoardData[i][j] = new Float32Array(4);

// Now for each entry in the 2D array let's set the colour.
// We could have just as easily done this in the previous loop actually
for (var i =0; i<texSize; i++) 
	for (var j=0; j<texSize; j++) {
		var c = (i + j ) % 2;
		imageCheckerBoardData[i][j] = [c, c, c, 1];
}

//Convert the image to uint8 rather than float.
var imageCheckerboard = new Uint8Array(4*texSize*texSize);
for (var i = 0; i < texSize; i++)
	for (var j = 0; j < texSize; j++)
	   for(var k =0; k<4; k++)
			imageCheckerboard[4*texSize*i+4*j+k] = 255*imageCheckerBoardData[i][j][k];
		
// For this example we are going to store a few different textures here
var textureArray = [] ;
    
// mini stations
var miniStations = [
    {
      angle: 0.0,
      angleSpeed: 25.0,
      orbitRadius: 2.5,
      upDownPhase: 0.0,
      upDownSpeed: 2.0,
      upDownAmp: 0.2,
      offsetY: 1.0
    },
    {
      angle: 120.0,
      angleSpeed: 18.0,
      orbitRadius: 2.0,
      upDownPhase: 1.0,
      upDownSpeed: 2.5,
      upDownAmp: 0.25,
      offsetY: 0.9
    },
    {
      angle: 240.0,
      angleSpeed: 30.0,
      orbitRadius: 2.3,
      upDownPhase: 2.0,
      upDownSpeed: 1.8,
      upDownAmp: 0.15,
      offsetY: 1.2
    },
  ];
  
  // mini Stations
  function drawMiniStation() {
    
    gPush();
    {
      // Main cylinder body
      setColor(vec4(0.5, 0.8, 0.2, 1.0));
      gScale(0.2, 0.3, 0.2); 
      drawCylinder();
    }
    gPop();
  
    // Top dome
    gPush();
    {
      // Move up a bit
      gTranslate(0, 0.3, 0);
      setColor(vec4(0.9, 0.9, 0.9, 1.0));
      gScale(0.15, 0.15, 0.15);
      drawSphere();
    }
    gPop();
  
    // 3 arms around the cylinder
    for (let j = 0; j < 3; j++) {
      gPush();
      {
        let ang = j * 120.0;
        gRotate(ang, 0, 1, 0);
        gTranslate(0.25, 0.0, 0); 
        setColor(vec4(0.2, 0.2, 0.8, 1.0));
        gScale(0.1, 0.05, 0.3);
        drawCube();
      }
      gPop();
    }
  }
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition2) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

// We are going to asynchronously load actual image files this will check if that call if an async call is complete
// You can use this for debugging


function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

// Helper function to load an actual file as a texture
// NOTE: The image is going to be loaded asyncronously (lazy) which could be
// after the program continues to the next functions. OUCH!
function loadFileTexture(tex, filename)
{
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
}

// Once the above image file loaded with loadFileTexture is actually loaded,
// this funcion is the onload handler and will be called.
function handleTextureLoaded(textureObj) {
	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
	
	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

// Takes an array of textures and calls render if the textures are created/loaded
// This is useful if you have a bunch of textures, to ensure that those files are
// actually loaded from disk you can wait and delay the render function call
// Notice how we call this at the end of init instead of just calling requestAnimFrame like before
function waitForTextures(texs) {
    setTimeout(
		function() {
			   var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log(texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               		console.log(wtime + " not ready yet") ;
               		waitForTextures(texs) ;
               }
               else
               {
               		console.log("ready to render") ;
					render(0);
               }
		},
	5) ;
}

// This will use an array of existing image data to load and set parameters for a texture
// We'll use this function for procedural textures, since there is no async loading to deal with
function loadImageTexture(tex, image) {
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();

	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);

	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;
}

// This just calls the appropriate texture loads for this example adn puts the textures in an array
function initTexturesForExample() {


    textureArray.push({}); 
    loadFileTexture(textureArray[textureArray.length - 1], "stars1.png");

    textureArray.push({}); 
    loadFileTexture(textureArray[textureArray.length - 1], "stars2.png");

    textureArray.push({}); 
    loadFileTexture(textureArray[textureArray.length - 1], "stars3.png");

    textureArray.push({}); 
    loadFileTexture(textureArray[textureArray.length - 1], "stars4.png");

    textureArray.push({}); 
    loadFileTexture(textureArray[textureArray.length - 1], "stars5.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "sun.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "earth.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Moon.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "spaceship.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "panel.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "dock.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "saturn.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "ring.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "moon1.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "solar.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "otherBody.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "dome.png");


    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],imageCheckerboard) ;

}

// Changes which texture is active in the array of texture examples (see initTexturesForExample)
function toggleTextures() {
    useTextures = (useTextures + 1) % 2
	gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
    

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
	// Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    gl.uniform1i(gl.getUniformLocation(program, "isSun"), 0);
	// Helper function just for this example to load the set of textures
    initTexturesForExample() ;

    waitForTextures(textureArray);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

var earthAngle = 0.0;

var saturnOrbitSpeed  = 15.0; // deg/sec or so
var saturnSpinSpeed   = 20.0; // for Saturn self-rotation


function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    MS = [];
    modelMatrix = mat4();

    // Time step

    dt = (timestamp - prevTime) / 1000.0;
    prevTime = timestamp;
    TIME += dt;

    // Increment cameraAngle, e.g. 20 degrees/sec
    cameraAngle += 20.0 * dt;

    // Orbit radius (distance from the sun)
    var radius = 10.0;

    // Compute camera's position in a circle around sunPos
    var camX = sunPos[0] + radius * Math.sin(radians(cameraAngle));
    var camZ = sunPos[2] + radius * Math.cos(radians(cameraAngle));
    var camY = sunPos[1] + 3.0;  // e.g. slightly above the sun

    eye = vec3(camX, camY, camZ);

    // The camera looks at the sun
    viewMatrix = lookAt(eye, sunPos, up);

    // The rest of your code:
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    setAllMatrices();

    earthOrbit += 90.0 * dt; // Earth orbits Sun at 90 deg/sec
    earthSpin  += 50.0 * dt; // Earth spins at 50 deg/sec
    moonAngle  += 200.0 * dt; 
    spaceshipAngle += 30.0 * dt; 
    shipSpin += 100.0 * dt;

    // change background
    bgTimeElapsed += dt;
    if (bgTimeElapsed > bgSwitchInterval) {
      bgTimeElapsed = 0;
      currentBgIndex = (currentBgIndex + 1) % totalBgImages;
    }

    gl.uniform1i(gl.getUniformLocation(program, "isSun"), 0);  

    setColor(vec4(1.0, 1.0, 1.0, 1.0));

    gPush();
    {
      modelMatrix = mult(mat4(), scale(-40, 40, 40));
      gl.bindTexture(gl.TEXTURE_2D, textureArray[currentBgIndex].textureWebGL);
      gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
      setAllMatrices();
      drawSphere();
    }
    gPop();

    gl.uniform1i(gl.getUniformLocation(program, "isSun"), 1);

    gPush();
    {
        
        // Optionally scale it bigger

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL); // sun
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gTranslate(sunPos[0], sunPos[1], sunPos[2]);
        gScale(1.5, 1.5, 1.5);

        drawSphere();
    }
    gPop();

    gl.uniform1i(gl.getUniformLocation(program, "isSun"), 0);

    var stationPos = vec3(sunPos[0], sunPos[1] + 3.5, sunPos[2]);

// SpaceStation
gPush();
    {
      modelMatrix = translate(stationPos);
  
      // Base Floor
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL); // sun
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        setColor(vec4(1.0, 1.0, 1.0, 1.0));

        modelMatrix = mult(modelMatrix, scale(2.0, 2.0, 0.2));
        drawCylinder();
      }
      gPop();
  
      // Second Floor
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL); // sun
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        modelMatrix = mult(modelMatrix, translate(vec3(0, 0.3, 0)));
        setColor(vec4(0.6, 0.8, 0.8, 1.0));
        modelMatrix = mult(modelMatrix, scale(1.2, 1.2, 0.3));
        drawCylinder();
      }
      gPop();
  
      // Top Dome
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[8].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        modelMatrix = mult(modelMatrix, translate(vec3(0, 0.6, 0)));
        modelMatrix = mult(modelMatrix, scale(0.6, 0.6, 0.6));
        drawSphere();
      }
      gPop();
  
      // Docking Arms (6 arms)
      var numArms = 6;
      for (var i = 0; i < numArms; i++) {
        var angleDeg = i * 60.0;
        gPush();
        {
          modelMatrix = mult(modelMatrix, rotate(angleDeg, 0, 1, 0));
          modelMatrix = mult(modelMatrix, translate(vec3(1.6, 0.1, 0)));
          gPush();
          {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[10].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
            modelMatrix = mult(modelMatrix, scale(0.4, 0.1, 0.3));
            drawCube();
          }
          gPop();
          modelMatrix = mult(modelMatrix, translate(vec3(0.2, 0, 0)));
          gPush();
          {
            setColor(vec4(0.9, 0.9, 0.9, 1.0));
            modelMatrix = mult(modelMatrix, scale(0.12, 0.12, 0.12));
            drawSphere();
          }
          gPop();
        }
        gPop();
      }
  
      // Solar Arrays (2 arrays)
      for (var j = 0; j < 2; j++) {
        var solarAngle = j * 180.0;
        gPush();
        {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textureArray[14].textureWebGL);
          gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
          modelMatrix = mult(modelMatrix, rotate(solarAngle, 0, 1, 0));
          modelMatrix = mult(modelMatrix, translate(vec3(2.2, 0.4, 0)));
          modelMatrix = mult(modelMatrix, scale(2.0, 0.05, 0.6));
          drawCube();
        }
        gPop();
      }
  
      // Extra Bottom Module
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL); // sun
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        modelMatrix = mult(modelMatrix, translate(vec3(0, -0.3, 0)));
        modelMatrix = mult(modelMatrix, scale(0.5, 0.5, 0.5));
        drawCone();
      }
      gPop();
  
  
    }
gPop();
  
    var orbitRadius = 3.5;
    var earthX = sunPos[0] + orbitRadius * Math.sin(radians(earthOrbit));
    var earthZ = sunPos[2] + orbitRadius * Math.cos(radians(earthOrbit));
    var earthY = sunPos[1]; // Same Y as sunPos
    
    //Earth
    gPush();
    {
        // Set modelMatrix to Earth's absolute position.
        modelMatrix = translate(vec3(earthX, earthY, earthZ));
        // Apply Earth's self-spin.
        modelMatrix = mult(modelMatrix, rotate(earthSpin, 0, 1, 0));
        // Scale Earth.
        modelMatrix = mult(modelMatrix, scale(0.5, 0.5, 0.5));
        
        // Bind Earth texture (textureArray[2] = earth.png)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[6].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        
        drawSphere(); // Draw Earth
        
        // --- Draw Moon orbiting the Earth ---
        gPush();
        {
            // Within Earth’s coordinate frame, rotate for Moon's orbit.
            modelMatrix = mult(modelMatrix, rotate(moonAngle, 0, 1, 0));
            // Translate outwards by a fixed Moon orbit radius (e.g., 1.5)
            modelMatrix = mult(modelMatrix, translate(vec3(1.5, 0, 0)));
            // Scale Moon.
            modelMatrix = mult(modelMatrix, scale(0.2, 0.2, 0.2));
            
            // Bind Moon texture (textureArray[3] = Moon.png)
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[7].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
            
            drawSphere(); // Draw Moon
        }
        gPop();
    }
    gPop();

    var saturnOrbitRadius = 8.0;
    var saturnOrbitSpeed  = 70.0; // deg/sec or so
    var saturnSpinSpeed   = 20.0; // for Saturn self-rotation

    saturnMoon1Angle+=40.0*dt
    saturnMoon2Angle+=30.0*dt

    var saturnOrbitAngle = TIME * saturnOrbitSpeed;
    var saturnSpin = TIME * saturnSpinSpeed;

    // Saturn's position
    var saturnX = sunPos[0] + saturnOrbitRadius * Math.sin(radians(saturnOrbitAngle));
    var saturnZ = sunPos[2] + saturnOrbitRadius * Math.cos(radians(saturnOrbitAngle));
    var saturnY = sunPos[1];

    //Saturn
    setColor(vec4(1.0, 1.0, 1.0, 1.0));
    gPush();
    {
        // Move to Saturn's position
        modelMatrix = mult(modelMatrix, translate(vec3(saturnX, saturnY, saturnZ)));
        // Spin Saturn on its axis
        modelMatrix = mult(modelMatrix, rotate(saturnSpin, 0, 1, 0));

        modelMatrix = mult(modelMatrix, scale(0.7, 0.7, 0.7));

      
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[11].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);

        drawSphere();

        // RING
        gPush();
        {        
 
            var ringCount = 8;

            var ringInnerRadius = 1.5;
            var ringOuterRadius = 3.0;
        
 
            var ringStep = (ringOuterRadius - ringInnerRadius) / (ringCount - 1);
        
            for (var i = 0; i < ringCount; i++) {
                gPush();
                {
                    // The ring radius for this band:
                    var r = ringInnerRadius + i * ringStep;
                    gRotate(90, 1, 0, 0);
                    gTranslate(0, 0, i * 0.0001);
                    gScale(r * 2.0, r * 2.0, 0.02);
                    // Bind the ring texture:
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[12].textureWebGL); // e.g. ring.png
                    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
                    // Optionally set color to white so we don’t tint the ring:
                    setColor(vec4(1.0, 1.0, 1.0, 1.0));
                    // Draw the cylinder for this ring band
                    drawCylinder();
                }
                gPop();
            }
        }
        gPop();

      // ----------------- Saturn Moons -----------------
      gPush();
      {
         var m1Orbit = 1.2;
         var m1x = m1Orbit * Math.sin(radians(saturnMoon1Angle));
         var m1z = m1Orbit * Math.cos(radians(saturnMoon1Angle));
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, textureArray[7].textureWebGL); // Using Moon texture
         setColor(vec4(0.7, 0.2, 0.0, 1.0));
         gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
         gTranslate(m1x, 0.5, m1z);  // position relative to Saturn's center
         gScale(0.2, 0.2, 0.2);       // small moon (same as Earth's moon)

         drawSphere();
      }
      gPop();

      // Moon 2 (orbit radius 1.8)
      gPush();
      {
         var m2Orbit = 1.8;
         var m2x = m2Orbit * Math.sin(radians(saturnMoon2Angle));
         var m2z = m2Orbit * Math.cos(radians(saturnMoon2Angle));
         gTranslate(m2x, 0.5, m2z);
         gScale(0.2, 0.2, 0.2);
         setColor(vec4(0.4, 0.2, 0.0, 1.0));
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, textureArray[7].textureWebGL);
         gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
         drawSphere();
      }
      gPop();

    }
    gPop();

    OtherSSOrbitAngle = spaceshipAngle + 180; // MODIFIED

    // Also, set demon's orbit radius to be same as spaceship
    var OtherSSOrbitRadius = commonOrbitRadius = 4.0; // MODIFIED: same as spaceshipOrbitRadius

    // Both spaceships now orbit at the same height:
    var spaceshipOrbitHeight = sunPos[1] + spaceshipOrbitHeightOffset; // = sunPos[1] + 1.2
    var OtherSSOrbitHeight = sunPos[1] + spaceshipOrbitHeightOffset;     // MODIFIED: same height

    var otherX = sunPos[0] + OtherSSOrbitRadius * Math.sin(radians(OtherSSOrbitAngle));
    var otherZ = sunPos[2] + OtherSSOrbitRadius * Math.cos(radians(OtherSSOrbitAngle));
    var otherY = OtherSSOrbitHeight; // MODIFIED

  setColor(vec4(1.0, 1.0, 1.0, 1.0));
  gPush();
    {

      modelMatrix = translate(vec3(otherX, otherY, otherZ));
      modelMatrix = mult(modelMatrix, rotate(OtherSSOrbitAngle, 0, 1, 0));
      modelMatrix = mult(modelMatrix, rotate(OtherSS0Spin, 0, 0, 1));
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[15].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gScale(0.4, 0.4, 0.4);
        drawSphere();
      }
      gPop();
 
      gPush();
      {
        // setColor(vec4(0.8, 0.2, 0.2, 1.0));
        gTranslate(-0.3, 0.3, 0);
        gRotate(-45, 0, 0, 1);
        gScale(0.1, 0.4, 0.1);
        drawCone();
      }
      gPop();
      gPush();
      {
        // setColor(vec4(0.8, 0.2, 0.2, 1.0));
        gTranslate(0.3, 0.3, 0);
        gRotate(45, 0, 0, 1);
        gScale(0.1, 0.4, 0.1);
        drawCone();
      }
      gPop();
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[14].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gTranslate(-0.5, 0, 0);
        gScale(0.02, 0.2, 1.0);
        drawCube();
      }
      gPop();
      gPush();
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[14].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gTranslate(0.5, 0, 0);
        gScale(0.02, 0.2, 1.0);
        drawCube();
      }
      gPop();
      gPush();
      {
        // setColor(vec4(0.5, 0.1, 0.1, 1.0));
        gTranslate(0, -0.4, -0.2);
        gRotate(-30, 1, 0, 0);
        gScale(0.05, 0.4, 0.05);
        drawCylinder();
      }
      gPop();
  
    }
  gPop();

    // ========== Draw Spaceship orbiting the Sun ==========
    var spaceshipOrbitRadius = commonOrbitRadius; // 5.0
    var shipX = sunPos[0] + spaceshipOrbitRadius * Math.sin(radians(spaceshipAngle));
    var shipZ = sunPos[2] + spaceshipOrbitRadius * Math.cos(radians(spaceshipAngle));
    var shipY = sunPos[1] + spaceshipOrbitHeightOffset; // MODIFIED

  setColor(vec4(1.0, 1.0, 1.0, 1.0));
  gPush();
  {


    modelMatrix = translate(vec3(shipX, shipY, shipZ));
    modelMatrix = mult(modelMatrix, rotate(spaceshipAngle, 0, 1, 0));
    // Draw spaceship main body
    gPush();
    {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL);
      gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
      setColor(vec4(0.6, 0.6, 0.7, 1.0));
      modelMatrix = mult(modelMatrix, scale(0.1, 0.1, 0.7));
      drawCylinder();
    }
    gPop();
    // Draw cockpit
    gPush();
    {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureArray[8].textureWebGL);
      gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
      setColor(vec4(0.9, 0.9, 0.1, 1.0));
      modelMatrix = mult(modelMatrix, translate(vec3(0, 0, 0.35)));
      modelMatrix = mult(modelMatrix, scale(0.15, 0.15, 0.15));
      drawSphere();
    }
    gPop();
    // Draw engine
    gPush();
    {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureArray[8].textureWebGL);
      gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
      setColor(vec4(0.9, 0.2, 0.2, 1.0));
      modelMatrix = mult(modelMatrix, translate(vec3(0, 0, -0.35)));
      modelMatrix = mult(modelMatrix, scale(0.08, 0.08, 0.2));
      drawCone();
    }
    gPop();
  }
  gPop();

  for (let i = 0; i < miniStations.length; i++) {
    let ms = miniStations[i];
    ms.angle += ms.angleSpeed * dt;
    ms.upDownPhase += ms.upDownSpeed * dt;
    let stX = stationPos[0] + ms.orbitRadius * Math.sin(radians(ms.angle));
    let stZ = stationPos[2] + ms.orbitRadius * Math.cos(radians(ms.angle));
    let stY = stationPos[1] + ms.offsetY + ms.upDownAmp * Math.sin(ms.upDownPhase);
    setColor(vec4(1.0, 1.0, 1.0, 1.0));
    gPush();
    {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL);
      gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
  
      gTranslate(stX, stY, stZ);
      gRotate(ms.angle * 2.0, 0, 1, 0);
      drawMiniStation();
    }
    gPop();
  }
	
  window.requestAnimFrame(render);


}
