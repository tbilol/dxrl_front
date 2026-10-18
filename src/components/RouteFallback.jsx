import { BlockSkeleton } from './Skeletons.jsx'

/**
 * Marshrut bo'lagi hali yuklanmagan bo'lsa ko'rsatiladigan yengil o'rin.
 *
 * Ataylab sarlavhasiz: noto'g'ri sarlavha bir zumga chaqnab ketmasin.
 * Bo'laklar App.jsx da bo'sh vaqtda oldindan yuklanadi, shuning uchun bu
 * amalda deyarli ko'rinmaydi — lekin sekin tarmoqda sahifa bo'sh qolmaydi.
 */
export default function RouteFallback() {
  return (
    <div className="w-wide">
      <main className="page">
        <BlockSkeleton height={44} />
        <div style={{ height: 'var(--s-4)' }} />
        <BlockSkeleton height={180} />
      </main>
    </div>
  )
}
