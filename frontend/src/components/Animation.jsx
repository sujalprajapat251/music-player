import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const Animation = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x160016);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 4, 21);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced Controls Configuration
    const controls = new (class OrbitControls {
      constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Control settings
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        this.enableZoom = true;
        this.enablePan = true;
        this.enableRotate = true;

        // Zoom limits
        this.minDistance = 5;
        this.maxDistance = 100;

        // Rotation limits
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;

        // Pan limits
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;

        // Mouse settings
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.panSpeed = 1.0;

        // Internal state
        this.target = new THREE.Vector3();
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.panOffset = new THREE.Vector3();
        this.scale = 1;

        this.isMouseDown = false;
        this.mouseButtons = {
          LEFT: 0,
          MIDDLE: 1,
          RIGHT: 2,
        };

        this.state = {
          NONE: -1,
          ROTATE: 0,
          ZOOM: 1,
          PAN: 2,
        };

        this.currentState = this.state.NONE;
        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        this.zoomStart = new THREE.Vector2();
        this.zoomEnd = new THREE.Vector2();
        this.zoomDelta = new THREE.Vector2();

        this.bindEvents();
        this.update();
      }

      bindEvents() {
        this.domElement.addEventListener(
          "mousedown",
          this.onMouseDown.bind(this)
        );
        this.domElement.addEventListener(
          "mousemove",
          this.onMouseMove.bind(this)
        );
        this.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.domElement.addEventListener("wheel", this.onMouseWheel.bind(this));
        this.domElement.addEventListener(
          "touchstart",
          this.onTouchStart.bind(this)
        );
        this.domElement.addEventListener(
          "touchmove",
          this.onTouchMove.bind(this)
        );
        this.domElement.addEventListener(
          "touchend",
          this.onTouchEnd.bind(this)
        );
        this.domElement.addEventListener(
          "contextmenu",
          this.onContextMenu.bind(this)
        );
      }

      onMouseDown(event) {
        event.preventDefault();
        this.isMouseDown = true;

        if (event.button === this.mouseButtons.LEFT) {
          this.currentState = this.state.ROTATE;
          this.rotateStart.set(event.clientX, event.clientY);
        } else if (event.button === this.mouseButtons.MIDDLE) {
          this.currentState = this.state.ZOOM;
          this.zoomStart.set(event.clientX, event.clientY);
        } else if (event.button === this.mouseButtons.RIGHT) {
          this.currentState = this.state.PAN;
          this.panStart.set(event.clientX, event.clientY);
        }
      }

      onMouseMove(event) {
        if (!this.isMouseDown) return;

        event.preventDefault();

        if (this.currentState === this.state.ROTATE) {
          this.rotateEnd.set(event.clientX, event.clientY);
          this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

          this.sphericalDelta.theta -=
            ((2 * Math.PI * this.rotateDelta.x) / this.domElement.clientWidth) *
            this.rotateSpeed;
          this.sphericalDelta.phi -=
            ((2 * Math.PI * this.rotateDelta.y) /
              this.domElement.clientHeight) *
            this.rotateSpeed;

          this.rotateStart.copy(this.rotateEnd);
        } else if (this.currentState === this.state.ZOOM) {
          this.zoomEnd.set(event.clientX, event.clientY);
          this.zoomDelta.subVectors(this.zoomEnd, this.zoomStart);

          if (this.zoomDelta.y > 0) {
            this.scale /= Math.pow(0.95, this.zoomSpeed);
          } else if (this.zoomDelta.y < 0) {
            this.scale *= Math.pow(0.95, this.zoomSpeed);
          }

          this.zoomStart.copy(this.zoomEnd);
        } else if (this.currentState === this.state.PAN) {
          this.panEnd.set(event.clientX, event.clientY);
          this.panDelta.subVectors(this.panEnd, this.panStart);

          this.pan(this.panDelta.x, this.panDelta.y);

          this.panStart.copy(this.panEnd);
        }
      }

      onMouseUp() {
        this.isMouseDown = false;
        this.currentState = this.state.NONE;
      }

      onMouseWheel(event) {
        event.preventDefault();

        if (event.deltaY < 0) {
          this.scale *= Math.pow(0.95, this.zoomSpeed);
        } else if (event.deltaY > 0) {
          this.scale /= Math.pow(0.95, this.zoomSpeed);
        }
      }

      onTouchStart(event) {
        event.preventDefault();

        if (event.touches.length === 1) {
          this.currentState = this.state.ROTATE;
          this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        } else if (event.touches.length === 2) {
          this.currentState = this.state.ZOOM;
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          this.zoomStart.set(0, distance);
        }
      }

      onTouchMove(event) {
        event.preventDefault();

        if (
          event.touches.length === 1 &&
          this.currentState === this.state.ROTATE
        ) {
          this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
          this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

          this.sphericalDelta.theta -=
            ((2 * Math.PI * this.rotateDelta.x) / this.domElement.clientWidth) *
            this.rotateSpeed;
          this.sphericalDelta.phi -=
            ((2 * Math.PI * this.rotateDelta.y) /
              this.domElement.clientHeight) *
            this.rotateSpeed;

          this.rotateStart.copy(this.rotateEnd);
        } else if (
          event.touches.length === 2 &&
          this.currentState === this.state.ZOOM
        ) {
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          this.zoomEnd.set(0, distance);

          if (this.zoomEnd.y > this.zoomStart.y) {
            this.scale /= Math.pow(0.95, this.zoomSpeed);
          } else if (this.zoomEnd.y < this.zoomStart.y) {
            this.scale *= Math.pow(0.95, this.zoomSpeed);
          }

          this.zoomStart.copy(this.zoomEnd);
        }
      }

      onTouchEnd() {
        this.currentState = this.state.NONE;
      }

      onContextMenu(event) {
        event.preventDefault();
      }

      pan(deltaX, deltaY) {
        const offset = new THREE.Vector3();
        const v = new THREE.Vector3();

        v.copy(this.camera.position).sub(this.target);

        const targetDistance = v.length();

        targetDistance *= Math.tan(((this.camera.fov / 2) * Math.PI) / 180.0);

        const panLeftV = new THREE.Vector3();
        panLeftV.setFromMatrixColumn(this.camera.matrix, 0);
        panLeftV.multiplyScalar(
          (-2 * deltaX * targetDistance) / this.domElement.clientHeight
        );

        const panUpV = new THREE.Vector3();
        panUpV.setFromMatrixColumn(this.camera.matrix, 1);
        panUpV.multiplyScalar(
          (2 * deltaY * targetDistance) / this.domElement.clientHeight
        );

        offset.copy(panLeftV).add(panUpV);

        this.panOffset.add(offset);
      }

      update() {
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          this.camera.up,
          new THREE.Vector3(0, 1, 0)
        );
        const quatInverse = quat.clone().invert();

        // Apply pan offset
        this.target.add(this.panOffset);

        // Get current spherical coordinates
        offset.copy(this.camera.position).sub(this.target);
        offset.applyQuaternion(quat);

        this.spherical.setFromVector3(offset);

        // Apply rotation deltas
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;

        // Apply zoom
        this.spherical.radius *= this.scale;

        // Apply limits
        this.spherical.phi = Math.max(
          this.minPolarAngle,
          Math.min(this.maxPolarAngle, this.spherical.phi)
        );
        this.spherical.radius = Math.max(
          this.minDistance,
          Math.min(this.maxDistance, this.spherical.radius)
        );

        // Convert back to cartesian
        offset.setFromSpherical(this.spherical);
        offset.applyQuaternion(quatInverse);

        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);

        // Apply damping
        if (this.enableDamping) {
          this.sphericalDelta.theta *= 1 - this.dampingFactor;
          this.sphericalDelta.phi *= 1 - this.dampingFactor;
        } else {
          this.sphericalDelta.set(0, 0, 0);
        }

        this.scale = 1;
        this.panOffset.set(0, 0, 0);

        // Check if camera has moved
        if (
          this.lastPosition.distanceToSquared(this.camera.position) > 0.01 ||
          8 * (1 - this.lastQuaternion.dot(this.camera.quaternion)) > 0.01
        ) {
          this.lastPosition.copy(this.camera.position);
          this.lastQuaternion.copy(this.camera.quaternion);
          return true;
        }

        return false;
      }

      dispose() {
        this.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.domElement.removeEventListener("mousemove", this.onMouseMove);
        this.domElement.removeEventListener("mouseup", this.onMouseUp);
        this.domElement.removeEventListener("wheel", this.onMouseWheel);
        this.domElement.removeEventListener("touchstart", this.onTouchStart);
        this.domElement.removeEventListener("touchmove", this.onTouchMove);
        this.domElement.removeEventListener("touchend", this.onTouchEnd);
        this.domElement.removeEventListener("contextmenu", this.onContextMenu);
      }
    })(camera, renderer.domElement);

    // Uniforms
    const gu = { time: { value: 0 } };

    // Geometry data
    let sizes = [];
    let shift = [];
    let pushShift = () => {
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
    };
    let pts = new Array(50000).fill().map(() => {
      sizes.push(Math.random() * 1.5 + 0.5);
      pushShift();
      return new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(Math.random() * 0.5 + 9.5);
    });
    for (let i = 0; i < 100000; i++) {
      let r = 10,
        R = 40;
      let rand = Math.pow(Math.random(), 1.5);
      let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
      pts.push(
        new THREE.Vector3().setFromCylindricalCoords(
          radius,
          Math.random() * 2 * Math.PI,
          (Math.random() - 0.5) * 2
        )
      );
      sizes.push(Math.random() * 1.5 + 0.5);
      pushShift();
    }

    // BufferGeometry
    let g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
    g.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));

    // Vertex shader
    const vertexShader = `
      uniform float time;
      attribute float sizes;
      attribute vec4 shift;
      varying vec3 vColor;
      void main() {
        float PI2 = 6.28318530718;
        float t = time;
        float moveT = mod(shift.x + shift.z * t, PI2);
        float moveS = mod(shift.y + shift.z * t, PI2);
        vec3 transformed = position + vec3(
          cos(moveS) * sin(moveT),
          cos(moveT),
          sin(moveS) * sin(moveT)
        ) * shift.w;

        float d = length(abs(position) / vec3(40., 10., 40.));
        d = clamp(d, 0., 1.);
        vColor = mix(vec3(227., 155., 0.), vec3(100., 50., 255.), d) / 255.;

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = sizes * 0.125 * (300.0 / length(mvPosition.xyz));
      }
    `;

    // Fragment shader
    const fragmentShader = `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord.xy - 0.5);
        float alpha = smoothstep(0.5, 0.1, d);
        gl_FragColor = vec4(vColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: { time: gu.time },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    let p = new THREE.Points(g, material);
    p.rotation.order = "ZYX";
    p.rotation.z = 0.2;
    scene.add(p);

    // Animation loop
    let clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      controls.update();
      let t = clock.getElapsedTime() * 0.5;
      gu.time.value = t * Math.PI;
      p.rotation.y = t * 0.05;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        cursor: "grab",
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "100vw",
          height: "100vh",
          userSelect: "none",
        }}
      />
      <div id="word"></div>
      <link
        href="https://fonts.googleapis.com/css2?family=Megrim&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default Animation;
