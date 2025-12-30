"use client"

import { useState, useEffect } from "react"
import client from "../../api/client"

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterKYC, setFilterKYC] = useState("all")
    const [selectedUsers, setSelectedUsers] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editFormData, setEditFormData] = useState({})

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await client.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    }

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            status: user.status,
            kycStatus: user.kycStatus,
            wallet: user.wallet
        });
        setIsEditing(false);
        setShowUserModal(true);
    }

    const handleEditUser = () => {
        setIsEditing(true);
    }

    const handleSaveUser = async () => {
        try {
            await client.put(`/users/${selectedUser._id}`, editFormData);
            // Refresh users
            fetchUsers();
            setShowUserModal(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    }

    // Filter users based on search and filters
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.wallet && user.wallet.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === "all" || user.status === filterStatus;

        const matchesKYC = filterKYC === "all" || user.kycStatus === filterKYC;

        return matchesSearch && matchesStatus && matchesKYC;
    });

    if (loading) return <div className="text-white">Loading users...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">User Management</h2>
                    <p className="text-gray-400 mt-1">Manage and monitor all platform users</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Search users by name, email, or wallet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none transition-all"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select
                        value={filterKYC}
                        onChange={(e) => setFilterKYC(e.target.value)}
                        className="px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none transition-all"
                    >
                        <option value="all">All KYC Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="verification_needed">Verification Needed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#0f0f1a] rounded-xl border border-[#9131e7]/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1a1a2e]">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input type="checkbox" className="w-4 h-4 rounded" />
                                </th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">User</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Wallet Address</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Investment</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Status</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">KYC</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Join Date</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#9131e7]/30">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                                        No users found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-[#1a1a2e] transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => toggleUserSelection(user._id)}
                                                className="w-4 h-4 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#9131e7] to-[#e3459b] rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.name}</p>
                                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[#9131e7] text-sm">{user.wallet || 'Not connected'}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-500 font-semibold">
                                                ₹{(user.totalInvestment || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${user.kycStatus === "verified"
                                                    ? "bg-green-500/20 text-green-500"
                                                    : user.kycStatus === "pending"
                                                        ? "bg-yellow-500/20 text-yellow-500"
                                                        : "bg-red-500/20 text-red-500"
                                                    }`}
                                            >
                                                {user.kycStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(user.joinedDate || user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a2e] border-t border-[#9131e7]/30">
                    <p className="text-gray-400 text-sm">
                        Showing {filteredUsers.length} of {users.length} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-[#0f0f1a] text-white rounded-lg hover:bg-[#2a2a3e] transition-all">
                            Previous
                        </button>
                        <button className="px-4 py-2 bg-[#9131e7] text-white rounded-lg font-semibold">1</button>
                        <button className="px-4 py-2 bg-[#0f0f1a] text-white rounded-lg hover:bg-[#2a2a3e] transition-all">
                            2
                        </button>
                        <button className="px-4 py-2 bg-[#0f0f1a] text-white rounded-lg hover:bg-[#2a2a3e] transition-all">
                            3
                        </button>
                        <button className="px-4 py-2 bg-[#0f0f1a] text-white rounded-lg hover:bg-[#2a2a3e] transition-all">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-[#0f0f1a] rounded-xl p-6 max-w-3xl w-full border border-[#9131e7]/30 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">{isEditing ? 'Edit User' : 'User Details'}</h3>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="text-gray-400 hover:text-white transition-all text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* User Profile */}
                            <div className="flex items-center gap-4 pb-6 border-b border-[#9131e7]/30">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#9131e7] to-[#e3459b] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-white">{selectedUser.name}</h4>
                                    <p className="text-gray-400">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        {isEditing ? (
                                            <>
                                                <select
                                                    value={editFormData.status}
                                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                                    className="bg-[#1a1a2e] text-white text-xs px-2 py-1 rounded border border-[#3f3f3f]"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="suspended">Suspended</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                <select
                                                    value={editFormData.kycStatus}
                                                    onChange={(e) => setEditFormData({ ...editFormData, kycStatus: e.target.value })}
                                                    className="bg-[#1a1a2e] text-white text-xs px-2 py-1 rounded border border-[#3f3f3f]"
                                                >
                                                    <option value="verified">Verified</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="verification_needed">Verification Needed</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </>
                                        ) : (
                                            <>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                                                    {selectedUser.status}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.kycStatus === "verified" ? "bg-green-500/20 text-green-500" : selectedUser.kycStatus === "pending" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>
                                                    KYC: {selectedUser.kycStatus}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Phone</p>
                                    <p className="text-white font-semibold">{selectedUser.phone || 'Not provided'}</p>
                                </div>
                                <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">User ID</p>
                                    <p className="text-white font-semibold">{selectedUser._id.substring(selectedUser._id.length - 8).toUpperCase()}</p>
                                </div>
                                <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Referral Code</p>
                                    <p className="text-white font-semibold">{selectedUser.referralCode || 'N/A'}</p>
                                </div>
                                <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Sponsor ID</p>
                                    <p className="text-white font-semibold">{selectedUser.sponsorId || 'N/A'}</p>
                                </div>
                                <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Join Date</p>
                                    <p className="text-white font-semibold">{new Date(selectedUser.joinedDate || selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Total Investment</p>
                                    <p className="text-green-500 font-bold text-lg">₹{(selectedUser.totalInvestment || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Wallet Information */}
                            <div className="bg-[#1a1a2e] p-4 rounded-lg">
                                <p className="text-gray-400 text-sm mb-2">Wallet Address</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editFormData.wallet || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, wallet: e.target.value })}
                                        className="w-full bg-[#000] text-[#9131e7] text-sm p-2 rounded border border-[#3f3f3f]"
                                    />
                                ) : (
                                    <code className="text-[#9131e7] text-sm break-all">{selectedUser.wallet || 'Not connected'}</code>
                                )}
                            </div>

                            {/* Wallet Balances */}
                            <div>
                                <h5 className="text-lg font-bold text-white mb-3">Wallet Balances</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-[#1a1a2e] p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">Monthly ROI</p>
                                        <p className="text-white font-semibold">₹{(selectedUser.monthlyROI || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1a1a2e] p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">Level Income</p>
                                        <p className="text-white font-semibold">₹{(selectedUser.levelIncomeROI || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1a1a2e] p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">Total Income</p>
                                        <p className="text-white font-semibold">₹{(selectedUser.totalIncome || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1a1a2e] p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">SOS Withdrawal</p>
                                        <p className="text-white font-semibold">₹{(selectedUser.sosWithdrawal || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="flex-1 px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-semibold hover:bg-[#3f3f3f] transition-all"
                                >
                                    Close
                                </button>
                                {isEditing ? (
                                    <button
                                        onClick={handleSaveUser}
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEditUser}
                                        className="flex-1 px-6 py-3 bg-[#9131e7] text-white rounded-lg font-semibold hover:bg-[#d4941f] transition-all"
                                    >
                                        Edit User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
