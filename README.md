
# Galactic Odyssey – Interactive Solar System Simulation (CSC 305 Assignment 2)

This project is a fully interactive 3D solar system scene implemented using WebGL and JavaScript. It was developed as part of the CSC 305 Computer Graphics course at the University of Victoria. The main objective of the assignment was to demonstrate proficiency in hierarchical modeling, real-time rendering, interactive camera control, lighting, and texture mapping, all using WebGL's low-level graphics programming interface.

## Project Overview

The solar system scene presents a virtual space environment where celestial bodies such as the Sun, planets, moons, and artificial structures like a spaceship and docking station are rendered and animated. This project emphasizes scene organization through hierarchical transformations, accurate lighting via the Phong reflection model, and realistic appearances using texture maps.

## Core Features and Concepts Implemented

### 1. Hierarchical Modeling and Transformations

Objects in the scene, such as planets and their moons, are created with hierarchical relationships. For example, moons orbit their respective planets, and planets orbit the Sun. This is achieved using a scene graph-like model where transformations (rotation, translation, scaling) are applied in parent-child order. Each object maintains its own transformation matrix, and these are combined recursively to apply cumulative effects during animation and rendering.

### 2. Texture Mapping

Multiple high-resolution textures were used to enhance the realism of the planets and other objects. For example:
- Earth and other planets use `earth.png`, `moon1.png`, and `saturn.png`.
- The Sun uses a glowing `sun.png` texture.
- Background stars are represented using layered textures (`stars1.png` to `stars5.png`) to simulate depth in space.

Texture mapping is handled through GLSL fragment shaders using `gl.TEXTURE_2D`. Texture coordinates are calculated per vertex and passed into the shaders using buffer objects.

### 3. Phong Lighting Model

Lighting was implemented using the Phong lighting model within GLSL shaders. The Sun acts as a point light source positioned at the center of the solar system. Each vertex is shaded based on:
- Ambient lighting (to simulate indirect illumination)
- Diffuse lighting (based on the angle between light direction and surface normal)
- Specular highlights (for shiny reflections)

Normals are either computed or passed in for each object to correctly calculate the lighting interaction.

### 4. Interactive Camera System

The camera supports rotation, zoom, and panning using mouse and keyboard input. This allows the user to freely navigate the 3D scene and observe planetary orbits from various perspectives. The view matrix is updated in response to user input and recalculated every frame.

### 5. Object-Oriented Scene Construction

The `objects.js` file contains all object definitions and buffer setup for rendering geometries such as spheres (for planets), rings (e.g., Saturn), and rectangles (e.g., docking panel). Each object has:
- Its own vertex positions, normals, and texture coordinates.
- A transformation stack to manage its position and rotation.
- Custom logic for animation updates.

### 6. Real-Time Animation

The scene is updated in a continuous loop using `requestAnimationFrame()`, which ensures smooth frame rate and GPU synchronization. Each frame, transformation matrices are recalculated to reflect time-based motion such as:
- Planetary rotation (around their own axis)
- Planetary revolution (around the Sun)
- Moon orbits
- Decorative rotation for the spaceship or rings

### 7. Audio Integration

A background audio track (`interstellar.mp3`) is embedded into the scene to create an immersive experience. The audio begins playback when the user launches the simulation, utilizing the HTML5 `<audio>` API.

## File Structure

```
.
├── main.html               # Loads the WebGL canvas and links all scripts
├── main.js                 # Sets up the scene, handles animation loop, camera, and rendering
├── objects.js              # Contains object creation, buffer setup, and animation logic
├── interstellar.mp3        # Background soundtrack
├── *.png                   # Texture assets for planets, stars, and objects
├── /Common                 # Utility libraries (MV.js, initShaders.js, webgl-utils.js)
└── Readme.txt              # Original assignment instructions and overview
```

## Technical Breakdown

- **WebGL Context Initialization**: Scene starts with canvas context retrieval and program linking using custom shader code.
- **Shader Pipeline**: Vertex and fragment shaders are compiled and linked to implement Phong shading and texturing.
- **Buffer Management**: Vertex buffers, index buffers, and texture coordinate buffers are created for each object and sent to the GPU.
- **Matrix Management**: Model, view, and projection matrices are calculated using custom matrix/vector libraries from `MV.js`.
- **Rendering Loop**: Uses `requestAnimationFrame` to repeatedly call the draw function and update animation states.

## How to Run the Project

1. Clone or download the repository files.
2. Start a local HTTP server in the project directory:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000/csc305_assignment_2/main.html
   ```

**Note**: WebGL requires a local server context to correctly load textures and audio files.

## Learning Outcomes

This assignment provided valuable experience with:
- Building structured 3D scenes with hierarchical relationships.
- Working with shaders to implement lighting and materials.
- Using WebGL APIs to render and animate 3D graphics manually.
- Enhancing visual realism with textures and audio integration.
- Structuring modular JavaScript code for maintainable graphics applications.

## Acknowledgments

This project was completed for the CSC 305 course at the University of Victoria. All textures and audio assets are used strictly for educational and non-commercial purposes.
