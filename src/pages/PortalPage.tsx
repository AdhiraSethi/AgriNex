import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Activity, ArrowRight, Boxes, ChartNoAxesCombined,
  Check, CircleDollarSign, FilePlus2, FileText, Fingerprint,
  Leaf, MapPin, Package, Plus, RefreshCw, Search, ShieldCheck, Sprout,
  Truck, Users, Wallet, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { EmptyState, LoadingSpinner, PageHeader, StatusBadge } from '../components/UI'
import ThemeToggle from '../components/ThemeToggle'

type DataRow = Record<string, unknown>
type Field = {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  options?: string[]
  step?: string
  placeholder?: string
}
type DialogKind = 'listing' | 'kyc' | 'procurement' | 'bid' | 'inspection' | 'escrow' | 'shipment'

const cropOptions = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Other']

const pageDefinitions: Record<string, { title: string; subtitle: string; endpoint: string; columns?: string[] }> = {
  'farmer:listings': { title: 'Crop listings', subtitle: 'Manage your available produce and asking prices.', endpoint: '/farmer/listings', columns: ['crop_name', 'variety', 'grade', 'quantity_kg', 'available_qty_kg', 'price_per_kg', 'status', 'created_at'] },
  'farmer:invitations': { title: 'Pool invitations', subtitle: 'Review buyer matches and choose whether to join each pool.', endpoint: '/farmer/pool-invitations', columns: ['procurement', 'quantity_allocated_kg', 'price_per_kg', 'total_value', 'ai_score', 'consent_status'] },
  'farmer:payments': { title: 'Payments', subtitle: 'Track settled and pending farmer payments.', endpoint: '/farmer/payments', columns: ['pool_id', 'quantity_kg', 'price_per_kg', 'amount', 'status', 'transaction_ref', 'paid_at'] },
  'farmer:kyc': { title: 'KYC verification', subtitle: 'Verify your identity to unlock crop listings.', endpoint: '/auth/me' },
  'buyer:procurement': { title: 'Procurement requests', subtitle: 'Set crop, grade, volume, price ceiling, and delivery destination.', endpoint: '/buyer/procurement', columns: ['crop_name', 'grade', 'required_qty_kg', 'max_price_per_kg', 'delivery_location', 'pool_count', 'status', 'created_at'] },
  'buyer:pools': { title: 'Crop pools', subtitle: 'Review AI matches, farmer consent, and pooled quantities.', endpoint: '/buyer/pools', columns: ['id', 'procurement', 'total_quantity_kg', 'num_farmers', 'ai_match_score', 'status', 'created_at'] },
  'buyer:orders': { title: 'Order tracking', subtitle: 'Follow every confirmed order from transport to inspection and settlement.', endpoint: '/buyer/orders', columns: ['pool_id', 'crop_name', 'quantity_kg', 'pool_status', 'shipment_status', 'inspection_result', 'escrow_status', 'delivery_location'] },
  'transporter:jobs': { title: 'Available transport jobs', subtitle: 'Review open delivery jobs and submit a sealed bid.', endpoint: '/transporter/jobs', columns: ['crop_type', 'weight_kg', 'pickup_location', 'delivery_location', 'total_bids', 'auction_deadline', 'auction_status'] },
  'transporter:auctions': { title: 'Transport auctions', subtitle: 'View open and closed auctions and manage your sealed offers.', endpoint: '/transporter/auctions', columns: ['crop_type', 'weight_kg', 'pickup_location', 'delivery_location', 'total_bids', 'my_bid_amount', 'auction_deadline', 'auction_status'] },
  'transporter:my-bids': { title: 'My bids', subtitle: 'Track bid outcomes and awarded transport contracts.', endpoint: '/transporter/my-bids', columns: ['job_id', 'crop_type', 'weight_kg', 'pickup_location', 'delivery_location', 'bid_amount', 'is_winner', 'auction_status'] },
  'transporter:shipments': { title: 'My shipments', subtitle: 'Update pickup, transit, and delivery milestones.', endpoint: '/transporter/shipments', columns: ['shipment_id', 'crop_type', 'weight_kg', 'pickup_location', 'delivery_location', 'status', 'qr_code'] },
  'admin:users': { title: 'User verification', subtitle: 'Review farmer KYC status and platform accounts.', endpoint: '/admin/users', columns: ['name', 'email', 'phone', 'role', 'kyc_status', 'is_active', 'created_at'] },
  'admin:pools': { title: 'Crop pools', subtitle: 'Monitor match quality, farmer consent, and delivery readiness.', endpoint: '/admin/pools', columns: ['id', 'crop_name', 'buyer_name', 'total_quantity_kg', 'num_farmers', 'accepted_farmers', 'status', 'escrow_status'] },
  'admin:auctions': { title: 'Transport auctions', subtitle: 'Review sealed bids and award each job to its lowest bidder.', endpoint: '/admin/auctions', columns: ['job_id', 'crop_type', 'weight_kg', 'pickup_location', 'delivery_location', 'auction_status', 'lowest_bid'] },
  'admin:shipments': { title: 'Shipment tracking', subtitle: 'Inspect QR manifests and delivery progress across the network.', endpoint: '/admin/shipments', columns: ['shipment_id', 'crop_type', 'weight_kg', 'transporter_name', 'pickup_location', 'delivery_location', 'status', 'inspection_result'] },
  'admin:inspections': { title: 'Quality inspections', subtitle: 'Record arrival condition, grade, moisture, and compliance.', endpoint: '/admin/inspections', columns: ['shipment_id', 'crop_type', 'grade_result', 'moisture_percent', 'weight_received_kg', 'compliance_passed', 'result', 'inspected_at'] },
  'admin:escrow': { title: 'Escrow & payments', subtitle: 'Release, partially release, dispute, or refund held funds.', endpoint: '/admin/escrow', columns: ['pool_id', 'crop_name', 'buyer_name', 'total_amount', 'released_amount', 'held_amount', 'status', 'inspection_result'] },
  'admin:analytics': { title: 'Platform analytics', subtitle: 'A live view of supply, transactions, and platform activity.', endpoint: '/admin/analytics' },
}

