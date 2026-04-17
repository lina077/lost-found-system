import { useState, useEffect } from 'react'
import axios from 'axios'
import UserNavbar from '../../components/UserNavbar'
import ItemCard from '../../components/ItemCard'
import ItemDetailModal from '../../components/ItemDetailModal'
import SiteFooter from '../../components/SiteFooter'

const CATEGORIES = ['All Categories', 'Electronics', 'Books', 'Keys', 'Wallet', 'ID Card', 'Bag', 'Other']

export default function Home() {
  const [items, setItems]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('lost')
  const [selectedItem, setSelectedItem] = useState(null)

  const [heroSearch, setHeroSearch] = useState('')
  const [category, setCategory]     = useState('')
  const [location, setLocation]     = useState('')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [sort, setSort]             = useState('newest')

  const fetchItems = async (tab = activeTab, kw = heroSearch) => {
    setLoading(true)
    try {
      const params = {
        type:     'lost',
        status:   tab === 'found' ? 'Found' : 'Pending',
        keyword:  kw       || undefined,
        category: category || undefined,
        location: location || undefined,
        dateFrom: dateFrom || undefined,
        dateTo:   dateTo   || undefined,
        sort,
      }
      const res = await axios.get('http://localhost:5000/api/items', { params })
      setItems(res.data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchItems(activeTab)
  }, [activeTab, category, location, dateFrom, dateTo, sort])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    fetchItems(activeTab, heroSearch)
  }

  const clearFilters = () => {
    setCategory('')
    setLocation('')
    setDateFrom('')
    setDateTo('')
    setSort('newest')
    setHeroSearch('')
    fetchItems(activeTab, '')
  }

  return (
    <div>
      <UserNavbar />

      {/* Hero */}
      <div className="hero-section">
        <h1>Find Your Lost Belongings</h1>
        <p>Search through our database of lost and found items. Reuniting people with their valuables since 2026.</p>
        <form className="hero-search" onSubmit={handleHeroSearch}>
          <input
            type="text"
            placeholder="Search lost or found items by name, category, or location..."
            value={heroSearch}
            onChange={e => setHeroSearch(e.target.value)}
          />
          <button type="submit">🔍 Search</button>
        </form>
      </div>

      {/* Tab Toggle */}
      <div style={{ background: 'white', padding: '0 0 8px', borderBottom: '1px solid #e5e7eb' }}>
        <div className="tab-toggle">
          <button className={activeTab === 'lost'  ? 'active' : ''} onClick={() => setActiveTab('lost')}>Lost Items</button>
          <button className={activeTab === 'found' ? 'active' : ''} onClick={() => setActiveTab('found')}>Found Items</button>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '28px', paddingBottom: '40px' }}>
        <div className="row g-4">

          {/* Sidebar Filters */}
          <div className="col-lg-3">
            <div className="filters-sidebar">
              <h6>
                Filters
                <button onClick={clearFilters} style={{
                  background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px',
                  padding: '2px 10px', fontSize: '0.78rem', cursor: 'pointer', color: '#6b7280',
                }}>Clear</button>
              </h6>

              <div className="filter-label">Category</div>
              <select className="filter-input" value={category}
                onChange={e => setCategory(e.target.value === 'All Categories' ? '' : e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <div className="filter-label">Location</div>
              <input className="filter-input" placeholder="Enter location"
                value={location} onChange={e => setLocation(e.target.value)} />

              <div className="filter-label">Date Range</div>
              <input type="date" className="filter-input"
                value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <input type="date" className="filter-input"
                value={dateTo} onChange={e => setDateTo(e.target.value)} />

              <div className="filter-label">Sort By</div>
              <select className="filter-input" value={sort}
                onChange={e => setSort(e.target.value)} style={{ marginBottom: 0 }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                Loading items...
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                <p>No items found. Try different filters.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {items.map(item => (
                  <div className="col" key={item.id}>
                    <ItemCard item={item} onClick={() => setSelectedItem(item)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />

      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}