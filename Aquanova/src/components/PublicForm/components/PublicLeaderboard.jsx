import { useEffect, useState } from 'react'
import { referralService } from '../../../services/referralService'

const MEDALS = ['🥇', '🥈', '🥉']

export default function PublicLeaderboard({ formId }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!formId) return
    setLoading(true)
    referralService
      .getPublicLeaderboard(formId, 10)
      .then(res => { if (res?.ok) setRows(res.data ?? []) })
      .catch(() => { /* sin auth: puede fallar, ignorar silenciosamente */ })
      .finally(() => setLoading(false))
  }, [formId])

  if (loading || rows.length === 0) return null

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-100 bg-yellow-50 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-yellow-100">
        <span className="text-lg leading-none">🏆</span>
        <h3 className="font-semibold text-yellow-900 text-sm">Top participantes</h3>
      </div>
      <ol className="divide-y divide-yellow-100">
        {rows.map(row => (
          <li key={row.user_id} className="flex items-center gap-3 px-5 py-3 hover:bg-yellow-100/50 transition-colors">
            <span className="w-7 text-center shrink-0">
              {row.position <= 3
                ? <span className="text-base leading-none">{MEDALS[row.position - 1]}</span>
                : <span className="text-sm font-bold text-yellow-700">{row.position}</span>
              }
            </span>
            <span className="flex-1 text-sm font-medium text-yellow-900 truncate">{row.name}</span>
            <span className="text-xs font-bold text-yellow-700 shrink-0">{row.total_points} pts</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