const forms: Record<DialogKind, Field[]> = {
  listing: [
    { name: 'crop_name', label: 'Crop', type: 'select', options: cropOptions, required: true },
    { name: 'variety', label: 'Variety', placeholder: 'Optional variety' },
    { name: 'grade', label: 'Grade', type: 'select', options: ['A', 'B', 'C'], required: true },
    { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number', step: '0.1', required: true },
    { name: 'price_per_kg', label: 'Price per kg (₹)', type: 'number', step: '0.01', required: true },
    { name: 'harvest_date', label: 'Harvest date', type: 'date' },
    { name: 'location', label: 'Village / location' },
    { name: 'district', label: 'District' },
    { name: 'state', label: 'State' },
    { name: 'description', label: 'Notes', type: 'textarea' },
  ],
  kyc: [
    { name: 'aadhaar_number', label: 'Aadhaar number', placeholder: '12 digits', required: true },
    { name: 'bank_account', label: 'Bank account number' },
    { name: 'ifsc_code', label: 'IFSC code' },
    { name: 'farm_size_acres', label: 'Farm size (acres)', type: 'number', step: '0.1' },
  ],
  procurement: [
    { name: 'crop_name', label: 'Crop', type: 'select', options: cropOptions, required: true },
    { name: 'grade', label: 'Minimum grade', type: 'select', options: ['A', 'B', 'C'], required: true },
    { name: 'required_qty_kg', label: 'Required quantity (kg)', type: 'number', step: '0.1', required: true },
    { name: 'max_price_per_kg', label: 'Maximum price per kg (₹)', type: 'number', step: '0.01', required: true },
    { name: 'delivery_location', label: 'Delivery location', required: true },
    { name: 'delivery_district', label: 'Delivery district' },
    { name: 'delivery_state', label: 'Delivery state' },
    { name: 'required_by', label: 'Required by', type: 'date' },
    { name: 'description', label: 'Additional requirements', type: 'textarea' },
  ],
  bid: [
    { name: 'bid_amount', label: 'Sealed bid amount (₹)', type: 'number', step: '0.01', required: true },
    { name: 'vehicle_type', label: 'Vehicle type', placeholder: 'e.g. Refrigerated truck' },
    { name: 'capacity_kg', label: 'Vehicle capacity (kg)', type: 'number', step: '1' },
    { name: 'notes', label: 'Notes for the buyer', type: 'textarea' },
  ],
  inspection: [
    { name: 'shipment_id', label: 'Shipment ID', type: 'number', step: '1', required: true },
    { name: 'grade_result', label: 'Inspected grade', type: 'select', options: ['A', 'B', 'C', 'Rejected'], required: true },
    { name: 'moisture_percent', label: 'Moisture (%)', type: 'number', step: '0.1', required: true },
    { name: 'weight_received_kg', label: 'Received weight (kg)', type: 'number', step: '0.1', required: true },
    { name: 'result', label: 'Inspection result', type: 'select', options: ['passed', 'partial', 'failed'], required: true },
    { name: 'compliance_passed', label: 'Compliance passed', type: 'checkbox' },
    { name: 'quality_notes', label: 'Quality notes', type: 'textarea' },
  ],
  escrow: [
    { name: 'action', label: 'Resolution', type: 'select', options: ['release', 'partial', 'dispute', 'refund'], required: true },
    { name: 'released_amount', label: 'Partial release amount (₹)', type: 'number', step: '0.01' },
    { name: 'dispute_reason', label: 'Dispute reason', type: 'textarea' },
  ],
  shipment: [
    { name: 'status', label: 'New shipment status', type: 'select', options: ['pickup', 'in_transit', 'delivered'], required: true },
    { name: 'notes', label: 'Delivery notes', type: 'textarea' },
  ],
}

const roleIcons = { farmer: Sprout, buyer: Boxes, transporter: Truck, admin: ShieldCheck }

function prettify(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function displayValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') {
    const record = value as DataRow
    if (key === 'procurement') return `${record.crop_name ?? 'Crop'} · ${record.grade ?? ''}`
    return Object.entries(record).map(([field, item]) => `${prettify(field)}: ${String(item)}`).join(' · ')
  }
  if (key.includes('amount') || key.includes('price') || key.includes('value')) {
    const number = Number(value)
    return Number.isFinite(number) ? `₹${number.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : String(value)
  }
  if (key.includes('quantity') || key.endsWith('_kg') || key === 'weight_kg') return `${Number(value).toLocaleString('en-IN')} kg`
  if (key.includes('score') && typeof value === 'number') return `${Math.round(value)}%`
  if (key.endsWith('_at') || key.endsWith('_date') || key === 'auction_deadline') {
    const date = new Date(String(value))
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return String(value)
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response
    if (response?.data?.detail) return response.data.detail
  }
  return 'The request could not be completed. Check your connection and try again.'
}

export default function PortalPage() {
  const location = useLocation()
  const { user, token, setAuth } = useAuthStore()
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialog, setDialog] = useState<{ kind: DialogKind; row?: DataRow } | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const role = user?.role ?? 'farmer'
  const pageKey = location.pathname.replace(/\/$/, '').split('/')[2] || 'dashboard'
  const definition = pageDefinitions[`${role}:${pageKey}`]
  const isDashboard = pageKey === 'dashboard'
  const endpoint = isDashboard ? `/${role}/dashboard` : definition?.endpoint
  const PageIcon = roleIcons[role as keyof typeof roleIcons] || Leaf

  useEffect(() => {
    if (!endpoint) {
      setLoading(false)
      setData(null)
      return
    }
    let active = true
    setLoading(true)
    setError('')
    api.get(endpoint).then((response) => {
      if (active) setData(response.data)
    }).catch((requestError: unknown) => {
      if (active) setError(getErrorMessage(requestError))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [endpoint, refreshKey])

  const openDialog = (kind: DialogKind, row?: DataRow) => {
    const values: Record<string, string | boolean> = {}
    for (const field of forms[kind]) {
      values[field.name] = field.type === 'checkbox' ? false : field.type === 'select' ? field.options?.[0] ?? '' : ''
    }
    if (kind === 'inspection' && row?.shipment_id) values.shipment_id = String(row.shipment_id)
    if (kind === 'shipment') {
      const currentStatus = String(row?.status ?? '')
      values.status = currentStatus === 'pending' ? 'pickup' : currentStatus === 'pickup' ? 'in_transit' : 'delivered'
    }
    setFormValues(values)
    setDialog({ kind, row })
  }

  const performAction = async (path: string, method: 'post' | 'put' = 'post', body?: unknown) => {
    try {
      await api[method](path, body)
      if (dialog?.kind === 'kyc' && user && token) setAuth({ ...user, kyc_status: 'verified' }, token)
      toast.success('Updated successfully')
      setDialog(null)
      setRefreshKey((key) => key + 1)
    } catch (actionError) {
      toast.error(getErrorMessage(actionError))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!dialog) return
    setSaving(true)
    const values = { ...formValues }
    for (const field of forms[dialog.kind]) {
      if (field.type === 'number' && values[field.name] !== '') values[field.name] = Number(values[field.name]) as unknown as string
    }
    let path = ''
    let method: 'post' | 'put' = 'post'
    let body: DataRow = values as DataRow
    const row = dialog.row ?? {}

    if (dialog.kind === 'listing') path = '/farmer/listings'
    if (dialog.kind === 'kyc') path = '/auth/kyc/demo'
    if (dialog.kind === 'procurement') path = '/buyer/procurement'
    if (dialog.kind === 'bid') path = `/transporter/auctions/${row.job_id ?? row.id}/bid`
    if (dialog.kind === 'inspection') {
      path = '/admin/inspections'
      body = { ...values, shipment_id: Number(values.shipment_id), moisture_percent: Number(values.moisture_percent), weight_received_kg: Number(values.weight_received_kg), compliance_passed: Boolean(values.compliance_passed) }
    }
    if (dialog.kind === 'escrow') {
      path = `/admin/escrow/${row.escrow_id}/action`
      body = { action: values.action }
      if (values.released_amount) body.released_amount = Number(values.released_amount)
      if (values.dispute_reason) body.dispute_reason = values.dispute_reason
    }
    if (dialog.kind === 'shipment') {
      path = `/transporter/shipments/${row.shipment_id}/update`
      method = 'put'
    }
    await performAction(path, method, body)
    setSaving(false)
  }

  const handleRowAction = async (action: 'match' | 'confirm' | 'accept' | 'reject' | 'verify' | 'award', row: DataRow) => {
    let path = ''
    let body: unknown
    if (action === 'match') path = `/buyer/procurement/${row.id}/match`
    if (action === 'confirm') path = `/buyer/pools/${row.id}/confirm`
    if (action === 'accept' || action === 'reject') {
      path = `/farmer/pool-invitations/${row.pool_member_id}/respond?accept=${action === 'accept'}`
      body = null
    }
    if (action === 'verify' || action === 'reject') {
      if (role === 'admin') {
        path = `/admin/users/${row.id}/verify?approve=${action === 'verify'}`
        body = null
      }
    }
    if (action === 'award') path = `/admin/auctions/${row.job_id}/award`
    if (!path) return
    await performAction(path, 'post', body)
  }

  const rows = useMemo(() => {
    let values: DataRow[] = []
    if (Array.isArray(data)) values = data as DataRow[]
    if (role === 'farmer' && pageKey === 'payments' && data && !Array.isArray(data)) values = (data as DataRow).payments as DataRow[] ?? []
    if (search.trim()) {
      const needle = search.toLowerCase()
      values = values.filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    }
    return values
  }, [data, pageKey, role, search])

  const pageSubtitle = definition?.subtitle ?? 'Your marketplace activity, next steps, and account health in one place.'

  if (loading) return <div className="page-content"><LoadingSpinner text="Loading your workspace..." /></div>

  if (isDashboard && data && typeof data === 'object') {
    const dashboard = data as DataRow
    const stats = (dashboard.stats ?? {}) as DataRow
    const statEntries = Object.entries(stats)
    const recentKey = ['recent_listings', 'recent_requests', 'recent_pools'].find((key) => Array.isArray(dashboard[key]))
    const recentRows = recentKey ? dashboard[recentKey] as DataRow[] : []
    const kycStatus = dashboard.kyc_status
    return (
      <div className="page-content page-enter">
        <PageHeader title={`Good day, ${user?.name?.split(' ')[0] ?? 'there'}`} subtitle={pageSubtitle} actions={
          <><ThemeToggle /><button type="button" title="Refresh dashboard" onClick={() => setRefreshKey((key) => key + 1)} className="icon-button"><RefreshCw size={17} /></button></>
        } />
        {role === 'farmer' && kycStatus !== 'verified' && (
          <div className="mb-6 flex flex-col gap-3 border-l-4 border-amber-400 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold text-amber-950">Verify your account to list crops</p><p className="mt-1 text-sm text-amber-800">Your current KYC status is {String(kycStatus ?? 'pending')}.</p></div>
            <Link to="/farmer/kyc" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap">Complete KYC <ArrowRight size={16} /></Link>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statEntries.map(([key, value], index) => {
            const icons = [ChartNoAxesCombined, Package, Users, Wallet]
            const Icon = icons[index % icons.length]
            const amount = key.includes('earnings') || key.includes('spent') || key.includes('escrow')
            return <div key={key} className="portal-stat" style={{ animationDelay: `${index * 45}ms` }}>
              <span className="portal-stat-icon"><Icon size={18} /></span>
              <span className="portal-stat-label">{prettify(key)}</span>
              <strong>{amount ? `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : Number(value).toLocaleString('en-IN')}</strong>
            </div>
          })}
        </div>
        {role === 'buyer' && <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <QuickLink to="/buyer/procurement" icon={FilePlus2} title="Create procurement" description="Post a new crop requirement and start matching." />
          <QuickLink to="/buyer/pools" icon={Boxes} title="Review crop pools" description="Check farmer consent and confirm a ready pool." />
        </div>}
        {role === 'farmer' && <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <QuickLink to="/farmer/listings" icon={Sprout} title="Manage crop listings" description="Add available produce and update your asking price." />
          <QuickLink to="/farmer/invitations" icon={Users} title="Pool invitations" description="Respond to buyers looking for your crop." />
        </div>}
        {role === 'transporter' && <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <QuickLink to="/transporter/jobs" icon={Truck} title="Browse transport jobs" description="Find open routes and submit a sealed bid." />
          <QuickLink to="/transporter/shipments" icon={MapPin} title="Update shipments" description="Record pickup, transit, and delivery progress." />
        </div>}
        {role === 'admin' && <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <QuickLink to="/admin/users" icon={Fingerprint} title="Review farmer KYC" description="Verify accounts so farmers can list produce." />
          <QuickLink to="/admin/escrow" icon={Wallet} title="Manage escrow" description="Review inspection outcomes and settle funds." />
        </div>}
        {recentRows.length > 0 && <section className="portal-section mt-7">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="section-title mb-0">Recent activity</h2><p className="mt-1 text-sm text-gray-500">Latest changes in your account.</p></div><Link to={`/${role}/${role === 'farmer' ? 'listings' : role === 'buyer' ? 'procurement' : role === 'transporter' ? 'my-bids' : 'pools'}`} className="text-sm font-semibold text-agri-700 hover:text-agri-900">View all <ArrowRight className="ml-1 inline" size={14} /></Link></div>
          <DataTable rows={recentRows} columns={Object.keys(recentRows[0]).filter((key) => !key.endsWith('_at')).slice(0, 5)} />
        </section>}
      </div>
    )
  }

  if (isDashboard && !data) return <div className="page-content page-enter">
    <PageHeader title={`Good day, ${user?.name?.split(' ')[0] ?? 'there'}`} subtitle={pageSubtitle} actions={<><ThemeToggle /><button type="button" title="Retry loading dashboard" onClick={() => setRefreshKey((key) => key + 1)} className="icon-button"><RefreshCw size={17} /></button></>} />
    <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p className="font-semibold">Dashboard data is unavailable</p><p className="mt-1">{error || 'The API did not return dashboard data.'}</p><p className="mt-2">Check that the AgriNex API is running, then retry.</p></div>
  </div>

  if (!definition) return <div className="page-content"><EmptyState icon={PageIcon} title="Page not found" description="Choose a section from the portal navigation." /></div>

  return (
    <div className="page-content page-enter">
      <PageHeader title={definition.title} subtitle={definition.subtitle} actions={
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {['listings', 'procurement', 'kyc', 'inspections'].includes(pageKey) && <button type="button" onClick={() => openDialog(pageKey === 'listings' ? 'listing' : pageKey === 'procurement' ? 'procurement' : pageKey === 'kyc' ? 'kyc' : 'inspection')} className="btn-primary inline-flex items-center gap-2"><Plus size={16} />{pageKey === 'listings' ? 'Add crop' : pageKey === 'procurement' ? 'New request' : pageKey === 'kyc' ? 'Verify identity' : 'Record inspection'}</button>}
          <button type="button" title="Refresh" onClick={() => setRefreshKey((key) => key + 1)} className="icon-button"><RefreshCw size={17} /></button>
        </div>
      } />

      {error && <div className="mb-5 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800"><Activity size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Couldn’t load this section</p><p className="mt-1">{error}</p><p className="mt-2 text-red-700">Make sure the AgriNex API is running at {api.defaults.baseURL}.</p></div></div>}

      {pageKey === 'kyc' && data !== null && typeof data === 'object' && <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-gray-200 bg-white p-5">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Verification status</p><div className="mt-2"><StatusBadge status={String((data as DataRow).kyc_status ?? 'pending')} /></div></div>
        <div className="max-w-xl text-sm leading-6 text-gray-600">Identity verification is required before creating crop listings. The current service uses the backend’s demo verification flow.</div>
        {(data as DataRow).kyc_status !== 'verified' && <button type="button" onClick={() => openDialog('kyc')} className="btn-primary inline-flex items-center gap-2"><Fingerprint size={16} />Verify identity</button>}
      </div>}

      {pageKey === 'analytics' && data !== null && typeof data === 'object' && <AnalyticsPanel data={data as DataRow} />}

      {pageKey !== 'analytics' && role === 'farmer' && pageKey === 'payments' && data !== null && typeof data === 'object' && !Array.isArray(data) && <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {Object.entries(((data as DataRow).summary ?? {}) as DataRow).map(([key, value]) => <div key={key} className="portal-stat"><span className="portal-stat-icon"><CircleDollarSign size={18} /></span><span className="portal-stat-label">{prettify(key)}</span><strong>{key.includes('paid') || key.includes('pending') ? `₹${Number(value).toLocaleString('en-IN')}` : String(value)}</strong></div>)}
      </div>}

      {pageKey !== 'analytics' && pageKey !== 'kyc' && <section className="portal-section">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="section-title mb-0">{definition.title}</h2><p className="mt-1 text-sm text-gray-500">{rows.length} {rows.length === 1 ? 'record' : 'records'}</p></div>
          <label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" aria-label="Search records" /></label>
        </div>
        {rows.length === 0 ? <EmptyState icon={PageIcon} title={error ? 'Data unavailable' : 'Nothing here yet'} description={error ? 'Check the API connection and refresh.' : emptyCopy(role, pageKey)} /> : <DataTable rows={rows} columns={definition.columns ?? Object.keys(rows[0])} renderActions={(row) => renderRowActions(role, pageKey, row, handleRowAction, openDialog)} />}
      </section>}

      {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button type="button" className="absolute inset-0 bg-slate-950/45" onClick={() => setDialog(null)} aria-label="Close dialog" />
        <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-gray-200 bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-agri-700">AgriNex workspace</p><h2 id="dialog-title" className="mt-1 text-lg font-bold text-gray-900">{dialogTitles[dialog.kind]}</h2></div><button type="button" className="icon-button" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="p-5">
            {dialog.kind === 'bid' && <p className="mb-4 border-l-2 border-orange-400 bg-orange-50 p-3 text-sm text-orange-900">Your offer stays sealed. Other transporters cannot see your bid amount.</p>}
            {dialog.kind === 'kyc' && <p className="mb-4 border-l-2 border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">Demo verification only. Use a valid 12-digit number; identity data should not be used for production testing.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {forms[dialog.kind].map((field) => <FieldControl key={field.name} field={field} value={formValues[field.name] ?? ''} onChange={(value) => setFormValues((current) => ({ ...current, [field.name]: value }))} />)}
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={() => setDialog(null)} className="btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">{saving ? 'Saving…' : <><Check size={16} />Save changes</>}</button></div>
          </form>
        </section>
      </div>}
    </div>
  )
}

