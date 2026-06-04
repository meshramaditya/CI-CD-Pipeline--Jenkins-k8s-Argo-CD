import {useEffect, useMemo, useState} from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/Layout'

const MENU = [
  {id: 1, name: 'French Vanilla Fantasy', category: 'Coffee', price: 12.83},
  {id: 2, name: 'Almond Amore', category: 'Coffee', price: 9.55},
  {id: 3, name: 'Cinnamon Swirl', category: 'Latte', price: 14.4},
  {id: 4, name: 'Raspberry Ripple', category: 'Special', price: 18.2},
  {id: 5, name: 'Tiramisu Temptation', category: 'Coffee', price: 6.2},
  {id: 6, name: 'White Chocolate Wonder', category: 'Latte', price: 15.4},
  {id: 7, name: 'Dark Roast Dynamic', category: 'Coffee', price: 12},
  {id: 8, name: 'Irish Cream Illusion', category: 'Special', price: 9.8},
  {id: 9, name: 'Pumpkin Spice Perfection', category: 'Seasonal', price: 22},
  {id: 10, name: 'Caribbean Caramel', category: 'Coffee', price: 20.5},
  {id: 11, name: 'Ethiopian Emerald', category: 'Single Origin', price: 22.25},
  {id: 12, name: 'Decaf Delight', category: 'Coffee', price: 12}
]

const CUP_OPTIONS = ['Small (Hot)', 'Medium (Ice)', 'Large (Ice)']
const SUGAR_OPTIONS = ['Less Sugar', 'Normal Sugar']
const TOPPING_OPTIONS = [
  {name: 'Pearl Boba', price: 2},
  {name: 'Coconut Jelly', price: 3},
  {name: 'Coffee Jelly', price: 4},
  {name: 'Espresso', price: 5}
]

function money(value){
  return `$${Number(value).toFixed(2)}`
}

function makeSeedOrders(){
  const base = [
    ['BC-10230', 'makr-thru', 'Arina Manson', 'completed', 4],
    ['BC-10231', 'Drive-thru', 'Aric Asuncion', 'In-Progress', 12],
    ['BC-10232', 'Curb-side', 'Niki Holmes', 'Pending', 25.39],
    ['BC-10233', 'Delivery', 'Jennie Swain', 'Scheduled', 50.05],
    ['BC-10234', 'Pickup', 'Julia Franco', 'Dispatched', 32.7],
    ['BC-10235', 'Dine-in', 'Kevin Lee', 'Completed', 18.2],
  ]
  return base.map((row, idx) => ({
    id: row[0],
    type: row[1],
    customer: row[2],
    status: row[3],
    total: row[4],
    placed: new Date(Date.now() - (idx + 1) * 3600000).toLocaleString(),
    updated: new Date(Date.now() - idx * 1800000).toLocaleString()
  }))
}

