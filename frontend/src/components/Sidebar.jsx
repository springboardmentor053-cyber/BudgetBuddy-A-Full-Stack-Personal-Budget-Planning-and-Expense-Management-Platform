import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function Sidebar() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        username: "",
        email: "",
    });

    const token = localStorage.getItem("access");

    

    // =============================
    // Fetch Logged-in User
    // =============================

    useEffect(() => {

    const fetchProfile = async () => {

        try {

            const response = await api.get(
                "/profile/"
            );

            setProfile({
                username: response.data.username,
                email: response.data.email,
            });

        } catch (error) {

            console.error(
                "Error fetching profile:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "access"
                );

                localStorage.removeItem(
                    "refresh"
                );

                navigate("/login");

            }

        }

    };

    if (token) {
        fetchProfile();
    }

}, [token, navigate]);


    // =============================
    // Logout
    // =============================

    const logout = () => {

        localStorage.removeItem("access");

        localStorage.removeItem("refresh");

        navigate("/login");

    };


    // =============================
    // Avatar Letter
    // =============================

    const avatarLetter =
        profile.username
            ? profile.username
                .charAt(0)
                .toUpperCase()
            : "U";


    return (

        <div className="sidebar">


            {/* ============================= */}
            {/* Logo */}
            {/* ============================= */}

            <div className="sidebar-logo">

                <div className="logo-icon">
                    💰
                </div>

                <div>

                    <h4>
                        BudgetBuddy
                    </h4>

                    <p>
                        Personal Finance
                    </p>

                </div>

            </div>


            {/* ============================= */}
            {/* Main */}
            {/* ============================= */}

            <div className="sidebar-section">

                <p className="sidebar-heading">
                    MAIN
                </p>

                <NavLink
                    to="/dashboard"
                    className="sidebar-link"
                >

                    <i className="bi bi-speedometer2"></i>

                    <span>
                        Dashboard
                    </span>

                </NavLink>

            </div>


            {/* ============================= */}
            {/* Finance */}
            {/* ============================= */}

            <div className="sidebar-section">

                <p className="sidebar-heading">
                    FINANCE
                </p>


                <NavLink
                    to="/income"
                    className="sidebar-link"
                >

                    <i className="bi bi-cash-stack"></i>

                    <span>
                        Income
                    </span>

                </NavLink>


                <NavLink
                    to="/expenses"
                    className="sidebar-link"
                >

                    <i className="bi bi-credit-card"></i>

                    <span>
                        Expenses
                    </span>

                </NavLink>


                <NavLink
                    to="/budget"
                    className="sidebar-link"
                >

                    <i className="bi bi-pie-chart"></i>

                    <span>
                        Budget
                    </span>

                </NavLink>


                <NavLink
                    to="/savings"
                    className="sidebar-link"
                >

                    <i className="bi bi-piggy-bank"></i>

                    <span>
                        Savings
                    </span>

                </NavLink>

            </div>


            {/* ============================= */}
            {/* Insights */}
            {/* ============================= */}

            <div className="sidebar-section">

                <p className="sidebar-heading">
                    INSIGHTS
                </p>


                <NavLink
                    to="/reports"
                    className="sidebar-link"
                >

                    <i className="bi bi-bar-chart"></i>

                    <span>
                        Reports
                    </span>

                </NavLink>

            </div>


            {/* ============================= */}
            {/* Account */}
            {/* ============================= */}

            <div className="sidebar-section">

                <p className="sidebar-heading">
                    ACCOUNT
                </p>


                <NavLink
                    to="/notifications"
                    className="sidebar-link"
                >

                    <i className="bi bi-bell"></i>

                    <span>
                        Notifications
                    </span>

                </NavLink>


                <NavLink
                    to="/profile"
                    className="sidebar-link"
                >

                    <i className="bi bi-person-circle"></i>

                    <span>
                        Profile
                    </span>

                </NavLink>

            </div>


            {/* ============================= */}
            {/* User Footer */}
            {/* ============================= */}

            <div className="sidebar-footer">

                <div className="user-card">

                    <div className="avatar">

                        {avatarLetter}

                    </div>


                    <div>

                        <strong>
                            {profile.username || "User"}
                        </strong>

                        <p>
                            {profile.email || "Student"}
                        </p>

                    </div>

                </div>


                {/* ============================= */}
                {/* Logout */}
                {/* ============================= */}

                <button
                    type="button"
                    className="logout-btn"
                    onClick={logout}
                >

                    <i className="bi bi-box-arrow-right"></i>

                    Logout

                </button>

            </div>

        </div>

    );

}

export default Sidebar;