const dialogTitles: Record<DialogKind, string> = {
  listing: 'Add a crop listing', kyc: 'Verify your identity', procurement: 'Create procurement request',
  bid: 'Submit sealed transport bid', inspection: 'Record quality inspection', escrow: 'Resolve escrow', shipment: 'Update shipment status',
}

function FieldControl({ field, value, onChange }: { field: Field; value: string | boolean; onChange: (value: string | boolean) => void }) {
  const id = `field-${field.name}`
  if (field.type === 'checkbox') return <label htmlFor={id} className="flex items-center gap-3 rounded border border-gray-200 p-3 text-sm font-medium text-gray-700"><input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-green-700" />{field.label}</label>
  return <label htmlFor={id} className={`block ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}><span className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}{field.required && <span className="ml-1 text-red-600">*</span>}</span>
    {field.type === 'textarea' ? <textarea id={id} value={String(value)} onChange={(event) => onChange(event.target.value)} required={field.required} rows={3} className="input-field resize-y" /> : field.type === 'select' ? <select id={id} value={String(value)} onChange={(event) => onChange(event.target.value)} required={field.required} className="input-field">{field.options?.map((option) => <option key={option} value={option}>{prettify(option)}</option>)}</select> : <input id={id} type={field.type ?? 'text'} step={field.step} value={String(value)} onChange={(event) => onChange(event.target.value)} required={field.required} placeholder={field.placeholder} className="input-field" />}
  </label>
}

function DataTable({ rows, columns, renderActions }: { rows: DataRow[]; columns: string[]; renderActions?: (row: DataRow) => React.ReactNode }) {
  return <div className="overflow-x-auto border border-gray-200"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-gray-50"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{prettify(column)}</th>)}{renderActions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>}</tr></thead><tbody className="divide-y divide-gray-100 bg-white">{rows.map((row, index) => <tr key={String(row.id ?? row.job_id ?? row.pool_id ?? row.shipment_id ?? row.pool_member_id ?? index)} className="hover:bg-green-50/40">{columns.map((column) => <td key={column} className="max-w-[240px] px-4 py-3 align-middle text-gray-700">{column.includes('status') || column === 'result' ? <StatusBadge status={String(row[column] ?? 'unknown')} /> : <span className="block truncate" title={displayValue(row[column], column)}>{displayValue(row[column], column)}</span>}</td>)}{renderActions && <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2">{renderActions(row)}</div></td>}</tr>)}</tbody></table></div>
}

function renderRowActions(role: string, pageKey: string, row: DataRow, handleAction: (action: 'match' | 'confirm' | 'accept' | 'reject' | 'verify' | 'award', row: DataRow) => void, openDialog: (kind: DialogKind, row?: DataRow) => void) {
  const actionButton = (label: string, action: 'match' | 'confirm' | 'accept' | 'reject' | 'verify' | 'award', tone = 'green') => <button key={action} type="button" onClick={() => handleAction(action, row)} className={`table-action ${tone === 'red' ? 'table-action-red' : ''}`}>{label}</button>
  if (role === 'farmer' && pageKey === 'invitations' && row.consent_status === 'pending') return <>{actionButton('Accept', 'accept')}{actionButton('Decline', 'reject', 'red')}</>
  if (role === 'buyer' && pageKey === 'procurement' && ['open', 'matching'].includes(String(row.status))) return actionButton('Run AI match', 'match')
  if (role === 'buyer' && pageKey === 'pools' && ['forming', 'consent_pending'].includes(String(row.status))) return actionButton('Confirm pool', 'confirm')
  if (role === 'transporter' && ['jobs', 'auctions'].includes(pageKey) && row.auction_status === 'open') return <button type="button" onClick={() => openDialog('bid', row)} className="table-action">{row.already_bid || row.my_bid_amount ? 'Update bid' : 'Place bid'}</button>
  if (role === 'transporter' && pageKey === 'shipments' && ['pending', 'pickup', 'in_transit'].includes(String(row.status))) return <button type="button" onClick={() => openDialog('shipment', row)} className="table-action">Update status</button>
  if (role === 'admin' && pageKey === 'users' && row.role === 'farmer' && row.kyc_status === 'pending') return <>{actionButton('Verify', 'verify')}{actionButton('Reject', 'reject', 'red')}</>
  if (role === 'admin' && pageKey === 'auctions' && row.auction_status !== 'awarded' && Array.isArray(row.bids) && row.bids.length > 0) return actionButton('Award lowest bid', 'award')
  if (role === 'admin' && pageKey === 'escrow' && !['released', 'refunded'].includes(String(row.status))) return <button type="button" onClick={() => openDialog('escrow', row)} className="table-action">Resolve</button>
  return null
}

function QuickLink({ to, icon: Icon, title, description }: { to: string; icon: typeof FileText; title: string; description: string }) {
  return <Link to={to} className="quick-link"><span className="quick-link-icon"><Icon size={19} /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-gray-900">{title}</span><span className="mt-1 block text-sm leading-5 text-gray-500">{description}</span></span><ArrowRight size={17} className="shrink-0 text-gray-400" /></Link>
}

function AnalyticsPanel({ data }: { data: DataRow }) {
  const financial = (data.financial ?? {}) as DataRow
  const users = (data.user_stats ?? {}) as DataRow
  const transactions = (data.transaction_stats ?? {}) as DataRow
  const cropRows = Array.isArray(data.crop_distribution) ? data.crop_distribution as DataRow[] : []
  const poolRows = Array.isArray(data.pool_status_distribution) ? data.pool_status_distribution as DataRow[] : []
  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Object.entries({ ...financial, ...users, ...transactions }).map(([key, value]) => <div key={key} className="portal-stat"><span className="portal-stat-icon"><ChartNoAxesCombined size={18} /></span><span className="portal-stat-label">{prettify(key)}</span><strong>{key.includes('amount') || key.includes('value') || key.includes('escrow') || key.includes('farmers') === false && key.includes('paid') ? `₹${Number(value).toLocaleString('en-IN')}` : Number(value).toLocaleString('en-IN')}</strong></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-2"><section className="portal-section"><h2 className="section-title">Crop distribution</h2>{cropRows.length ? <DataTable rows={cropRows} columns={['crop', 'count', 'total_kg']} /> : <EmptyState icon={Sprout} title="No crop listings yet" />}</section><section className="portal-section"><h2 className="section-title">Pool status</h2>{poolRows.length ? <DataTable rows={poolRows} columns={['status', 'count']} /> : <EmptyState icon={Boxes} title="No pools yet" />}</section></div>
  </div>
}

function emptyCopy(role: string, pageKey: string) {
  if (pageKey === 'listings') return 'Add your first crop listing to make your produce discoverable.'
  if (pageKey === 'procurement') return 'Create a procurement request to start matching with farmers.'
  if (pageKey === 'jobs' || pageKey === 'auctions') return 'No open transport opportunities are available right now.'
  if (pageKey === 'invitations') return 'New buyer pool invitations will appear here.'
  if (pageKey === 'pools') return role === 'buyer' ? 'Run AI matching on a procurement request to form a crop pool.' : 'Crop pools will appear here as requests are matched.'
  return 'Records will appear here as your marketplace activity grows.'
}