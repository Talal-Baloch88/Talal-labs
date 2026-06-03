/* ==========================================================================
   5. THREE.JS BACKGROUND (Integrated Master)
========================================================================== */
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

function createHexagonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 64);
    ctx.beginPath();
    
    const size = 28; 
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
    
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
}

const hexTexture = createHexagonTexture();

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
        map: hexTexture,        
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false       
    });
    return new THREE.Points(geometry, material);
}

const backgroundLayer = createParticleLayer(10000, 1.5, 0.3); 
const foregroundLayer = createParticleLayer(400, 4.5, 0.8);  
scene.add(backgroundLayer, foregroundLayer);

const linesGeometry = new THREE.BufferGeometry();
const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x38b6ff,
    transparent: true,
    opacity: 0.30,
    blending: THREE.AdditiveBlending
});
const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(linesMesh);

let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;

    backgroundLayer.rotation.y = elapsedTime * 0.02;
    backgroundLayer.position.x = targetX * 30;
    backgroundLayer.position.y = -targetY * 30;

    foregroundLayer.rotation.y = -elapsedTime * 0.01;
    foregroundLayer.position.x = targetX * 80;
    foregroundLayer.position.y = -targetY * 80;

    const positions = foregroundLayer.geometry.attributes.position.array;
    const linePoints = [];
    
    for (let i = 0; i < positions.length; i += 3) {
        for (let j = i + 3; j < positions.length; j += 3) {
            const dx = positions[i] - positions[j];
            const dy = positions[i+1] - positions[j+1];
            const dz = positions[i+2] - positions[j+2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 55) { 
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


/* ==========================================================================
   6. PROJECT DETAIL SLIDE OVERLAY LOGIC
========================================================================== */
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


/* ==========================================================================
   INTERACTIVE LEAD CAPTURE ENGINE (EMAILJS INTEGRATION)
========================================================================== */
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const form = this;
    const submitBtn = form.querySelector('.btn-submit');
    const loader = document.querySelector('.loader');

    if (loader) loader.classList.add('active');
    if (submitBtn) submitBtn.style.display = 'none';

    const templateParams = {
        title: `New Portfolio Inquiry from ${document.getElementById('form-name').value}`,
        name: document.getElementById('form-name').value,
        from_name: document.getElementById('form-name').value,
        reply_to: document.getElementById('form-email').value,
        message: document.getElementById('form-message').value
    }; // Fixed: Missing closing brace target cleanly matched here

    emailjs.send('talal1212', 'template_skmrklp', templateParams)
        .then(function(response) {
            console.log('TRANSMISSION SUCCESSFUL:', response.status, response.text);
            
            if (loader) loader.classList.remove('active');
            if (submitBtn) submitBtn.style.display = 'flex';
            
            form.reset(); 
            alert('Message engine online. Your transmission was sent successfully!');
        }, function(error) {
            console.error('TRANSMISSION FAILED:', error);
            
            if (loader) loader.classList.remove('active');
            if (submitBtn) submitBtn.style.display = 'flex';
            
            alert('Transmission failed. Please check your system configuration or try again.');
        });
});