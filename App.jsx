
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, CheckCircle2, Download, Dumbbell, Droplets, RotateCcw, Scale, Smartphone, Upload, Utensils } from 'lucide-react'

const STORAGE_KEY = 'fitness-tracker-shareable-v1'
const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const mealPlan = {
  Mon: { breakfast:'4 eggs + veggies', lunch:'Chicken + rice + broccoli', preworkout:'Protein shake + banana', dinner:'Chicken + rice + broccoli' },
  Tue: { breakfast:'4 eggs + veggies', lunch:'Chicken + rice + broccoli', preworkout:'Protein + fruit', dinner:'Turkey + quinoa + zucchini + carrots' },
  Wed: { breakfast:'4 eggs + veggies', lunch:'Turkey + quinoa + veggies', preworkout:'Protein shake + banana', dinner:'Turkey + quinoa + veggies' },
  Thu: { breakfast:'4 eggs + veggies', lunch:'Turkey + quinoa + veggies', preworkout:'Protein + fruit', dinner:'Fish + sweet potato + greens' },
  Fri: { breakfast:'4 eggs + veggies', lunch:'Fish + sweet potato + greens', preworkout:'Protein + fruit', dinner:'Fish + sweet potato + greens' },
  Sat: { breakfast:'4 eggs + veggies', lunch:'Lean beef + beans + cauliflower', preworkout:'Optional', dinner:'Cheat meal (1 meal only)' },
  Sun: { breakfast:'4 eggs + veggies', lunch:'Protein + veggies (low carb)', preworkout:'Optional', dinner:'Chicken + rice + broccoli (prep for Monday)' }
}

const defaultDaily = () => ({ protein:false, carbsTimed:false, workout:false, water:false, onPlan:false, notes:'' })

const defaultState = {
  profile: { currentWeight:'260', goalWeight:'205', waterGoalOz:'128' },
  daily: Object.fromEntries(weekDays.map(day => [day, defaultDaily()])),
  weekly: Array.from({length:8}, (_, i) => ({ week:i + 1, weight:'', waist:'', energy:'', workouts:'', notes:'' }))
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultState
  }catch{
    return defaultState
  }
}

