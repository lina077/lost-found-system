import { useState, useEffect } from 'react'
import axios from 'axios'
import UserNavbar from '../../components/UserNavbar'
import ItemCard from '../../components/ItemCard'
import ItemDetailModal from '../../components/ItemDetailModal'
import SiteFooter from '../../components/SiteFooter'

const CATEGORIES = ['All Categories', 'Electronics', 'Books', 'Clothing', 'Keys', 'Wallet', 'ID Card', 'Bag', 'Mobile Phone', 'Watches', 'Other']

function ItemsPage({ type }) {
  const [items, setItems]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [category, setCategory]         = useState('')
  const [location, setLocation]         = useState('')
  const [sort, setSort]                 = useState('newest')
  const [search, setSearch]             = useState('')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {
        keyword:  search   || undefined,
        category: category || undefined,
        location: location || undefined,
        sort,
      }

      if (type === 'lost') {
        // Lost Items page: type=lost, status=Pending only
        params.type   = 'lost'
        params.status = 'Pending'
      } else {
        // Found Items page: type=lost items that have status=Found
        params.type   = 'lost'
        params.status = 'Found'
      }

      const res = await axios.get('http://localhost:5000/api/items', { params })
      setItems(res.data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [type, category, location, sort])

  return (
    <div>
      <UserNavbar />
      <div style={{ background: 'var(--primary)', padding: '32px 0 24px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>
          {type === 'lost' ? '🔍 Lost Items' : '✅ Found Items'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          {type === 'lost'
            ? 'Browse all pending lost items reported in our system'
            : 'Browse all items that have been found'}
        </p>
      </div>

      <div className="container" style={{ paddingTop: '28px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            className="form-control-custom" style={{ flex: 1, minWidth: '200px' }}
            placeholder="Search by name, description..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchItems()}
          />
          <select className="form-control-custom" style={{ width: '180px' }}
            value={category}
            onChange={e => setCategory(e.target.value === 'All Categories' ? '' : e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="form-control-custom" style={{ width: '160px' }}
            placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <select className="form-control-custom" style={{ width: '150px' }}
            value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <button className="btn-primary-custom" onClick={fetchItems}>Search</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            No {type} items found.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-xl-4 g-4">
            {items.map(item => (
              <div className="col" key={item.id}>
                <ItemCard item={item} onClick={() => setSelectedItem(item)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
      {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}

export function LostItems()  { return <ItemsPage type="lost"  /> }
export function FoundItems() { return <ItemsPage type="found" /> }