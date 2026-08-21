import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function Sidebar() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
    username: "",
    email: "",
    profile_picture: "",
});

    const token = localStorage.getItem("access");

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // =====================================================
    // FETCH LOGGED-IN USER
    // =====================================================

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(
    "/profile/"
);

                setProfile({
    username: response.data.username,
    email: response.data.email,
    profile_picture: response.data.profile_picture || "",
});
            } catch (error) {
                console.error(
                    "Error fetching profile:",
                    error
                );

                if (error.response?.status === 401) {
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");

                    navigate("/login");
                }
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token, navigate]);

    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
    };

    // =====================================================
    // AVATAR
    // =====================================================

    const avatarLetter = profile.username
        ? profile.username.charAt(0).toUpperCase()
        : "U";
    const profilePictureUrl = profile.profile_picture
    ? profile.profile_picture.startsWith("http")
        ? profile.profile_picture
        : `${import.meta.env.VITE_API_URL.replace("/api/", "")}${profile.profile_picture}`
    : "";

    // =====================================================
    // NAVIGATION ITEM
    // =====================================================

    const navClass = ({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    return (
        <aside className="sidebar">

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="sidebar-brand">

                <div className="sidebar-brand-icon">
                    💰
                </div>

                <div className="sidebar-brand-text">
                    <h2>BudgetBuddy</h2>
                    <span>Personal Finance</span>
                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="sidebar-navigation">

                {/* MAIN */}

                <div className="sidebar-section">

                    <div className="sidebar-heading">
                        MAIN
                    </div>

                    <NavLink
                        to="/dashboard"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-grid-1x2-fill"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Dashboard
                        </span>
                    </NavLink>

                </div>


                {/* FINANCE */}

                <div className="sidebar-section">

                    <div className="sidebar-heading">
                        FINANCE
                    </div>

                    <NavLink
                        to="/income"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-wallet2"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Income
                        </span>
                    </NavLink>


                    <NavLink
                        to="/expenses"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-receipt"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Expenses
                        </span>
                    </NavLink>


                    <NavLink
                        to="/budget"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-pie-chart-fill"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Budget
                        </span>
                    </NavLink>


                    <NavLink
                        to="/savings"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-piggy-bank-fill"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Savings
                        </span>
                    </NavLink>

                </div>


                {/* INSIGHTS */}

                <div className="sidebar-section">

                    <div className="sidebar-heading">
                        INSIGHTS
                    </div>

                    <NavLink
                        to="/reports"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-bar-chart-line-fill"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Reports
                        </span>
                    </NavLink>

                </div>


                {/* ACCOUNT */}

                <div className="sidebar-section">

                    <div className="sidebar-heading">
                        ACCOUNT
                    </div>

                    <NavLink
                        to="/notifications"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-bell-fill"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Notifications
                        </span>
                    </NavLink>


                    <NavLink
                        to="/profile"
                        className={navClass}
                    >
                        <span className="sidebar-link-icon">
                            <i className="bi bi-person-fill"></i>
                        </span>

                        <span className="sidebar-link-text">
                            Profile
                        </span>
                    </NavLink>

                </div>

            </nav>


            {/* =================================================
                USER AREA
            ================================================= */}

            <div className="sidebar-bottom">

                <div className="sidebar-user-card">

                    <div className="avatar">

    {profilePictureUrl ? (
        <img
            src={profilePictureUrl}
            alt="Profile"
            className="sidebar-profile-image"
        />
    ) : (
        avatarLetter
    )}

</div>

                    <div className="sidebar-user-info">

                        <strong>
                            {profile.username || "User"}
                        </strong>

                        <span>
                            {profile.email || "Personal account"}
                        </span>

                    </div>

                </div>


                {/* LOGOUT */}

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={logout}
                >
                    <span className="sidebar-logout-icon">
                        <i className="bi bi-box-arrow-right"></i>
                    </span>

                    <span>
                        Logout
                    </span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;