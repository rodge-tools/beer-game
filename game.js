const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Create a separate canvas for the beer
const beerCanvas = document.createElement('canvas');
beerCanvas.width = canvas.width;
beerCanvas.height = canvas.height;
const beerCtx = beerCanvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;
beerCanvas.width = 800;
beerCanvas.height = 600;

// Load images
const images = {
    man: new Image(),
    beer: new Image(),
    woman1: new Image(),
    woman2: new Image(),
    woman3: new Image(),
    womanDance1: new Image(),
    womanDance2: new Image(),
    womanDance3: new Image(),
    barBackground: new Image(),
    barCounter: new Image()
};

// Track loading status
let loadedImages = 0;
const totalImages = Object.keys(images).length;

// Loading screen function
function drawLoadingScreen() {
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Loading... ${Math.floor((loadedImages / totalImages) * 100)}%`, canvas.width/2, canvas.height/2);
}

// Handle image loading
function handleImageLoad() {
    loadedImages++;
    drawLoadingScreen();
    
    // Only start game when all images are loaded
    if (loadedImages === totalImages) {
        console.log('All images loaded, starting game...');
        gameLoop();
    }
}

// Set up image loading handlers
Object.values(images).forEach(img => {
    img.onload = handleImageLoad;
    img.onerror = (err) => {
        console.error('Error loading image:', err);
    };
});

// Set image sources
images.man.src = 'assets/man.png';
images.beer.src = 'assets/beer.png';
images.woman1.src = 'assets/woman1.png';
images.woman2.src = 'assets/woman2.png';
images.woman3.src = 'assets/woman3.png';
images.womanDance1.src = 'assets/woman-dance1.png';
images.womanDance2.src = 'assets/woman-dance2.png';
images.womanDance3.src = 'assets/woman-dance3.png';
images.barBackground.src = 'assets/bar-background.jpg';
images.barCounter.src = 'assets/bar-counter.jpg';

// Draw initial loading screen
drawLoadingScreen();

// Game objects
const man = {
    x: -20,    // Keeping man's position
    y: 240,
    width: 240,
    height: 400
};

const beer = {
    x: 150,
    y: 270,    // Changed from 250 to 270 (lowered slightly)
    width: 80,
    height: 120,
    isDragging: false,
    visible: true,    // New property to control visibility
    dragOffsetX: 0,
    dragOffsetY: 0
};

const women = [];
let mouseX = 0;
let mouseY = 0;

// Add at the top with other game state variables
let usedImageIndices = [1, 2, 3];  // Track available image indices

// Modify the createWoman function
function createWoman() {
    // Get a random index from available indices
    const randomIndex = Math.floor(Math.random() * usedImageIndices.length);
    const imageIndex = usedImageIndices[randomIndex];
    // Remove the used index from available indices
    usedImageIndices.splice(randomIndex, 1);
    
    return {
        x: canvas.width,
        y: 200,
        width: 200,
        height: 400,
        speed: 2,
        isDancing: false,
        danceFrame: 0,
        imageIndex: imageIndex,
        lastImageIndex: 0
    };
}

// Initialize women with different starting positions
for (let i = 0; i < 3; i++) {
    const woman = createWoman();
    // Start with 800 spacing but reduce it for each subsequent woman
    woman.x = canvas.width + (i * (800 - (i * 100))); // Each woman appears 100 pixels closer
    woman.y = 200;
    women.push(woman);
}

// Handle canvas scaling for responsive design
function getScaledCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Update beer position while dragging
    if (beer.isDragging) {
        beer.x = mouseX - beer.width / 2;
        beer.y = mouseY - beer.height / 2;
    }
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over the beer
    if (mouseX > beer.x && 
        mouseX < beer.x + beer.width &&
        mouseY > beer.y && 
        mouseY < beer.y + beer.height) {
        beer.isDragging = true;
        // Set initial offset for smooth dragging
        beer.dragOffsetX = mouseX - beer.x;
        beer.dragOffsetY = mouseY - beer.y;
    }
});

canvas.addEventListener('mouseup', () => {
    if (beer.isDragging) {
        // Check if beer is near a woman
        for (let woman of women) {
            if (Math.abs(beer.x - woman.x) < 100 && 
                Math.abs(beer.y - woman.y) < 100) {
                woman.isDancing = true;
                woman.danceFrame = 0;
                beer.visible = false;  // Hide beer when given to woman
            }
        }
        beer.isDragging = false;
    }
});

// Add touch support for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const scaled = getScaledCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    mouseX = scaled.x;
    mouseY = scaled.y;
    
    // Update beer position while dragging
    if (beer.isDragging) {
        beer.x = mouseX - beer.width / 2;
        beer.y = mouseY - beer.height / 2;
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const scaled = getScaledCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    const mouseX = scaled.x;
    const mouseY = scaled.y;
    
    // Check if touch is on the beer
    if (mouseX > beer.x && 
        mouseX < beer.x + beer.width &&
        mouseY > beer.y && 
        mouseY < beer.y + beer.height) {
        beer.isDragging = true;
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (beer.isDragging) {
        // Check if beer is near a woman
        for (let woman of women) {
            if (Math.abs(beer.x - woman.x) < 100 && 
                Math.abs(beer.y - woman.y) < 100) {
                woman.isDancing = true;
                woman.danceFrame = 0;
                beer.visible = false;  // Hide beer when given to woman
            }
        }
        beer.isDragging = false;
    }
});

// Prevent scrolling on touch devices
document.body.addEventListener('touchmove', function(e) {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

// Add fallback drawing functions
function drawFallbackRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawMan() {
    if (images.man.complete) {
        ctx.drawImage(images.man, man.x, man.y, man.width, man.height);
    } else {
        drawFallbackRect(man.x, man.y, man.width, man.height, '#4a4a4a');
    }
}

function drawBeer() {
    // Clear the beer canvas first
    beerCtx.clearRect(0, 0, beerCanvas.width, beerCanvas.height);
    
    if (images.beer.complete) {
        beerCtx.drawImage(images.beer, beer.x, beer.y, beer.width, beer.height);
    } else {
        beerCtx.fillStyle = '#ffd700';
        beerCtx.fillRect(beer.x, beer.y, beer.width, beer.height);
    }
}

function drawWoman(woman) {
    const womanImage = woman.isDancing ? 
        images[`womanDance${woman.imageIndex}`] : 
        images[`woman${woman.imageIndex}`];

    if (womanImage && womanImage.complete) {
        ctx.drawImage(womanImage, woman.x, woman.y, woman.width, woman.height);
    } else {
        drawFallbackRect(woman.x, woman.y, woman.width, woman.height, '#ff69b4');
    }
}

// Add game state
let gameStarted = false;

// Add start screen function
function drawStartScreen() {
    // Draw background
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ge din kvinna en öl!', canvas.width/2, canvas.height/2 - 50);
    
    // Draw play button
    ctx.fillStyle = '#4CAF50';
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = canvas.width/2 - buttonWidth/2;
    const buttonY = canvas.height/2 + 20;
    
    // Draw button background
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button text
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText('Spela', canvas.width/2, buttonY + 40);
    
    // Draw credits
    ctx.fillStyle = '#888';
    ctx.font = '20px Arial';
    ctx.fillText('Created by rodge', canvas.width/2, canvas.height - 30);
}

// Add click handler for play button
canvas.addEventListener('click', (e) => {
    if (!gameStarted) {
        const scaled = getScaledCoordinates(e.clientX, e.clientY);
        const mouseX = scaled.x;
        const mouseY = scaled.y;
        
        // Check if click is on play button
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = canvas.width/2 - buttonWidth/2;
        const buttonY = canvas.height/2 + 20;
        
        if (mouseX > buttonX && 
            mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && 
            mouseY < buttonY + buttonHeight) {
            gameStarted = true;
        }
    }
});

// Add touch handler for play button
canvas.addEventListener('touchend', (e) => {
    if (!gameStarted) {
        e.preventDefault();
        const scaled = getScaledCoordinates(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        const mouseX = scaled.x;
        const mouseY = scaled.y;
        
        // Check if touch is on play button
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = canvas.width/2 - buttonWidth/2;
        const buttonY = canvas.height/2 + 20;
        
        if (mouseX > buttonX && 
            mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && 
            mouseY < buttonY + buttonHeight) {
            gameStarted = true;
        }
    }
});

// Modify the game loop to handle the separate beer canvas
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    beerCtx.clearRect(0, 0, beerCanvas.width, beerCanvas.height);
    
    if (!gameStarted) {
        drawStartScreen();
    } else {
        // Draw bar background
        ctx.drawImage(images.barBackground, 0, 0, canvas.width, canvas.height);
        
        // Draw bar counter
        ctx.drawImage(images.barCounter, 0, 350, canvas.width, 50);
        
        // Draw bar stools
        for (let i = 0; i < 5; i++) {
            ctx.drawImage(images.man, 100 + i * 150, 300, 40, 50);
        }
        
        // Draw man
        drawMan();
        
        // Find the rightmost woman's position
        let rightmostX = 0;
        for (let woman of women) {
            if (woman.x > rightmostX) {
                rightmostX = woman.x;
            }
        }
        
        // Check if any woman finished dancing and reset beer
        for (let woman of women) {
            if (woman.isDancing && woman.danceFrame > 60) {
                woman.isDancing = false;
                woman.x = rightmostX + (800 - (women.indexOf(woman) * 100));
                beer.x = 150;
                beer.y = 270;
                beer.visible = true;
            }
        }
        
        // Draw beer on its canvas if visible
        if (beer.visible) {
            drawBeer();
        }
        
        // When not dragging, draw beer first (behind women)
        if (beer.visible && !beer.isDragging) {
            ctx.drawImage(beerCanvas, 0, 0);
        }
        
        // Draw women
        for (let woman of women) {
            if (!woman.isDancing) {
                woman.x -= woman.speed;
                if (woman.x < -woman.width) {
                    woman.x = rightmostX + (800 - (women.indexOf(woman) * 100));
                    woman.isDancing = false;
                    
                    if (usedImageIndices.length === 0) {
                        usedImageIndices = [1, 2, 3];
                    }
                    
                    const randomIndex = Math.floor(Math.random() * usedImageIndices.length);
                    const newIndex = usedImageIndices[randomIndex];
                    usedImageIndices.splice(randomIndex, 1);
                    
                    woman.lastImageIndex = woman.imageIndex;
                    woman.imageIndex = newIndex;
                }
            } else {
                woman.danceFrame++;
            }
            drawWoman(woman);
        }
        
        // Draw the beer canvas on top only when dragging
        if (beer.isDragging && beer.visible) {
            ctx.drawImage(beerCanvas, 0, 0);
        }
    }
    
    requestAnimationFrame(gameLoop);
} 