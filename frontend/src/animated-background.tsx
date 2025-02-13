import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  frameCount?: number;
  startTimestamp?: number;
}

interface BaseElement {
  draw(ctx: CanvasRenderingContext2D, frameCount: number): void;
  hue: number;
}

class Triangle implements BaseElement {
  private points: [number, number][] = [];
  private readonly canvas: HTMLCanvasElement;
  private size: number;
  private readonly index: number;
  public hue: number;
  private readonly seed: number;
  private centerX: number;
  private centerY: number;
  private readonly freqX: number;
  private readonly freqY: number;
  private readonly ampX: number;
  private readonly ampY: number;
  private readonly rotationSpeed: number;

  constructor(canvas: HTMLCanvasElement, index: number, frameCount: number, baseHue: number, seed: number) {
    this.canvas = canvas;
    this.index = index;
    this.seed = seed;
    
    // Even smaller size and less variation
    this.size = 20 + Math.sin(index * 0.5 + seed * 0.001) * 10;
    this.hue = (baseHue + index * 20) % 360;
    
    // Distribute triangles across the canvas using a grid
    const gridSize = Math.ceil(Math.sqrt(12)); // Adjusted for 12 triangles
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Add some randomness to grid positions
    this.centerX = cellWidth * (col + 0.5) + Math.sin(seed * index) * (cellWidth * 0.3);
    this.centerY = cellHeight * (row + 0.5) + Math.cos(seed * index) * (cellHeight * 0.3);
    
    // Even slower movement parameters
    this.freqX = 0.0005 + (index % 5) * 0.0002;
    this.freqY = 0.0007 + (index % 4) * 0.0002;
    this.ampX = 30 + (index % 3) * 10;
    this.ampY = 25 + (index % 4) * 8;
    this.rotationSpeed = 0.0002 + (index % 6) * 0.0001;
  }

  private calculatePoints(frameCount: number): void {
    // Calculate center position with smooth movement
    const currentX = this.centerX + Math.sin(frameCount * this.freqX + this.seed) * this.ampX;
    const currentY = this.centerY + Math.cos(frameCount * this.freqY + this.seed) * this.ampY;
    
    // Slower rotation
    const baseAngle = frameCount * this.rotationSpeed;
    
    this.points = Array(3).fill(0).map((_, i) => {
      const pointAngle = baseAngle + (i * Math.PI * 2 / 3);
      return [
        currentX + Math.cos(pointAngle) * this.size,
        currentY + Math.sin(pointAngle) * this.size
      ];
    });
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    this.calculatePoints(frameCount);
    // Lower base opacity
    const opacity = 0.15 + Math.sin(frameCount * 0.02 + this.index) * 0.05;

    ctx.beginPath();
    ctx.moveTo(this.points[0][0], this.points[0][1]);
    this.points.slice(1).forEach(point => ctx.lineTo(point[0], point[1]));
    ctx.closePath();
    ctx.fillStyle = `hsla(${this.hue}, 90%, 65%, ${opacity})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${this.hue}, 95%, 75%, ${opacity * 1.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

class WaveLine implements BaseElement {
  private readonly canvas: HTMLCanvasElement;
  private readonly index: number;
  private readonly seed: number;
  public hue: number;
  private readonly baseFrequency: number;
  private readonly baseAmplitude: number;
  private readonly speedMultiplier: number;
  private readonly waveCount: number;

  constructor(canvas: HTMLCanvasElement, index: number, frameCount: number, baseHue: number, seed: number) {
    this.canvas = canvas;
    this.index = index;
    this.seed = seed;
    this.hue = (baseHue + index * 30) % 360;
    
    // Slower wave parameters
    this.baseFrequency = 0.0005 + (Math.sin(seed * index) * 0.0002);
    this.baseAmplitude = 30 + Math.sin(seed * index * 0.1) * 12;
    this.speedMultiplier = 0.005 + (index % 4) * 0.001;
    this.waveCount = 2 + (index % 2);
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    const yOffset = (this.canvas.height / 8) * this.index;
    
    ctx.beginPath();
    ctx.moveTo(0, yOffset);

    for (let x = 0; x < this.canvas.width; x += 2) {
      let y = yOffset;
      
      // Combine multiple waves with different frequencies and phases
      for (let wave = 0; wave < this.waveCount; wave++) {
        const waveFreq = this.baseFrequency * (1 + wave * 0.4);
        const waveAmp = this.baseAmplitude * (1 - wave * 0.15);
        const timeOffset = frameCount * this.speedMultiplier * (1 + wave * 0.2);
        const phaseOffset = this.seed * 0.1 + this.index * 0.2 + wave;
        
        y += Math.sin(x * waveFreq + timeOffset + phaseOffset) * waveAmp;
        
        // Slower vertical drift
        y += Math.sin(frameCount * 0.01 + this.index) * 15;
      }
      
      ctx.lineTo(x, y);
    }

    // Dynamic opacity based on movement
    const opacity = 0.15 + Math.sin(frameCount * 0.02 + this.index) * 0.05;
    ctx.strokeStyle = `hsla(${this.hue}, 85%, 75%, ${opacity})`;
    ctx.lineWidth = 1.5 + Math.sin(frameCount * 0.03 + this.index) * 0.5;
    ctx.stroke();
  }
}

class Particle implements BaseElement {
  private x: number = 0;
  private y: number = 0;
  private size: number = 0;
  public hue: number = 0;
  private opacity: number = 0;
  private speed: number;
  private angle: number;
  private readonly seed: number;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly index: number,
    frameCount: number,
    baseHue: number,
    seed: number
  ) {
    this.speed = 5 + (seed % 100) / 20;
    this.seed = seed;
    this.angle = (index * Math.PI * 2 / 20);
  }

  private calculate(frameCount: number): void {
    this.angle += 0.1 * this.speed;
    const radius = 200 + Math.sin(frameCount * 0.2 + this.index + this.seed * 0.001) * 100;
    this.x = this.canvas.width / 2 + Math.cos(this.angle) * radius;
    this.y = this.canvas.height / 2 + Math.sin(this.angle) * radius;
    this.size = 4 + Math.sin(frameCount * 0.5 + this.index) * 2;
    this.hue = (frameCount * 1 + this.index * 10) % 360;
    this.opacity = 0.3 + Math.sin(frameCount * 0.2 + this.index) * 0.1;
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    this.calculate(frameCount);
    const glowSize = this.size * 2;
    
    // Add glow effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, glowSize
    );
    gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.opacity})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 100%, 70%, 0)`);
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

class Circle implements BaseElement {
  private x: number;
  private y: number;
  private radius: number;
  public hue: number;
  private opacity: number;
  private pulseSpeed: number;
  private centerX: number;
  private centerY: number;
  private orbitRadius: number;
  private orbitSpeed: number;
  private readonly index: number;
  private readonly freqX1: number;
  private readonly freqX2: number;
  private readonly freqY1: number;
  private readonly freqY2: number;
  private readonly ampX1: number;
  private readonly ampX2: number;
  private readonly ampY1: number;
  private readonly ampY2: number;