function readStorage(key, fallback){
  if(typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  if(!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value){
  if(typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export default function Dashboard(){
  const router = useRouter()
  const [tab, setTab] = useState('pos')
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [modalItem, setModalItem] = useState(null)
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    if(typeof window !== 'undefined' && localStorage.getItem('bluecube_auth') !== '1'){
      router.push('/')
      return
    }
    setOrders(readStorage('bluecube_orders', makeSeedOrders()))
    setTransactions(readStorage('bluecube_transactions', []))
    if(router.query.tab){
      setTab(String(router.query.tab))
    }
  }, [router])

  useEffect(() => {
    writeStorage('bluecube_orders', orders)
  }, [orders])

  useEffect(() => {
    writeStorage('bluecube_transactions', transactions)
  }, [transactions])

  function openAddOrder(item){
    setModalItem(item)
    setDraft({
      qty: 1,
      cup: CUP_OPTIONS[0],
      sugar: SUGAR_OPTIONS[0],
      toppings: ['Pearl Boba']
    })
  }

  function toggleTopping(name){
    setDraft(prev => {
      const has = prev.toppings.includes(name)
      return {
        ...prev,
        toppings: has ? prev.toppings.filter(t => t !== name) : [...prev.toppings, name]
      }
    })
  }

  const modalTotal = useMemo(() => {
    if(!modalItem || !draft) return 0
    const toppingTotal = draft.toppings.reduce((sum, toppingName) => {
      const found = TOPPING_OPTIONS.find(t => t.name === toppingName)
      return sum + (found ? found.price : 0)
    }, 0)
    return (modalItem.price + toppingTotal) * draft.qty
  }, [modalItem, draft])

  function addConfiguredItem(){
    if(!modalItem || !draft) return
    const item = {
      lineId: Date.now(),
      productId: modalItem.id,
      name: modalItem.name,
      basePrice: modalItem.price,
      qty: draft.qty,
      cup: draft.cup,
      sugar: draft.sugar,
      toppings: draft.toppings,
      finalPrice: modalTotal
    }
    setCart(prev => [item, ...prev])
    setModalItem(null)
    setDraft(null)
  }

  function removeCartLine(lineId){
    setCart(prev => prev.filter(line => line.lineId !== lineId))
  }

  const cartSubtotal = useMemo(() => cart.reduce((sum, line) => sum + line.finalPrice, 0), [cart])
  const cartTax = Number((cartSubtotal * 0.05).toFixed(2))
  const cartTotal = Number((cartSubtotal + cartTax).toFixed(2))

  function payNow(){
    if(cart.length === 0){
      alert('Add order items first')
      return
    }

    const orderId = `BC-${Math.floor(10000 + Math.random() * 89999)}`
    const timestamp = new Date().toISOString()

    const newOrder = {
      id: orderId,
      type: 'Dine-in',
      customer: `Walk-in ${Math.floor(Math.random() * 90 + 10)}`,
      status: 'In-Progress',
      total: cartTotal,
      placed: new Date(timestamp).toLocaleString(),
      updated: new Date(timestamp).toLocaleString()
    }

    const newTx = {
      id: Date.now(),
      orderId,
      date: timestamp,
      method: 'Card',
      amount: cartTotal,
      tax: cartTax,
      itemCount: cart.length,
      lines: cart
    }

    setOrders(prev => [newOrder, ...prev])
    setTransactions(prev => [newTx, ...prev])
    setCart([])
    setTab('billing')
    alert(`Payment success for ${orderId}`)
  }

  const filteredMenu = useMemo(() => {
    const term = search.trim().toLowerCase()
    if(!term) return MENU
    return MENU.filter(item => item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term))
  }, [search])

  const statClosedOrders = orders.length
  const statSales = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const statAvgTicket = transactions.length ? statSales / transactions.length : 0

  return (
    <Layout>
      <section className="dashboard-wrap">
        <header className="dash-top hero-card card">
          <div className="hero-copy">
            <div className="eyebrow">Live operations</div>
            <h2>Blue Cube Administrative Dashboard</h2>
            <p className="small-muted">Daily cafe operations, order flow, billing performance, and transaction tracking in one polished workspace.</p>
            <div className="hero-pills">
              <span className="hero-pill">{orders.length} active orders</span>
              <span className="hero-pill">{transactions.length} transactions</span>
              <span className="hero-pill hero-pill-accent">{money(statSales)} sales</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setTab('pos')}>+ New Order</button>
        </header>

        <div className="stats-grid">
          <StatCard title="Closed Orders" value={statClosedOrders} sub="Last 30 days" trend="+36%" />
          <StatCard title="Sales" value={money(statSales)} sub="Last 30 days" trend="+4%" />
          <StatCard title="Avg Order Ticket" value={money(statAvgTicket)} sub="Last 30 days" trend="+12%" />
          <StatCard title="Avg Sales Per Shift" value={money(statSales / Math.max(1, 30))} sub="Last 30 days" trend="+8%" />
        </div>

        <div className="tab-header tab-shell">
          <button onClick={() => setTab('pos')} className={`tab-btn ${tab === 'pos' ? 'active' : ''}`}>POS</button>
          <button onClick={() => setTab('orders')} className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}>Orders</button>
          <button onClick={() => setTab('billing')} className={`tab-btn ${tab === 'billing' ? 'active' : ''}`}>Billing</button>
          <button onClick={() => setTab('transactions')} className={`tab-btn ${tab === 'transactions' ? 'active' : ''}`}>Transactions</button>
          <button onClick={() => setTab('analytics')} className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`}>Analytics</button>
        </div>

        {tab === 'pos' && (
          <section className="pos-grid">
            <div className="menu-panel card section-card">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">Build order</div>
                  <h3>Menu</h3>
                </div>
                <input
                  className="input"
                  placeholder="Search menu or category"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="menu-grid modern">
                {filteredMenu.map(item => (
                  <button key={item.id} className="menu-tile" onClick={() => openAddOrder(item)}>
                    <div className="cup-art" />
                    <div className="tile-name">{item.name}</div>
                    <div className="small-muted">{item.category}</div>
                    <div className="tile-price">{money(item.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="billing-panel card section-card">
              <div className="eyebrow">Current cart</div>
              <h3>Order Details</h3>
              {cart.length === 0 && <p className="small-muted">No items yet. Use Add Order from menu.</p>}
              <div className="billing-lines">
                {cart.map(line => (
                  <div key={line.lineId} className="bill-line">
                    <div>
                      <strong>{line.name}</strong>
                      <div className="small-muted">{line.cup}, {line.sugar}, {line.toppings.join(', ') || 'No toppings'}</div>
                    </div>
                    <div className="bill-right">
                      <span>{money(line.finalPrice)}</span>
                      <button className="ghost-btn" onClick={() => removeCartLine(line.lineId)}>x</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bill-summary">
                <Row k="Sub Total" v={money(cartSubtotal)} />
                <Row k="Tax 5%" v={money(cartTax)} />
                <Row k="Total Payment" v={money(cartTotal)} strong />
              </div>
              <button className="btn full" onClick={payNow}>Pay Now</button>
            </div>
          </section>
        )}

        {tab === 'orders' && (
          <section className="card section-card">
            <div className="panel-head row-between">
              <div>
                <div className="eyebrow">Operational view</div>
                <h3>Open Orders</h3>
              </div>
              <button className="btn btn-primary" onClick={() => setTab('pos')}>+ New Order</button>
            </div>
            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Type</th>
                    <th>Customer Name</th>
                    <th>Status</th>
                    <th>Time Placed</th>
                    <th>Last Updated</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.type}</td>
                      <td>{order.customer}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>{order.placed}</td>
                      <td>{order.updated}</td>
                      <td>{money(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'billing' && (
          <section className="card billing-view section-card">
            <div className="eyebrow">Payments</div>
            <h3>Billing Section</h3>
            <p className="small-muted">Live summary of current cart and latest paid transactions.</p>
            <div className="billing-split">
              <div>
                <h4>Current Cart</h4>
                {cart.length === 0 ? <p className="small-muted">No current cart. Start from POS tab.</p> : cart.map(line => (
                  <div key={line.lineId} className="bill-line compact">
                    <span>{line.name} x{line.qty}</span>
                    <strong>{money(line.finalPrice)}</strong>
                  </div>
                ))}
              </div>
              <div>
                <h4>Recent Transactions</h4>
                {transactions.slice(0, 6).map(tx => (
                  <div key={tx.id} className="bill-line compact">
                    <span>{tx.orderId} • {new Date(tx.date).toLocaleDateString()}</span>
                    <strong>{money(tx.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'transactions' && (
          <section className="card section-card">
            <div className="eyebrow">Finance</div>
            <h3>Transactions</h3>
            {transactions.length === 0 && <p className="small-muted">No transactions yet.</p>}
            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Items</th>
                    <th>Tax</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.orderId}</td>
                      <td>{new Date(tx.date).toLocaleString()}</td>
                      <td>{tx.method}</td>
                      <td>{tx.itemCount}</td>
                      <td>{money(tx.tax)}</td>
                      <td>{money(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'analytics' && (
          <section className="card section-card">
            <div className="eyebrow">Performance</div>
            <h3>Analytics (Interactive)</h3>
            <p className="small-muted">Last 7 days sales trend from transaction data.</p>
            <AnalyticsChart transactions={transactions} />
          </section>
        )}
      </section>

      {modalItem && draft && (
        <div className="modal-overlay" onClick={() => { setModalItem(null); setDraft(null) }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="row-between">
              <h3>Add Order</h3>
              <button className="ghost-btn" onClick={() => { setModalItem(null); setDraft(null) }}>x</button>
            </div>
            <div className="product-head">
              <div className="cup-art large" />
              <div>
                <h4>{modalItem.name}</h4>
                <p>{money(modalItem.price)}</p>
              </div>
              <div className="qty-box">
                <button className="ghost-btn" onClick={() => setDraft(prev => ({...prev, qty: Math.max(1, prev.qty - 1)}))}>-</button>
                <span>{draft.qty}</span>
                <button className="ghost-btn" onClick={() => setDraft(prev => ({...prev, qty: prev.qty + 1}))}>+</button>
              </div>
            </div>

            <h4>Select a Cup *</h4>
            <div className="option-list">
              {CUP_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`option ${draft.cup === opt ? 'selected' : ''}`}
                  onClick={() => setDraft(prev => ({...prev, cup: opt}))}
                >
                  <span>{opt}</span>
                  <span>{draft.cup === opt ? 'o' : ' '}</span>
                </button>
              ))}
            </div>

            <h4>Sugar Level *</h4>
            <div className="option-list">
              {SUGAR_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`option ${draft.sugar === opt ? 'selected' : ''}`}
                  onClick={() => setDraft(prev => ({...prev, sugar: opt}))}
                >
                  <span>{opt}</span>
                  <span>{draft.sugar === opt ? 'o' : ' '}</span>
                </button>
              ))}
            </div>

            <h4>Topping</h4>
            <div className="option-list">
              {TOPPING_OPTIONS.map(top => (
                <button key={top.name} className={`option ${draft.toppings.includes(top.name) ? 'selected' : ''}`} onClick={() => toggleTopping(top.name)}>
                  <span>{top.name}</span>
                  <span>+{money(top.price)}</span>
                </button>
              ))}
            </div>

            <button className="btn full" onClick={addConfiguredItem}>{money(modalTotal)} Add to Order</button>
          </div>
        </div>
      )}
    </Layout>
  )
}

function Row({k, v, strong}){
  return (
    <div className={`row-between ${strong ? 'row-strong' : ''}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  )
}

function StatCard({title, value, sub, trend}){
  return (
    <div className="card stat-card">
      <div className="small-muted">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="row-between">
        <span className="small-muted">{sub}</span>
        <span className="trend-up">{trend}</span>
      </div>
    </div>
  )
}

function StatusBadge({status}){
  const cls = status.toLowerCase().replace(/\s+/g, '-')
  return <span className={`status ${cls}`}>{status}</span>
}

function AnalyticsChart({transactions}){
  const points = []
  for(let i = 6; i >= 0; i -= 1){
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    points.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
      total: 0
    })
  }

  transactions.forEach(tx => {
    const key = tx.date.slice(0, 10)
    const found = points.find(p => p.key === key)
    if(found) found.total += Number(tx.amount)
  })

  const max = Math.max(1, ...points.map(p => p.total))

  return (
    <div>
      <div className="bar-chart">
        {points.map(point => (
          <div key={point.key} className="bar-col">
            <div className="bar" style={{height: `${(point.total / max) * 100}%`}} title={money(point.total)}>
              <span>{Math.round(point.total)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="x-labels">
        {points.map(point => <span key={point.key}>{point.label}</span>)}
      </div>
    </div>
  )
}
