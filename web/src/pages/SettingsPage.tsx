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
    <div className="container" style={{ padding: '3rem 0', maxWidth: '800px' }}>
      <button 
        className="btn btn-ghost" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: '2rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="logo-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <SettingsIcon size={24} />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your profile and security preferences.</p>
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Password Card */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Lock size={20} color="var(--rec-red)" />
            <h2 style={{ fontSize: '1.25rem' }}>Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Password</label>
              <input 
                type="password" 
                className="input" 
                value={pass.old}
                onChange={e => setPass({...pass, old: e.target.value})}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>New Password</label>
              <input 
                type="password" 
                className="input" 
                value={pass.new}
                onChange={e => setPass({...pass, new: e.target.value})}
                required 
                minLength={6}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input 
                type="password" 
                className="input" 
                value={pass.confirm}
                onChange={e => setPass({...pass, confirm: e.target.value})}
                required 
              />
            </div>
            <button className="btn btn-ghost" type="submit" disabled={updatingPass} style={{ marginTop: '0.5rem', borderColor: 'rgba(239,68,68,0.2)' }}>
              {updatingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="glass" style={{ marginTop: '2rem', padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Trash2 size={20} color="var(--rec-red)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--rec-red)' }}>Danger Zone</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Deleting your account will permanently remove all your recordings and data. This action cannot be undone.
          </p>
          <button 
            className="btn btn-danger" 
            onClick={() => confirm('Are you absolutely sure you want to delete your account? This will remove all your cloud recordings.')}
            style={{ borderRadius: '12px' }}
          >
            Deactivate Account
          </button>
        </div>

        <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tip: You can change your capture preferences directly in the <a href="/library" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>library</a> section.
          </p>
        </div>
      </div>
    </div>
  )
}
