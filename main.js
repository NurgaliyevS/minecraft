/* 
 * 
 *          noa Minecraft clone example
 * 
 *  This is a basic example of how to use the noa-engine
 *  to create a Minecraft-like voxel game.
 * 
*/

// Add this at the top of the file, after any imports
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, creating standalone inventory');
    createStandaloneInventory();
});

// Import the Engine constructor from noa-engine
import { Engine } from 'noa-engine'
// Import Babylon.js
import * as BABYLON from '@babylonjs/core/Legacy/legacy'
// Import Three.js for textures
import * as THREE from 'three'

// Add this code at the beginning of the file to ensure right-click is properly captured
document.addEventListener('contextmenu', function(event) {
    // Prevent the default context menu
    event.preventDefault();
    return false;
}, false);

// Add a global right-click handler that will work anywhere in the game
window.addEventListener('mousedown', function(event) {
    // Check if it's a right-click (button 2)
    if (event.button === 2) {
        console.log('Global right-click detected');
        event.preventDefault();
        
        try {
            // Try the simple block placement first
            if (typeof window.simplePlaceBlock === 'function') {
                window.simplePlaceBlock();
            } 
            // If that doesn't work, try the other methods
            else if (typeof window.placeBlockAtTargeted === 'function') {
                window.placeBlockAtTargeted();
            } else if (typeof placeBlockAtTargeted === 'function') {
                placeBlockAtTargeted();
            } else {
                console.log('Block placement functions not available yet');
            }
        } catch (error) {
            console.error('Error handling right-click:', error);
        }
        
        return false;
    }
}, false);

// Engine options object
const opts = {
    debug: false,
    showFPS: true,
    inverseY: false,
    inverseX: false,
    chunkSize: 32,
    chunkAddDistance: 3,
    chunkRemoveDistance: 4,
    worldGenWhilePaused: true,
    camera: {
        maxDistance: 10,
        minDistance: 0.5,
        zoomSpeed: 0.5
    }
}

// Global variables
let selectedBlockIndex = 0;
let placeableBlocks = [];

// Create noa instance
const noa = new Engine(opts)

// Set background color to sky blue
noa.rendering.backgroundColor = [0.5, 0.7, 0.9]

// Get references to DOM elements
const container = document.getElementById('container')
const inventoryEl = document.getElementById('inventory')
const instructionsEl = document.getElementById('instructions')

// Debug function to check DOM elements
function debugElements() {
    console.log('DEBUG: Checking DOM elements...')
    console.log('container:', container)
    console.log('inventoryEl:', inventoryEl)
    console.log('instructionsEl:', instructionsEl)
    
    // Check if inventory exists in DOM
    const invCheck = document.getElementById('inventory')
    console.log('inventory element check:', invCheck)
    
    // Check standalone inventory
    const standaloneInv = document.getElementById('standalone-inventory')
    console.log('standalone inventory check:', standaloneInv)
    
    // List all elements with z-index > 0
    const allElements = document.querySelectorAll('*')
    const highZElements = Array.from(allElements).filter(el => {
        const style = window.getComputedStyle(el)
        return parseInt(style.zIndex) > 0
    })
    console.log('Elements with high z-index:', highZElements)
}

// Run debug immediately
debugElements()

// Make sure elements exist
if (!inventoryEl) {
    console.error('Inventory element not found!')
    // Create it if it doesn't exist
    const inv = document.createElement('div')
    inv.id = 'inventory'
    document.body.appendChild(inv)
    inventoryEl = inv
}

// Resize the container to the window size
container.style.width = window.innerWidth + 'px'
container.style.height = window.innerHeight + 'px'

// Set up camera
noa.camera.zoomDistance = 5

// Create procedural texture for the blocks
const blockTextureData = createBlockTextures()

// Register block materials and textures
const blockIDs = registerBlocks(noa, blockTextureData)

// Generate terrain
setupWorldGeneration(noa)

// Setup player
setupPlayer(noa)

// Setup input handling
setupInput(noa)

// Setup inventory UI
setupInventory()

// Make sure standalone inventory is created after game starts
setTimeout(() => {
    // Only create the standalone inventory if it doesn't exist
    if (!document.getElementById('standalone-inventory')) {
        createStandaloneInventory();
        console.log('Standalone inventory created after game start');
    } else {
        console.log('Standalone inventory already exists, skipping creation');
    }
    debugElements();
}, 1000);

// Handle window resize
window.addEventListener('resize', function() {
    container.style.width = window.innerWidth + 'px'
    container.style.height = window.innerHeight + 'px'
    noa.rendering.resize()
})

// Start the game loop
if (noa && noa.ticker && typeof noa.ticker.start === 'function') {
    console.log('Starting game loop');
    noa.ticker.start();
} else {
    console.error('Cannot start game loop - noa.ticker.start is not available');
}

