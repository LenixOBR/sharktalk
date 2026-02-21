import { useState } from 'react'
import maitenanceLogo from './assets/maintenance.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='logo'>
        <img src={maitenanceLogo} className="logo" alt="logo" />
      </div>
      <h1>Sob manuntenção</h1>
    </>
  )
}

export default App
