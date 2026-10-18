import { LeafIcon, PackageIcon } from '../Icons.jsx'
import { forDark, productColor } from '../../stats/products.js'
import { useTheme } from '../../theme.jsx'

/**
 * Karta muqovasi. Rasm bo'lsa — o'sha, bo'lmasa mahsulot rangidagi yumshoq
 * fon va ikonka (sinig'i chiqqan rasm belgisi ham, bo'sh joy ham emas).
 *
 * Balandlik CSS da qat'iy nisbat bilan beriladi, shuning uchun rasmli va
 * rasmsiz kartalar to'rda bir xil balandlikda turadi.
 */
export default function CoverImage({ src, product, className = '' }) {
  const { isDark } = useTheme()

  if (src) {
    return (
      <div className={`cover ${className}`}>
        <img src={src} alt="" loading="lazy" decoding="async" />
        {/* Pastdagi yumshoq qorayish — ustidagi yozuv o'qilishi uchun. */}
        <span className="cover-veil" aria-hidden="true" />
      </div>
    )
  }

  const base = productColor(product)
  const tint = isDark ? forDark(base) : base
  const Icon = product ? LeafIcon : PackageIcon

  return (
    <div
      className={`cover is-empty ${className}`}
      style={{ '--tint': tint }}
      aria-hidden="true"
    >
      <Icon size={30} />
    </div>
  )
}
