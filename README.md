# Minecraft Clone with noa-engine

A simple Minecraft clone built with [noa-engine](https://github.com/fenomas/noa).

## Setup

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Clone this repository
3. Install dependencies:
   ```
   npm install
   ```
   
   If you encounter dependency conflicts, you can use:
   ```
   npm install --legacy-peer-deps
   ```
   or
   ```
   npm install --force
   ```

4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

## Controls

- **WASD** - Move
- **Space** - Jump
- **Left Click** - Break block
- **Right Click** - Place block
- **1-5** - Select block
- **E** - Toggle instructions

## Project Structure

- `index.html` - The main HTML file
- `main.js` - The main JavaScript file that initializes noa-engine and sets up the game
- `package.json` - Project configuration and dependencies

## Why noa-engine?

noa-engine is a voxel game engine built on top of Babylon.js. It provides:

- Efficient voxel rendering
- Physics and collision detection
- Player movement and controls
- World generation
- Block targeting and interaction

## Important Note

noa-engine is designed to be used with a module bundler like webpack or vite. It cannot be used directly in the browser via a script tag. This project uses Vite to bundle the code.

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts between noa-engine and @babylonjs/core, try one of these solutions:

1. Use the `--legacy-peer-deps` flag when installing:
   ```
   npm install --legacy-peer-deps
   ```

2. Use the `--force` flag when installing:
   ```
   npm install --force
   ```

3. Update the @babylonjs/core version in package.json to match the peer dependency requirement of noa-engine.

## Resources

- [noa-engine GitHub repository](https://github.com/fenomas/noa)
- [noa-examples repository](https://github.com/fenomas/noa-examples)
- [Babylon.js documentation](https://doc.babylonjs.com/) # minecraft
