import React from 'react'
import Footer from '../footer/Footer'
import Header from '../header/Header'
import './layout.css'

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}
