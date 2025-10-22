import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { getStatColor } from '../utils/researchUtils';
import ResearchNode from './ResearchNode';
import styles from './ResearchTreeModal.module.scss';

interface ResearchTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRID_SPACING = 150;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

const ResearchTreeModal: React.FC<ResearchTreeModalProps> = ({ isOpen, onClose }) => {
  const { guildState, purchaseResearch } = useApp();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePurchase = useCallback((nodeId: string) => {
    purchaseResearch(nodeId);
  }, [purchaseResearch]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen) return null;

  const renderConnection = (fromX: number, fromY: number, toX: number, toY: number, stat: string) => {
    const statColor = getStatColor(stat);
    const startX = (fromX + 3) * GRID_SPACING;
    const startY = (fromY + 3) * GRID_SPACING;
    const endX = (toX + 3) * GRID_SPACING;
    const endY = (toY + 3) * GRID_SPACING;

    return (
      <line
        key={`${fromX}-${fromY}-${toX}-${toY}`}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={statColor}
        strokeWidth="3"
        opacity="0.7"
      />
    );
  };

  const connections = [
    // Hub connections
    { from: { x: 0, y: 0 }, to: { x: -1, y: 0 }, stat: 'STR' },
    { from: { x: 0, y: 0 }, to: { x: 0, y: -1 }, stat: 'AGL' },
    { from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, stat: 'MND' },
    { from: { x: 0, y: 0 }, to: { x: 0, y: 1 }, stat: 'VIG' },
    
    // STR branch
    { from: { x: -1, y: 0 }, to: { x: -2, y: 0 }, stat: 'STR' },
    { from: { x: -2, y: 0 }, to: { x: -3, y: 0 }, stat: 'STR' },
    
    // AGL branch
    { from: { x: 0, y: -1 }, to: { x: 0, y: -2 }, stat: 'AGL' },
    { from: { x: 0, y: -2 }, to: { x: 0, y: -3 }, stat: 'AGL' },
    
    // MND branch
    { from: { x: 1, y: 0 }, to: { x: 2, y: 0 }, stat: 'MND' },
    { from: { x: 2, y: 0 }, to: { x: 3, y: 0 }, stat: 'MND' },
    
    // VIG branch
    { from: { x: 0, y: 1 }, to: { x: 0, y: 2 }, stat: 'VIG' },
    { from: { x: 0, y: 2 }, to: { x: 0, y: 3 }, stat: 'VIG' },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Research Tree</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: getStatColor('STR') }}></div>
            <span>Strength</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: getStatColor('AGL') }}></div>
            <span>Agility</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: getStatColor('MND') }}></div>
            <span>Mind</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: getStatColor('VIG') }}></div>
            <span>Vitality</span>
          </div>
        </div>

        <div 
          className={styles.treeContainer}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.controls}>
            <button 
              className={styles.controlButton} 
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              title="Zoom Out"
            >
              −
            </button>
            <div className={styles.zoomLevel}>{Math.round(zoom * 100)}%</div>
            <button 
              className={styles.controlButton} 
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              title="Zoom In"
            >
              +
            </button>
            <button 
              className={styles.controlButton} 
              onClick={handleResetView}
              title="Reset View"
            >
              ⟲
            </button>
          </div>

          <div 
            className={styles.treeViewport}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            <svg className={styles.connections} viewBox="0 0 1050 1050">
              {connections.map(conn => 
                renderConnection(conn.from.x, conn.from.y, conn.to.x, conn.to.y, conn.stat)
              )}
            </svg>
            
            <div className={styles.nodes}>
              {guildState.research.map(node => (
                <ResearchNode
                  key={node.id}
                  node={node}
                  onPurchase={handlePurchase}
                  gridSpacing={GRID_SPACING}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchTreeModal;
