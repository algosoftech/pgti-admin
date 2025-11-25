import "../main_dashboard.css";
import Top_navbar from "./Top_navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faShoppingCart, 
  faBox, 
  faChartLine,
  faDollarSign,
  faTruck,
  faLeaf,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const statsCards = [
    {
      title: "Total Customers",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
      icon: faUsers,
      color: "#39B54A",
      bgColor: "rgba(57, 181, 74, 0.1)",
      onClick: () => navigate("/admin/users/list")
    },
    {
      title: "Today's Orders",
      value: "89",
      change: "+8%",
      changeType: "positive",
      icon: faShoppingCart,
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      onClick: () => navigate("/admin/orders/list")
    },
    {
      title: "Total Products",
      value: "456",
      change: "-3%",
      changeType: "negative",
      icon: faBox,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
      onClick: () => navigate("/admin/products/list")
    },
    {
      title: "Total Promo Codes",
      value: "10",
      change: "+15%",
      changeType: "positive",
      icon: faDollarSign,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      onClick: () => navigate("/admin/promocodes/list")
    }
  ];

  const quickActions = [
    {
      title: "Add New Product",
      description: "Add fresh organic products to inventory",
      icon: faLeaf,
      color: "#39B54A",
      onClick: () => navigate("/admin/products/addeditdata")
    },
    {
      title: "View Orders",
      description: "Check pending and completed orders",
      icon: faTruck,
      color: "#3B82F6",
      onClick: () => navigate("/admin/orders/list")
    },
    {
      title: "Customer Management",
      description: "Manage customer accounts and data",
      icon: faUsers,
      color: "#8B5CF6",
      onClick: () => navigate("/admin/users/list")
    },
    {
      title: "Analytics",
      description: "View store performance and insights",
      icon: faChartLine,
      color: "#F59E0B",
      onClick: () => navigate("/admin/dashboard")
    }
  ];

  return (
    <>
      <Top_navbar />
      <div className="dashboard-container">
        {/* <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening at The Farmers Store.</p>
        </div> */}

        <div className="stats-grid">
          {statsCards.map((card, index) => (
            <div key={index} className="stat-card" onClick={card.onClick}>
              <div className="stat-card-header">
                <div className="stat-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <div className={`stat-change ${card.changeType}`}>
                  {card.change}
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{card.value}</h3>
                <p className="stat-title">{card.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-content">
          <div className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <div key={index} className="quick-action-card" onClick={action.onClick}>
                  <div className="action-icon" style={{ color: action.color }}>
                    <FontAwesomeIcon icon={action.icon} />
                  </div>
                  <div className="action-content">
                    <h3 className="action-title">{action.title}</h3>
                    <p className="action-description">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recent-activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-card">
              <div className="activity-item">
                <div className="activity-icon">
                  <FontAwesomeIcon icon={faShoppingCart} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">New order #1234 received from John Doe</p>
                  <span className="activity-time">2 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FontAwesomeIcon icon={faBox} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">Organic Tomatoes stock updated</p>
                  <span className="activity-time">15 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">New customer Sarah Wilson registered</p>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">Order #1230 marked as delivered</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
