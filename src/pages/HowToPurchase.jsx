import React from 'react'
import Header from '../components/Header';

const HowToPurchase = () => {
  return (
    <div>
      <Header />
      <h1 className='text-lg font-semibold mt-20 mb-2 text-center gradient-text'>How to Purchase</h1>
      <div className="m-4 rounded-2xl overflow-hidden aspect-video">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/NyqkkX0-v60"
            title="How to Use"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      <p className='text-lg font-semibold mt-4 mb-2 text-center'>Step by Step Guide</p>
      <img src="" alt="" />

    </div>
  )
}

export default HowToPurchase