function downloadJson(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ScorePill({ label, value }){
  return (
    <div className="pill">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}

export default function App(){
  const [tab, setTab] = useState('dashboard')
  const [state, setState] = useState(defaultState)
  const [selectedDay, setSelectedDay] = useState('Mon')
  const fileInputRef = useRef(null)

  useEffect(() => { setState(loadState()) }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  const toggleDaily = (day, key) => {
    setState(prev => ({ ...prev, daily: { ...prev.daily, [day]: { ...prev.daily[day], [key]: !prev.daily[day][key] } } }))
  }

  const updateDailyNotes = (day, value) => {
    setState(prev => ({ ...prev, daily: { ...prev.daily, [day]: { ...prev.daily[day], notes: value } } }))
  }

  const updateProfile = (key, value) => setState(prev => ({ ...prev, profile: { ...prev.profile, [key]: value } }))

  const updateWeekly = (index, key, value) => {
    setState(prev => {
      const weekly = [...prev.weekly]
      weekly[index] = { ...weekly[index], [key]: value }
      return { ...prev, weekly }
    })
  }

  const dailyScores = useMemo(() => weekDays.map(day => {
    const d = state.daily[day]
    const score = [d.protein, d.carbsTimed, d.workout, d.water, d.onPlan].filter(Boolean).length
    return { day, score }
  }), [state.daily])

  const weeklyCompliance = useMemo(() => {
    const total = dailyScores.reduce((sum, item) => sum + item.score, 0)
    return Math.round((total / 35) * 100)
  }, [dailyScores])

  const perfectDays = dailyScores.filter(d => d.score === 5).length
  const latestWeekly = [...state.weekly].reverse().find(w => w.weight)
  const currentShownWeight = latestWeekly?.weight || state.profile.currentWeight
  const toGoal = Math.max(0, Number(currentShownWeight || 0) - Number(state.profile.goalWeight || 0))

  const exportData = () => downloadJson('fitness-tracker-data.json', state)

  const importData = async (event) => {
    const file = event.target.files?.[0]
    if(!file) return
    try{
      const text = await file.text()
      const parsed = JSON.parse(text)
      if(parsed?.profile && parsed?.daily && parsed?.weekly){
        setState(parsed)
      } else {
        alert('That file does not look like a tracker export.')
      }
    }catch{
      alert('Could not import that file.')
    } finally {
      event.target.value = ''
    }
  }

  const resetTracker = () => {
    if(window.confirm('Reset the tracker back to a fresh start?')){
      setState(defaultState)
    }
  }

  return (
    <div className="app">
      <div className="hero">
        <div className="eyebrow">iPhone fitness tracker</div>
        <h1>8-week cut dashboard</h1>
        <p>Track daily execution, weekly measurements, meals, and progress toward 205.</p>
      </div>

      <div className="tabs">
        {['dashboard','daily','weekly','meals'].map(name => (
          <button key={name} className={`tab ${tab === name ? 'active' : ''}`} onClick={() => setTab(name)}>
            {name[0].toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <>
        <div className="card">
          <h2><Smartphone size={18} style={{verticalAlign:'-3px', marginRight:8}} /> Shareable simple version</h2>
          <p className="notice">Use this in iPhone Safari and add it to the Home Screen. Each person keeps their own data on their own device. Export and import lets you back up or move your tracker later.</p>
          <div className="buttonRow">
            <button className="button" onClick={exportData}><Download size={16} style={{verticalAlign:'-2px', marginRight:6}} />Export</button>
            <button className="button secondary" onClick={() => fileInputRef.current?.click()}><Upload size={16} style={{verticalAlign:'-2px', marginRight:6}} />Import</button>
            <button className="button secondary" onClick={resetTracker}><RotateCcw size={16} style={{verticalAlign:'-2px', marginRight:6}} />Reset</button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/json" style={{display:'none'}} onChange={importData} />
        </div>

        <div className="card">
          <div className="grid2">
            <ScorePill label="Compliance" value={`${weeklyCompliance}%`} />
            <ScorePill label="Perfect days" value={`${perfectDays}/7`} />
            <ScorePill label="Current" value={`${currentShownWeight} lb`} />
            <ScorePill label="To goal" value={`${toGoal} lb`} />
          </div>
        </div>

        <div className="card">
          <h2><Scale size={18} style={{verticalAlign:'-3px', marginRight:8}} /> Profile</h2>
          <div className="grid3">
            <div><label className="label">Current</label><input className="input" value={state.profile.currentWeight} onChange={e => updateProfile('currentWeight', e.target.value)} /></div>
            <div><label className="label">Goal</label><input className="input" value={state.profile.goalWeight} onChange={e => updateProfile('goalWeight', e.target.value)} /></div>
            <div><label className="label">Water oz</label><input className="input" value={state.profile.waterGoalOz} onChange={e => updateProfile('waterGoalOz', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2><CalendarDays size={18} style={{verticalAlign:'-3px', marginRight:8}} /> Week at a glance</h2>
          {dailyScores.map(({ day, score }) => (
            <div key={day} className="progressWrap">
              <div className="row small"><span>{day}</span><span>{score}/5</span></div>
              <div className="progressBar"><div className="progressFill" style={{ width:`${score * 20}%` }} /></div>
            </div>
          ))}
        </div>
      </>}

      {tab === 'daily' && <>
        <div className="card">
          <div className="dayRow">
            {weekDays.map(day => (
              <button key={day} className={`dayButton ${selectedDay === day ? 'active' : ''}`} onClick={() => setSelectedDay(day)}>{day}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2><CheckCircle2 size={18} style={{verticalAlign:'-3px', marginRight:8}} /> {selectedDay} check-in</h2>
          {[
            ['protein', 'Hit protein'],
            ['carbsTimed', 'Carbs timed'],
            ['workout', 'Workout done'],
            ['water', '1 gallon water'],
            ['onPlan', 'Stayed on plan'],
          ].map(([key, label]) => (
            <div className="check" key={key}>
              <span>{label}</span>
              <input type="checkbox" checked={state.daily[selectedDay][key]} onChange={() => toggleDaily(selectedDay, key)} />
            </div>
          ))}
          <label className="label">Notes</label>
          <textarea className="textarea" value={state.daily[selectedDay].notes} onChange={e => updateDailyNotes(selectedDay, e.target.value)} placeholder="Energy, cravings, hunger, stress, or anything useful" />
        </div>
      </>}

      {tab === 'weekly' && <>
        {state.weekly.map((row, index) => (
          <div className="card" key={row.week}>
            <h2><Dumbbell size={18} style={{verticalAlign:'-3px', marginRight:8}} /> Week {row.week}</h2>
            <div className="grid2">
              <div><label className="label">Weight</label><input className="input" value={row.weight} onChange={e => updateWeekly(index, 'weight', e.target.value)} /></div>
              <div><label className="label">Waist</label><input className="input" value={row.waist} onChange={e => updateWeekly(index, 'waist', e.target.value)} /></div>
              <div><label className="label">Energy 1-10</label><input className="input" value={row.energy} onChange={e => updateWeekly(index, 'energy', e.target.value)} /></div>
              <div><label className="label">Workouts / 6</label><input className="input" value={row.workouts} onChange={e => updateWeekly(index, 'workouts', e.target.value)} /></div>
            </div>
            <div style={{marginTop:10}}>
              <label className="label">Notes</label>
              <textarea className="textarea" value={row.notes} onChange={e => updateWeekly(index, 'notes', e.target.value)} />
            </div>
          </div>
        ))}
      </>}

      {tab === 'meals' && <>
        <div className="card">
          <h2><Utensils size={18} style={{verticalAlign:'-3px', marginRight:8}} /> 7-day meal plan</h2>
          {weekDays.map(day => (
            <div className="mealDay" key={day}>
              <h3>{day}</h3>
              <p><strong>Breakfast:</strong> {mealPlan[day].breakfast}</p>
              <p><strong>Lunch:</strong> {mealPlan[day].lunch}</p>
              <p><strong>Pre-workout:</strong> {mealPlan[day].preworkout}</p>
              <p><strong>Dinner:</strong> {mealPlan[day].dinner}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2><Droplets size={18} style={{verticalAlign:'-3px', marginRight:8}} /> Daily rules</h2>
          <div className="rule">• Hit protein every day</div>
          <div className="rule">• Carbs around workout only</div>
          <div className="rule">• 1 cheat meal Saturday</div>
          <div className="rule">• 1 gallon water daily</div>
          <div className="rule">• Dinner becomes next day lunch</div>
        </div>
      </>}
    </div>
  )
}
