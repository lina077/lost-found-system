import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// items ENUM: 'Pending', 'Found', 'Resolved'
const STATUS_COLORS = { 'Pending': '#f59e0b', 'Found': '#3b82f6', 'Resolved': '#22c55e' }

export default function AdminDashboard() {
  const [stats, setStats]         = useState({})
  const [categories, setCategories] = useState([])
  const [activity, setActivity]   = useState([])
  const [locations, setLocations] = useState([])
  const [statusData, setStatusData] = useState([])
  const token   = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const base = 'http://localhost:5000/api/admin'
    Promise.all([
      axios.get(`${base}/stats`,            { headers }),
      axios.get(`${base}/stats/categories`, { headers }),
      axios.get(`${base}/stats/activity`,   { headers }),
      axios.get(`${base}/stats/locations`,  { headers }),
      axios.get(`${base}/stats/status`,     { headers }),
    ]).then(([s, c, a, l, st]) => {
      setStats(s.data)
      setCategories(c.data)
      setActivity(a.data.map(d => ({ ...d, date: d.date?.slice(5) })))
      setLocations(l.data)
      // DB returns exact ENUM: 'Pending', 'Found', 'Resolved'
      setStatusData(st.data.map(d => ({ name: d.status, value: Number(d.count) })))
    }).catch(err => console.error('Dashboard error:', err))
  }, [])

  const statCards = [
    { label: 'Pending Lost Items', value: stats.pendingLostItems, icon: '🔍', color: 'blue'   },
    { label: 'Found Items',        value: stats.foundItems,        icon: '✅', color: 'green'  },
    { label: 'Pending Claims',     value: stats.pendingClaims,     icon: '📋', color: 'yellow' },
    { label: 'Total Users',        value: stats.totalUsers,        icon: '👥', color: 'purple' },
    { label: 'Total Items',        value: stats.totalItems,        icon: '📦', color: 'gray'   },
    { label: 'Resolved',           value: stats.resolvedItems,     icon: '🏆', color: 'green'  },
  ]

  const noData = (h) => (
    <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
      No data yet
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>Dashboard Overview</h4>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
          Welcome to the Lost &amp; Found Admin Panel.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map(s => (
          <div className="col-md-4 col-sm-6" key={s.label}>
            <div className="stat-card">
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value ?? '—'}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="chart-card">
            <h6>Reports by Category</h6>
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categories} dataKey="count" nameKey="category"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={v => <span style={{ fontSize: '0.8rem' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : noData(260)}
          </div>
        </div>

        <div className="col-md-6">
          <div className="chart-card">
            <h6>Activity (by month)</h6>
            {activity.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : noData(260)}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="chart-card">
            <h6>Top 4 Locations Reported</h6>
            {locations.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={locations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="location" type="category" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : noData(220)}
          </div>
        </div>

        <div className="col-md-6">
          <div className="chart-card">
            <h6>Status Distribution</h6>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : noData(220)}
          </div>
        </div>
      </div>
    </div>
  )
}