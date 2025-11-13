import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, authService } from '../../lib/supabase'

export default function PatientProfile() {
  const router = useRouter()
  const [patientId, setPatientId] = useState<string>('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [allergies, setAllergies] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setError(null)
      const user = await authService.getCurrentUser()
      if (!user) {
        router.push('/patient/login')
        return
      }
      const { data, error: pErr } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
      setLoading(false)
      if (pErr || !data || data.length === 0) {
        setError('Profil pasien tidak ditemukan')
        return
      }
      const p = data[0] as any
      setPatientId(p.id)
      setName(p.name || '')
      setGender(p.gender || '')
      setDob(p.dob || '')
      setPhone(p.phone || '')
      setMedicalHistory(p.medical_history || '')
      setAllergies(p.allergies || '')
    })()
  }, [router])

  function validate() {
    if (!name.trim()) return 'Nama wajib diisi'
    if (!['male','female'].includes(gender)) return 'Pilih jenis kelamin'
    if (!dob) return 'Tanggal lahir wajib diisi'
    if (!phone.trim()) return 'No. telepon wajib diisi'
    if (medicalHistory.length > 1000) return 'Riwayat terlalu panjang'
    if (allergies.length > 500) return 'Alergi terlalu panjang'
    return null
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    const { error: uErr } = await supabase
      .from('patients')
      .update({ name, gender, dob, phone, medical_history: medicalHistory, allergies })
      .eq('id', patientId)
    if (uErr) {
      setError(uErr.message)
      return
    }
    setSuccess('Profil berhasil disimpan')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-4">Profil Pasien</h1>
        {loading && <p>Memuat...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-sm">Nama</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">Jenis Kelamin</label>
              <select value={gender} onChange={(e)=>setGender(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                <option value="">Pilih</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Tanggal Lahir</label>
              <input type="date" value={dob} onChange={(e)=>setDob(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">No. Telepon</label>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">Riwayat Penyakit</label>
              <textarea value={medicalHistory} onChange={(e)=>setMedicalHistory(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 h-24" />
            </div>
            <div>
              <label className="block text-sm">Alergi</label>
              <textarea value={allergies} onChange={(e)=>setAllergies(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 h-20" />
            </div>
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Simpan</button>
          </form>
        )}
      </div>
    </div>
  )
}
