import { useState, useEffect } from 'react'

function App() {
  const [weight, setWeight] = useState('')
  const [log, setLog] = useState([])

  // LOAD saved data
  useEffect(() => {
    const saved = localStorage.getItem('fitness-log')
    if (saved) setLog(JSON.parse(saved))
  }, [])

  // SAVE data whenever it changes
  useEffect(() => {
    localStorage.setItem('fitness-log', JSON.stringify(log))
  }, [log])

  const addEntry = () => {
    if (!weight) return
    setLog([...log, weight])
    setWeight('')
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Fitness Tracker 💪</h1>

      <h3>Daily Weight</h3>
      <input
        placeholder="Enter weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <button onClick={addEntry}>Add</button>

      <h3>Log</h3>
      <ul>
        {log.map((w, i) => (
          <li key={i}>{w} lbs</li>
        ))}
      </ul>
    </div>
  )
}

export default App
