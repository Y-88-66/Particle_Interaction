import React, { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PARTICLE_COUNT, BOUNDS } from '../constants'

// Particle interaction: mouse/touch produces an attractor/repulsor in world space.
const ParticleScene: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3))
  const velocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3))
  const colors = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3))
  const { camera, gl } = useThree()

  // interaction state
  const attractor = useRef(new THREE.Vector3(0, 0, 0))
  const attractMode = useRef(1) // 1 = attract, -1 = repulse
  const pointer = useRef({ x: 0, y: 0 })

  // initialize particles
  useEffect(() => {
    const pos = positions.current
    const vel = velocities.current
    const col = colors.current
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // distribute in a cone-ish tree-like shape or loose sphere
      const t = Math.random()
      const radius = (1 - t) * (Math.random() * 2.5 + 0.2) * (Math.random() > 0.8 ? 0.6 : 1)
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = (t - 0.5) * 6 // vertical spread
      const z = Math.sin(angle) * radius
      const i3 = i * 3
      pos[i3] = x
      pos[i3 + 1] = y
      pos[i3 + 2] = z

      // small random velocities
      vel[i3] = (Math.random() - 0.5) * 0.02
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02

      // colors: greenish for leaves, some ornaments
      if (Math.random() > 0.985) {
        // ornament
        col[i3] = 1.0
        col[i3 + 1] = Math.random() > 0.5 ? 0.2 : 0.84
        col[i3 + 2] = 0.2
      } else {
        // leaf greens
        const g = 0.4 + Math.random() * 0.4
        col[i3] = 0.0
        col[i3 + 1] = g
        col[i3 + 2] = 0.0
      }
    }
  }, [])

  // handle pointer -> world conversion
  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      pointer.current.x = x
      pointer.current.y = y

      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera)
      attractor.current.copy(vec)
    }
    function onClick() {
      attractMode.current *= -1
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('click', onClick)
    }
  }, [camera, gl.domElement])

  useFrame((state, delta) => {
    const pos = positions.current
    const vel = velocities.current
    const att = attractor.current
    const mode = attractMode.current
    const damping = 0.98
    const px = pointsRef.current?.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      // vector from particle to attractor
      const dx = att.x - pos[i3]
      const dy = att.y - pos[i3 + 1]
      const dz = att.z - pos[i3 + 2]
      const dist2 = dx * dx + dy * dy + dz * dz + 0.0001
      // normalized influence
      const invDist = 1 / Math.sqrt(dist2)
      const force = (mode * 50) / (dist2) // stronger when close
      // apply
      vel[i3] += dx * invDist * force * delta * 0.001
      vel[i3 + 1] += dy * invDist * force * delta * 0.001
      vel[i3 + 2] += dz * invDist * force * delta * 0.001

      // simple bounds and damping
      pos[i3] += vel[i3]
      pos[i3 + 1] += vel[i3 + 1]
      pos[i3 + 2] += vel[i3 + 2]

      vel[i3] *= damping
      vel[i3 + 1] *= damping
      vel[i3 + 2] *= damping

      // keep inside BOUNDS box with soft wrap
      for (let k = 0; k < 3; k++) {
        if (pos[i3 + k] > BOUNDS) pos[i3 + k] = -BOUNDS
        if (pos[i3 + k] < -BOUNDS) pos[i3 + k] = BOUNDS
      }

      // write back to buffer attribute
      px.array[i3] = pos[i3]
      px.array[i3 + 1] = pos[i3 + 1]
      px.array[i3 + 2] = pos[i3 + 2]
    }
    px.needsUpdate = true

    // gentle rotation for whole points set
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default ParticleScene
