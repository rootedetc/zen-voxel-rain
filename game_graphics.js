window.ZenGraphics = (function() {
    let scene, camera, renderer;
    let particles = [];
    let ripples = [];
    let rainSystem;
    const rainCount = 500;

    function init() {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) {
            console.warn("three-canvas not found in document. Please ensure <canvas id='three-canvas'></canvas> exists.");
        }

        // 1. Scene & Camera
        scene = new THREE.Scene();

        // 3. Skybox: Deep lavender to soft blush pink gradient
        const canvasBg = document.createElement('canvas');
        canvasBg.width = 2;
        canvasBg.height = 2;
        const context = canvasBg.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 2);
        gradient.addColorStop(0, '#DCD6F7'); // deep lavender
        gradient.addColorStop(1, '#F4C2C2'); // soft blush pink
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 2);
        const bgTexture = new THREE.CanvasTexture(canvasBg);
        scene.background = bgTexture;

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(10, 12, 14);
        camera.lookAt(0, 1.5, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 2. Lighting
        const ambientLight = new THREE.AmbientLight(0xDCD6F7, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xFFE5D9, 1.2);
        dirLight.position.set(8, 15, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.left = -10;
        dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10;
        dirLight.shadow.camera.bottom = -10;
        scene.add(dirLight);

        // 4. Island Base
        const islandGeo = new THREE.CylinderGeometry(5, 4.5, 1.5, 12);
        const islandMat = new THREE.MeshStandardMaterial({ 
            color: 0x70C1B3, 
            flatShading: true 
        });
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.y = 0; 
        island.receiveShadow = true;
        island.castShadow = true;
        scene.add(island);

        // 5. Pond Water
        const pondGeo = new THREE.CylinderGeometry(4.6, 4.6, 0.1, 12);
        const pondMat = new THREE.MeshStandardMaterial({ 
            color: 0xA8DADC, 
            transparent: true, 
            opacity: 0.85, 
            roughness: 0.1, 
            metalness: 0.1 
        });
        const pond = new THREE.Mesh(pondGeo, pondMat);
        pond.position.y = 0.8; 
        pond.receiveShadow = true;
        scene.add(pond);

        // 6. Low-Poly Tree
        const treeGroup = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 2, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, flatShading: true });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1; 
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        const leafMat = new THREE.MeshStandardMaterial({ color: 0x2ECC71, flatShading: true });
        const leafPinkMat = new THREE.MeshStandardMaterial({ color: 0xE6B0AA, flatShading: true }); 
        
        const leaf1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), leafMat);
        leaf1.position.set(0, 2.5, 0);
        leaf1.castShadow = true;
        treeGroup.add(leaf1);

        const leaf2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), leafPinkMat);
        leaf2.position.set(1, 2.0, 0.5);
        leaf2.castShadow = true;
        treeGroup.add(leaf2);

        const leaf3 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), leafMat);
        leaf3.position.set(-0.8, 2.2, -0.8);
        leaf3.castShadow = true;
        treeGroup.add(leaf3);

        treeGroup.position.set(-2, 0.75, -1.5);
        scene.add(treeGroup);

        // 7. Lilies
        const lilyGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8);
        const lilyMat = new THREE.MeshStandardMaterial({ color: 0x2ECC71, flatShading: true });
        const lilyPinkMat = new THREE.MeshStandardMaterial({ color: 0xE6B0AA, flatShading: true });
        
        const lily1 = new THREE.Mesh(lilyGeo, lilyMat);
        lily1.position.set(2, 0.85, 2);
        lily1.receiveShadow = true;
        scene.add(lily1);

        const lily2 = new THREE.Mesh(lilyGeo, lilyMat);
        lily2.position.set(1.2, 0.85, 3);
        lily2.scale.set(0.7, 1, 0.7);
        lily2.receiveShadow = true;
        scene.add(lily2);
        
        const lilyFlower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 6), lilyPinkMat);
        lilyFlower.position.set(2, 0.88, 2);
        scene.add(lilyFlower);

        // 8. Particles: Falling Rain
        const rainGeo = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);
        
        for (let i = 0; i < rainCount; i++) {
            rainPositions[i*3] = (Math.random() - 0.5) * 15;
            rainPositions[i*3+1] = Math.random() * 20 + 2;
            rainPositions[i*3+2] = (Math.random() - 0.5) * 15;
            rainVelocities[i] = - (Math.random() * 5 + 10); // falling speed
        }
        
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        const rainMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.5
        });
        rainSystem = new THREE.Points(rainGeo, rainMat);
        rainSystem.userData = { velocities: rainVelocities };
        scene.add(rainSystem);

        window.addEventListener('resize', onWindowResize, false);

        return { scene, camera, renderer };
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 8. Particles: Sparks
    function spawnSparks(position3D) {
        if (!scene) return;
        const sparkCount = 12;
        const sparkGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const sparkMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });

        for (let i = 0; i < sparkCount; i++) {
            const spark = new THREE.Mesh(sparkGeo, sparkMat);
            spark.position.copy(position3D);
            spark.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 5,
                    Math.random() * 5,
                    (Math.random() - 0.5) * 5
                ),
                life: 1.0
            };
            scene.add(spark);
            particles.push(spark);
        }
    }

    function splashRipple(position3D) {
        if (!scene) return;
        const rippleGeo = new THREE.RingGeometry(0.05, 0.1, 12);
        const rippleMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const ripple = new THREE.Mesh(rippleGeo, rippleMat);
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.set(position3D.x, 0.86, position3D.z);
        ripple.userData = {
            scale: 1,
            life: 1.0
        };
        scene.add(ripple);
        ripples.push(ripple);
    }

    function render(deltaTime) {
        if (!renderer || !scene || !camera) return;

        // Update Rain
        if (rainSystem) {
            const positions = rainSystem.geometry.attributes.position.array;
            const velocities = rainSystem.userData.velocities;
            for (let i = 0; i < rainCount; i++) {
                positions[i*3+1] += velocities[i] * deltaTime;
                if (positions[i*3+1] < 0.8) {
                    positions[i*3+1] = 20; // reset to top
                    // Create occasional splash ripples for rain
                    if (Math.random() < 0.05) {
                        splashRipple(new THREE.Vector3(positions[i*3], 0.8, positions[i*3+2]));
                    }
                }
            }
            rainSystem.geometry.attributes.position.needsUpdate = true;
        }

        // Update Sparks
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.position.addScaledVector(p.userData.velocity, deltaTime);
            p.userData.velocity.y -= 9.8 * deltaTime; // gravity
            p.userData.life -= deltaTime * 1.5;
            p.scale.setScalar(Math.max(0, p.userData.life));

            if (p.userData.life <= 0 || p.position.y < 0.8) {
                scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                particles.splice(i, 1);
            }
        }

        // Update Ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.userData.scale += deltaTime * 3;
            r.scale.setScalar(r.userData.scale);
            r.userData.life -= deltaTime * 1.5;
            r.material.opacity = Math.max(0, r.userData.life * 0.6);

            if (r.userData.life <= 0) {
                scene.remove(r);
                r.geometry.dispose();
                r.material.dispose();
                ripples.splice(i, 1);
            }
        }

        renderer.render(scene, camera);
    }

    // 9. Projection function
    function getScreenPosition(position3D, containerWidth, containerHeight) {
        if (!camera) return { x: 0, y: 0 };
        const vector = position3D.clone();
        vector.project(camera);
        
        return {
            x: (vector.x * 0.5 + 0.5) * containerWidth,
            y: (vector.y * -0.5 + 0.5) * containerHeight,
            z: vector.z
        };
    }

    // 10. Expose API globally
    return {
        init,
        render,
        spawnSparks,
        splashRipple,
        getScreenPosition
    };
})();
