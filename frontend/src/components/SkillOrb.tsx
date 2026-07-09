import { useEffect, useRef, useState } from "react";

interface SkillNode {
  name: string;
  x: number;
  y: number;
  z: number;
  projX: number;
  projY: number;
  scale: number;
  alpha: number;
}

export default function SkillOrb() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const skillsList = [
    "Python", "Django", "REST APIs", "AngularJS", "MySQL",
    "MongoDB", "HTML5", "CSS3", "Git", "GitHub", "Java",
    "PHP", "Postman", "Node.js", "Express.js", "JWT",
    "SQLite3", "Bootstrap", "C/C++", "RBAC", "WAMP"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = containerRef.current?.offsetWidth || 450);
    let height = (canvas.height = containerRef.current?.offsetHeight || 450);

    const fov = 250;
    const radius = Math.min(width, height) * 0.38;
    const nodes: SkillNode[] = [];

    // Distribute skills evenly on a 3D sphere (Fibonacci Sphere Algorithm)
    const count = skillsList.length;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      nodes.push({
        name: skillsList[i],
        x,
        y,
        z,
        projX: 0,
        projY: 0,
        scale: 1,
        alpha: 1,
      });
    }

    let angleX = 0.005;
    let angleY = 0.005;
    let isHovered = false;
    let mouseX = 0;
    let mouseY = 0;

    // Track Canvas Mouse Positioning
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Distance from center
      const cx = width / 2;
      const cy = height / 2;
      
      // Speed changes depending on mouse position relative to center
      mouseX = (clientX - cx) / cx;
      mouseY = (clientY - cy) / cy;

      // Check if mouse is hovering over the sphere area to slow down / interact
      const distToCenter = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);
      isHovered = distToCenter < radius * 1.3;

      // Detect hover on specific text items
      let foundSkill: string | null = null;
      for (const node of nodes) {
        // Simple bounding box check on projected coordinates
        const textWidth = ctx.measureText(node.name).width;
        const textHeight = 14;
        if (
          clientX >= node.projX - textWidth / 2 - 8 &&
          clientX <= node.projX + textWidth / 2 + 8 &&
          clientY >= node.projY - textHeight / 2 - 6 &&
          clientY <= node.projY + textHeight / 2 + 6 &&
          node.z < 0 // Only interactive if on the front half
        ) {
          foundSkill = node.name;
          break;
        }
      }
      setHoveredSkill(foundSkill);
    };

    const handleMouseLeave = () => {
      isHovered = false;
      setHoveredSkill(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      width = canvas.width = containerRef.current.offsetWidth;
      height = canvas.height = containerRef.current.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Rotate points around X and Y
    const rotateX = (node: SkillNode, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y1 = node.y * cos - node.z * sin;
      const z1 = node.y * sin + node.z * cos;
      node.y = y1;
      node.z = z1;
    };

    const rotateY = (node: SkillNode, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = node.x * cos - node.z * sin;
      const z1 = node.x * sin + node.z * cos;
      node.x = x1;
      node.z = z1;
    };

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Sphere structure outline
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.03)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Slow down but do not stop rotation on hover, adjust direction with mouse
      const targetAngleX = isHovered ? mouseY * 0.002 : 0.003;
      const targetAngleY = isHovered ? mouseX * 0.002 : 0.003;

      angleX += (targetAngleX - angleX) * 0.1;
      angleY += (targetAngleY - angleY) * 0.1;

      // Project nodes and sort by depth (z coordinate) to render back-to-front
      nodes.forEach((node) => {
        rotateX(node, angleX);
        rotateY(node, angleY);

        // Projecting 3D to 2D
        // node.z < 0 is "front", node.z > 0 is "back"
        const depthZ = node.z + fov;
        node.scale = fov / depthZ;
        node.alpha = Math.max(0.15, Math.min(1.0, 1.2 - node.z / (radius * 1.5)));
        
        node.projX = node.x * node.scale + width / 2;
        node.projY = node.y * node.scale + height / 2;
      });

      // Sort nodes so we draw back nodes first (z-index sorting)
      const sortedNodes = [...nodes].sort((a, b) => b.z - a.z);

      sortedNodes.forEach((node) => {
        const isHoveredNode = hoveredSkill === node.name;

        // Depth styles
        const fontSize = Math.max(10, Math.min(22, 13 * node.scale));
        ctx.font = `600 ${fontSize}px "Inter", sans-serif`;

        // Highlight colors
        if (isHoveredNode) {
          ctx.fillStyle = "#a855f7"; // purple-500 glow
          ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
          ctx.shadowBlur = 10;
        } else if (node.z < 0) {
          // Front elements get vibrant colors
          ctx.fillStyle = `rgba(59, 130, 246, ${node.alpha})`; // blue-500
          ctx.shadowBlur = 0;
        } else {
          // Back elements get darker translucent grey/blue
          ctx.fillStyle = `rgba(148, 163, 184, ${node.alpha * 0.5})`; // slate-400
          ctx.shadowBlur = 0;
        }

        // Render skill text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.name, node.projX, node.projY);

        // Render tiny orbit connection points for a "constellation" feel
        if (node.z < 0) {
          ctx.beginPath();
          ctx.arc(node.projX, node.projY + fontSize / 2 + 5, 2, 0, Math.PI * 2);
          ctx.fillStyle = isHoveredNode ? "#a855f7" : "rgba(6, 182, 212, 0.4)";
          ctx.fill();
        }
      });

      ctx.shadowBlur = 0; // Reset shadow
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [hoveredSkill]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[450px] flex items-center justify-center select-none"
    >
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      {hoveredSkill && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-purple-500/30 px-4 py-1.5 rounded-full text-xs text-purple-300 font-mono tracking-wider backdrop-blur-md animate-fade-in shadow-lg">
          Focus: {hoveredSkill}
        </div>
      )}
    </div>
  );
}
