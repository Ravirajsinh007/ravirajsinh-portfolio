import { useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  speedX: number;
  speedY: number;
}

export default function Canvas3D({ activeSection }: { activeSection: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ current: 0, target: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Dynamic configuration based on screen width
    const isMobile = width < 768;
    const particleCount = isMobile ? 60 : 150;
    const fov = 350; // Field of view

    // 3D rotation angles
    let angleX = 0.002;
    let angleY = 0.003;
    let angleZ = 0.001;

    // Generate random 3D space particles
    const particles: Point3D[] = [];
    const colors = ["#3b82f6", "#8b5cf6", "#d946ef", "#06b6d4"];

    for (let i = 0; i < particleCount; i++) {
      const radius = isMobile ? 120 : 250;
      // Spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
      });
    }

    // 3D Geometric Shape: Torus Knot vertices for visual centerpiece
    const torusVertices: { x: number; y: number; z: number }[] = [];
    const torusLines = isMobile ? 120 : 250;
    const p = 2; // Torus parameters
    const q = 3;
    const r = 70; // major radius
    const rSmall = 25; // minor radius

    for (let i = 0; i < torusLines; i++) {
      const theta = (i / torusLines) * 2 * Math.PI * p;
      const r_theta = r + rSmall * Math.cos((q / p) * theta);
      const tx = r_theta * Math.cos(theta);
      const ty = r_theta * Math.sin(theta);
      const tz = rSmall * Math.sin((q / p) * theta);
      torusVertices.push({ x: tx, y: ty, z: tz });
    }

    // Handle Window Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track Mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;
      mouseRef.current.targetX = mx * 0.05;
      mouseRef.current.targetY = my * 0.05;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Track Scroll
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? window.scrollY / docHeight : 0;
      scrollRef.current.target = scrollPercent * 200; // Map scroll to depth offset
    };
    window.addEventListener("scroll", handleScroll);

    // Rotate point in 3D around X, Y, Z
    const rotate3D = (
      x: number,
      y: number,
      z: number,
      sinX: number,
      cosX: number,
      sinY: number,
      cosY: number,
      sinZ: number,
      cosZ: number
    ) => {
      // Rotate Y
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // Rotate X
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // Rotate Z
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      return { x: x3, y: y3, z: z2 };
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Smooth scroll depth easing
      const scroll = scrollRef.current;
      scroll.current += (scroll.target - scroll.current) * 0.05;

      // Calculate trig values once per frame
      // Slower or faster rotation based on active section
      let multiplier = 1;
      if (activeSection === "home") multiplier = 1.5;
      if (activeSection === "skills") multiplier = 2.0;
      if (activeSection === "projects") multiplier = 0.8;

      angleX += 0.0015 * multiplier;
      angleY += 0.002 * multiplier;
      angleZ += 0.0008 * multiplier;

      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);
      const sinZ = Math.sin(angleZ);
      const cosZ = Math.cos(angleZ);

      const centerX = width / 2 + mouse.x;
      const centerY = height / 2 + mouse.y;

      // 1. Draw central 3D Torus Knot wireframe
      // We offset its depth based on scroll to make it fly past
      const torusScaleOffset = 1.0 - Math.min(scroll.current / 150, 0.8);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
      ctx.lineWidth = 1.2;

      let firstProjected = { x: 0, y: 0 };
      for (let i = 0; i < torusVertices.length; i++) {
        const v = torusVertices[i];
        // Apply scaling & rotation
        const rotated = rotate3D(
          v.x * torusScaleOffset,
          v.y * torusScaleOffset,
          v.z * torusScaleOffset,
          sinX,
          cosX,
          sinY,
          cosY,
          sinZ,
          cosZ
        );

        // Map to 3D depth with scroll
        const depthZ = rotated.z + 150 - scroll.current * 0.3;
        if (depthZ > 0) {
          const scale = fov / (fov + depthZ);
          const px = rotated.x * scale + centerX;
          const py = rotated.y * scale + centerY;

          if (i === 0) {
            ctx.moveTo(px, py);
            firstProjected = { x: px, y: py };
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.lineTo(firstProjected.x, firstProjected.y);
      ctx.stroke();

      // 2. Draw drift particles
      particles.forEach((p) => {
        // Subtle drift movement
        p.baseX += p.speedX;
        p.baseY += p.speedY;

        // Keep inside boundary
        const boundary = 300;
        if (Math.abs(p.baseX) > boundary) p.speedX *= -1;
        if (Math.abs(p.baseY) > boundary) p.speedY *= -1;

        // Apply 3D rotation
        const rotated = rotate3D(
          p.baseX,
          p.baseY,
          p.baseZ,
          sinX * 0.4,
          cosX * 0.4,
          sinY * 0.4,
          cosY * 0.4,
          sinZ * 0.4,
          cosZ * 0.4
        );

        // Perspective projection
        // Make particles move closer/wider on scroll
        const depthZ = rotated.z + 200 + scroll.current * 0.5;

        if (depthZ > 0) {
          const scale = fov / (fov + depthZ);
          const px = rotated.x * scale + centerX;
          const py = rotated.y * scale + centerY;

          // Draw particle glow
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale * 1.5, 0, Math.PI * 2);
          const alpha = Math.max(0.1, Math.min(1.0, 1.2 - depthZ / 500));
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // Draw constellation lines (connect nearby particles)
          particles.forEach((other) => {
            if (p === other) return;
            const dx = other.baseX - p.baseX;
            const dy = other.baseY - p.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Connect if close enough in raw 3D space
            if (dist < 55) {
              const rotatedOther = rotate3D(
                other.baseX,
                other.baseY,
                other.baseZ,
                sinX * 0.4,
                cosX * 0.4,
                sinY * 0.4,
                cosY * 0.4,
                sinZ * 0.4,
                cosZ * 0.4
              );
              const depthZOther = rotatedOther.z + 200 + scroll.current * 0.5;
              if (depthZOther > 0) {
                const scaleOther = fov / (fov + depthZOther);
                const ox = rotatedOther.x * scaleOther + centerX;
                const oy = rotatedOther.y * scaleOther + centerY;

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(ox, oy);
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 55)})`;
                ctx.stroke();
              }
            }
          });
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas-3d"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#070913]"
    />
  );
}
