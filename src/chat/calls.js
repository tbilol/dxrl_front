import { useCallback, useEffect, useRef, useState } from 'react'

import log from '../logger.js'

/**
 * Qo'ng'iroqlar holati.
 *
 * TODO: Connect to WebRTC signaling server — haqiqiy P2P ulanish uchun
 * server tomonida signalizatsiya (offer / answer / ICE almashinuvi) kerak.
 * Backendda hozircha bunday endpoint (WebSocket yoki SSE) yo'q.
 *
 * Shu sababli bu modul ikki qismdan iborat:
 *   1) MAHALLIY QISM — haqiqatan ishlaydi: kamera va mikrofonni ochish
 *      (getUserMedia), o'z tasvirini ko'rsatish, mikrofon/kamerani
 *      o'chirib-yoqish, kamerani almashtirish, qo'ng'iroq taymeri.
 *   2) ULANISH QISMI — hozircha taqlid: `connect()` ichida RTCPeerConnection
 *      yaratiladi va lokal oqim qo'shiladi, lekin offer/answer yuboriladigan
 *      kanal yo'q. Namoyish uchun holat taymer bilan "javob berildi"ga
 *      o'tadi. Signalizatsiya paydo bo'lgach faqat shu funksiya o'zgaradi.
 */

/** Qo'ng'iroq bosqichlari. */
export const CALL = {
  IDLE: 'idle',
  OUTGOING: 'outgoing',
  INCOMING: 'incoming',
  ACTIVE: 'active',
  ENDED: 'ended',
}

/** Namoyish uchun: chaqiruvdan javobgacha o'tadigan vaqt. */
const DEMO_ANSWER_MS = 3200

export default function useCall() {
  const [state, setState] = useState(CALL.IDLE)
  const [kind, setKind] = useState('voice') // 'voice' | 'video'
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [facing, setFacing] = useState('user')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')

  const streamRef = useRef(null)
  const peerRef = useRef(null)
  const answerTimer = useRef(null)
  const tickTimer = useRef(null)

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    peerRef.current?.close()
    peerRef.current = null
  }, [])

  const clearTimers = useCallback(() => {
    clearTimeout(answerTimer.current)
    clearInterval(tickTimer.current)
    answerTimer.current = null
    tickTimer.current = null
  }, [])

  useEffect(() => () => {
    clearTimers()
    stopMedia()
  }, [clearTimers, stopMedia])

  /** Mikrofon (va video bo'lsa kamera) ochiladi — bu qism haqiqiy. */
  const openMedia = useCallback(async (mode, camera = 'user') => {
    const constraints = {
      audio: true,
      video: mode === 'video' ? { facingMode: camera } : false,
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    streamRef.current = stream
    return stream
  }, [])

  /**
   * Ulanish. Hozircha faqat RTCPeerConnection tayyorlanadi — signalizatsiya
   * kanali yo'qligi uchun offer hech kimga yuborilmaydi.
   */
  const connect = useCallback((stream) => {
    if (typeof RTCPeerConnection === 'undefined') return
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))
    peerRef.current = pc
    // TODO: Connect to WebRTC signaling server —
    //   const offer = await pc.createOffer()
    //   await pc.setLocalDescription(offer)
    //   signaling.send({ type: 'offer', sdp: offer, to: peerId })
  }, [])

  const startTicking = useCallback(() => {
    setSeconds(0)
    clearInterval(tickTimer.current)
    tickTimer.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }, [])

  /** Chiquvchi qo'ng'iroq. */
  const start = useCallback(
    async (mode) => {
      setError('')
      setKind(mode)
      setMuted(false)
      setCameraOff(false)
      setState(CALL.OUTGOING)

      try {
        const stream = await openMedia(mode, facing)
        connect(stream)
      } catch (err) {
        setError(err?.name === 'NotAllowedError' ? 'permission' : 'device')
        setState(CALL.OUTGOING)
        return
      }

      // Namoyish: bir necha soniyadan keyin "javob berildi".
      answerTimer.current = setTimeout(() => {
        setState(CALL.ACTIVE)
        startTicking()
      }, DEMO_ANSWER_MS)
    },
    [connect, facing, openMedia, startTicking],
  )

  /**
   * Kiruvchi qo'ng'iroqni ko'rsatish.
   *
   * TODO: Connect to WebRTC signaling server — serverdan "offer" kelganda
   * aynan shu funksiya chaqiriladi. Hozircha signalizatsiya kanali yo'q,
   * shuning uchun kiruvchi qo'ng'iroq o'z-o'zidan kelmaydi.
   */
  const ring = useCallback((mode = 'voice') => {
    setKind(mode)
    setState(CALL.INCOMING)
  }, [])

  /*
   * Debug rejimida kiruvchi qo'ng'iroq ekranini ko'rish uchun:
   *   localStorage.setItem('AGROGRAM_DEBUG', 'true')
   *   agrogramRingIncoming('video')
   * Ishlab chiqarishda bu funksiya umuman e'lon qilinmaydi.
   */
  useEffect(() => {
    if (!log.isDebug()) return undefined
    window.agrogramRingIncoming = ring
    return () => {
      delete window.agrogramRingIncoming
    }
  }, [ring])

  const accept = useCallback(async () => {
    try {
      const stream = await openMedia(kind, facing)
      connect(stream)
    } catch (err) {
      setError(err?.name === 'NotAllowedError' ? 'permission' : 'device')
      return
    }
    setState(CALL.ACTIVE)
    startTicking()
  }, [connect, facing, kind, openMedia, startTicking])

  const hangUp = useCallback(() => {
    clearTimers()
    stopMedia()
    setState(CALL.IDLE)
    setSeconds(0)
    setError('')
  }, [clearTimers, stopMedia])

  /* ------------------------- Boshqaruv tugmalari ------------------------- */

  const toggleMute = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }, [])

  const toggleCamera = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCameraOff(!track.enabled)
  }, [])

  const toggleSpeaker = useCallback(() => setSpeaker((v) => !v), [])

  /** Old/orqa kamerani almashtirish — oqim qaytadan ochiladi. */
  const flipCamera = useCallback(async () => {
    if (kind !== 'video') return
    const next = facing === 'user' ? 'environment' : 'user'
    const old = streamRef.current
    try {
      const stream = await openMedia('video', next)
      old?.getTracks().forEach((track) => track.stop())
      setFacing(next)
      setCameraOff(false)
      if (peerRef.current) {
        const sender = peerRef.current.getSenders().find((s) => s.track?.kind === 'video')
        await sender?.replaceTrack(stream.getVideoTracks()[0])
      }
    } catch {
      // Qurilmada ikkinchi kamera yo'q — eski oqim qoladi.
      streamRef.current = old
    }
  }, [facing, kind, openMedia])

  return {
    state,
    kind,
    muted,
    cameraOff,
    speaker,
    seconds,
    error,
    stream: streamRef,
    start,
    ring,
    accept,
    hangUp,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    flipCamera,
  }
}
