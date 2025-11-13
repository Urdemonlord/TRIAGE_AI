import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, authService } from '../../../lib/supabase'

type Session = {
  id: string
  patient_id: string
  complaint: string
  urgency: string
  summary: string
  status: string
  created_at: string
}

const interactions: Record<string, string[]> = {
  aspirin: ['warfarin'],
  ibuprofen: ['warfarin'],
  amoxicillin: [],
}

export default function DoctorSession() {
  const router = useRouter()
  const { id } = router.query
  const [session, setSession] = useState<Session | null>(null)
  const [note, setNote] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [rxPatient, setRxPatient] = useState('')
  const [rxDrug, setRxDrug] = useState('')
  const [rxDose, setRxDose] = useState('')
  const [rxInstr, setRxInstr] = useState('')
  const [signature, setSignature] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      setError(null)
      const user = await authService.getCurrentUser()
      if (!user) {
        setError('Harus login sebagai dokter')
        return
      }
      setUserId(user.id)
      if (!id || typeof id !== 'string') return
      const { data, error: sErr } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('id', id)
        .limit(1)
      if (sErr || !data || data.length === 0) {
        setError('Sesi tidak ditemukan')
        return
      }
      const s = data[0] as any
      setSession({
        id: s.id,
        patient_id: s.patient_id,
        complaint: s.complaint,
        urgency: s.urgency,
        summary: s.summary,
        status: s.status,
        created_at: s.created_at,
      })
      setRxPatient(s.patient_name || '')
    })()
  }, [id])

  const interactionWarning = useMemo(() => {
    const drug = rxDrug.toLowerCase().trim()
    const list = interactions[drug] || []
    if (!drug || list.length === 0) return ''
    return `Interaksi obat: hindari kombinasi dengan ${list.join(', ')}`
  }, [rxDrug])

  async function saveNote(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    if (!note.trim()) {
      setError('Catatan wajib diisi')
      return
    }
    const { error: nErr } = await supabase.from('triage_notes').insert({
      id: crypto.randomUUID(),
      session_id: session.id,
      doctor_id: userId,
      note,
      decision: diagnosis || null,
      created_at: new Date().toISOString(),
    })
    if (nErr) {
      setError(nErr.message)
      return
    }
    await supabase.from('triage_sessions').update({ status: 'completed' }).eq('id', session.id)
    setSuccess('Catatan disimpan')
  }

  async function savePrescription(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!session) return
    if (!rxPatient.trim() || !rxDrug.trim() || !rxDose.trim() || !rxInstr.trim() || !signature.trim()) {
      setError('Lengkapi data resep dan tanda tangan')
      return
    }
    const after = {
      session_id: session.id,
      patient_name: rxPatient,
      drug: rxDrug,
      dose: rxDose,
      instructions: rxInstr,
      signature,
      created_at: new Date().toISOString(),
    }
    const { error: aErr } = await supabase.from('audit_logs').insert({
      id: crypto.randomUUID(),
      actor_id: userId,
      entity: 'prescription',
      action: 'create',
      before: null,
      after,
      created_at: new Date().toISOString(),
    })
    if (aErr) {
      setError(aErr.message)
      return
    }
    setSuccess('Resep elektronik tersimpan')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-4">Sesi Dokter</h1>
        {session ? (
          <div>
            <p className="text-sm mb-2">Waktu: {new Date(session.created_at).toLocaleString()}</p>
            <p className="mb-2">Keluhan: {session.complaint}</p>
            <p className="mb-2">Urgensi: {session.urgency}</p>
            <p className="mb-4">Ringkasan: {session.summary}</p>
            <form onSubmit={saveNote} className="space-y-3 mb-6">
              <h2 className="text-lg font-semibold">Catatan Dokter</h2>
              <input value={diagnosis} onChange={(e)=>setDiagnosis(e.target.value)} placeholder="Diagnosis override (opsional)" className="w-full border rounded px-3 py-2" />
              <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Catatan" className="w-full border rounded px-3 py-2 h-24" />
              <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Simpan Catatan</button>
            </form>
            <form onSubmit={savePrescription} className="space-y-3">
              <h2 className="text-lg font-semibold">Resep Elektronik</h2>
              <input value={rxPatient} onChange={(e)=>setRxPatient(e.target.value)} placeholder="Nama Pasien" className="w-full border rounded px-3 py-2" />
              <input value={rxDrug} onChange={(e)=>setRxDrug(e.target.value)} placeholder="Nama Obat" className="w-full border rounded px-3 py-2" />
              {interactionWarning && <p className="text-yellow-700 text-sm">{interactionWarning}</p>}
              <input value={rxDose} onChange={(e)=>setRxDose(e.target.value)} placeholder="Dosis" className="w-full border rounded px-3 py-2" />
              <textarea value={rxInstr} onChange={(e)=>setRxInstr(e.target.value)} placeholder="Instruksi" className="w-full border rounded px-3 py-2 h-20" />
              <input value={signature} onChange={(e)=>setSignature(e.target.value)} placeholder="Tanda tangan digital (ketik nama lengkap)" className="w-full border rounded px-3 py-2" />
              <button type="submit" className="bg-green-600 text-white rounded px-4 py-2">Terbitkan Resep</button>
            </form>
            {(error || success) && (
              <p className={error ? 'text-red-600 mt-3' : 'text-green-600 mt-3'}>{error || success}</p>
            )}
          </div>
        ) : (
          <p>Memuat...</p>
        )}
      </div>
    </div>
  )
}
