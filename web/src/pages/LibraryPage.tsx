import { useEffect, useState } from 'react'
import { videoApi, type Video } from '../api/endpoints'
import { VideoCard } from '../components/VideoCard'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ToastContainer'
import { Library, Search, Loader2 } from 'lucide-react'

export function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toasts, addToast, removeToast } = useToast()

  const fetchVideos = async () => {
    try {
      const res = await videoApi.list()
      setVideos(res.data.results)
    } catch (err) {
      addToast('Failed to load library', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ flex: 1, padding: '2rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>
              <Library size={24} />
              <span style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Personal Collection</span>
            </div>
            <h1>Your Library</h1>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search recordings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 className="animate-spin" size={48} color="var(--accent)" />
          </div>
        ) : filteredVideos.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {filteredVideos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onDelete={fetchVideos}
                onToast={addToast}
              />
            ))}
          </div>
        ) : (
          <div className="glass" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <Library size={48} style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>No recordings found</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {search ? "Your search didn't match any videos." : "You haven't recorded any videos yet."}
            </p>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  )
}
