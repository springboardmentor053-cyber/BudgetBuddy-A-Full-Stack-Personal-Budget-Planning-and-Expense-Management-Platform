import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        alert("Logged Out Successfully");

        navigate("/login");
    };

    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link className="navbar-brand fw-bold" to="/dashboard">
                    BudgetBuddy
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >

                    <ul className="navbar-nav ms-auto">

                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/income">
                                Income
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/expenses">
                                Expenses
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/budget">
                                Budget
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/savings">
                                Savings
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/reports">
                                Reports
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/profile">
                                Profile
                            </Link>
                        </li>

                        <li className="nav-item">
                            <button
                                className="btn btn-danger ms-3"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </li>

                    </ul>

                </div>

            </div>

        </nav>

    );
}

export default Navbar;