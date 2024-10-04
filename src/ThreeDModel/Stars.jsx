// src/components/Stars.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Stars = () => {
  const starsRef = useRef();

  useEffect(() => {
    const count = 5000; // Number of stars
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // Z
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 'white', size: 0.1 });
    
    // Create the points object
    starsRef.current = new THREE.Points(geometry, material);

    // Clean up the starsRef.current when the component unmounts
    return () => {
      starsRef.current.geometry.dispose();
      starsRef.current.material.dispose();
    };
  }, []);

  return <primitive object={starsRef.current} />;
};

export default Stars;
