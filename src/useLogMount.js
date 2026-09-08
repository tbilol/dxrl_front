import { useEffect } from 'react'
import log from './logger.js'

/** Komponent ekranga chiqqanini va olib tashlanganini konsolga yozadi. */
export default function useLogMount(name, data) {
  useEffect(() => {
    log.front(`${name} mounted`, data ?? '')
    return () => log.front(`${name} unmounted`)
    // Faqat nom o'zgarsa qayta yozamiz — `data` har renderda yangi obyekt bo'lishi mumkin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])
}