  constructor(canvas: HTMLCanvasElement, index: number, frameCount: number, baseHue: number, seed: number) {
    this.index = index;
    
    // Distribute circles evenly across the canvas
    const gridSize = Math.ceil(Math.sqrt(15));
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    this.centerX = cellWidth * (col + 0.5) + Math.sin(seed * index) * (cellWidth * 0.3);
    this.centerY = cellHeight * (row + 0.5) + Math.cos(seed * index) * (cellHeight * 0.3);
    this.orbitRadius = 100 + ((index * seed) % 100);
    this.radius = 50 + Math.sin(index * 0.8 + seed * 0.002) * 25;
    this.hue = (baseHue + index * 15) % 360;
    this.pulseSpeed = 0.02 + index * 0.002;
    this.opacity = 0.12;
    
    // Slower movement parameters
    this.orbitSpeed = 0.005;
    this.freqX1 = 0.002;
    this.freqX2 = 0.003;
    this.freqY1 = 0.0025;
    this.freqY2 = 0.0035;
    
    // Slightly reduced movement ranges
    this.ampX1 = 120;
    this.ampX2 = 80;
    this.ampY1 = 80;
    this.ampY2 = 60;
    
    this.x = this.centerX;
    this.y = this.centerY;
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    const time = frameCount * this.orbitSpeed;
    
    const xOffset = Math.sin(time + this.index) * this.ampX1 + 
                   Math.cos(time * 0.5 + this.index) * this.ampX2;
    const yOffset = Math.cos(time + this.index) * this.ampY1 + 
                   Math.sin(time * 0.5 + this.index) * this.ampY2;
    
    this.x = this.centerX + xOffset;
    this.y = this.centerY + yOffset;
    
    this.opacity = 0.12 + Math.sin(frameCount * 0.01 + this.index) * 0.05;
    const pulsedRadius = Math.max(1, this.radius + Math.sin(frameCount * this.pulseSpeed) * 15);

    // Draw solid circle with sharp edge but more transparent
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulsedRadius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${this.opacity * 1.5})`;
    ctx.fill();

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulsedRadius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 85%, ${this.opacity})`;
    ctx.stroke();

