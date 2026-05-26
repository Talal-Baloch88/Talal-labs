/* =========================================
   5. THREE.JS BACKGROUND (Integrated Master)
========================================= */
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

// --- 1. FUNCTION TO CREATE A 2D HEXAGON TEXTURE ---
// This draws a perfect 2D hexagon to use as our particle shape instead of a boring square point
function createHexagonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 64);
    ctx.beginPath();
    
    const size = 28; // Radius of the hexagon
    const centerX = 32;
    const centerY = 32;
    
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * size;
        const y = centerY + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // Fill with solid white (Three.js will tint this color dynamically)
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
}

const hexTexture = createHexagonTexture();

// --- 2. Helper to create particle layers ---
function createParticleLayer(count, size, opacity) {
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 600; 
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
        size: size,
        color: 0x38b6ff,
        map: hexTexture,        // Apply our custom 2D hexagon shape here!
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false       // Prevents the flat shapes from clipping each other
    });
    return new THREE.Points(geometry, material);
}

// --- 3. Setup Layers & Lines ---
const backgroundLayer = createParticleLayer(4000, 1.5, 0.3); // Tiny distant hexagons
const foregroundLayer = createParticleLayer(400, 4.5, 0.8);  // Crisp, visible 2D hexagons up front
scene.add(backgroundLayer, foregroundLayer);

const linesGeometry = new THREE.BufferGeometry();
const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x38b6ff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});
const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(linesMesh);

// --- 4. Interaction State ---
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

const clock = new THREE.Clock();

// --- 5. THE SINGLE MASTER ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth movement logic (Lerping)
    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;

    // Rotate and Position Background
    backgroundLayer.rotation.y = elapsedTime * 0.02;
    backgroundLayer.position.x = targetX * 30;
    backgroundLayer.position.y = -targetY * 30;

    // Rotate and Position Foreground
    foregroundLayer.rotation.y = -elapsedTime * 0.01;
    foregroundLayer.position.x = targetX * 80;
    foregroundLayer.position.y = -targetY * 80;

    // --- Neural Network Line Logic ---
    const positions = foregroundLayer.geometry.attributes.position.array;
    const linePoints = [];
    
    for (let i = 0; i < positions.length; i += 3) {
        for (let j = i + 3; j < positions.length; j += 3) {
            const dx = positions[i] - positions[j];
            const dy = positions[i+1] - positions[j+1];
            const dz = positions[i+2] - positions[j+2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 55) { // Connection distance
                linePoints.push(positions[i], positions[i+1], positions[i+2]);
                linePoints.push(positions[j], positions[j+1], positions[j+2]);
            }
        }
    }
    
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
    linesMesh.position.copy(foregroundLayer.position);
    linesMesh.rotation.copy(foregroundLayer.rotation);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


/*Project Detail Slide Logic*/
function openSlide(btn) {
  const card = btn.closest('.featured-mini-card');
  const title = card.querySelector('h2').innerText;
  const img = card.querySelector('img').src;
  const longText = card.querySelector('.hidden-content').innerHTML;

  const overlay = document.getElementById('projectDetailSlide');
  document.getElementById('slideTitle').innerText = title;
  document.getElementById('slideImg').src = img;
  document.getElementById('slideDescription').innerHTML = longText;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; 
}

function hideProject() {
  document.getElementById('projectDetailSlide').classList.remove('active');
  document.body.style.overflow = 'auto';
}

const sendEmail = (e) => {
  e.preventDefault();
};

