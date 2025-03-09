document.addEventListener('DOMContentLoaded', function() {
    // Setup options for noa engine
    const opts = {
        debug: false,
        showFPS: false,
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
    };

    // Log all global variables to help debug
    console.log('All globals:', Object.keys(window));

    // Create noa instance - try different global variables
    let noa;
    try {
        if (window.noa && window.noa.Engine) {
            noa = new window.noa.Engine(opts);
            console.log('Using window.noa.Engine');
        } else if (window.Engine) {
            noa = new window.Engine(opts);
            console.log('Using window.Engine');
        } else if (typeof Engine !== 'undefined') {
            noa = new Engine(opts);
            console.log('Using Engine');
        } else if (window.NOAS) {
            noa = new window.NOAS(opts);
            console.log('Using window.NOAS');
        } else {
            console.error('Could not find noa engine constructor');
            return;
        }
    } catch (e) {
        console.error('Error creating noa instance:', e);
        return;
    }
    
    // Set background color to sky blue
    noa.rendering.backgroundColor = [0.5, 0.7, 0.9];
    
    // Get references to DOM elements
    const container = document.getElementById('container');
    const inventoryEl = document.getElementById('inventory');
    const instructionsEl = document.getElementById('instructions');
    
    // Resize the container to the window size
    container.style.width = window.innerWidth + 'px';
    container.style.height = window.innerHeight + 'px';
    
    // Set up camera
    noa.camera.zoomDistance = 5;
    
    // Create procedural texture for the blocks
    const blockTextureData = createBlockTextures();
    
    // Register block materials and textures
    registerBlocks(noa, blockTextureData);
    
    // Generate terrain
    setupWorldGeneration(noa);
    
    // Setup player
    setupPlayer(noa);
    
    // Setup input handling
    setupInput(noa);
    
    // Setup inventory UI
    setupInventory();
    
    // Handle resize
    window.addEventListener('resize', function() {
        container.style.width = window.innerWidth + 'px';
        container.style.height = window.innerHeight + 'px';
        noa.rendering.resize();
    });
    
    // Start the game loop
    noa.ticker.start();

    // Helper functions
    function createBlockTextures() {
        const blockTypes = ['dirt', 'grass', 'stone', 'wood', 'leaves'];
        const textureData = {};
        
        // Create a canvas for textures
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        
        blockTypes.forEach(type => {
            // Clear canvas
            ctx.clearRect(0, 0, 16, 16);
            
            // Draw different textures based on block type
            switch (type) {
                case 'dirt':
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(0, 0, 16, 16);
                    // Add some texture details
                    ctx.fillStyle = '#6B3300';
                    for (let i = 0; i < 10; i++) {
                        const x = Math.floor(Math.random() * 16);
                        const y = Math.floor(Math.random() * 16);
                        const size = 1 + Math.floor(Math.random() * 2);
                        ctx.fillRect(x, y, size, size);
                    }
                    break;
                    
                case 'grass':
                    // Dirt bottom
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(0, 0, 16, 16);
                    // Grass top
                    ctx.fillStyle = '#567D46';
                    ctx.fillRect(0, 0, 16, 4);
                    // Transition
                    ctx.fillStyle = '#6B9362';
                    ctx.fillRect(0, 4, 16, 2);
                    // Texture details
                    ctx.fillStyle = '#7CAF71';
                    for (let i = 0; i < 5; i++) {
                        const x = Math.floor(Math.random() * 16);
                        ctx.fillRect(x, Math.floor(Math.random() * 3), 1, 2);
                    }
                    break;
                    
                case 'stone':
                    ctx.fillStyle = '#808080';
                    ctx.fillRect(0, 0, 16, 16);
                    // Add some texture details
                    ctx.fillStyle = '#707070';
                    for (let i = 0; i < 8; i++) {
                        const x = Math.floor(Math.random() * 16);
                        const y = Math.floor(Math.random() * 16);
                        const size = 1 + Math.floor(Math.random() * 3);
                        ctx.fillRect(x, y, size, size);
                    }
                    ctx.fillStyle = '#909090';
                    for (let i = 0; i < 5; i++) {
                        const x = Math.floor(Math.random() * 16);
                        const y = Math.floor(Math.random() * 16);
                        const size = 1 + Math.floor(Math.random() * 2);
                        ctx.fillRect(x, y, size, size);
                    }
                    break;
                    
                case 'wood':
                    ctx.fillStyle = '#8B5A2B';
                    ctx.fillRect(0, 0, 16, 16);
                    // Add wood grain
                    ctx.fillStyle = '#704623';
                    for (let i = 0; i < 16; i += 4) {
                        ctx.fillRect(0, i, 16, 2);
                    }
                    break;
                    
                case 'leaves':
                    ctx.fillStyle = '#4A7023';
                    ctx.fillRect(0, 0, 16, 16);
                    // Add some texture details
                    ctx.fillStyle = '#3A5D1A';
                    for (let i = 0; i < 20; i++) {
                        const x = Math.floor(Math.random() * 16);
                        const y = Math.floor(Math.random() * 16);
                        const size = 1 + Math.floor(Math.random() * 2);
                        ctx.fillRect(x, y, size, size);
                    }
                    ctx.fillStyle = '#5A8033';
                    for (let i = 0; i < 10; i++) {
                        const x = Math.floor(Math.random() * 16);
                        const y = Math.floor(Math.random() * 16);
                        const size = 1;
                        ctx.fillRect(x, y, size, size);
                    }
                    break;
            }
            
            // Store the texture data URL
            textureData[type] = {
                url: canvas.toDataURL(),
                texture: null
            };
            
            // Create a new image for the inventory
            const img = new Image();
            img.src = canvas.toDataURL();
            img.className = 'block-icon';
            textureData[type].image = img;
        });
        
        return textureData;
    }
    
    function registerBlocks(noa, blockTextureData) {
        // Register block materials
        const createMaterial = function(texture) {
            const img = new Image();
            img.src = texture.url;
            
            // Create a Three.js texture from the image
            const tex = new THREE.Texture(img);
            img.onload = function() {
                tex.needsUpdate = true;
            };
            
            // Set texture filtering for blocky look
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            
            // Store the texture in the data object
            texture.texture = tex;
            
            // Create a material from the texture
            const mat = noa.rendering.makeStandardMaterial();
            mat.map = tex;
            return mat;
        };
        
        // Block IDs
        const AIR = 0;
        const DIRT = 1;
        const GRASS = 2;
        const STONE = 3;
        const WOOD = 4;
        const LEAVES = 5;
        
        // Register block types with materials
        noa.registry.registerMaterial('dirt', createMaterial(blockTextureData.dirt), null);
        noa.registry.registerMaterial('grass', createMaterial(blockTextureData.grass), null);
        noa.registry.registerMaterial('stone', createMaterial(blockTextureData.stone), null);
        noa.registry.registerMaterial('wood', createMaterial(blockTextureData.wood), null);
        noa.registry.registerMaterial('leaves', createMaterial(blockTextureData.leaves), null);
        
        // Register blocks
        noa.registry.registerBlock(DIRT, { material: 'dirt' });
        noa.registry.registerBlock(GRASS, { material: 'grass' });
        noa.registry.registerBlock(STONE, { material: 'stone' });
        noa.registry.registerBlock(WOOD, { material: 'wood' });
        noa.registry.registerBlock(LEAVES, { material: 'leaves' });
        
        // Export block IDs so other functions can use them
        return {
            AIR, DIRT, GRASS, STONE, WOOD, LEAVES
        };
    }
    
    function setupWorldGeneration(noa) {
        // Get block IDs
        const { AIR, DIRT, GRASS, STONE, WOOD, LEAVES } = noa.registry.getBlockIDsObj();
        
        // Function to generate world chunks
        noa.world.on('worldDataNeeded', function(id, data, x, y, z) {
            // Set up parameters for terrain generation
            const baseHeight = 10;
            const amplitude = 5;
            const frequency = 0.05;
            
            // Simple 2D Perlin-like noise function
            function noise2D(x, z) {
                return Math.sin(x * frequency) * Math.cos(z * frequency) * 0.5 + 0.5;
            }
            
            // Fill the chunk with blocks
            for (let i = 0; i < data.shape[0]; i++) {
                for (let j = 0; j < data.shape[1]; j++) {
                    for (let k = 0; k < data.shape[2]; k++) {
                        // Get the world position
                        const worldX = x + i;
                        const worldY = y + j;
                        const worldZ = z + k;
                        
                        // Generate height map
                        const height = Math.floor(baseHeight + amplitude * noise2D(worldX, worldZ));
                        
                        // Set blocks based on height
                        if (worldY < height - 4) {
                            data.set(i, j, k, STONE);
                        } else if (worldY < height - 1) {
                            data.set(i, j, k, DIRT);
                        } else if (worldY === height - 1) {
                            data.set(i, j, k, GRASS);
                        } else {
                            // Above ground level - generate trees occasionally
                            if (worldY === height && Math.random() < 0.01 &&
                                worldX % 7 === 0 && worldZ % 7 === 0) {
                                // Tree trunk
                                for (let treeHeight = 0; treeHeight < 5; treeHeight++) {
                                    if (j + treeHeight < data.shape[1]) {
                                        data.set(i, j + treeHeight, k, WOOD);
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
                                                continue;
                                            }
                                            
                                            // Place leaves in a rough sphere
                                            const dist = Math.sqrt(lx * lx + (ly - 4.5) * (ly - 4.5) + lz * lz);
                                            if (dist < 2.5 && Math.random() > 0.2) {
                                                data.set(i + lx, j + ly, k + lz, LEAVES);
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
            noa.world.setChunkData(id, data);
        });
    }
    
    function setupPlayer(noa) {
        // Get the player entity
        const player = noa.playerEntity;
        
        // Add an offset to the camera
        noa.entities.addComponent(player, noa.components.camera, {
            offset: [0, 1.6, 0],
            inverseX: false,
            inverseY: false
        });
        
        // Set player position above ground
        noa.entities.setPosition(player, [0, 25, 0]);
        
        // Add physics to the player
        noa.entities.addComponent(player, noa.components.physics, {
            mass: 1,
            drag: 0.3,
            friction: 1
        });
        
        // Add movement to the player
        noa.entities.addComponent(player, noa.components.movement, {
            airJumps: 0,
            jumpForce: 7,
            jumpTime: 250,
            moveForce: 30,
            responsiveness: 15,
            runningFriction: 0
        });
    }
    
    function setupInput(noa) {
        // Get block IDs
        const { AIR, DIRT, GRASS, STONE, WOOD, LEAVES } = noa.registry.getBlockIDsObj();
        
        // Set up global variables for selected block
        let selectedBlockIndex = 0;
        const placeableBlocks = [DIRT, GRASS, STONE, WOOD, LEAVES];
        
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
        noa.inputs.bind('forward', 'W');
        noa.inputs.bind('backward', 'S');
        noa.inputs.bind('left', 'A');
        noa.inputs.bind('right', 'D');
        noa.inputs.bind('jump', 'space');
        
        // Block selection with number keys
        for (let i = 1; i <= 5; i++) {
            noa.inputs.bind(`block${i}`, `${i}`);
            noa.inputs.down.on(`block${i}`, function() {
                selectedBlockIndex = i - 1;
                updateInventoryUI();
            });
        }
        
        // Toggle instructions
        noa.inputs.bind('toggle-instructions', 'E');
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
            }
        });
        noa.inputs.bind('fire', 'mouse1');
        
        // Right click to place blocks
        noa.inputs.down.on('alt-fire', function() {
            if (noa.targetedBlock) {
                const pos = noa.targetedBlock.position;
                const adj = noa.targetedBlock.normal;
                const placePos = [
                    pos[0] + adj[0],
                    pos[1] + adj[1],
                    pos[2] + adj[2]
                ];
                
                // Check if the position is not occupied by the player
                if (!noa.entities.isInAABB(noa.playerEntity, placePos[0], placePos[1], placePos[2])) {
                    noa.setBlock(placeableBlocks[selectedBlockIndex], placePos[0], placePos[1], placePos[2]);
                }
            }
        });
        noa.inputs.bind('alt-fire', 'mouse3');
        
        // Helper function to update inventory UI
        function updateInventoryUI() {
            const slots = document.querySelectorAll('.inventory-slot');
            slots.forEach((slot, index) => {
                slot.classList.remove('selected');
                if (index === selectedBlockIndex) {
                    slot.classList.add('selected');
                }
            });
        }
    }
    
    function setupInventory() {
        // Get block IDs and texture data
        const { AIR, DIRT, GRASS, STONE, WOOD, LEAVES } = noa.registry.getBlockIDsObj();
        const blockNames = ['Dirt', 'Grass', 'Stone', 'Wood', 'Leaves'];
        
        // Create inventory slots
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            if (i === 0) slot.classList.add('selected');
            
            // Create block icon
            const typeKey = blockNames[i].toLowerCase();
            const icon = blockTextureData[typeKey].image.cloneNode();
            slot.appendChild(icon);
            
            // Add click event
            slot.addEventListener('click', function() {
                // Update selected block index
                selectedBlockIndex = i;
                
                // Update UI
                const slots = document.querySelectorAll('.inventory-slot');
                slots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });
            
            inventoryEl.appendChild(slot);
        }
    }
});