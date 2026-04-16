import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const STATUS_COLORS = { 'Pending': '#f59e0b', 'Found': '#3b82f6', 'Resolved': '#22c55e' }

export default function AdminReports() {
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
      setStatusData(st.data.map(d => ({ name: d.status, value: Number(d.count) })))
    }).catch(() => {})
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>📊 Reports & Analytics</h4>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>System-wide statistics and visual reports</p>
      </div>

      {/* Summary Row */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Items',    value: stats.totalItems,        color: '#dbeafe' },
          { label: 'Lost Items',     value: stats.lostItems,         color: '#fee2e2' },
          { label: 'Found Items',    value: stats.foundItems,        color: '#d1fae5' },
          { label: 'Resolved',       value: stats.resolvedItems,     color: '#e0e7ff' },
          { label: 'Pending Claims', value: stats.pendingClaims,     color: '#fef3c7' },
          { label: 'Total Users',    value: stats.totalUsers,        color: '#f3f4f6' },
        ].map(s => (
          <div className="col-md-2 col-sm-4" key={s.label}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '16px',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderTop: `4px solid ${s.color}`,
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{s.value ?? '—'}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="chart-card">
            <h6>Reports by Category</h6>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categories} dataKey="count" nameKey="category"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend formatter={v => <span style={{ fontSize: '0.8rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-6">
          <div className="chart-card">
            <h6>Activity (by month)</h6>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="chart-card">
            <h6>Top Locations Reported</h6>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={locations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="location" type="category" tick={{ fontSize: 10 }} width={130} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-6">
          <div className="chart-card">
            <h6>Status Distribution</h6>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={85} paddingAngle={2}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}