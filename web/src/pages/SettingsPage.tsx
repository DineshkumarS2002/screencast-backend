import { useState } from 'react'
import { Lock, ArrowLeft, Settings as SettingsIcon, Trash2 } from 'lucide-react'
import { authApi } from '../api/endpoints'
import { useToast } from '../hooks/useToast'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { addToast } = useToast()
  const navigate = useNavigate()

  // Password state
  const [pass, setPass] = useState({
    old: '',
    new: '',
    confirm: '',
  })
  const [updatingPass, setUpdatingPass] = useState(false)


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pass.new !== pass.confirm) {
      addToast('New passwords do not match.', 'error')
      return
    }
    setUpdatingPass(true)
    try {
      await authApi.changePassword(pass.old, pass.new, pass.confirm)
      addToast('Password changed successfully!', 'success')
      setPass({ old: '', new: '', confirm: '' })
    } catch (err: any) {
      const msg = err.response?.data?.old_password?.[0] || 'Failed to change password.'
      addToast(msg, 'error')
    } finally {
      setUpdatingPass(false)
    }
  }

  return (
    <div className="container" style={{ 
      padding: '2rem 0',
      paddingTop: 'calc(2rem + env(safe-area-inset-top))',
      maxWidth: '800px' 
    }}>
      <button 
        className="btn btn-ghost" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: '2.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> Return to previous
      </button>

      <div className="settings-header flex flex-stack" style={{ alignItems: 'center', gap: '1.25rem', marginBottom: '3.5rem' }}>
        <div className="header-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="card-hover" style={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}>
              <SettingsIcon size={28} color="white" />
          </div>
          <div>
            <h1 style={{ marginBottom: '0.25rem', fontSize: '2.25rem' }}>Preferences</h1>
            <p className="header-subtitle" style={{ color: 'var(--text-secondary)' }}>Configure your security and workspace parameters.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Password Card */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="var(--accent-light)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Cryptographic Security</h2>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Current Password</label>
              <input 
                type="password" 
                className="input" 
                value={pass.old}
                onChange={e => setPass({...pass, old: e.target.value})}
                placeholder="Enter current password"
                required 
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>New Password</label>
              <input 
                type="password" 
                className="input" 
                value={pass.new}
                onChange={e => setPass({...pass, new: e.target.value})}
                placeholder="Minimum 6 characters"
                required 
                minLength={6}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Confirm New Password</label>
              <input 
                type="password" 
                className="input" 
                value={pass.confirm}
                onChange={e => setPass({...pass, confirm: e.target.value})}
                placeholder="Repeat new password"
                required 
              />
            </div>
            <button className="btn btn-primary submit-btn" type="submit" disabled={updatingPass} style={{ marginTop: '0.5rem', padding: '0.75rem 2rem', borderRadius: '12px', width: '100%' }}>
              {updatingPass ? 'Updating Security...' : 'Apply New Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="glass" style={{ padding: '2.5rem', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#fca5a5" />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fca5a5' }}>Sensitive Area</h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Deactivating your account will result in the permanent deletion of all stored recordings and metadata. This action is irreversible.
          </p>
          <button 
            className="btn btn-danger" 
            onClick={() => confirm('Are you absolutely sure you want to delete your account? This will remove all your cloud recordings.')}
            style={{ borderRadius: '12px', padding: '0.75rem 2rem' }}
          >
            Deactivate Access
          </button>
      </div>

      <div className="glass" style={{ marginTop: '2.5rem', padding: '1.5rem', textAlign: 'center', background: 'transparent', border: '1px solid var(--glass-border)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Need technical support? Contact us at <span style={{ color: 'var(--accent-light)' }}>support@screencast.ai</span>
        </p>
      </div>
      </div>
    </div>
  )
}