// We only need the standalone inventory, so we'll remove these redundant calls
// createAndDisplayInventory() - REMOVED
// createFixedInventory() - REMOVED
// setTimeout(createAndDisplayInventory, 1000) - REMOVED

// Function to create and display inventory
function createAndDisplayInventory() {
    console.log('Creating and displaying inventory...')
    setupInventory()
    
    // Force inventory to be visible with very prominent styling
    if (inventoryEl) {
        inventoryEl.style.display = 'flex'
        inventoryEl.style.visibility = 'visible'
        inventoryEl.style.opacity = '1'
        inventoryEl.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
        inventoryEl.style.padding = '20px'
        inventoryEl.style.borderRadius = '15px'
        inventoryEl.style.border = '4px solid rgba(255, 255, 255, 0.5)'
        inventoryEl.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.8)'
        inventoryEl.style.bottom = '40px'
        
        // Log inventory status
        console.log('Inventory should now be visible:', inventoryEl)
        console.log('Inventory children:', inventoryEl.children.length)
        console.log('Inventory style:', inventoryEl.style.cssText)
    } else {
        console.error('Inventory element still not found!')
    }
}

// Helper functions
function createBlockTextures() {
    const blockTypes = ['dirt', 'grass', 'stone', 'wood', 'leaves']
    const textureData = {}
    
    // Create a canvas for textures
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')
    
    blockTypes.forEach(type => {
        // Clear canvas
        ctx.clearRect(0, 0, 16, 16)
        
        // Draw different textures based on block type
        switch (type) {
            case 'dirt':
                ctx.fillStyle = '#8B4513'
                ctx.fillRect(0, 0, 16, 16)
                // Add some texture details
                ctx.fillStyle = '#6B3300'
                for (let i = 0; i < 10; i++) {
                    const x = Math.floor(Math.random() * 16)
                    const y = Math.floor(Math.random() * 16)
                    const size = 1 + Math.floor(Math.random() * 2)
                    ctx.fillRect(x, y, size, size)
                }
                break
                
            case 'grass':
                // Dirt bottom
                ctx.fillStyle = '#8B4513'
                ctx.fillRect(0, 0, 16, 16)
                // Grass top
                ctx.fillStyle = '#567D46'
                ctx.fillRect(0, 0, 16, 4)
                // Transition
                ctx.fillStyle = '#6B9362'
                ctx.fillRect(0, 4, 16, 2)
                // Texture details
                ctx.fillStyle = '#7CAF71'
                for (let i = 0; i < 5; i++) {
                    const x = Math.floor(Math.random() * 16)
                    ctx.fillRect(x, Math.floor(Math.random() * 3), 1, 2)
                }
                break
                
            case 'stone':
                ctx.fillStyle = '#808080'
                ctx.fillRect(0, 0, 16, 16)
                // Add some texture details
                ctx.fillStyle = '#707070'
                for (let i = 0; i < 8; i++) {
                    const x = Math.floor(Math.random() * 16)
                    const y = Math.floor(Math.random() * 16)
                    const size = 1 + Math.floor(Math.random() * 3)
                    ctx.fillRect(x, y, size, size)
                }
                ctx.fillStyle = '#909090'
                for (let i = 0; i < 5; i++) {
                    const x = Math.floor(Math.random() * 16)
                    const y = Math.floor(Math.random() * 16)
                    const size = 1 + Math.floor(Math.random() * 2)
                    ctx.fillRect(x, y, size, size)
                }
                break
                
            case 'wood':
                ctx.fillStyle = '#8B5A2B'
                ctx.fillRect(0, 0, 16, 16)
                // Add wood grain
                ctx.fillStyle = '#704623'
                for (let i = 0; i < 16; i += 4) {
                    ctx.fillRect(0, i, 16, 2)
                }
                break
                
            case 'leaves':
                ctx.fillStyle = '#4A7023'
                ctx.fillRect(0, 0, 16, 16)
                // Add some texture details
                ctx.fillStyle = '#3A5D1A'
                for (let i = 0; i < 20; i++) {
                    const x = Math.floor(Math.random() * 16)
                    const y = Math.floor(Math.random() * 16)
                    const size = 1 + Math.floor(Math.random() * 2)
                    ctx.fillRect(x, y, size, size)
                }
                ctx.fillStyle = '#5A8033'
                for (let i = 0; i < 10; i++) {
                    const x = Math.floor(Math.random() * 16)
                    const y = Math.floor(Math.random() * 16)
                    const size = 1
                    ctx.fillRect(x, y, size, size)
                }
                break
        }
        
        // Store the texture data URL
        textureData[type] = {
            url: canvas.toDataURL(),
            texture: null
        }
        
        // Create a new image for the inventory
        const img = new Image()
        img.src = canvas.toDataURL()
        img.className = 'block-icon'
        textureData[type].image = img
    })
    
    return textureData
}

