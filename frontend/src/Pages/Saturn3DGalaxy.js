import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const Saturn3DGalaxy = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const frameRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000008);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 20, 40);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Central Saturn-like planet
        const planetGeometry = new THREE.SphereGeometry(3, 64, 64);
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.castShadow = true;
        scene.add(planet);

        // Add planet glow effect
        const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const planetGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(planetGlow);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Point light from planet
        const planetLight = new THREE.PointLight(0xffd700, 2, 100);
        planetLight.position.set(0, 0, 0);
        scene.add(planetLight);

        // Create multiple ring systems
        const ringGroups = [];
        const ringConfigs = [
            { radius: 8, particles: 1200, color: 0xff6b9d, speed: 0.002, thickness: 1.5 },
            { radius: 12, particles: 1500, color: 0xc44569, speed: 0.0015, thickness: 2 },
            { radius: 16, particles: 1800, color: 0x9b59b6, speed: 0.001, thickness: 2.5 },
            { radius: 22, particles: 2000, color: 0x6c5ce7, speed: 0.0008, thickness: 3 },
            { radius: 28, particles: 1600, color: 0xa29bfe, speed: 0.0006, thickness: 2.8 },
            { radius: 35, particles: 1200, color: 0x74b9ff, speed: 0.0004, thickness: 3.5 }
        ];

        ringConfigs.forEach((config, ringIndex) => {
            const ringGroup = new THREE.Group();
            const positions = new Float32Array(config.particles * 3);
            const colors = new Float32Array(config.particles * 3);
            const sizes = new Float32Array(config.particles);

            for (let i = 0; i < config.particles; i++) {
                // Ring distribution with some randomness
                const angle = (i / config.particles) * Math.PI * 2 + Math.random() * 0.5;
                const radiusVariation = config.radius + (Math.random() - 0.5) * config.thickness;
                const heightVariation = (Math.random() - 0.5) * 0.8;

                positions[i * 3] = Math.cos(angle) * radiusVariation;
                positions[i * 3 + 1] = heightVariation;
                positions[i * 3 + 2] = Math.sin(angle) * radiusVariation;

                // Color variations
                const color = new THREE.Color(config.color);
                const brightness = 0.7 + Math.random() * 0.3;
                color.multiplyScalar(brightness);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;

                // Size variations
                sizes[i] = Math.random() * 8 + 2;
            }

            const ringGeometry = new THREE.BufferGeometry();
            ringGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            ringGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            ringGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            // Particle material with custom shader
            const ringMaterial = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true,
                map: createParticleTexture()
            });

            const ringParticles = new THREE.Points(ringGeometry, ringMaterial);
            ringGroup.add(ringParticles);

            // Store ring data for animation
            ringGroup.userData = {
                speed: config.speed,
                originalPositions: positions.slice(),
                particles: config.particles,
                radius: config.radius,
                thickness: config.thickness
            };

            ringGroups.push(ringGroup);
            scene.add(ringGroup);
        });

        // Create particle texture
        function createParticleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        }

        // Add background stars
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 400;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
            starColors[i * 3] = color.r;
            starColors[i * 3 + 1] = color.g;
            starColors[i * 3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            const time = Date.now() * 0.001;

            // Rotate planet
            planet.rotation.y += 0.005;
            planetGlow.rotation.y += 0.005;

            // Animate rings
            ringGroups.forEach((ringGroup, index) => {
                const userData = ringGroup.userData;
                const geometry = ringGroup.children[0].geometry;
                const positions = geometry.attributes.position.array;

                // Rotate entire ring
                ringGroup.rotation.y += userData.speed;

                // Add wave motion to particles
                for (let i = 0; i < userData.particles; i++) {
                    const originalIndex = i * 3;
                    const angle = (i / userData.particles) * Math.PI * 2 + time * userData.speed * 100;
                    const wave = Math.sin(time * 2 + angle * 3) * 0.3;

                    positions[originalIndex + 1] = userData.originalPositions[originalIndex + 1] + wave;
                }

                geometry.attributes.position.needsUpdate = true;
            });

            // Camera movement based on mouse
            const targetX = mouseX * 10;
            const targetY = mouseY * 10;
            camera.position.x += (targetX - camera.position.x) * 0.02;
            camera.position.y += (targetY + 20 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

            // Auto rotation
            const radius = 40;
            camera.position.x = Math.sin(time * 0.1) * radius;
            camera.position.z = Math.cos(time * 0.1) * radius;

            renderer.render(scene, camera);
        };

        // Handle resize
        const handleResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        animate();
        setIsLoaded(true);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            <div ref={mountRef} className="w-full h-full" />

            {/* Loading indicator */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-white text-xl animate-pulse">Loading 3D Saturn Galaxy...</div>
                </div>
            )}
        </div>
    );
};

export default Saturn3DGalaxy;