/**
 * MeetingPage — allows users to host and join video meetings using Jitsi Meet.
 */

import { useEffect, useRef, useState } from 'react'
import { Share2, ShieldCheck, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export function MeetingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<any>(null)
  
  const [roomName, setRoomName] = useState(() => {
    // Google Meet style: xxx-yyyy-zzz
    const p1 = Math.random().toString(36).substring(2, 5);
    const p2 = Math.random().toString(36).substring(2, 6);
    const p3 = Math.random().toString(36).substring(2, 5);
    return `${p1}-${p2}-${p3}`;
  })
  
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [scheduledTime, setScheduledTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    if (isInMeeting && jitsiContainerRef.current && !jitsiApiRef.current) {
      const domain = 'meet.jit.si'
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableNoAudioDetection: true,
          enableNoSpeakerDetection: true,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          disableRemoteMute: false, // Allow host to mute others
          remoteVideoMenu: {
            disableKick: false // Allow host to kick
          },
          localRecording: {
            enabled: true,
            format: 'webm'
          }
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          HIDE_DEEP_LINKING_LOGO: true,
          JITSI_WATERMARK_LINK: '',
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          DISPLAY_WELCOME_FOOTER: false,
          MOBILE_APP_PROMO: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
          APP_NAME: 'ScreenCast',
          NATIVE_APP_NAME: 'ScreenCast',
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security', 'localrecording'
          ],
          SETTINGS_SECTIONS: [ 'devices', 'language', 'moderator', 'profile', 'calendar' ],
        },
        userInfo: {
          displayName: `${user?.username || 'User'} (Host)`
        }
      }

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options)
      
      // Update page title
      document.title = `ScreenCast Meeting | ${roomName}`

      jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
        setIsInMeeting(false)
        jitsiApiRef.current = null
        document.title = 'ScreenCast'
        navigate('/')
      })

      return () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose()
          jitsiApiRef.current = null
        }
      }
    }
  }, [isInMeeting, roomName, user, navigate])

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream])

  const requestPermissions = async () => {
    try {
      setPermissionError('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      
      // Stop tracks immediately after permission is granted 
      // because Jitsi will request its own tracks
      stream.getTracks().forEach(track => track.stop())
      
      setLocalStream(null) 
    } catch (err) {
      setPermissionError('Camera/Microphone access denied. Please allow them in your browser settings.')
    }
  }

  const startMeeting = () => {
    if (!window.JitsiMeetExternalAPI) {
      alert('Jitsi Meet API not loaded. Please refresh the page.')
      return
    }
    setIsInMeeting(true)
  }

  const copyLink = () => {
    const link = `${window.location.origin}/${roomName}`
    const timeStr = scheduledTime 
      ? new Date('2000-01-01T' + scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    
    const invitation = `${roomName.replace(/-/g, ' ').toUpperCase()}
${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, ${timeStr}
.
Time zone: Asia/Kolkata
ScreenCast joining info
Video call link: ${link}`

    navigator.clipboard.writeText(invitation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToWhatsApp = () => {
    const link = `${window.location.origin}/${roomName}`
    const timeStr = scheduledTime 
      ? new Date('2000-01-01T' + scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    
    const invitation = `${roomName.replace(/-/g, ' ').toUpperCase()}
${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, ${timeStr}
.
Time zone: Asia/Kolkata
ScreenCast joining info
Video call link: ${link}`

    const encodedText = encodeURIComponent(invitation)
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  }

  if (isInMeeting) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          height: '60px', 
          background: 'rgba(255,255,255,0.05)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--primary-gradient)', borderRadius: '8px' }}></div>
            <span style={{ fontWeight: 600, color: '#fff' }}>ScreenCast Live Session</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              HOSTING
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginRight: '1rem' }}>
              Room ID: <span style={{ color: '#fff' }}>{roomName}</span>
            </div>
            <button className="btn btn-ghost" onClick={copyLink} style={{ height: '32px', fontSize: '0.8rem', padding: '0 1rem' }}>
              <Share2 size={14} /> {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button className="btn btn-danger" onClick={() => {
              if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose()
                jitsiApiRef.current = null
              }
              setIsInMeeting(false)
            }} style={{ height: '32px', fontSize: '0.8rem', padding: '0 1rem' }}>
              End Meeting
            </button>
          </div>
        </div>
        <div ref={jitsiContainerRef} style={{ flex: 1 }} />
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '3rem', width: '100%', textAlign: 'center' }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: '24px', 
          background: 'rgba(139, 92, 246, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', border: '1px solid var(--accent)'
        }}>
          <ShieldCheck size={40} color="var(--accent)" />
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Host a Meeting</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Configure your meeting room and invite participants.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Room Name</label>
            <button 
              onClick={() => setIsScheduling(!isScheduling)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              {isScheduling ? 'Cancel Schedule' : 'Schedule for later'}
            </button>
          </div>
          <input 
            className="input" 
            value={roomName} 
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 600, marginBottom: isScheduling ? '1rem' : '0' }}
          />
          
          {isScheduling && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Meeting Time
              </label>
              <input 
                type="time"
                className="input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        {permissionError && (
          <div style={{ color: 'var(--rec-red)', marginBottom: '1.5rem', fontSize: '0.9rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
            {permissionError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={async () => {
            await requestPermissions()
            if (!permissionError) startMeeting()
          }} style={{ width: '100%', height: '55px', fontSize: '1.1rem' }}>
            <ShieldCheck size={20} /> Launch Meeting
          </button>
          
          <div className="flex flex-stack" style={{ gap: '1rem' }}>
            <button 
              className="btn btn-ghost" 
              onClick={copyLink} 
              style={{ flex: 1, gap: '0.5rem', border: '1px dashed rgba(255,255,255,0.2)', width: '100%' }}
            >
              <Share2 size={16} /> {copied ? 'Invite Copied!' : 'Copy Invite'}
            </button>

            <button 
              className="btn" 
              onClick={shareToWhatsApp} 
              style={{ 
                flex: 1, gap: '0.5rem', 
                background: '#25D366', color: 'white', border: 'none',
                fontWeight: 600, width: '100%'
              }}
            >
              <MessageCircle size={18} /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