function registerBlocks(noa, blockTextureData) {
    // Register block materials
    const createMaterial = function(texture) {
        const img = new Image()
        img.src = texture.url
        
        // Create a Three.js texture from the image
        const tex = new THREE.Texture(img)
        img.onload = function() {
            tex.needsUpdate = true
        }
        
        // Set texture filtering for blocky look
        tex.magFilter = THREE.NearestFilter
        tex.minFilter = THREE.NearestFilter
        
        // Store the texture in the data object
        texture.texture = tex
        
        // Create a material from the texture
        const mat = noa.rendering.makeStandardMaterial()
        mat.map = tex
        return mat
    }
    
    // Block IDs
    const AIR = 0
    const DIRT = 1
    const GRASS = 2
    const STONE = 3
    const WOOD = 4
    const LEAVES = 5
    
    // Register block types with materials
    noa.registry.registerMaterial('dirt', createMaterial(blockTextureData.dirt), null)
    noa.registry.registerMaterial('grass', createMaterial(blockTextureData.grass), null)
    noa.registry.registerMaterial('stone', createMaterial(blockTextureData.stone), null)
    noa.registry.registerMaterial('wood', createMaterial(blockTextureData.wood), null)
    noa.registry.registerMaterial('leaves', createMaterial(blockTextureData.leaves), null)
    
    // Register blocks
    noa.registry.registerBlock(DIRT, { material: 'dirt' })
    noa.registry.registerBlock(GRASS, { material: 'grass' })
    noa.registry.registerBlock(STONE, { material: 'stone' })
    noa.registry.registerBlock(WOOD, { material: 'wood' })
    noa.registry.registerBlock(LEAVES, { material: 'leaves' })
    
    // Export block IDs so other functions can use them
    return {
        AIR, DIRT, GRASS, STONE, WOOD, LEAVES
    }
}

