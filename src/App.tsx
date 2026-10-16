import React from 'react'
import { Canvas } from '@react-three/fiber'
import ParticleScene from './components/ParticleScene'
import { OrbitControls } from '@react-three/drei'

const App: React.FC = () => {
  return (
    <div className="app">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleScene />
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
      <div className="ui">
        <h1>Particle Interaction</h1>
        <p>Move the mouse / touch to attract particles. Click to toggle repulse/attract.</p>
      </div>
    </div>
  )
}

export default App
