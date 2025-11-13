import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, authService } from '../../lib/supabase'

type Session = {
  id: string
  complaint: string
  symptoms: string[]
  categories: string[]
  urgency: string
  risk_score: number
  summary: string
  status: string
  created_at: string
}

export default function PatientHistory() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [severity, setSeverity] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setError(null)
      const user = await authService.getCurrentUser()
      if (!user) {
        router.push('/patient/login')
        return
      }
      const { data: patientRows, error: pErr } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
      if (pErr || !patientRows || patientRows.length === 0) {
        setLoading(false)
        setError('Profil pasien tidak ditemukan')
        return
      }
      const patientId = patientRows[0].id
      const { data, error: sErr } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      setLoading(false)
      if (sErr) {
        setError(sErr.message)
        return
      }
      setSessions((data || []) as Session[])
    })()
  }, [router])

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const okSeverity = severity ? s.urgency === severity : true
      const t = new Date(s.created_at).getTime()
      const okFrom = from ? t >= new Date(from).getTime() : true
      const okTo = to ? t <= new Date(to).getTime() : true
      return okSeverity && okFrom && okTo
    })
  }, [sessions, severity, from, to])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Riwayat Triase</h1>
          <a href="/patient/profile" className="text-blue-600">Profil</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm">Keparahan</label>
            <select value={severity} onChange={(e)=>setSeverity(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
              <option value="">Semua</option>
              <option value="Red">Red</option>
              <option value="Yellow">Yellow</option>
              <option value="Green">Green</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Dari Tanggal</label>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Sampai Tanggal</label>
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
        </div>
        {loading && <p>Memuat...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Tanggal</th>
                  <th className="text-left p-3">Keluhan</th>
                  <th className="text-left p-3">Keparahan</th>
                  <th className="text-left p-3">Ringkasan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="p-3">{s.complaint}</td>
                    <td className="p-3">
                      <span className={
                        s.urgency === 'Red' ? 'text-red-600' : s.urgency === 'Yellow' ? 'text-yellow-600' : 'text-green-600'
                      }>{s.urgency}</span>
                    </td>
                    <td className="p-3">
                      <details>
                        <summary className="cursor-pointer text-blue-600">Lihat detail</summary>
                        <div className="mt-2 text-sm">
                          <p>{s.summary}</p>
                          <p className="mt-1">Gejala: {Array.isArray(s.symptoms) ? s.symptoms.join(', ') : ''}</p>
                          <p className="mt-1">Kategori: {Array.isArray(s.categories) ? s.categories.join(', ') : ''}</p>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
