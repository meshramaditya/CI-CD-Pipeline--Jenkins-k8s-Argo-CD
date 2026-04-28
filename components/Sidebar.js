import Link from 'next/link'
export default function Sidebar(){
  return (
    <div>
      <nav style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
        <Link href="/dashboard" className="small-muted">POS</Link>
        <Link href="/dashboard?tab=orders" className="small-muted">Orders</Link>
        <Link href="/dashboard?tab=transactions" className="small-muted">Transactions</Link>
        <Link href="/dashboard?tab=analytics" className="small-muted">Analytics</Link>
        <a className="small-muted" href="#" onClick={(e)=>{e.preventDefault(); localStorage.removeItem('bluecube_auth'); location.href='/'}}>Sign out</a>
      </nav>
      <div style={{marginTop:20}} className="small-muted">Daily operations • Billing • Insights</div>
    </div>
  )
}
