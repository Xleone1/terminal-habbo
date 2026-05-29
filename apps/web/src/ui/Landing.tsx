import React from 'react'
import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'

export default function Landing(){
  return (
    <div style={{background:'#070B0E',minHeight:'100vh',color:'#C7D1D9', fontFamily:'IBM Plex Mono, monospace'}}>
      <Hero />
      <div style={{padding: '0 20px', maxWidth: '1200px', margin: '0 auto'}}>
        <Stats />
      </div>
    </div>
  )
}
