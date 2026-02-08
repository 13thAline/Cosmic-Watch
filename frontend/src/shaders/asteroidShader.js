// Asteroid Point Shader - GLSL
// Custom vertex and fragment shaders for GPU-accelerated asteroid rendering

// ============================================
// VERTEX SHADER
// ============================================
// #pragma glslify: export(vertexShader)

const vertexShader = `
  attribute vec3 instanceColor;
  attribute float instanceSize;
  attribute float isHazardous;
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHazardous;
  
  uniform float time;
  uniform float cameraDistance;
  
  void main() {
    vColor = instanceColor;
    vHazardous = isHazardous;
    
    // Calculate distance to camera for LOD
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float dist = -mvPosition.z;
    
    // Size attenuation with distance (inverse relationship)
    float size = instanceSize * (300.0 / max(dist, 1.0));
    size = clamp(size, 1.0, 25.0);
    
    // Hazardous asteroids have a subtle pulse animation
    if (isHazardous > 0.5) {
      size *= 1.0 + 0.2 * sin(time * 3.0);
    }
    
    // Alpha fadeout for distant asteroids (performance & visual clarity)
    vAlpha = clamp(1.0 - (dist / 500.0), 0.15, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size;
  }
`;

// ============================================
// FRAGMENT SHADER  
// ============================================
// #pragma glslify: export(fragmentShader)

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHazardous;
  
  void main() {
    // Create circular point with soft edges
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Discard pixels outside the circle
    if (dist > 0.5) discard;
    
    // Soft glow for hazardous asteroids (red tint)
    float glow = vHazardous > 0.5 ? 0.4 : 0.0;
    
    // Smooth edge transition
    float edgeFalloff = 1.0 - smoothstep(0.25, 0.5, dist);
    float alpha = vAlpha * edgeFalloff;
    
    // Add glow contribution
    alpha += glow * (1.0 - dist * 2.0);
    
    // Final color with glow contribution
    vec3 finalColor = vColor;
    if (vHazardous > 0.5) {
      // Add red glow to hazardous asteroids
      finalColor += vec3(glow * 0.3, 0.0, 0.0);
    }
    
    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
  }
`;

// ============================================
// ORBIT LINE SHADER
// ============================================

const orbitVertexShader = `
  varying float vProgress;
  attribute float lineProgress;
  
  void main() {
    vProgress = lineProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const orbitFragmentShader = `
  varying float vProgress;
  uniform vec3 pastColor;
  uniform vec3 futureColor;
  uniform float currentProgress;
  
  void main() {
    // Gradient from past to future based on progress along orbit
    float t = vProgress;
    vec3 color = mix(pastColor, futureColor, t);
    
    // Highlight current position with brighter color
    float highlight = 1.0 - abs(t - currentProgress) * 5.0;
    highlight = clamp(highlight, 0.0, 1.0);
    color += highlight * vec3(0.3);
    
    // Fade out past positions more than future
    float alpha = t < currentProgress ? 0.3 : 0.7;
    alpha += highlight * 0.3;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ============================================
// VELOCITY VECTOR SHADER
// ============================================

const velocityVertexShader = `
  varying vec3 vPosition;
  
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const velocityFragmentShader = `
  varying vec3 vPosition;
  uniform float arrowLength;
  
  void main() {
    // Gradient along arrow direction (tip is brighter)
    float t = length(vPosition) / arrowLength;
    vec3 color = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.8, 0.0), t);
    gl_FragColor = vec4(color, 0.9);
  }
`;

// Export for use in JavaScript
export {
    vertexShader,
    fragmentShader,
    orbitVertexShader,
    orbitFragmentShader,
    velocityVertexShader,
    velocityFragmentShader
};