function setupWorldGeneration(noa) {
    // Get block IDs
    const { AIR, DIRT, GRASS, STONE, WOOD, LEAVES } = blockIDs
    
    // Function to generate world chunks
    noa.world.on('worldDataNeeded', function(id, data, x, y, z) {
        // Set up parameters for terrain generation
        const baseHeight = 10
        const amplitude = 5
        const frequency = 0.05
        
        // Simple 2D Perlin-like noise function
        function noise2D(x, z) {
            return Math.sin(x * frequency) * Math.cos(z * frequency) * 0.5 + 0.5
        }
        
        // Fill the chunk with blocks
        for (let i = 0; i < data.shape[0]; i++) {
            for (let j = 0; j < data.shape[1]; j++) {
                for (let k = 0; k < data.shape[2]; k++) {
                    // Get the world position
                    const worldX = x + i
                    const worldY = y + j
                    const worldZ = z + k
                    
                    // Generate height map
                    const height = Math.floor(baseHeight + amplitude * noise2D(worldX, worldZ))
                    
                    // Set blocks based on height
                    if (worldY < height - 4) {
                        data.set(i, j, k, STONE)
                    } else if (worldY < height - 1) {
                        data.set(i, j, k, DIRT)
                    } else if (worldY === height - 1) {
                        data.set(i, j, k, GRASS)
                    } else {
                        // Above ground level - generate trees occasionally
                        if (worldY === height && Math.random() < 0.01 &&
                            worldX % 7 === 0 && worldZ % 7 === 0) {
                            // Tree trunk
                            for (let treeHeight = 0; treeHeight < 5; treeHeight++) {
                                if (j + treeHeight < data.shape[1]) {
                                    data.set(i, j + treeHeight, k, WOOD)
                                }
                            }
                            
                            // Tree leaves
                            for (let lx = -2; lx <= 2; lx++) {
                                for (let lz = -2; lz <= 2; lz++) {
                                    for (let ly = 3; ly <= 6; ly++) {
                                        // Skip if outside the chunk
                                        if (i + lx < 0 || i + lx >= data.shape[0] ||
                                            j + ly < 0 || j + ly >= data.shape[1] ||
                                            k + lz < 0 || k + lz >= data.shape[2]) {
                                            continue
                                        }
                                        
                                        // Place leaves in a rough sphere
                                        const dist = Math.sqrt(lx * lx + (ly - 4.5) * (ly - 4.5) + lz * lz)
                                        if (dist < 2.5 && Math.random() > 0.2) {
                                            data.set(i + lx, j + ly, k + lz, LEAVES)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Tell noa the chunk is ready
        noa.world.setChunkData(id, data)
    })
}

function setupPlayer(noa) {
    try {
        // Check if noa is properly initialized
        if (!noa || !noa.entities) {
            console.error('noa or noa.entities is not initialized in setupPlayer');
            return;
        }
        
        // Set player position high above the terrain to avoid spawning inside blocks
        const playerHeight = 80; // Increased height to ensure player starts above terrain
        
        try {
            const playerPosition = noa.entities.getPosition(noa.playerEntity);
            if (playerPosition && playerPosition.length >= 2) {
                playerPosition[1] = playerHeight;
                console.log('Setting player position to height:', playerHeight);
            } else {
                console.warn('Could not get player position');
            }
        } catch (error) {
            console.warn('Error setting player position:', error);
        }
        
        try {
            // Add a mesh to the player entity
            const mesh = BABYLON.MeshBuilder.CreateBox('player-mesh', {
                height: 1.8,
                width: 0.6,
                depth: 0.6
            }, noa.rendering.getScene());
            
            mesh.material = new BABYLON.StandardMaterial('player-mat', noa.rendering.getScene());
            mesh.material.diffuseColor = new BABYLON.Color3(0.9, 0.5, 0.3);
            mesh.material.alpha = 0.8;
            
            // Offset the mesh so its bottom is at the entity's position
            const offset = [0, 0.9, 0];
            
            // Add the mesh to the entity
            if (noa.entities.names && noa.entities.names.mesh) {
                noa.entities.addComponent(noa.playerEntity, noa.entities.names.mesh, {
                    mesh: mesh,
                    offset: offset
                });
            } else {
                console.warn('Mesh component not available');
            }
        } catch (error) {
            console.warn('Error setting up player mesh:', error);
        }
        
        // Check if camera component exists before adding
        if (noa.components && noa.components.camera) {
            try {
                // Set camera options
                if (noa.camera) {
                    noa.camera.zoomDistance = 5;
                }
                
                // Add camera component to player
                noa.entities.addComponent(noa.playerEntity, noa.components.camera, {
                    offset: [0, 1.5, 0],
                    inverseX: opts && opts.inverseX,
                    inverseY: opts && opts.inverseY
                });
            } catch (error) {
                console.warn('Error setting up camera:', error);
            }
        } else {
            console.warn('Camera component not found, skipping camera setup');
        }
        
        // Check if physics component exists before adding
        if (noa.components && noa.components.physics) {
            try {
                // Add physics component to player
                noa.entities.addComponent(noa.playerEntity, noa.components.physics, {
                    mass: 1,
                    friction: 0.3,
                    restitution: 0.1
                });
            } catch (error) {
                console.warn('Error setting up physics:', error);
            }
        } else {
            console.warn('Physics component not found, skipping physics setup');
        }
        
        // Check if movement component exists before adding
        if (noa.components && noa.components.movement) {
            try {
                // Add movement component to player
                noa.entities.addComponent(noa.playerEntity, noa.components.movement, {
                    airJumps: 0
                });
            } catch (error) {
                console.warn('Error setting up movement:', error);
            }
        } else {
            console.warn('Movement component not found, skipping movement setup');
        }
        
        console.log('Player setup complete');
    } catch (error) {
        console.error('Error in setupPlayer:', error);
    }
}

function setupInput(noa) {
    try {
        // Get block IDs
        const { AIR, DIRT, GRASS, STONE, WOOD, LEAVES } = blockIDs || { 
            AIR: 0, DIRT: 1, GRASS: 2, STONE: 3, WOOD: 4, LEAVES: 5 
        };
        
        // Set up global variables for selected block
        placeableBlocks = [DIRT, GRASS, STONE, WOOD, LEAVES];
        
        // Bind keys for movement
        noa.inputs.down.on('forward', function() {
            noa.inputs.state.forward = true;
        });
        noa.inputs.up.on('forward', function() {
            noa.inputs.state.forward = false;
        });
        
        noa.inputs.down.on('backward', function() {
            noa.inputs.state.backward = true;
        });
        noa.inputs.up.on('backward', function() {
            noa.inputs.state.backward = false;
        });
        
        noa.inputs.down.on('left', function() {
            noa.inputs.state.left = true;
        });
        noa.inputs.up.on('left', function() {
            noa.inputs.state.left = false;
        });
        
        noa.inputs.down.on('right', function() {
            noa.inputs.state.right = true;
        });
        noa.inputs.up.on('right', function() {
            noa.inputs.state.right = false;
        });
        
        noa.inputs.down.on('jump', function() {
            noa.inputs.state.jump = true;
        });
        noa.inputs.up.on('jump', function() {
            noa.inputs.state.jump = false;
        });
        
        // Setup keybindings for movement
        noa.inputs.bind('forward', 'KeyW');
        noa.inputs.bind('backward', 'KeyS');
        noa.inputs.bind('left', 'KeyA');
        noa.inputs.bind('right', 'KeyD');
        noa.inputs.bind('jump', 'Space');
        
        // Block selection with number keys
        for (let i = 1; i <= 5; i++) {
            noa.inputs.bind(`block${i}`, `Digit${i}`);
            noa.inputs.down.on(`block${i}`, function() {
                selectedBlockIndex = i - 1;
                window.standaloneSelectedBlockIndex = i - 1; // Update standalone inventory
                
                // Update standalone inventory UI
                document.querySelectorAll('#standalone-inventory > div').forEach((s, idx) => {
                    if (idx === i - 1) {
                        s.style.borderColor = 'gold';
                        s.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                        s.style.transform = 'translateY(-10px)';
                        s.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.5)';
                    } else {
                        s.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                        s.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                        s.style.transform = 'none';
                        s.style.boxShadow = 'none';
                    }
                });
                
                console.log('Selected block index:', i - 1);
            });
        }
        
        // Toggle instructions
        noa.inputs.bind('toggle-instructions', 'KeyE');
        noa.inputs.down.on('toggle-instructions', function() {
            if (instructionsEl.style.display === 'none') {
                instructionsEl.style.display = 'block';
            } else {
                instructionsEl.style.display = 'none';
            }
        });
        
        // Left click to break blocks
        noa.inputs.down.on('fire', function() {
            if (noa.targetedBlock) {
                const pos = noa.targetedBlock.position;
                noa.setBlock(0, pos[0], pos[1], pos[2]);
                console.log('Block broken at', pos);
            }
        });
        noa.inputs.bind('fire', 'mouse1');
        
        // Right click to place blocks - completely rewritten
        // First, unbind any existing bindings
        try {
            noa.inputs.unbind('alt-fire');
        } catch (e) {
            console.log('No existing alt-fire binding to unbind');
        }
        
        // Create a new binding for right-click
        noa.inputs.bind('alt-fire', 'mouse3'); // mouse3 is right click
        
        // Add the event handler
        noa.inputs.down.on('alt-fire', function() {
            console.log('Right click detected (alt-fire)');
            placeBlockAtTargeted();
        });
        
        // Also add a direct DOM event listener for right-click as a backup
        document.getElementById('container').addEventListener('mousedown', function(event) {
            // Check if it's a right-click (button 2)
            if (event.button === 2) {
                console.log('Right click detected (DOM event)');
                event.preventDefault();
                placeBlockAtTargeted();
                return false;
            }
        });
        
        // Function to place a block at the targeted position
        function placeBlockAtTargeted() {
            try {
                if (noa && noa.targetedBlock) {
                    console.log('Targeted block found');
                    const pos = noa.targetedBlock.position;
                    const adj = noa.targetedBlock.normal;
                    const placePos = [
                        pos[0] + adj[0],
                        pos[1] + adj[1],
                        pos[2] + adj[2]
                    ];
                    
                    // Get the selected block index
                    const blockIndex = typeof window.standaloneSelectedBlockIndex !== 'undefined' ? 
                        window.standaloneSelectedBlockIndex : 0;
                    
                    console.log('Placing block:', blockIndex, 'at position:', placePos);
                    
                    // Check if the position is not occupied by the player
                    // Use a try-catch to handle the case where isInAABB is not available
                    let canPlaceBlock = true;
                    try {
                        if (noa.entities && typeof noa.entities.isInAABB === 'function') {
                            canPlaceBlock = !noa.entities.isInAABB(noa.playerEntity, placePos[0], placePos[1], placePos[2]);
                        }
                    } catch (error) {
                        console.log('Error checking player collision, proceeding with block placement:', error);
                    }
                    
                    if (canPlaceBlock) {
                        try {
                            noa.setBlock(placeableBlocks[blockIndex], placePos[0], placePos[1], placePos[2]);
                            console.log('Block placed successfully');
                        } catch (error) {
                            console.error('Error placing block:', error);
                        }
                    } else {
                        console.log('Cannot place block - position occupied by player');
                    }
                } else {
                    console.log('No targeted block found or noa not initialized');
                }
            } catch (error) {
                console.error('Error in placeBlockAtTargeted:', error);
            }
        }
        
        // Make the function globally accessible
        window.placeBlockAtTargeted = placeBlockAtTargeted;
        
        // Add a key binding for placing blocks
        noa.inputs.bind('place-block', 'KeyP');
        noa.inputs.down.on('place-block', function() {
            console.log('P key pressed, placing block');
            placeBlockAtTargeted();
        });
        
        console.log('Input setup complete');
    } catch (error) {
        console.error('Error in setupInput:', error);
    }
}

function updateInventoryUI() {
    const slots = document.querySelectorAll('.inventory-slot')
    slots.forEach((slot, index) => {
        slot.classList.remove('selected')
        if (index === selectedBlockIndex) {
            slot.classList.add('selected')
        }
    })
}

function setupInventory() {
    // Skip inventory setup since we're using the standalone inventory
    console.log('Skipping original inventory setup since we are using standalone inventory');
    return;
    
    // The code below is kept for reference but won't execute
    console.log('Setting up inventory...')
    
    // Clear any existing inventory slots
    inventoryEl.innerHTML = ''
    
    // Make sure inventory is visible
    inventoryEl.style.display = 'flex'
    inventoryEl.style.visibility = 'visible'
    inventoryEl.style.opacity = '1'
    
    // Add a background container to make it more visible
    inventoryEl.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
    inventoryEl.style.padding = '20px'
    inventoryEl.style.borderRadius = '15px'
    inventoryEl.style.border = '4px solid rgba(255, 255, 255, 0.5)'
    inventoryEl.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.8)'
}

// Create a fixed inventory that will always be visible
function createFixedInventory() {
    // Remove any existing inventory
    const oldInventory = document.getElementById('inventory')
    if (oldInventory) {
        oldInventory.remove()
    }
    
    // Create a new inventory element
    const newInventory = document.createElement('div')
    newInventory.id = 'inventory'
    
    // Apply styles directly
    Object.assign(newInventory.style, {
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: '20px',
        borderRadius: '15px',
        zIndex: '9999',
        border: '4px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
        width: 'auto',
        minWidth: '500px',
        justifyContent: 'center'
    })
    
    // Add block types
    const blockTypes = [
        { name: 'Dirt', color: '#8B4513' },
        { name: 'Grass', color: '#567D46' },
        { name: 'Stone', color: '#808080' },
        { name: 'Wood', color: '#8B5A2B' },
        { name: 'Leaves', color: '#4A7023' }
    ]
    
    blockTypes.forEach((block, index) => {
        const slot = document.createElement('div')
        
        // Apply styles to slot
        Object.assign(slot.style, {
            width: '70px',
            height: '70px',
            margin: '0 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            border: index === 0 ? '4px solid #ffff00' : '4px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            transform: index === 0 ? 'translateY(-8px)' : 'none',
            boxShadow: index === 0 ? '0 8px 15px rgba(0, 0, 0, 0.3)' : 'none',
            transition: 'all 0.2s ease'
        })
        
        // Add class for event handling
        slot.className = 'inventory-slot'
        if (index === 0) {
            slot.classList.add('selected')
        }
        
        // Create block icon
        const icon = document.createElement('div')
        Object.assign(icon.style, {
            width: '50px',
            height: '50px',
            backgroundColor: block.color
        })
        slot.appendChild(icon)
        
        // Add block name
        const name = document.createElement('div')
        name.textContent = block.name
        Object.assign(name.style, {
            position: 'absolute',
            bottom: '-25px',
            left: '0',
            right: '0',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 2px black'
        })
        slot.appendChild(name)
        
        // Add click event
        slot.addEventListener('click', function() {
            // Update selected block index
            selectedBlockIndex = index
            
            // Update UI
            document.querySelectorAll('.inventory-slot').forEach((s, i) => {
                if (i === index) {
                    s.style.borderColor = '#ffff00'
                    s.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                    s.style.transform = 'translateY(-8px)'
                    s.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.3)'
                } else {
                    s.style.borderColor = 'rgba(255, 255, 255, 0.6)'
                    s.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
                    s.style.transform = 'none'
                    s.style.boxShadow = 'none'
                }
            })
        })
        
        newInventory.appendChild(slot)
    })
    
    // Add to document
    document.body.appendChild(newInventory)
    
    // Update the global reference
    inventoryEl = newInventory
    
    console.log('Fixed inventory created with', blockTypes.length, 'blocks')
    return newInventory
}

// Add this function to create a standalone inventory
function createStandaloneInventory() {
    console.log('Creating standalone inventory');
    
    // Remove existing inventory if it exists
    const existingInventory = document.getElementById('standalone-inventory');
    if (existingInventory) {
        existingInventory.remove();
    }
    
    // Create inventory container
    const inventory = document.createElement('div');
    inventory.id = 'standalone-inventory';
    inventory.style.position = 'fixed';
    inventory.style.bottom = '20px';
    inventory.style.left = '50%';
    inventory.style.transform = 'translateX(-50%)';
    inventory.style.display = 'flex';
    inventory.style.gap = '10px';
    inventory.style.padding = '15px';
    inventory.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    inventory.style.borderRadius = '10px';
    inventory.style.zIndex = '10000'; // Very high z-index to ensure visibility
    inventory.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.8)';
    inventory.style.border = '3px solid gold';
    
    // Define block types with colors
    const blockTypes = [
        { name: 'Dirt', color: '#8B4513' },
        { name: 'Grass', color: '#567D46' },
        { name: 'Stone', color: '#808080' },
        { name: 'Wood', color: '#A0522D' },
        { name: 'Leaves', color: '#228B22' }
    ];
    
    // Set up global variable for selected block
    window.standaloneSelectedBlockIndex = 0;
    
    // Create slots for each block type
    blockTypes.forEach((block, index) => {
        const slot = document.createElement('div');
        slot.style.width = '70px';
        slot.style.height = '70px';
        slot.style.backgroundColor = index === 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)';
        slot.style.border = `4px solid ${index === 0 ? 'gold' : 'rgba(255, 255, 255, 0.6)'}`;
        slot.style.borderRadius = '8px';
        slot.style.display = 'flex';
        slot.style.flexDirection = 'column';
        slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center';
        slot.style.cursor = 'pointer';
        slot.style.transition = 'all 0.2s ease';
        slot.style.transform = index === 0 ? 'translateY(-10px)' : 'none';
        slot.style.boxShadow = index === 0 ? '0 10px 20px rgba(0, 0, 0, 0.5)' : 'none';
        
        // Create block icon
        const icon = document.createElement('div');
        icon.style.width = '50px';
        icon.style.height = '50px';
        icon.style.backgroundColor = block.color;
        icon.style.borderRadius = '4px';
        icon.style.boxShadow = 'inset 0 0 10px rgba(0, 0, 0, 0.5)';
        
        // Create block name label
        const label = document.createElement('div');
        label.textContent = block.name;
        label.style.fontSize = '14px';
        label.style.fontWeight = 'bold';
        label.style.color = 'white';
        label.style.marginTop = '5px';
        label.style.textShadow = '1px 1px 2px black';
        
        // Add click event to select this block
        slot.addEventListener('click', () => {
            window.standaloneSelectedBlockIndex = index;
            
            // Update UI to show selected block
            document.querySelectorAll('#standalone-inventory > div').forEach((s, idx) => {
                if (idx === index) {
                    s.style.borderColor = 'gold';
                    s.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                    s.style.transform = 'translateY(-10px)';
                    s.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.5)';
                } else {
                    s.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    s.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                    s.style.transform = 'none';
                    s.style.boxShadow = 'none';
                }
            });
            
            // Also update the game's selectedBlockIndex if it exists
            if (typeof selectedBlockIndex !== 'undefined') {
                selectedBlockIndex = index;
                if (typeof updateInventoryUI === 'function') {
                    updateInventoryUI();
                }
            }
            
            console.log('Selected block:', block.name, 'at index', index);
        });
        
        // Add elements to slot
        slot.appendChild(icon);
        slot.appendChild(label);
        inventory.appendChild(slot);
    });
    
    // Add inventory to document
    document.body.appendChild(inventory);
    console.log(`Standalone inventory created with ${blockTypes.length} blocks`);
}

// Add this function to ensure the inventory is created and visible
function ensureInventoryIsVisible() {
    console.log('Ensuring inventory is visible...');
    
    // Check if standalone inventory exists
    let inventory = document.getElementById('standalone-inventory');
    
    // If it doesn't exist, create it
    if (!inventory) {
        console.log('Standalone inventory not found, creating it');
        createStandaloneInventory();
    } else {
        console.log('Standalone inventory found, ensuring it is visible');
        inventory.style.display = 'flex';
        inventory.style.zIndex = '10000';
        inventory.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        inventory.style.border = '5px solid gold';
        inventory.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.5)';
    }
    
    // Log the inventory status
    debugElements();
}

// Call this function multiple times to ensure the inventory is visible
setTimeout(ensureInventoryIsVisible, 1000);
setTimeout(ensureInventoryIsVisible, 3000);
setTimeout(ensureInventoryIsVisible, 5000);

// Add a keyboard shortcut to toggle the inventory
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyI') {
        console.log('I key pressed, toggling inventory visibility');
        const inventory = document.getElementById('standalone-inventory');
        if (inventory) {
            inventory.style.display = inventory.style.display === 'none' ? 'flex' : 'none';
            console.log('Inventory display set to:', inventory.style.display);
        } else {
            console.log('Inventory not found, creating it');
            createStandaloneInventory();
        }
    }
});

