import { CrownIcon, ShieldCheckIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'

/** Premium tarifdagi foydalanuvchining nishoni. */
export function PremiumBadge({ compact = false }) {
  const t = useT()
  return (
    <span className="badge badge-premium" title={t('plan.premium')}>
      <CrownIcon size={12} />
      {!compact && t('plan.premium')}
    </span>
  )
}

/** E-ijara orqali tasdiqlangan dehqon. */
export function VerifiedBadge({ compact = false }) {
  const t = useT()
  return (
    <span className="badge badge-verified" title={t('verify.badge')}>
      <ShieldCheckIcon size={12} />
      {!compact && t('verify.badge')}
    </span>
  )
}
