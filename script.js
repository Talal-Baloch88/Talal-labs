

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

// 1. Helper to create particle layers
function createParticleLayer(count, size, opacity) {
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 600; 
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
        size: size,
        color: 0x00f0ff,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geometry, material);
}

// 2. Setup Layers & Lines
const backgroundLayer = createParticleLayer(4000, 0.8, 0.3);
const foregroundLayer = createParticleLayer(600, 2.0, 0.8); // Fewer points in foreground for better line performance
scene.add(backgroundLayer, foregroundLayer);

const linesGeometry = new THREE.BufferGeometry();
const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});
const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(linesMesh);

// 3. Interaction State
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

const clock = new THREE.Clock();

// 4. THE SINGLE MASTER ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth movement logic (Lerping)
    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;

    // Rotate and Position Background
    backgroundLayer.rotation.y = elapsedTime * 0.02; // Slower rotation for background
    backgroundLayer.position.x = targetX * 30;
    backgroundLayer.position.y = -targetY * 30;

    // Rotate and Position Foreground
    foregroundLayer.rotation.y = -elapsedTime * 0.01;
    foregroundLayer.position.x = targetX * 80;
    foregroundLayer.position.y = -targetY * 80;

    // --- Neural Network Line Logic ---
    const positions = foregroundLayer.geometry.attributes.position.array;
    const linePoints = [];
    
    // We only connect points in the foreground for that crisp "3D" feel
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