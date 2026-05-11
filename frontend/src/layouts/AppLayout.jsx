import Sidebar from './Sidebar';

const AppLayout = ({ children, title, actions }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <span className="page-title">{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actions}
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
