import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const categoryColors = {
  Work: 0x3b82f6,
  Study: 0xa855f7,
  Exercise: 0x22c55e,
  Break: 0xf97316,
};

export default function ThreeBarChart({ data }) {
  const containerRef = useRef(null);
  const [hoveredInfo, setHoveredInfo] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    scene.add(new THREE.GridHelper(12, 12, 0xe0e0e0, 0xf0f0f0));

    const categories = ["Work", "Study", "Exercise", "Break"];
    const maxValue = Math.max(...data.map((d) => d.total)) || 100;
    const MAX_BAR_HEIGHT = 5; // optional max height
    const bars = [];
    const barData = [];

    data.forEach((day, dayIndex) => {
      let yOffset = 0;
      const scaleFactor = MAX_BAR_HEIGHT / maxValue;

      categories.forEach((cat) => {
        const value = day[cat];
        if (value > 0) {
          const targetHeight = value * scaleFactor;
          const geometry = new THREE.BoxGeometry(0.6, targetHeight, 0.6);
          const material = new THREE.MeshStandardMaterial({
            color: categoryColors[cat],
            roughness: 0.3,
            metalness: 0.2,
            emissive: categoryColors[cat],
            emissiveIntensity: 0.1,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.scale.y = 0;
          mesh.position.set(dayIndex * 1.2 - 3.6, yOffset, 0);
          scene.add(mesh);
          bars.push(mesh);

          barData.push({
            mesh,
            category: cat,
            value,
            day: day.name,
            yOffset,
            targetHeight,
            material,
          });

          yOffset += targetHeight;
        }
      });

      // Day labels
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#333";
      ctx.font = "36px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(day.name, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.5, 0.4, 1);
      sprite.position.set(dayIndex * 1.2 - 3.6, -0.4, 0);
      sprite.onBeforeRender = () => sprite.quaternion.copy(camera.quaternion);
      scene.add(sprite);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredBar = null;

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bars);

      if (intersects.length > 0) {
        const intersected = barData.find((b) => b.mesh === intersects[0].object);
        if (intersected && intersected !== hoveredBar) {
          if (hoveredBar) hoveredBar.material.emissiveIntensity = 0.1;
          hoveredBar = intersected;
          hoveredBar.material.emissiveIntensity = 0.3;

          const vector = new THREE.Vector3();
          vector.setFromMatrixPosition(intersected.mesh.matrixWorld);
          vector.y += intersected.targetHeight;
          vector.project(camera);

          let x = ((vector.x + 1) / 2) * rect.width;
          let y = ((-vector.y + 1) / 2) * rect.height;

          const tooltipWidth = 140; 
          const tooltipHeight = 50; 
          const margin = 8;

          x = Math.min(Math.max(x, margin), rect.width - tooltipWidth - margin);
          y = Math.min(Math.max(y, margin), rect.height - tooltipHeight - margin);

          setHoveredInfo({
            category: intersected.category,
            value: intersected.value,
            day: intersected.day,
            x,
            y,
          });
        }
      } else {
        if (hoveredBar) hoveredBar.material.emissiveIntensity = 0.1;
        hoveredBar = null;
        setHoveredInfo(null);
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      bars.forEach((b) => {
        const bar = barData.find((d) => d.mesh === b);
        if (b.scale.y < 1) {
          b.scale.y = Math.min(b.scale.y + 0.05, 1);
          b.position.y = bar.yOffset * b.scale.y + b.scale.y * bar.targetHeight / 2;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      bars.forEach((b) => {
        b.geometry.dispose();
        b.material.dispose();
      });
    };
  }, [data]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl" />
      {hoveredInfo && (
        <div
          className="absolute bg-white px-3 py-2 rounded shadow-lg border border-gray-200 pointer-events-none text-sm"
          style={{
            left: hoveredInfo.x,
            top: hoveredInfo.y,
            whiteSpace: "nowrap",
          }}
        >
          <p className="font-medium">{hoveredInfo.day}</p>
          <p>
            {hoveredInfo.category}: {hoveredInfo.value} min
          </p>
        </div>
      )}
    </div>
  );
}


