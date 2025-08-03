import { ref, computed, type Ref } from 'vue';
import type { Point, PolygonPoints } from '../types';

export const useCanvas = (canvasRef: Ref<HTMLCanvasElement | null>) => {
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  const currentPolygon = ref<Point[]>([]);
  const isDrawing = ref(false);
  const backgroundImage = ref<HTMLImageElement | null>(null);
  const hoveredPointIndex = ref<number>(-1);

  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;

  const colors = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'] as const;
  const POINT_RADIUS = 6;
  const POINT_HOVER_RADIUS = 10;
  const POINT_CLICK_THRESHOLD = 16;
  const LINE_WIDTH = 2;

  const setupCanvas = () => {
    if (!canvasRef.value) return;
    
    ctx.value = canvasRef.value.getContext('2d');
    updateCanvasSize();
    loadBackgroundImage();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvasRef.value.parentElement!);
  };

  const updateCanvasSize = () => {
    if (!canvasRef.value) return;
    const container = canvasRef.value.parentElement!;
    const rect = container.getBoundingClientRect();
    
    canvasRef.value.width = rect.width;
    canvasRef.value.height = rect.height;
    
    redraw();
  };

  const loadBackgroundImage = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      backgroundImage.value = img;
      redraw();
    };
    img.src = 'https://picsum.photos/800/600';
  };

  const getCanvasCoordinates = (event: MouseEvent | TouchEvent): Point => {
    if (!canvasRef.value) return [0, 0];
    
    const rect = canvasRef.value.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if (event instanceof TouchEvent) {
      const touch = event.touches[0] || event.changedTouches[0];
      if (!touch) return [0, 0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    

    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;
    
    return [
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY
    ] as Point;
  };

  const getActualCoordinates = (virtualPoint: Point): Point => {
    if (!canvasRef.value) return virtualPoint;
    
    const scaleX = canvasRef.value.width / BASE_WIDTH;
    const scaleY = canvasRef.value.height / BASE_HEIGHT;
    
    return [
      virtualPoint[0] * scaleX,
      virtualPoint[1] * scaleY
    ] as Point;
  };

  const isPointNearExisting = (point: Point, targetPoint: Point): boolean => {
    const [actualX, actualY] = getActualCoordinates(point);
    const [targetX, targetY] = getActualCoordinates(targetPoint);
    
    const distance = Math.sqrt(
      Math.pow(actualX - targetX, 2) + Math.pow(actualY - targetY, 2)
    );
    
    return distance <= POINT_CLICK_THRESHOLD;
  };

  const findClickedPoint = (clickPoint: Point): number => {
    return currentPolygon.value.findIndex(point => 
      isPointNearExisting(clickPoint, point)
    );
  };

  const findHoveredPoint = (mousePoint: Point): number => {
    if (!canClosePolygon.value) return -1;
    

    if (currentPolygon.value.length > 0 && isPointNearExisting(mousePoint, currentPolygon.value[0]!)) {
      return 0;
    }
    return -1;
  };

  const drawPolygon = (points: PolygonPoints, color: string, isCurrent = false) => {
    if (!ctx.value || points.length < 2) return;

    const actualPoints = points.map(getActualCoordinates);
    const [firstPoint, ...restPoints] = actualPoints;
    if (!firstPoint) return;

    if (points.length >= 3 && !isCurrent) {
      ctx.value.beginPath();
      ctx.value.moveTo(...firstPoint);
      restPoints.forEach(point => point && ctx.value!.lineTo(...point));
      ctx.value.closePath();
      
      ctx.value.fillStyle = color;
      ctx.value.globalAlpha = 0.3;
      ctx.value.fill();
    }

    ctx.value.globalAlpha = 1;
    ctx.value.strokeStyle = color;
    ctx.value.lineWidth = isCurrent ? 3 : LINE_WIDTH;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    

    if (!isCurrent) {
      ctx.value.shadowBlur = 2;
      ctx.value.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.value.shadowOffsetY = 1;
    }
    
    ctx.value.beginPath();
    ctx.value.moveTo(...firstPoint);
    restPoints.forEach(point => point && ctx.value!.lineTo(...point));
    if (points.length >= 3 && !isCurrent) ctx.value.closePath();
    ctx.value.stroke();
    

    ctx.value.shadowBlur = 0;
    ctx.value.shadowOffsetY = 0;

    actualPoints.forEach((point, i) => {
      if (!point || !ctx.value) return;
      
      const isFirstPoint = i === 0;
      const isHovered = isCurrent && hoveredPointIndex.value === i;
      const canClose = isCurrent && canClosePolygon.value && isFirstPoint;
      const radius = isHovered ? POINT_HOVER_RADIUS : POINT_RADIUS;
      

      if (isHovered) {
        ctx.value.beginPath();
        ctx.value.arc(...point, radius + 4, 0, Math.PI * 2);
        ctx.value.fillStyle = `${color}20`;
        ctx.value.fill();
      }
      
      ctx.value.beginPath();
      ctx.value.arc(...point, radius, 0, Math.PI * 2);
      
      if (canClose && isHovered) {

        ctx.value.fillStyle = '#059669';
        ctx.value.strokeStyle = 'white';
        ctx.value.lineWidth = 4;
        ctx.value.shadowBlur = 12;
        ctx.value.shadowColor = '#059669';
      } else if (canClose) {

        ctx.value.fillStyle = '#10b981';
        ctx.value.strokeStyle = 'white';
        ctx.value.lineWidth = 3;
        ctx.value.shadowBlur = 6;
        ctx.value.shadowColor = '#10b981';
      } else if (isHovered) {

        ctx.value.fillStyle = color;
        ctx.value.strokeStyle = 'white';
        ctx.value.lineWidth = 3;
        ctx.value.shadowBlur = 4;
        ctx.value.shadowColor = color;
      } else {

        ctx.value.fillStyle = color;
        ctx.value.strokeStyle = 'white';
        ctx.value.lineWidth = 2;
        ctx.value.shadowBlur = 2;
        ctx.value.shadowColor = 'rgba(0, 0, 0, 0.2)';
      }
      
      ctx.value.fill();
      ctx.value.stroke();
      
  
      ctx.value.shadowBlur = 0;

      if (isCurrent) {
        ctx.value.fillStyle = 'white';
        ctx.value.font = '12px Arial';
        ctx.value.textAlign = 'center';
        ctx.value.fillText(String(i + 1), point[0], point[1] + 4);
      }
    });
  };

  const redraw = () => {
    if (!ctx.value || !backgroundImage.value || !canvasRef.value) return;
    
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.value.drawImage(
      backgroundImage.value, 
      0, 0, 
      canvasRef.value.width, 
      canvasRef.value.height
    );
  };

  const getPolygonColor = (index: number) => colors[index % colors.length] ?? colors[0]!;

  const drawPreviewLine = (mousePos: Point) => {
    if (!ctx.value || currentPolygon.value.length === 0) return;
    
    const lastPoint = currentPolygon.value.at(-1);
    if (!lastPoint) return;
    
    const [actualMouse] = [getActualCoordinates(mousePos)];
    const [actualLast] = [getActualCoordinates(lastPoint)];
    

    ctx.value.strokeStyle = '#3b82f6';
    ctx.value.lineWidth = 2;
    ctx.value.lineCap = 'round';
    ctx.value.shadowBlur = 4;
    ctx.value.shadowColor = '#3b82f6';
    ctx.value.setLineDash([8, 6]);
    ctx.value.beginPath();
    ctx.value.moveTo(...actualLast);
    ctx.value.lineTo(...actualMouse);
    ctx.value.stroke();
    ctx.value.setLineDash([]);
    ctx.value.shadowBlur = 0;

    if (canClosePolygon.value) {
      const firstPoint = currentPolygon.value[0];
      if (firstPoint && hoveredPointIndex.value === 0) {
        const [actualFirst] = [getActualCoordinates(firstPoint)];
        ctx.value.strokeStyle = '#10b981';
        ctx.value.lineWidth = 3;
        ctx.value.shadowBlur = 6;
        ctx.value.shadowColor = '#10b981';
        ctx.value.setLineDash([10, 6]);
        ctx.value.beginPath();
        ctx.value.moveTo(...actualMouse);
        ctx.value.lineTo(...actualFirst);
        ctx.value.stroke();
        ctx.value.setLineDash([]);
        ctx.value.shadowBlur = 0;
      }
    }
  };

  const canClosePolygon = computed(() => 
    currentPolygon.value.length >= 3
  );

  const currentPointCount = computed(() => 
    currentPolygon.value.length
  );

  return {
    currentPolygon: computed(() => currentPolygon.value),
    isDrawing: computed(() => isDrawing.value),
    canClosePolygon,
    currentPointCount,
    hoveredPointIndex: computed(() => hoveredPointIndex.value),
    setupCanvas,
    getCanvasCoordinates,
    findClickedPoint,
    findHoveredPoint,
    isPointNearExisting,
    drawPolygon,
    drawPreviewLine,
    getPolygonColor,
    redraw,
    startDrawing: () => { 
      isDrawing.value = true; 
      currentPolygon.value = []; 
    },
    stopDrawing: () => { 
      isDrawing.value = false; 
    },
    addPoint: (point: Point) => currentPolygon.value.push(point),
    clearCurrent: () => { 
      currentPolygon.value = []; 
    },
    setHoveredPoint: (index: number) => { 
      hoveredPointIndex.value = index; 
    },
    finishPolygon: () => {
      const points = [...currentPolygon.value];
      currentPolygon.value = [];
      isDrawing.value = false;
      return points;
    }
  };
};