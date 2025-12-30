"use client"

import { useState, useEffect } from "react"
import client from "../api/client"

export default function Profile() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        wallet: "",
        joined: "",
        kyc_status: "",
        referral_code: "",
        walletConnected: false
    })
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({})
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await client.get('/auth/me');
            const data = res.data;
            const formattedProfile = {
                name: data.name,
                email: data.email,
                phone: data.phone || "Not set",
                wallet: data.wallet || "",
                walletConnected: data.wallet ? true : false,
                joined: new Date(data.joinedDate).toLocaleDateString(),
                kyc_status: data.kycStatus === 'verification_needed' ? 'Unverified' :
                    data.kycStatus === 'verified' ? 'Verified' : data.kycStatus,
                referral_code: data.referralCode || "No Code",
                _id: data._id
            };
            setProfile(formattedProfile);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone || ""
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    }

    const handleUpdateProfile = async () => {
        try {
            const res = await client.put(`/users/${profile._id}`, formData);
            const data = res.data;
            setProfile(prev => ({
                ...prev,
                name: data.name,
                email: data.email,
                phone: data.phone
            }));
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.response?.data?.message || "Failed to update profile");
        }
    }

    const handleConnectWallet = async () => {
        try {
            // Check if MetaMask or Web3 wallet is available
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const walletAddress = accounts[0];

                // Update user's wallet in backend (will update even if wallet already exists)
                await client.put(`/users/${profile._id}`, { wallet: walletAddress });

                setProfile(prev => ({
                    ...prev,
                    wallet: walletAddress,
                    walletConnected: true
                }));

                if (profile.wallet && profile.wallet !== walletAddress) {
                    alert("Wallet address updated successfully!");
                } else {
                    alert("Wallet connected successfully!");
                }
            } else {
                alert("Please install MetaMask or another Web3 wallet!");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet");
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }

        try {
            await client.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert("Password changed successfully!");
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Error changing password:", error);
            alert(error.response?.data?.message || "Failed to change password");
        }
    }

    const handleCopyReferralLink = () => {
        const referralLink = `${window.location.origin}/register?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(referralLink);
        alert("Referral link copied to clipboard!");
    }

    if (loading) return <div className="text-white">Loading profile...</div>

    return (
        <div className="w-full space-y-6 md:space-y-8">
            <div className="flex justify-between items-center mb-4 md:mb-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Profile</h2>
                <button
                    onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                    className="px-4 py-2 bg-[#9131e7] text-white rounded-lg hover:bg-[#e84495] transition-all"
                >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 lg:p-8 rounded-xl border border-[#444]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-[#444]">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#9131e7] to-[#e84495] flex items-center justify-center text-2xl md:text-3xl font-bold text-[#040408] flex-shrink-0">
                        {profile.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{profile.name}</h3>
                            <button
                                onClick={handleConnectWallet}
                                className="px-3 md:px-4 py-1 md:py-2 rounded-lg font-semibold text-xs md:text-sm transition-all bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white hover:shadow-lg"
                            >
                                {profile.walletConnected ? "Update Wallet" : "Connect Wallet"}
                            </button>
                        </div>
                        <p className="inline-block px-2 md:px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs md:text-sm font-semibold">
                            {profile.kyc_status}
                        </p>
                    </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                    <div>
                        <h4 className="text-lg md:text-xl font-bold text-[#9131e7] mb-3 md:mb-4">Personal Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-lg border border-[#444]">
                                <label className="text-xs md:text-sm text-[#b0b0b0] mb-1 md:mb-2 block">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full bg-[#333] text-white p-2 rounded"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-base md:text-lg text-white font-semibold truncate">{profile.name}</p>
                                )}
                            </div>
                            <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-lg border border-[#444]">
                                <label className="text-xs md:text-sm text-[#b0b0b0] mb-1 md:mb-2 block">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        className="w-full bg-[#333] text-white p-2 rounded"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-base md:text-lg text-white font-semibold truncate">{profile.email}</p>
                                )}
                            </div>
                            <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-lg border border-[#444]">
                                <label className="text-xs md:text-sm text-[#b0b0b0] mb-1 md:mb-2 block">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full bg-[#333] text-white p-2 rounded"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-base md:text-lg text-white font-semibold truncate">{profile.phone}</p>
                                )}
                            </div>
                            <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-lg border border-[#444]">
                                <label className="text-xs md:text-sm text-[#b0b0b0] mb-1 md:mb-2 block">Member Since</label>
                                <p className="text-base md:text-lg text-white font-semibold">{profile.joined}</p>
                            </div>
                        </div>
                    </div>


                    <div>
                        <h4 className="text-lg md:text-xl font-bold text-[#9131e7] mb-3 md:mb-4">Referral Link</h4>
                        <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-lg border border-[#444] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <label className="text-xs md:text-sm text-[#b0b0b0] mb-1 md:mb-2 block">Your Referral Link</label>
                                <code className="text-white font-mono text-xs md:text-sm break-all">
                                    {`${window.location.origin}/register?ref=${profile.referral_code}`}
                                </code>
                            </div>
                            <button
                                onClick={handleCopyReferralLink}
                                className="px-3 md:px-4 py-2 bg-[#9131e7] text-[#040408] font-bold rounded-lg hover:bg-[#e84495] transition-all flex-shrink-0 text-sm md:text-base w-full sm:w-auto"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>


                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-[#040408] font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 text-sm md:text-base"
                        >
                            Change Password
                        </button>
                        <button className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-[#9131e7] text-[#9131e7] font-bold rounded-lg hover:bg-[#9131e7]/10 transition-all duration-300 text-sm md:text-base">
                            Two-Factor Authentication
                        </button>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-6 md:p-8 rounded-xl border border-[#9131e7] max-w-md w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-[#b0b0b0] mb-2 block">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-[#444] focus:border-[#9131e7] focus:outline-none"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-[#b0b0b0] mb-2 block">New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-[#444] focus:border-[#9131e7] focus:outline-none"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-[#b0b0b0] mb-2 block">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-[#444] focus:border-[#9131e7] focus:outline-none"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white font-bold rounded-lg hover:shadow-lg transition-all"
                                >
                                    Change Password
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                    }}
                                    className="flex-1 px-4 py-3 border border-[#9131e7] text-[#9131e7] font-bold rounded-lg hover:bg-[#9131e7]/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}