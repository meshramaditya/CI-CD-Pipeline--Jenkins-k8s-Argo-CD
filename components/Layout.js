import Sidebar from './Sidebar'
export default function Layout({children}){
  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>Blue Cube</h3>
        <Sidebar />
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}
