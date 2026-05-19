// Shared alert constants — no server imports, safe for client components

export const SEV_MAP = {
  critical: { label: 'CRITICO',  bg: 'bg-red-500/20 text-red-400',       border: 'border-red-500/30'     },
  high:     { label: 'ALTO',     bg: 'bg-orange-500/20 text-orange-400',  border: 'border-orange-500/30'  },
  medium:   { label: 'MEDIO',    bg: 'bg-amber-400/20 text-amber-400',    border: 'border-amber-400/30'   },
  low:      { label: 'BASSO',    bg: 'bg-white/10 text-white/50',         border: 'border-white/10'       },
}

export const TYPE_MAP: Record<string, string> = {
  security:    'Sicurezza',
  system:      'Sistema',
  data:        'Dati',
  performance: 'Performance',
}