// Add a keyboard shortcut for placing blocks
document.addEventListener('keydown', function(event) {
    // Check if the P key was pressed
    if (event.code === 'KeyP') {
        console.log('P key pressed for placing block');
        
        // Try the simple block placement first
        if (typeof window.simplePlaceBlock === 'function') {
            window.simplePlaceBlock();
        } else {
            // Fall back to the original method
            try {
                // Try to place a block
                if (noa && noa.targetedBlock) {
                    const pos = noa.targetedBlock.position;
                    const adj = noa.targetedBlock.normal;
                    const placePos = [
                        pos[0] + adj[0],
                        pos[1] + adj[1],
                        pos[2] + adj[2]
                    ];
                    
                    // Get the selected block index
                    const blockIndex = typeof window.standaloneSelectedBlockIndex !== 'undefined' ? 
                        window.standaloneSelectedBlockIndex : 0;
                    
                    console.log('Attempting to place block type:', blockIndex, 'at position:', placePos);
                    
                    try {
                        // Direct call to setBlock without collision check
                        noa.setBlock(placeableBlocks[blockIndex], placePos[0], placePos[1], placePos[2]);
                        console.log('Block placed successfully via P key');
                    } catch (error) {
                        console.error('Error placing block via P key:', error);
                    }
                } else {
                    console.log('No targeted block found for P key placement');
                }
            } catch (error) {
                console.error('Error in P key block placement:', error);
            }
        }
    }
});

