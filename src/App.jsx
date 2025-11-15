import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl shadow p-5 border border-gray-100">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">{title}</h2>
      {children}
    </div>
  )
}

export default function App() {
  const [athletes, setAthletes] = useState([])
  const [exercises, setExercises] = useState([])
  const [formAthlete, setFormAthlete] = useState({ name: '', email: '', primary_sport: '' })
  const [formExercise, setFormExercise] = useState({ name: '', sport: '', points_count: 4, focus: '' })
  const [plan, setPlan] = useState({ athlete_id: '', sport: '', goals: '' })
  const [suggestions, setSuggestions] = useState([])

  const fetchAthletes = async () => {
    const res = await fetch(`${API_BASE}/athletes`)
    const data = await res.json()
    setAthletes(data)
  }

  const fetchExercises = async () => {
    const res = await fetch(`${API_BASE}/exercises`)
    const data = await res.json()
    setExercises(data)
  }

  useEffect(() => {
    fetchAthletes()
    fetchExercises()
  }, [])

  const createAthlete = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/athletes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formAthlete) })
    if (res.ok) {
      setFormAthlete({ name: '', email: '', primary_sport: '' })
      fetchAthletes()
    }
  }

  const createExercise = async (e) => {
    e.preventDefault()
    const payload = { ...formExercise, focus: formExercise.focus ? formExercise.focus.split(',').map(s => s.trim()) : [] }
    const res = await fetch(`${API_BASE}/exercises`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setFormExercise({ name: '', sport: '', points_count: 4, focus: '' })
      fetchExercises()
    }
  }

  const createPlan = async (e) => {
    e.preventDefault()
    const goals = plan.goals ? plan.goals.split(',').map(s => s.trim()) : []
    const res = await fetch(`${API_BASE}/plans`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ athlete_id: plan.athlete_id, sport: plan.sport, goals }) })
    const data = await res.json()
    setSuggestions(data.exercise_suggestions || [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Athlete Speed & Agility Coach</h1>
          <p className="text-gray-600 mt-2">Create athletes, design laser-point agility drills, record attempts, and get smart exercise suggestions from your goals.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Add Athlete">
            <form onSubmit={createAthlete} className="space-y-3">
              <input value={formAthlete.name} onChange={e=>setFormAthlete(a=>({...a, name:e.target.value}))} placeholder="Name" className="w-full border rounded px-3 py-2" required />
              <input value={formAthlete.email} onChange={e=>setFormAthlete(a=>({...a, email:e.target.value}))} placeholder="Email" className="w-full border rounded px-3 py-2" />
              <input value={formAthlete.primary_sport} onChange={e=>setFormAthlete(a=>({...a, primary_sport:e.target.value}))} placeholder="Primary sport (e.g., football, tennis)" className="w-full border rounded px-3 py-2" />
              <button className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700">Save Athlete</button>
            </form>
          </Section>

          <Section title="Add Exercise">
            <form onSubmit={createExercise} className="space-y-3">
              <input value={formExercise.name} onChange={e=>setFormExercise(s=>({...s, name:e.target.value}))} placeholder="Exercise name" className="w-full border rounded px-3 py-2" required />
              <input value={formExercise.sport} onChange={e=>setFormExercise(s=>({...s, sport:e.target.value}))} placeholder="Sport" className="w-full border rounded px-3 py-2" required />
              <input type="number" value={formExercise.points_count} onChange={e=>setFormExercise(s=>({...s, points_count:parseInt(e.target.value||'0')}))} placeholder="# of laser points" className="w-full border rounded px-3 py-2" />
              <input value={formExercise.focus} onChange={e=>setFormExercise(s=>({...s, focus:e.target.value}))} placeholder="Focus tags (comma separated: speed, agility, reaction)" className="w-full border rounded px-3 py-2" />
              <button className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700">Save Exercise</button>
            </form>
          </Section>
        </div>

        <Section title="Plan Suggestions from Goals">
          <form onSubmit={createPlan} className="grid md:grid-cols-4 gap-3 items-end">
            <select value={plan.athlete_id} onChange={e=>setPlan(p=>({...p, athlete_id:e.target.value}))} className="border rounded px-3 py-2">
              <option value="">Select athlete</option>
              {athletes.map(a=> <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
            <input value={plan.sport} onChange={e=>setPlan(p=>({...p, sport:e.target.value}))} placeholder="Sport" className="border rounded px-3 py-2" />
            <input value={plan.goals} onChange={e=>setPlan(p=>({...p, goals:e.target.value}))} placeholder="Goals (comma separated)" className="border rounded px-3 py-2" />
            <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Get Suggestions</button>
          </form>
          {suggestions.length>0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Suggested Drills</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
        </Section>

        <Section title="Current Athletes">
          <ul className="divide-y">
            {athletes.map(a => (
              <li key={a._id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">{a.name}</div>
                  <div className="text-sm text-gray-500">{a.primary_sport || '—'}</div>
                </div>
                <span className="text-xs text-gray-500">id: {a._id}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Current Exercises">
          <div className="grid md:grid-cols-2 gap-3">
            {exercises.map(ex => (
              <div key={ex._id} className="p-3 border rounded-lg bg-white/50">
                <div className="font-medium text-gray-800">{ex.name}</div>
                <div className="text-sm text-gray-500">{ex.sport} • points: {ex.points_count}</div>
                <div className="text-xs text-gray-500">focus: {(ex.focus||[]).join(', ') || '—'}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
