"use client";

import { useState, useEffect } from "react";
import {
  Bike,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  MessageSquare,
  Search,
  Lock,
  ArrowRight,
  Filter,
  RefreshCw,
  LogOut,
  Zap,
  Camera,
  User,
  Check,
  X,
  Settings,
  Phone,
  Key,
} from "lucide-react";
import BikeFormModal from "@/components/admin/BikeFormModal";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: fleet | schedule | returns | settings
  const [activeTab, setActiveTab] = useState<"fleet" | "schedule" | "returns" | "settings">("fleet");

  const [bikes, setBikes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookingFilter, setBookingFilter] = useState("ALL");

  // Inline Quick Price Editing State
  const [editingPriceBikeId, setEditingPriceBikeId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);
  const [inlineDeposit, setInlineDeposit] = useState<number>(0);
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Full Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<any | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const [scheduleDate, setScheduleDate] = useState(todayStr);

  // Settings: WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappSuccess, setWhatsappSuccess] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);

  // Settings: Login Credentials
  const [currentUsername, setCurrentUsername] = useState("admin");
  const [newUsername, setNewUsername] = useState("admin");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSavingAuth, setIsSavingAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/login");
        const data = await res.json();
        setIsAuthenticated(data.authenticated === true);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      const [bikesRes, bookingsRes, settingsRes] = await Promise.all([
        fetch("/api/bikes"),
        fetch("/api/bookings"),
        fetch("/api/admin/settings"),
      ]);
      const bikesData = await bikesRes.json();
      const bookingsData = await bookingsRes.json();
      const settingsData = await settingsRes.json();

      setBikes(bikesData.bikes || []);
      setBookings(bookingsData.bookings || []);
      if (settingsData.whatsappPhone) {
        setWhatsappPhone(settingsData.whatsappPhone);
        setCurrentUsername(settingsData.adminUsername || "admin");
        setNewUsername(settingsData.adminUsername || "admin");
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!usernameInput.trim()) {
      setLoginError("Please enter your User ID.");
      return;
    }
    if (!passwordInput.trim()) {
      setLoginError("Please enter your password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Invalid User ID or Password.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
  };

  // Instant 1-Click Inline Price & Deposit Save
  const handleSaveInlinePrice = async (bikeId: string) => {
    if (isNaN(inlinePrice) || inlinePrice <= 0) {
      alert("Hourly rate must be a valid number greater than ₹0.");
      return;
    }
    if (inlinePrice > 1000) {
      alert("Hourly rate cannot exceed ₹1,000 / hr.");
      return;
    }
    if (isNaN(inlineDeposit) || inlineDeposit < 0) {
      alert("Security deposit must be ₹0 or greater.");
      return;
    }
    if (inlineDeposit > 10000) {
      alert("Security deposit cannot exceed ₹10,000.");
      return;
    }

    setIsSavingInline(true);
    try {
      const res = await fetch(`/api/bikes/${bikeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hourlyRate: inlinePrice,
          securityDeposit: inlineDeposit,
        }),
      });
      if (res.ok) {
        setEditingPriceBikeId(null);
        await loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to update price.");
      }
    } catch {
      alert("Error updating price.");
    } finally {
      setIsSavingInline(false);
    }
  };

  const startInlineEdit = (bike: any) => {
    setEditingPriceBikeId(bike.id);
    setInlinePrice(bike.hourlyRate);
    setInlineDeposit(bike.securityDeposit);
  };

  const handleDeleteBike = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" and all its photos?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/bikes/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch {
      alert("Failed to delete bicycle");
    }
  };

  const handleQuickStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/bikes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string,
    additionalData: any = {}
  ) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to update booking status.");
      }
    } catch {
      alert("Error updating booking status.");
    }
  };

  const handleConfirmBooking = async (id: string, name: string) => {
    if (confirm(`Approve and confirm booking for ${name}? This will reserve the cycle for the student.`)) {
      await handleUpdateBookingStatus(id, "CONFIRMED");
    }
  };

  const handleHandoverRide = async (id: string, name: string) => {
    if (confirm(`Handover bicycle to ${name}? This marks payment as received and starts the active ride.`)) {
      await handleUpdateBookingStatus(id, "ACTIVE", { paymentStatus: "PAID" });
    }
  };

  const handleCancelBooking = async (id: string, name: string) => {
    const reason = prompt(`Enter cancellation reason for ${name}:`, "Cancelled by stand manager / Unavailable");
    if (reason === null) return;
    await handleUpdateBookingStatus(id, "CANCELLED", { returnNotes: reason });
  };

  const handleCheckInBooking = async (bookingId: string) => {
    const returnNotes = prompt("Enter return condition notes:", "Returned in good condition. Deposit released.");
    if (returnNotes === null) return;
    await handleUpdateBookingStatus(bookingId, "COMPLETED", { paymentStatus: "PAID", returnNotes });
  };

  // Save WhatsApp Phone Number independently
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappSuccess(null);
    setWhatsappError(null);

    const digitsOnly = whatsappPhone.replace(/\D/g, "");
    if (!digitsOnly || digitsOnly.length < 10) {
      setWhatsappError("Please enter a valid mobile number with at least 10 digits.");
      return;
    }

    setIsSavingWhatsApp(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update WhatsApp number.");
      }

      setWhatsappSuccess("WhatsApp number saved successfully! Students will now reach you at this number.");
      setWhatsappPhone(data.settings.whatsappPhone);
    } catch (err: any) {
      setWhatsappError(err.message || "Failed to save WhatsApp number.");
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  // Save Login Credentials independently
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSuccess(null);
    setAuthError(null);

    const trimmedUser = newUsername.trim();
    if (!trimmedUser || trimmedUser.length < 3) {
      setAuthError("Admin User ID must be at least 3 characters long.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setAuthError("Please enter your current password to authorize setting a new password.");
        return;
      }
      if (newPassword.length < 6) {
        setAuthError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setAuthError("New password and confirm password do not match.");
        return;
      }
    }

    setIsSavingAuth(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update credentials.");
      }

      setAuthSuccess("Login credentials updated successfully!");
      setCurrentUsername(data.settings.adminUsername);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setAuthError(err.message || "An error occurred updating credentials.");
    } finally {
      setIsSavingAuth(false);
    }
  };

  // LOGIN SCREEN
  if (isAuthenticated === false) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-100">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200/90 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              Fleet Owner Login
            </h2>
            <p className="text-xs text-neutral-500">
              Sign in with your Owner User ID and Password to manage bicycles and image uploads.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                User ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Enter your User ID"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoggingIn ? "Authenticating..." : "Sign In to Admin Console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredBikes = bikes.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBikes = bikes.length;
  const availableBikes = bikes.filter((b) => b.status === "AVAILABLE").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const activeBookings = bookings.filter((b) => b.status === "ACTIVE");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "ALL") return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-100/60 pb-16">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold">
                  RGPV Campus Cycle Fleet Manager
                </h1>
                <p className="text-[11px] text-neutral-400">
                  Signed in as <strong className="text-emerald-400">{currentUsername}</strong> · WhatsApp: <strong className="text-emerald-400">+{whatsappPhone}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingBike(null);
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Cycle Photos & Add</span>
              </button>

              <button
                onClick={loadData}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-red-900/60 text-neutral-300 hover:text-red-400"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 border-t border-neutral-800 pt-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("fleet")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "fleet" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              Fleet & Photos ({bikes.length})
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "schedule" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              Hourly Timeline (24h)
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "returns" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Bookings & Stand Returns ({bookings.length})</span>
              {pendingBookings.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black animate-pulse">
                  {pendingBookings.length} pending
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "settings" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>WhatsApp & Login Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* KPI Mini-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Cycles</span>
              <p className="text-base font-black text-neutral-900">{totalBikes}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400">Ready at Stands</span>
              <p className="text-base font-black text-neutral-900">{availableBikes}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400">On Campus Road</span>
              <p className="text-base font-black text-neutral-900">{activeBookings.length}</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border shadow-sm flex items-center gap-3 transition-colors ${
            pendingBookings.length > 0 ? "bg-amber-50 border-amber-300" : "bg-white border-neutral-200/80"
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pendingBookings.length > 0 ? "bg-amber-400 text-neutral-950" : "bg-neutral-100 text-neutral-400"
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500">Pending Approval</span>
              <p className={`text-base font-black ${pendingBookings.length > 0 ? "text-amber-900" : "text-neutral-900"}`}>
                {pendingBookings.length}
              </p>
            </div>
          </div>
        </div>

        {/* TAB 1: FLEET & PHOTO UPLOADS */}
        {activeTab === "fleet" && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by cycle name or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented Out</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/70 border-b border-neutral-200/60 text-neutral-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Cycle & Photos</th>
                    <th className="py-2.5 px-4">Cycle Stand Location</th>
                    <th className="py-2.5 px-4">Hourly Rate (₹)</th>
                    <th className="py-2.5 px-4">Deposit (₹)</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredBikes.map((bike) => {
                    const primaryImg = bike.images?.find((img: any) => img.isPrimary) || bike.images?.[0];
                    const isInlineEditing = editingPriceBikeId === bike.id;

                    return (
                      <tr key={bike.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-11 rounded-xl bg-neutral-100 overflow-hidden relative border border-neutral-200 flex-shrink-0">
                              {primaryImg ? (
                                <img src={primaryImg.url} alt={bike.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <Camera className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {bike.images?.length > 0 && (
                                <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 text-white font-bold px-1 rounded">
                                  {bike.images.length}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 leading-snug">{bike.name}</p>
                              <p className="text-[10px] text-neutral-500">{bike.type} · {bike.gearCount} gears</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-neutral-700">
                          {bike.location}
                        </td>

                        {/* Hourly Rate with 1-Click Inline Edit */}
                        <td className="py-3 px-4">
                          {isInlineEditing ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-400">₹</span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={inlinePrice}
                                onChange={(e) => setInlinePrice(parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-1 text-xs font-bold border border-emerald-500 rounded bg-white focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveInlinePrice(bike.id)}
                                disabled={isSavingInline}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                title="Save price"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingPriceBikeId(null)}
                                className="p-1 rounded bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => startInlineEdit(bike)}
                              className="group/rate cursor-pointer inline-flex items-center gap-1.5 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                              title="Click to edit price directly"
                            >
                              <span className="font-black text-neutral-900 text-sm">
                                ₹{bike.hourlyRate.toFixed(0)}
                              </span>
                              <span className="text-[10px] text-neutral-400">/hr</span>
                              <Edit2 className="w-3 h-3 text-neutral-300 group-hover/rate:text-emerald-600 transition-colors" />
                            </div>
                          )}
                        </td>

                        {/* Deposit with 1-Click Inline Edit */}
                        <td className="py-3 px-4 font-semibold text-neutral-700">
                          {isInlineEditing ? (
                            <div className="flex items-center gap-1">
                              <span>₹</span>
                              <input
                                type="number"
                                min="0"
                                step="5"
                                value={inlineDeposit}
                                onChange={(e) => setInlineDeposit(parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-1 text-xs font-semibold border border-neutral-300 rounded bg-white focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => startInlineEdit(bike)}
                              className="cursor-pointer hover:bg-neutral-100 px-1.5 py-0.5 rounded inline-block"
                              title="Click to edit deposit"
                            >
                              ₹{bike.securityDeposit.toFixed(0)}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={bike.status}
                            onChange={(e) => handleQuickStatus(bike.id, e.target.value)}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-white"
                          >
                            <option value="AVAILABLE">Available</option>
                            <option value="RENTED">Rented Out</option>
                            <option value="MAINTENANCE">Maintenance</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingBike(bike);
                                setIsModalOpen(true);
                              }}
                              className="p-1 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                              title="Edit all cycle specs & photos (pre-filled)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBike(bike.id, bike.name)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete cycle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="font-extrabold text-neutral-900 text-sm">
                  24-Hour Campus Rental Schedule
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Visual timeline of all cycle reservations across hours (IST).
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-neutral-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-600"></span> On Road</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> Confirmed</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-300 border border-amber-400"></span> Pending</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-neutral-100"></span> Free</span>
                </div>

                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-neutral-300 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-1.5">
                <div className="grid grid-cols-[180px_repeat(15,1fr)] gap-1 text-[9px] font-bold text-neutral-400 uppercase text-center border-b pb-1">
                  <div className="text-left pl-2">Cycle</div>
                  {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => (
                    <div key={h}>{h}:00</div>
                  ))}
                </div>

                {bikes.map((bike) => {
                  const dayStart = new Date(`${scheduleDate}T00:00:00+05:30`).getTime();
                  const dayEnd = new Date(`${scheduleDate}T23:59:59.999+05:30`).getTime();
                  const bikeBookings = bookings.filter((b) => {
                    if (b.bikeId !== bike.id || b.status === "CANCELLED") return false;
                    const bStart = new Date(b.startTime).getTime();
                    const bEnd = new Date(b.endTime).getTime();
                    return bStart <= dayEnd && bEnd >= dayStart;
                  });

                  return (
                    <div
                      key={bike.id}
                      className="grid grid-cols-[180px_repeat(15,1fr)] gap-1 items-center py-1.5 border-b border-neutral-100 text-xs"
                    >
                      <div className="font-bold text-neutral-800 truncate pr-2" title={bike.name}>
                        {bike.name}
                      </div>

                      {Array.from({ length: 15 }, (_, i) => i + 7).map((hour) => {
                        const slotStart = new Date(`${scheduleDate}T${String(hour).padStart(2, "0")}:00:00+05:30`).getTime();
                        const slotEnd = new Date(`${scheduleDate}T${String(hour + 1).padStart(2, "0")}:00:00+05:30`).getTime();

                        const activeMatch = bikeBookings.find((b) => {
                          const bStart = new Date(b.startTime).getTime();
                          const bEnd = new Date(b.endTime).getTime();
                          return bStart < slotEnd && bEnd > slotStart;
                        });

                        return (
                          <div
                            key={hour}
                            title={activeMatch ? `${activeMatch.customerName} (${activeMatch.status}) · ${activeMatch.bookingNumber}` : `${hour}:00 Available`}
                            className={`h-6 rounded text-[8px] font-bold flex items-center justify-center transition-colors ${
                              !activeMatch
                                ? "bg-neutral-100 text-neutral-300"
                                : activeMatch.status === "ACTIVE"
                                ? "bg-blue-600 text-white shadow-sm"
                                : activeMatch.status === "CONFIRMED"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : activeMatch.status === "PENDING"
                                ? "bg-amber-300 text-amber-950 border border-amber-400 font-extrabold"
                                : "bg-neutral-400 text-white"
                            }`}
                          >
                            {!activeMatch
                              ? ""
                              : activeMatch.status === "ACTIVE"
                              ? "Ride"
                              : activeMatch.status === "CONFIRMED"
                              ? "Booked"
                              : activeMatch.status === "PENDING"
                              ? "Pending"
                              : "Done"}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS & RETURNS */}
        {activeTab === "returns" && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
              <div>
                <h3 className="font-extrabold text-neutral-900 text-sm">
                  Student Bookings & Cycle Stand Returns
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Approve incoming WhatsApp requests, handover cycles for active rides, and check in returned bicycles.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setBookingFilter("ALL")}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                    bookingFilter === "ALL" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setBookingFilter("PENDING")}
                  className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                    bookingFilter === "PENDING"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span>Pending ({pendingBookings.length})</span>
                  {pendingBookings.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
                </button>
                <button
                  onClick={() => setBookingFilter("CONFIRMED")}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                    bookingFilter === "CONFIRMED" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Confirmed ({confirmedBookings.length})
                </button>
                <button
                  onClick={() => setBookingFilter("ACTIVE")}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                    bookingFilter === "ACTIVE" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  On Road ({activeBookings.length})
                </button>
                <button
                  onClick={() => setBookingFilter("COMPLETED")}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                    bookingFilter === "COMPLETED" ? "bg-neutral-700 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  Completed ({completedBookings.length})
                </button>
                <button
                  onClick={() => setBookingFilter("CANCELLED")}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                    bookingFilter === "CANCELLED" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  Cancelled ({cancelledBookings.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b text-neutral-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Student & Phone</th>
                    <th className="py-2.5 px-3">Bicycle</th>
                    <th className="py-2.5 px-3">Timing</th>
                    <th className="py-2.5 px-3">Due (₹)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-400">
                        No bookings found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                          {b.bookingNumber}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-neutral-900">{b.customerName}</p>
                          <p className="text-[10px] text-neutral-500">{b.customerPhone}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-neutral-800">{b.bike?.name}</p>
                          <p className="text-[10px] text-neutral-400">{b.bike?.location}</p>
                        </td>
                        <td className="py-3 px-3 text-neutral-600">
                          <p className="font-semibold text-neutral-800">
                            {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {new Date(b.startTime).toLocaleDateString([], { month: "short", day: "numeric" })} ({b.totalHours} hrs)
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-black text-neutral-900">₹{b.totalAmount.toFixed(0)}</p>
                          <p className="text-[10px] text-neutral-500 font-semibold">
                            {b.paymentStatus === "PAID" ? "Paid ✓" : "Due at stand"}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === "PENDING"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : b.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : b.status === "ACTIVE"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : b.status === "CANCELLED"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {b.status === "PENDING"
                              ? "Pending"
                              : b.status === "CONFIRMED"
                              ? "Confirmed"
                              : b.status === "ACTIVE"
                              ? "On Road"
                              : b.status === "COMPLETED"
                              ? "Completed"
                              : "Cancelled"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* WhatsApp link to chat directly with student */}
                            <a
                              href={`https://wa.me/91${b.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${b.customerName}, regarding your RGPV bicycle booking ${b.bookingNumber} for ${b.bike?.name}...`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors"
                              title="WhatsApp this student"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* PENDING Actions: Approve / Confirm OR Decline */}
                            {b.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(b.id, b.customerName)}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                                  title="Approve booking and reserve cycle"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(b.id, b.customerName)}
                                  className="px-2 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200 transition-colors"
                                  title="Decline request"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {/* CONFIRMED Actions: Handover (Start Ride) OR Cancel */}
                            {b.status === "CONFIRMED" && (
                              <>
                                <button
                                  onClick={() => handleHandoverRide(b.id, b.customerName)}
                                  className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                                  title="Student arrived, paid, and collected cycle"
                                >
                                  Handover
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(b.id, b.customerName)}
                                  className="px-2 py-1 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-700 font-bold text-[11px] transition-colors"
                                  title="Cancel reservation"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {/* ACTIVE Actions: Check-In (Return Cycle) */}
                            {b.status === "ACTIVE" && (
                              <button
                                onClick={() => handleCheckInBooking(b.id)}
                                className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-colors"
                                title="Check in returned cycle & release deposit"
                              >
                                Check-In
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP NUMBER & ADMIN CREDENTIALS SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            {/* CARD 1: WHATSAPP NUMBER (Independent Save, No password required!) */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-extrabold text-neutral-900 text-base flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Booking Receiver Number</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  All &quot;Book on WhatsApp&quot; student reservations will open a chat with this phone number.
                </p>
              </div>

              {whatsappSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{whatsappSuccess}</span>
                </div>
              )}

              {whatsappError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  {whatsappError}
                </div>
              )}

              <form onSubmit={handleSaveWhatsApp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    WhatsApp Phone Number (Country Code + Mobile)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 font-bold text-neutral-400 text-xs">+</span>
                      <input
                        type="text"
                        placeholder="919876543210 or 10-digit number"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <a
                      href={`https://wa.me/${whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Test message from RGPV Pedal Admin Console.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold flex items-center gap-1 transition-colors"
                      title="Test chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Test Chat</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Enter with or without country code. For India, 10-digit numbers automatically get prefix +91.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingWhatsApp}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingWhatsApp ? "Saving Number..." : "Save WhatsApp Number"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: LOGIN USER ID & PASSWORD */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-extrabold text-neutral-900 text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>Admin Login Credentials (User ID & Password)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Change the User ID and Password used to log into this admin console.
                </p>
              </div>

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
                {/* User ID */}
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Admin User ID
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Current signed-in User ID is: <strong className="text-neutral-700">{currentUsername}</strong>
                  </p>
                </div>

                {/* Current Password */}
                <div className="pt-2 border-t border-neutral-100">
                  <label className="block font-bold text-neutral-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password to authorize changes"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* New Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      New Password (min. 6 characters)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingAuth}
                    className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingAuth ? "Updating Credentials..." : "Update Login Credentials"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <BikeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBike(null);
        }}
        onSaved={loadData}
        initialData={editingBike}
      />
    </div>
  );
}
