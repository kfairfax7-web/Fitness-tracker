import { useEffect, useMemo, useState } from 'react'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const mealPlan = {
  Mon: {
    breakfast: '4 eggs + veggies',
    lunch: 'Chicken + rice + broccoli',
    preworkout: 'Protein shake + banana',
    dinner: 'Chicken + rice + broccoli',
  },
  Tue: {
    breakfast: '4 eggs + veggies',
    lunch: 'Chicken + rice + broccoli',
    preworkout: 'Protein + fruit',
    dinner: 'Turkey + quinoa + zucchini + carrots',
  },
  Wed: {
    breakfast: '4 eggs + veggies',
    lunch: 'Turkey + quinoa + veggies',
    preworkout: 'Protein shake + banana',
    dinner: 'Turkey + quinoa + veggies',
  },
  Thu: {
    breakfast: '4 eggs + veggies',
    lunch: 'Turkey + quinoa + veggies',
    preworkout: 'Protein + fruit',
    dinner: 'Fish + sweet potato + greens',
  },
  Fri: {
    breakfast: '4 eggs + veggies',
    lunch: 'Fish + sweet potato + greens',
    preworkout: 'Protein + fruit',
    dinner: 'Fish + sweet potato + greens',
  },
  Sat: {
    breakfast: '4 eggs + veggies',
    lunch: 'Lean beef + beans + cauliflower',
    preworkout: 'Optional',
    dinner: 'Cheat meal (1 meal only)',
  },
  Sun: {
    breakfast: '4 eggs + veggies',
    lunch: 'Protein + veggies (low carb)',
    preworkout: 'Optional',
    dinner: 'Chicken + rice + broccoli (prep for Monday)',
  },
}

const defaultDaily = () => ({
  weight: '',
  water: '',
  protein: false,
  carbsTimed: false,
  workout: false,
  onPlan: false,
  notes: '',
})

const defaultState = {
  profile: {
    currentWeight: '260',
    goalWeight: '205',
    waterGoal: '128',
    proteinGoal: '200',
    carbGoal: '150',
    fatGoal: '70',
    calorieGoal: '2300',
  },
  selectedDay: 'Mon',
  daily: {
    Mon: defaultDaily(),
    Tue: defaultDaily(),
    Wed: defaultDaily(),
    Thu: defaultDaily(),
    Fri: defaultDaily(),
    Sat: defaultDaily(),
    Sun: defaultDaily(),
  },
  weekly: Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    weight: '',
    waist: '',
    energy: '',
    workouts: '',
    notes: '',
  })),
}

const STORAGE_KEY = 'fitness-tracker-full-v2'

