"use client"; // Important for using React hooks (client component)

import React, { useState, useEffect, useRef, DragEvent } from 'react';

interface Furniture {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

function generateRandomFurniture(
  numPieces: number,
  containerWidth: number,
  containerHeight: number
): Furniture[] {
  const furnitureArray: Furniture[] = [];
  for (let i = 0; i < numPieces; i++) {
    const width = 50 + Math.floor(Math.random() * 50); // 50-100px
    const height = 50 + Math.floor(Math.random() * 50); // 50-100px
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const x = Math.random() * (containerWidth - width);
    const y = Math.random() * (containerHeight - height);

    furnitureArray.push({
      id: i,
      x,
      y,
      width,
      height,
      color,
    });
  }
  return furnitureArray;
}

function calculateFengShui(
  furniture: Furniture[],
  containerWidth: number,
  containerHeight: number
): number {
  if (furniture.length === 0) return 50;

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const distances = furniture.map(({ x, y, width, height }) => {
    const pieceCenterX = x + width / 2;
    const pieceCenterY = y + height / 2;
    const dx = pieceCenterX - centerX;
    const dy = pieceCenterY - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  });

  const avgDistance =
    distances.reduce((sum, d) => sum + d, 0) / distances.length;

  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
  let score = 100 - (avgDistance / maxDistance) * 100;
  score = Math.max(0, Math.min(100, score));
  return Math.round(score);
}

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [fengShuiScore, setFengShuiScore] = useState<number>(50);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialFurniture = generateRandomFurniture(
        5,
        clientWidth,
        clientHeight
      );
      setFurniture(initialFurniture);
      setFengShuiScore(calculateFengShui(initialFurniture, clientWidth, clientHeight));
    }
  }, []);

  // Fired when drag starts
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Furniture) => {
    setDraggingId(item.id);

    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  // Must allow onDrop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Drop the piece and recalc position
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingId === null || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dropX = e.clientX - containerRect.left - dragOffset.x;
    const dropY = e.clientY - containerRect.top - dragOffset.y;

    const { clientWidth, clientHeight } = containerRef.current;
    const piece = furniture.find((f) => f.id === draggingId);
    if (!piece) return;

    const newX = Math.max(0, Math.min(dropX, clientWidth - piece.width));
    const newY = Math.max(0, Math.min(dropY, clientHeight - piece.height));

    const updatedFurniture = furniture.map((f) => {
      if (f.id === draggingId) {
        return { ...f, x: newX, y: newY };
      }
      return f;
    });

    setFurniture(updatedFurniture);
    setDraggingId(null);

    const newScore = calculateFengShui(updatedFurniture, clientWidth, clientHeight);
    setFengShuiScore(newScore);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Main container (draggable area) */}
      <div
        ref={containerRef}
        className="relative flex-1 border-2 border-gray-300"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {furniture.map((item) => (
          <div
            key={item.id}
            className="absolute cursor-move"
            style={{
              width: item.width,
              height: item.height,
              left: item.x,
              top: item.y,
              backgroundColor: item.color,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          />
        ))}
      </div>

      {/* Feng Shui Meter */}
      <div className="w-40 border-l-2 border-gray-300 flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold my-4">Feng Shui Meter</h2>
        <div className="relative h-64 w-10 border border-gray-400 rounded bg-gray-100">
          <div
            className="absolute bottom-0 left-0 w-full bg-green-500 transition-all duration-300"
            style={{ height: `${fengShuiScore}%` }}
          />
        </div>
        <p className="mt-4 text-lg font-bold">{fengShuiScore} / 100</p>
      </div>
    </div>
  );
}