// Update the HTML file to use this module
console.log('noa-engine initialized successfully!')

// Add this after noa is initialized
// Add a direct event listener to the container for right-click
setTimeout(() => {
    const containerElement = document.getElementById('container');
    if (containerElement) {
        console.log('Adding right-click event listener to container');
        containerElement.addEventListener('mousedown', function(event) {
            if (event.button === 2) { // Right click
                console.log('Container right-click detected');
                event.preventDefault();
                
                // Try to place a block
                if (noa && noa.targetedBlock) {
                    const pos = noa.targetedBlock.position;
                    const adj = noa.targetedBlock.normal;
                    const placePos = [
                        pos[0] + adj[0],
                        pos[1] + adj[1],
                        pos[2] + adj[2]
                    ];
                    
                    // Get the selected block index
                    const blockIndex = typeof window.standaloneSelectedBlockIndex !== 'undefined' ? 
                        window.standaloneSelectedBlockIndex : 0;
                    
                    // Check if the position is not occupied by the player
                    if (!noa.entities.isInAABB(noa.playerEntity, placePos[0], placePos[1], placePos[2])) {
                        noa.setBlock(placeableBlocks[blockIndex], placePos[0], placePos[1], placePos[2]);
                        console.log('Block placed via container right-click');
                    }
                }
                
                return false;
            }
        }, false);
    } else {
        console.error('Container element not found');
    }
}, 1000);

