import Sidebar from "../components/Sidebar";
import "./Payments.css";

function Payments() {
    return (
        <div className="payments-container">
            <Sidebar />

            <div className="payments-content">
                <div className="coming-soon-wrapper">
                    <div className="coming-soon-card">
                        <div className="coming-soon-icon">💰</div>
                        <h1>Payments Module</h1>
                        <p>Coming Soon!</p>
                        <div className="coming-soon-message">
                            <p>We are working on the payments module to help you manage:</p>
                            <ul>
                                <li>✅ Student Fee Tracking</li>
                                <li>✅ Payment History</li>
                                <li>✅ Receipt Generation</li>
                                <li>✅ Fee Reports</li>
                            </ul>
                            <p className="eta">Expected Release: Soon 🚀</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payments;