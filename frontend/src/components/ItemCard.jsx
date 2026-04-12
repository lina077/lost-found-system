import { useNavigate } from 'react-router-dom'

export const getImgSrc = (photo) => {
  if (!photo) return null
  if (photo.startsWith('images/')) return `/${photo}`
  return `http://localhost:5000/uploads/${photo}`
}

// Matches DB ENUM: 'Pending', 'Found', 'Resolved'
export const getStatusInfo = (status) => {
  const s = (status || '').toLowerCase().trim()
  if (s === 'pending') return { label: 'Pending',  cls: 'badge-pending'  }
  if (s === 'found')   return { label: 'Found',    cls: 'badge-claimed'  }
  if (s === 'resolved') return { label: 'Resolved', cls: 'badge-resolved' }
  return { label: 'Pending', cls: 'badge-pending' }
}

export default function ItemCard({ item, onClick }) {
  const navigate = useNavigate()
  const { label: statusLabel, cls: statusClass } = getStatusInfo(item.status)
  const imgSrc = getImgSrc(item.photo)

  const handleClick = () => {
    if (onClick) onClick(item)
    else navigate(`/user/item/${item.id}`)
  }

  return (
    <div className="item-card">
      {imgSrc
        ? <img src={imgSrc} alt={item.title} className="card-img" />
        : <div className="card-img-placeholder">📦</div>
      }
      <div className="card-body">
        <h5>{item.title}</h5>
        <span className={`badge-status ${statusClass}`}>{statusLabel}</span>
        <div className="card-meta"><span>📍</span> {item.location}</div>
        <div className="card-meta">
          <span>📅</span>
          {item.date_occurred
            ? new Date(item.date_occurred).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A'}
        </div>
        <button className="btn-view-details" onClick={handleClick} style={{ marginTop: '12px' }}>
          View Details
        </button>
      </div>
    </div>
  )
}