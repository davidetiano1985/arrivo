'use client'

import { useState, useTransition } from 'react'

import { aggiornaDatiLocale } from './actions'

type RestaurantData = {
  id: string
  name: string
  tipo: string | null
  city: string | null
  address: string | null
  phone: string | null
  email: string | null
}

type Field = { label: string; value: string }

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase text-white/35">
        {label}{required && ' *'}
      </label>
      <input
        autoFocus={autoFocus}
        className="h-10 w-full rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#ff6b00] transition"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        required={required}
        type={type}
        value={value}
      />
    </div>
  )
}

export default function RistoranteEditForm({ restaurant }: { restaurant: RestaurantData }) {
  const [editing, setEditing] = useState(false)
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Display state — updated locally after a successful save (no router.refresh needed)
  const [current, setCurrent] = useState<RestaurantData>(restaurant)

  // Form state
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [citta, setCitta] = useState('')
  const [indirizzo, setIndirizzo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  function openEdit() {
    setNome(current.name)
    setTipo(current.tipo ?? '')
    setCitta(current.city ?? '')
    setIndirizzo(current.address ?? '')
    setTelefono(current.phone ?? '')
    setEmail(current.email ?? '')
    setMsg(null)
    setEditing(true)
  }

  function handleSalva() {
    setMsg(null)
    startTransition(async () => {
      try {
        const res = await aggiornaDatiLocale(current.id, { nome, tipo, citta, indirizzo, telefono, email })
        if (res.error) {
          setMsg({ text: res.error })
        } else {
          setCurrent({
            ...current,
            name: nome.trim(),
            tipo: tipo.trim() || null,
            city: citta.trim(),
            address: indirizzo.trim() || null,
            phone: telefono.trim() || null,
            email: email.trim() || null,
          })
          setMsg({ ok: true, text: 'Dati aggiornati con successo.' })
          setEditing(false)
        }
      } catch {
        setMsg({ text: 'Errore imprevisto. Riprova.' })
      }
    })
  }

  const displayFields: Field[] = [
    { label: 'Nome',      value: current.name },
    { label: 'Tipo',      value: current.tipo || '—' },
    { label: 'Città',     value: current.city || '—' },
    { label: 'Email',     value: current.email || '—' },
    { label: 'Telefono',  value: current.phone || '—' },
    { label: 'Indirizzo', value: current.address || '—' },
  ]

  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-6 py-4">
        <p className="text-xs font-black uppercase text-white/35">Dati del locale</p>
        {!editing && (
          <button
            className="shrink-0 rounded-full bg-white/8 px-4 py-1.5 text-xs font-black text-white/60 transition hover:bg-white/14 hover:text-white"
            onClick={openEdit}
            type="button"
          >
            Modifica
          </button>
        )}
      </div>

      {!editing ? (
        /* ── Read view ── */
        <>
          {displayFields.map(({ label, value }) => (
            <div className="flex items-center gap-4 border-b border-white/6 px-6 py-4 last:border-0" key={label}>
              <span className="w-24 shrink-0 text-xs font-black uppercase text-white/30">{label}</span>
              <span className="break-all text-sm font-bold text-white/80">{value}</span>
            </div>
          ))}
          {msg?.ok && (
            <div className="px-6 pb-5">
              <p className="text-xs font-bold text-emerald-400">{msg.text}</p>
            </div>
          )}
        </>
      ) : (
        /* ── Edit form ── */
        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              autoFocus
              label="Nome"
              onChange={setNome}
              placeholder="Nome del locale"
              required
              value={nome}
            />
            <InputField
              label="Tipo"
              onChange={setTipo}
              placeholder="Es. Ristorante, Bar, Pizzeria"
              value={tipo}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Città"
              onChange={setCitta}
              placeholder="Città"
              required
              value={citta}
            />
            <InputField
              label="Indirizzo"
              onChange={setIndirizzo}
              placeholder="Via e numero civico"
              value={indirizzo}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Telefono"
              onChange={setTelefono}
              placeholder="+39 000 000 0000"
              type="tel"
              value={telefono}
            />
            <InputField
              label="Email"
              onChange={setEmail}
              placeholder="email@locale.it"
              type="email"
              value={email}
            />
          </div>

          {msg && !msg.ok && (
            <p className="text-xs font-bold text-red-400">{msg.text}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              className="rounded-xl bg-[#ff6b00] px-6 py-2 text-xs font-black text-white transition hover:bg-[#e55f00] disabled:opacity-50"
              disabled={isPending}
              onClick={handleSalva}
              type="button"
            >
              {isPending ? 'Salvo…' : 'Salva modifiche'}
            </button>
            <button
              className="rounded-xl bg-white/8 px-5 py-2 text-xs font-black text-white/60 transition hover:bg-white/14 hover:text-white"
              disabled={isPending}
              onClick={() => { setEditing(false); setMsg(null) }}
              type="button"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
