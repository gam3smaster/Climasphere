import { useState } from 'react'
import { Check } from 'lucide-react'
import { Pencil } from 'lucide-react'
import { X } from 'lucide-react'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '../store/uiStore'
import { useLocationStore } from '../store/locationStore'
import { GlassCard } from '../components/ui/GlassCard'

const AVATARS = ['bear', 'cat', 'dog', 'panda', 'rabbit']

export default function Settings() {
  const userName = useUiStore(s => s.userName)
  const userAvatar = useUiStore(s => s.userAvatar)
  const setUserProfile = useUiStore(s => s.setUserProfile)
  const goToLocationStep = useUiStore(s => s.goToLocationStep)

  const active = useLocationStore(s => s.active)
  const clearActive = useLocationStore(s => s.clearActive)

  const navigate = useNavigate()

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(userName ?? '')
  const [selectedAvatar, setSelectedAvatar] = useState(userAvatar ?? 'bear')

  function handleSaveProfile() {
    if (!nameInput.trim()) return
    setUserProfile(nameInput.trim(), selectedAvatar)
    setEditingName(false)
  }

  function handleCancelEdit() {
    setNameInput(userName ?? '')
    setSelectedAvatar(userAvatar ?? 'bear')
    setEditingName(false)
  }

  function handleChangeLocation() {
    clearActive()
    goToLocationStep()
    navigate('/')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-6 tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        Settings
      </h1>

      {/* grids on desktop and mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">

        {/* Profile card */}
        <GlassCard className="p-5">
          <p className="text-xs font-data mb-4"
            style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}
          >
            PROFILE
          </p>

          <div className="flex items-center gap-4 mb-5">
            <img src={`/avatars/${editingName ? selectedAvatar : (userAvatar ?? 'bear')}.png`}
              alt={selectedAvatar}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid var(--border-default)' }}
            />
            <div>
              {editingName ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pick an avatar</p>
              ) : (
                <>
                  <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                    {userName ?? 'Guest'}
                  </p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
                    {userAvatar ?? '—'}
                  </p>
                </>
              )}
            </div>
          </div>

          {editingName && (
            <div className="flex gap-2 mb-4">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setSelectedAvatar(a)}
                  className="relative rounded-full transition-transform hover:scale-110"
                  style={{
                    outline: selectedAvatar === a ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  <img src={`/avatars/${a}.png`} alt={a} className="w-11 h-11 rounded-full object-cover" />
                  {selectedAvatar === a && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--accent-primary)' }}
                    >
                      <Check size={9} color="#000" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {editingName ? (
            <div className="space-y-3">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
                placeholder="Your name"
                maxLength={24}
                autoFocus
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--accent-primary)', color: '#000' }}
                >
                  <Check size={13} strokeWidth={2.5} /> Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: 'var(--accent-primary)' }}
            >
              <Pencil size={13} /> Edit name & avatar
            </button>
          )}
        </GlassCard>

        {/* Location card */}
        <GlassCard className="p-5">
          <p className="text-xs font-data mb-3"
            style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}
          >
            LOCATION
          </p>

          {active ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {active.name}
                  </p>
                  {active.subtitle && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {active.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleChangeLocation}
                className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No location set</p>
          )}
        </GlassCard>

        {/* About card — spans full width */}
        <GlassCard className="p-5 lg:col-span-2">
          <p className="text-xs font-data mb-3"
            style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}
          >
            ABOUT
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>App</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>ClimaSphere</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Version</span>
              <span className="text-sm font-data" style={{ color: 'var(--text-secondary)' }}>1.0.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Weather data</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Open-Meteo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>AI</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>OpenAI v1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Radar</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>RainViewer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>CREATED BY</span>
              <span className="text-sm" style={{ color: 'var(--accent-primary)' }}>
              <a href="https://github.com/gam3smaster" target="_blank">Abdulrahman</a></span>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  )
}