    // Add small inner highlight
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulsedRadius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 90%, ${this.opacity * 0.8})`;
    ctx.fill();
  }
}

class Star implements BaseElement {
  private x: number;
  private y: number;
  private size: number;
  public hue: number;
  private rotation: number;
  private points: number;
  private centerX: number;
  private centerY: number;
  private orbitRadius: number;
  private rotationSpeed: number;
  private orbitSpeed: number;
  private opacity: number;
  private readonly index: number;
  private readonly freqX1: number;
  private readonly freqX2: number;
  private readonly freqY1: number;
  private readonly freqY2: number;
  private readonly ampX1: number;
  private readonly ampX2: number;
  private readonly ampY1: number;
  private readonly ampY2: number;

  constructor(canvas: HTMLCanvasElement, index: number, frameCount: number, baseHue: number, seed: number) {
    this.index = index;
    
    // Distribute stars evenly across the canvas
    const gridSize = Math.ceil(Math.sqrt(20)); // For 20 stars
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    this.centerX = cellWidth * (col + 0.5) + Math.cos(seed * index) * (cellWidth * 0.3);
    this.centerY = cellHeight * (row + 0.5) + Math.sin(seed * index) * (cellHeight * 0.3);
    this.orbitRadius = 40 + ((index * seed) % 40);
    this.size = 12 + Math.sin(index * 0.4 + seed * 0.001) * 8;
    this.hue = (baseHue + index * 25) % 360;
    this.points = 5 + (index % 3);
    this.opacity = 0.25;
    
    // Slower movement parameters
    this.orbitSpeed = 0.004;
    this.rotationSpeed = 0.002;
    this.freqX1 = 0.002;
    this.freqX2 = 0.003;
    this.freqY1 = 0.0025;
    this.freqY2 = 0.0035;
    
    this.ampX1 = 60;
    this.ampX2 = 40;
    this.ampY1 = 50;
    this.ampY2 = 45;
    
    this.rotation = 0;
    this.x = this.centerX;
    this.y = this.centerY;
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    const time = frameCount * this.orbitSpeed;
    
    // Simple but effective movement
    const xOffset = Math.sin(time + this.index) * this.ampX1 + 
                   Math.cos(time * 0.5 + this.index) * this.ampX2;
    const yOffset = Math.cos(time + this.index) * this.ampY1 + 
                   Math.sin(time * 0.5 + this.index) * this.ampY2;
    
    this.x = this.centerX + xOffset;
    this.y = this.centerY + yOffset;
    
    this.rotation = frameCount * this.rotationSpeed;
    this.opacity = 0.25 + Math.sin(frameCount * 0.04 + this.index) * 0.08;

    ctx.beginPath();
    for (let i = 0; i < this.points * 2; i++) {
      const radius = i % 2 === 0 ? this.size : this.size * 0.4;
      const angle = (i * Math.PI) / this.points + this.rotation;
      const x = this.x + radius * Math.cos(angle);
      const y = this.y + radius * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `hsla(${this.hue}, 95%, 65%, ${this.opacity})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 75%, ${this.opacity * 1.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  frameCount = 0,
  startTimestamp = Date.now()
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 1920;
    canvas.height = 1080;

    const seed = startTimestamp;
    const baseHue = (frameCount * 0.05 + (seed % 360)) % 360;

    // Rich, deep background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, `hsla(${baseHue}, 80%, 5%, 1)`);
    bgGradient.addColorStop(0.5, `hsla(${(baseHue + 30) % 360}, 70%, 7%, 1)`);
    bgGradient.addColorStop(1, `hsla(${(baseHue + 60) % 360}, 80%, 3%, 1)`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create elements with enhanced colors
    const elements: BaseElement[] = [
      ...Array(12).fill(0).map((_, i) =>  // Reduced from 24 to 12 triangles
        new Triangle(canvas, i, frameCount, (baseHue + 120) % 360, seed)
      ),
      ...Array(8).fill(0).map((_, i) => 
        new WaveLine(canvas, i, frameCount, (baseHue + 180) % 360, seed)
      ),
      ...Array(30).fill(0).map((_, i) => 
        new Particle(canvas, i, frameCount, (baseHue + 240) % 360, seed)
      ),
      ...Array(15).fill(0).map((_, i) => 
        new Circle(canvas, i, frameCount, baseHue, seed)
      ),
      ...Array(20).fill(0).map((_, i) => 
        new Star(canvas, i, frameCount, (baseHue + 60) % 360, seed)
      )
    ];

    // Sort elements by hue for better blending
    elements.sort((a, b) => a.hue - b.hue);

    // Draw all elements
    elements.forEach(element => element.draw(ctx, frameCount));

    // Enhanced vignette effect
    const vignetteGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGradient.addColorStop(0.7, `hsla(${baseHue}, 80%, 5%, 0.2)`);
    vignetteGradient.addColorStop(1, `hsla(${baseHue}, 80%, 5%, 0.5)`);
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }, [frameCount, startTimestamp]);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default AnimatedBackground;