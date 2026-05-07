 /* =========================================
         5. THREE.JS BACKGROUND (Neural Network)
      ========================================= */
      const canvas = document.getElementById('three-canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 150;

      // Particle geometry
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 300; // Amount of nodes
      const posArray = new Float32Array(particlesCount * 3);

      for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles across the screen
        posArray[i] = (Math.random() - 0.5) * 400; 
      }
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      // Material for particles (Cyan to match accent)
      const material = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      // Mesh
      const particlesMesh = new THREE.Points(particlesGeometry, material);
      scene.add(particlesMesh);

      // Animation Loop
      let mouseX = 0;
      let mouseY = 0;
      
      document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
      });

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slow rotation for ambient movement
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Subtle mouse interaction with the background
        particlesMesh.position.x = mouseX * 0.01;
        particlesMesh.position.y = mouseY * -0.01;

        renderer.render(scene, camera);
      }
      animate();

      // Handle Resize
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      /* =========================================
         6. GEMINI API INTEGRATION
      ========================================= */
      const apiKey = ""; // API key is provided securely by the runtime environment
      
      const btnGenerate = document.getElementById('btn-generate-ai');
      const aiInput = document.getElementById('ai-problem-input');
      const loader = document.getElementById('ai-loader');
      const outputCard = document.getElementById('ai-output');
      const resultContent = document.getElementById('ai-result-content');

      // Exponential backoff for robust API calls
      async function fetchWithRetry(url, options, retries = 5) {
        const delays = [1000, 2000, 4000, 8000, 16000];
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delays[i]));
          }
        }
      }

      btnGenerate.addEventListener('click', async () => {
        const userProblem = aiInput.value.trim();
        if (!userProblem) return;

        // UI State: Loading
        btnGenerate.disabled = true;
        btnGenerate.style.opacity = '0.5';
        outputCard.classList.remove('active');
        loader.classList.add('active');

        try {
          const model = "gemini-2.5-flash-preview-09-2025";
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const systemPrompt = "You are an elite AI Solutions Architect for 'Talal Labs'. A potential client describes a business problem. Respond with a concise, cutting-edge 3-step AI strategy to solve it. Keep it professional, highly technical but accessible, and under 150 words. Format with simple bullet points.";

          const payload = {
            contents: [{ parts: [{ text: userProblem }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          };

          const data = await fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate solution. Please try again.";
          
          // Simple markdown parsing to make **bold** text render correctly in HTML
          resultText = resultText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          // Replace newlines with <br> for HTML rendering
          resultText = resultText.replace(/\n/g, '<br>');

          resultContent.innerHTML = resultText;
          outputCard.classList.add('active');

        } catch (error) {
          resultContent.innerHTML = "<span style='color: #ff4444;'>Connection error. Please try again later.</span>";
          outputCard.classList.add('active');
        } finally {
          // UI State: Restore
          loader.classList.remove('active');
          btnGenerate.disabled = false;
          btnGenerate.style.opacity = '1';
        }
      });
  