function App() {
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState(defaultState)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.log('Could not load saved data')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const selectedDayData = data.daily[data.selectedDay]

  const updateProfile = (key, value) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value,
      },
    }))
  }

  const updateDailyField = (day, key, value) => {
    setData((prev) => ({
      ...prev,
      daily: {
        ...prev.daily,
        [day]: {
          ...prev.daily[day],
          [key]: value,
        },
      },
    }))
  }

  const updateWeeklyField = (index, key, value) => {
    setData((prev) => {
      const next = [...prev.weekly]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, weekly: next }
    })
  }

  const compliance = useMemo(() => {
    let total = 0
    let max = 0

    days.forEach((day) => {
      const d = data.daily[day]
      total += [d.protein, d.carbsTimed, d.workout, d.onPlan].filter(Boolean).length
      max += 4
    })

    return max === 0 ? 0 : Math.round((total / max) * 100)
  }, [data.daily])

  const perfectDays = useMemo(() => {
    return days.filter((day) => {
      const d = data.daily[day]
      return d.protein && d.carbsTimed && d.workout && d.onPlan
    }).length
  }, [data.daily])

  const latestWeeklyWeight =
    [...data.weekly].reverse().find((w) => w.weight)?.weight || data.profile.currentWeight

  const poundsToGoal = Math.max(
    0,
    Number(latestWeeklyWeight || 0) - Number(data.profile.goalWeight || 0)
  )

  const resetAll = () => {
    const ok = window.confirm('Reset all tracker data?')
    if (!ok) return
    setData(defaultState)
    localStorage.removeItem(STORAGE_KEY)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fitness-tracker-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        setData(imported)
      } catch (err) {
        alert('Invalid file')
      }
    }
    reader.readAsText(file)
  }

  const styles = {
    page: {
      fontFamily: 'Arial, sans-serif',
      background: '#f3f4f6',
      minHeight: '100vh',
      padding: '16px',
      color: '#111827',
    },
    container: {
      maxWidth: '430px',
      margin: '0 auto',
    },
    hero: {
      background: '#111827',
      color: 'white',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '16px',
    },
    title: {
      margin: 0,
      fontSize: '28px',
    },
    subtitle: {
      marginTop: '8px',
      color: '#d1d5db',
      fontSize: '14px',
    },
    tabs: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginBottom: '16px',
    },
    tab: (active) => ({
      padding: '10px 6px',
      borderRadius: '14px',
      border: 'none',
      background: active ? '#111827' : 'white',
      color: active ? 'white' : '#111827',
      fontWeight: 600,
    }),
    card: {
      background: 'white',
      borderRadius: '18px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    },
    h2: {
      marginTop: 0,
      marginBottom: '12px',
      fontSize: '20px',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
    },
    stat: {
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '12px',
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
    },
    statValue: {
      fontSize: '22px',
      fontWeight: 700,
      marginTop: '4px',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: 600,
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '12px',
      border: '1px solid #d1d5db',
      marginBottom: '12px',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      minHeight: '90px',
      padding: '10px 12px',
      borderRadius: '12px',
      border: '1px solid #d1d5db',
      boxSizing: 'border-box',
    },
    dayRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginBottom: '12px',
    },
    dayButton: (active) => ({
      padding: '10px 0',
      borderRadius: '12px',
      border: '1px solid #d1d5db',
      background: active ? '#111827' : 'white',
      color: active ? 'white' : '#111827',
      fontWeight: 600,
    }),
    checklistRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '12px',
      marginBottom: '10px',
      border: '1px solid #e5e7eb',
    },
    mealBox: {
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '14px',
      marginBottom: '10px',
    },
    buttonRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
    },
    button: {
      padding: '10px 8px',
      borderRadius: '12px',
      border: 'none',
      background: '#111827',
      color: 'white',
      fontWeight: 600,
    },
    buttonSecondary: {
      padding: '10px 8px',
      borderRadius: '12px',
      border: '1px solid #d1d5db',
      background: 'white',
      color: '#111827',
      fontWeight: 600,
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.title}>Fitness Tracker 💪</h1>
          <div style={styles.subtitle}>
            8-week cut tracker • meals • habits • progress • macros
          </div>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(tab === 'dashboard')} onClick={() => setTab('dashboard')}>
            Dashboard
          </button>
          <button style={styles.tab(tab === 'daily')} onClick={() => setTab('daily')}>
            Daily
          </button>
          <button style={styles.tab(tab === 'weekly')} onClick={() => setTab('weekly')}>
            Weekly
          </button>
          <button style={styles.tab(tab === 'meals')} onClick={() => setTab('meals')}>
            Meals
          </button>
        </div>

        {tab === 'dashboard' && (
          <>
            <div style={styles.card}>
              <h2 style={styles.h2}>Overview</h2>
              <div style={styles.grid2}>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Compliance</div>
                  <div style={styles.statValue}>{compliance}%</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Perfect days</div>
                  <div style={styles.statValue}>{perfectDays}/7</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Current</div>
                  <div style={styles.statValue}>{latestWeeklyWeight}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>To goal</div>
                  <div style={styles.statValue}>{poundsToGoal} lb</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.h2}>Macro Goals</h2>
              <div style={styles.grid2}>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Protein</div>
                  <div style={styles.statValue}>{data.profile.proteinGoal}g</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Carbs</div>
                  <div style={styles.statValue}>{data.profile.carbGoal}g</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Fat</div>
                  <div style={styles.statValue}>{data.profile.fatGoal}g</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Calories</div>
                  <div style={styles.statValue}>{data.profile.calorieGoal}</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.h2}>Profile & Targets</h2>
              <label style={styles.label}>Current Weight</label>
              <input
                style={styles.input}
                value={data.profile.currentWeight}
                onChange={(e) => updateProfile('currentWeight', e.target.value)}
              />

              <label style={styles.label}>Goal Weight</label>
              <input
                style={styles.input}
                value={data.profile.goalWeight}
                onChange={(e) => updateProfile('goalWeight', e.target.value)}
              />

              <label style={styles.label}>Water Goal (oz)</label>
              <input
                style={styles.input}
                value={data.profile.waterGoal}
                onChange={(e) => updateProfile('waterGoal', e.target.value)}
              />

              <label style={styles.label}>Protein Goal (g)</label>
              <input
                style={styles.input}
                value={data.profile.proteinGoal}
                onChange={(e) => updateProfile('proteinGoal', e.target.value)}
              />

              <label style={styles.label}>Carb Goal (g)</label>
              <input
                style={styles.input}
                value={data.profile.carbGoal}
                onChange={(e) => updateProfile('carbGoal', e.target.value)}
              />

              <label style={styles.label}>Fat Goal (g)</label>
              <input
                style={styles.input}
                value={data.profile.fatGoal}
                onChange={(e) => updateProfile('fatGoal', e.target.value)}
              />

              <label style={styles.label}>Calorie Goal</label>
              <input
                style={styles.input}
                value={data.profile.calorieGoal}
                onChange={(e) => updateProfile('calorieGoal', e.target.value)}
              />
            </div>

            <div style={styles.card}>
              <h2 style={styles.h2}>Data</h2>
              <div style={styles.buttonRow}>
                <button style={styles.button} onClick={exportData}>
                  Export
                </button>
                <label style={{ ...styles.buttonSecondary, textAlign: 'center', cursor: 'pointer' }}>
                  Import
                  <input
                    type="file"
                    accept="application/json"
                    onChange={importData}
                    style={{ display: 'none' }}
                  />
                </label>
                <button style={styles.buttonSecondary} onClick={resetAll}>
                  Reset
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'daily' && (
          <div style={styles.card}>
            <h2 style={styles.h2}>Daily Check-In</h2>

            <div style={styles.dayRow}>
              {days.map((day) => (
                <button
                  key={day}
                  style={styles.dayButton(data.selectedDay === day)}
                  onClick={() => setData((prev) => ({ ...prev, selectedDay: day }))}
                >
                  {day}
                </button>
              ))}
            </div>

            <label style={styles.label}>Weight</label>
            <input
              style={styles.input}
              value={selectedDayData.weight}
              onChange={(e) => updateDailyField(data.selectedDay, 'weight', e.target.value)}
              placeholder="Enter weight"
            />

            <label style={styles.label}>Water (oz)</label>
            <input
              style={styles.input}
              value={selectedDayData.water}
              onChange={(e) => updateDailyField(data.selectedDay, 'water', e.target.value)}
              placeholder="128"
            />

            <div style={styles.checklistRow}>
              <span>Hit protein</span>
              <input
                type="checkbox"
                checked={selectedDayData.protein}
                onChange={(e) => updateDailyField(data.selectedDay, 'protein', e.target.checked)}
              />
            </div>

            <div style={styles.checklistRow}>
              <span>Carbs timed</span>
              <input
                type="checkbox"
                checked={selectedDayData.carbsTimed}
                onChange={(e) => updateDailyField(data.selectedDay, 'carbsTimed', e.target.checked)}
              />
            </div>

            <div style={styles.checklistRow}>
              <span>Workout done</span>
              <input
                type="checkbox"
                checked={selectedDayData.workout}
                onChange={(e) => updateDailyField(data.selectedDay, 'workout', e.target.checked)}
              />
            </div>

            <div style={styles.checklistRow}>
              <span>Stayed on plan</span>
              <input
                type="checkbox"
                checked={selectedDayData.onPlan}
                onChange={(e) => updateDailyField(data.selectedDay, 'onPlan', e.target.checked)}
              />
            </div>

            <label style={styles.label}>Notes</label>
            <textarea
              style={styles.textarea}
              value={selectedDayData.notes}
              onChange={(e) => updateDailyField(data.selectedDay, 'notes', e.target.value)}
              placeholder="Energy, cravings, hunger, workout notes..."
            />
          </div>
        )}
{data.weekly.map((week, index) => (
        {tab === 'weekly' && (
          <>
            {data.weekly.map((week, index) => (
              <div style={styles.card} key={week.week}>
                <h2 style={styles.h2}>Week {week.week}</h2>

                <label style={styles.label}>Weight</label>
                <input
                  style={styles.input}
                  value={week.weight}
                  onChange={(e) => updateWeeklyField(index, 'weight', e.target.value)}
                />

                <label style={styles.label}>Waist</label>
                <input
                  style={styles.input}
                  value={week.waist}
                  onChange={(e) => updateWeeklyField(index, 'waist', e.target.value)}
                />

                <label style={styles.label}>Energy (1-10)</label>
                <input
                  style={styles.input}
                  value={week.energy}
                  onChange={(e) => updateWeeklyField(index, 'energy', e.target.value)}
                />

                <label style={styles.label}>Workouts Completed</label>
                <input
                  style={styles.input}
                  value={week.workouts}
                  onChange={(e) => updateWeeklyField(index, 'workouts', e.target.value)}
                />

                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={week.notes}
                  onChange={(e) => updateWeeklyField(index, 'notes', e.target.value)}
                />
              </div>
            ))}
          </>
        )}

        {tab === 'meals' && (
          <div style={styles.card}>
            <h2 style={styles.h2}>7-Day Meal Plan</h2>

            {days.map((day) => (
              <div key={day} style={styles.mealBox}>
                <strong>{day}</strong>
                <div style={{ marginTop: '8px' }}>
                  <div><strong>Breakfast:</strong> {mealPlan[day].breakfast}</div>
                  <div><strong>Lunch:</strong> {mealPlan[day].lunch}</div>
                  <div><strong>Pre-workout:</strong> {mealPlan[day].preworkout}</div>
                  <div><strong>Dinner:</strong> {mealPlan[day].dinner}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