// Add a simple direct block placement function
function simplePlaceBlock() {
    try {
        console.log('Attempting simple block placement');
        
        if (!noa || !noa.targetedBlock) {
            console.log('No targeted block or noa not initialized');
            return;
        }
        
        const pos = noa.targetedBlock.position;
        const adj = noa.targetedBlock.normal;
        
        if (!pos || !adj) {
            console.log('Invalid position or normal vector');
            return;
        }
        
        const placePos = [
            pos[0] + adj[0],
            pos[1] + adj[1],
            pos[2] + adj[2]
        ];
        
        // Get the selected block index
        const blockIndex = typeof window.standaloneSelectedBlockIndex !== 'undefined' ? 
            window.standaloneSelectedBlockIndex : 0;
        
        console.log('Simple place block at position:', placePos, 'with block type:', blockIndex);
        
        // Get the block ID to place
        let blockID = 1; // Default to dirt if placeableBlocks is not available
        
        if (Array.isArray(placeableBlocks) && placeableBlocks.length > blockIndex) {
            blockID = placeableBlocks[blockIndex];
        } else if (blockIDs) {
            // Try to get block ID from blockIDs
            const blockTypes = ['DIRT', 'GRASS', 'STONE', 'WOOD', 'LEAVES'];
            if (blockIndex < blockTypes.length && blockIDs[blockTypes[blockIndex]]) {
                blockID = blockIDs[blockTypes[blockIndex]];
            }
        }
        
        console.log('Using block ID:', blockID);
        
        // Direct call to setBlock
        try {
            noa.setBlock(blockID, placePos[0], placePos[1], placePos[2]);
            console.log('Block placed successfully via simple method');
            return true;
        } catch (error) {
            console.error('Error in simple block placement:', error);
            return false;
        }
    } catch (error) {
        console.error('Error in simplePlaceBlock:', error);
        return false;
    }
}

// Make the function globally accessible
window.simplePlaceBlock = simplePlaceBlock;

// Add a keyboard shortcut for simple block placement
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyB') {
        console.log('B key pressed for simple block placement');
        simplePlaceBlock();
    }
});
