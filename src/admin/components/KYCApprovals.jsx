"use client"

import { useState, useEffect } from "react"
import client from "../../api/client"

export default function KYCApprovals() {
    const [selectedKYC, setSelectedKYC] = useState(null)

    const [kycRequests, setKycRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        pendingReview: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalVerified: 0
    })

    const fetchKYCRequests = async () => {
        try {
            const { data } = await client.get('/kyc/pending');
            setKycRequests(data);
        } catch (error) {
            console.error("Error fetching KYC requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKYCStats = async () => {
        try {
            const { data } = await client.get('/kyc/stats');
            setStats(data);
        } catch (error) {
            console.error("Error fetching KYC stats:", error);
        }
    };

    useEffect(() => {
        fetchKYCRequests();
            fetchKYCStats();        fetchKYCStats();
    }, []);

    const handleApprove = async (id) => {
        try {
            await client.put(`/kyc/${id}`, { status: 'approved' });
            fetchKYCRequests();
            fetchKYCStats();
            setSelectedKYC(null);
            alert(`KYC approved`);
        } catch (err) {
            console.error(err);
            alert("Failed to approve");
        }
    }

    const handleReject = async (id) => {
        try {
            await client.put(`/kyc/${id}`, { status: 'rejected' });
            fetchKYCRequests();
            fetchKYCStats();
            setSelectedKYC(null);
            alert(`KYC rejected`);
        } catch (err) {
            console.error(err);
            alert("Failed to reject");
        }
    }

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
            <div>
                <h2 className="text-3xl font-bold text-white">KYC Approvals</h2>
                <p className="text-gray-400 mt-1">Review and approve user verification requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Pending Review", value: stats.pendingReview, color: "yellow" },
                    { label: "Approved Today", value: stats.approvedToday, color: "green" },
                    { label: "Rejected Today", value: stats.rejectedToday, color: "red" },
                    { label: "Total Verified", value: stats.totalVerified, color: "blue" },
                ].map((stat, index) => (
                    <div key={index} className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KYC Requests List */}
                <div className="lg:col-span-1 bg-[#1f1f1f] rounded-xl p-6 border border-[#9131e7]/30">
                    <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {kycRequests.map((request) => (
                            <button
                                key={request._id}
                                onClick={() => setSelectedKYC(request)}
                                className={`w-full text-left p-4 rounded-lg transition-all ${selectedKYC?._id === request._id
                                    ? "bg-[#9131e7] text-white"
                                    : "bg-[#1a1a2e] text-white hover:bg-[#3f3f3f]"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#9131e7] to-[#e3459b] rounded-full flex items-center justify-center text-white font-bold">
                                        {(request.user?.name || request.name || "U").charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{request.user?.name || request.name}</p>
                                        <p className={`text-xs ${selectedKYC?._id === request._id ? "text-[#1f1f1f]" : "text-gray-400"}`}>
                                            {request.user?.email || request.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={selectedKYC?._id === request._id ? "text-[#1f1f1f]" : "text-gray-400"}>
                                        {request.documentType || "Verification"}
                                    </span>
                                    <span className={selectedKYC?._id === request._id ? "text-[#1f1f1f]" : "text-gray-500"}>
                                        {new Date(request.createdAt || request.submittedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* KYC Details */}
                <div className="lg:col-span-2 bg-[#1f1f1f] rounded-xl p-6 border border-[#9131e7]/30">
                    {selectedKYC ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white">KYC Review</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(selectedKYC._id)}
                                        className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedKYC._id)}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="bg-[#1a1a2e] rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3">Personal & Identity Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Full Name</p>
                                        <p className="text-white font-medium">{selectedKYC.user?.name || selectedKYC.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Email</p>
                                        <p className="text-white font-medium">{selectedKYC.user?.email || selectedKYC.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Aadhar Number</p>
                                        <p className="text-white font-medium">{selectedKYC.aadharNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">PAN Number</p>
                                        <p className="text-white font-medium">{selectedKYC.panNumber || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-[#1a1a2e] rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3">Bank Account Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Account Name</p>
                                        <p className="text-white font-medium">{selectedKYC.bankDetails?.accountName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Bank Name</p>
                                        <p className="text-white font-medium">{selectedKYC.bankDetails?.bankName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Account Number</p>
                                        <p className="text-white font-medium">{selectedKYC.bankDetails?.accountNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">IFSC Code</p>
                                        <p className="text-white font-medium">{selectedKYC.bankDetails?.ifscCode || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-400 text-sm">Branch</p>
                                        <p className="text-white font-medium">{selectedKYC.bankDetails?.branch || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h4 className="text-white font-semibold mb-3">Uploaded Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Aadhar Front */}
                                    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#9131e7]/20">
                                        <p className="text-gray-400 text-sm mb-2">Aadhar Front</p>
                                        <div className="aspect-video bg-[#3f3f3f] rounded-lg overflow-hidden border border-[#444]">
                                            <img
                                                src={selectedKYC.documents.aadharFront || "/placeholder.svg"}
                                                alt="Aadhar Front"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    {/* Aadhar Back */}
                                    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#9131e7]/20">
                                        <p className="text-gray-400 text-sm mb-2">Aadhar Back</p>
                                        <div className="aspect-video bg-[#3f3f3f] rounded-lg overflow-hidden border border-[#444]">
                                            <img
                                                src={selectedKYC.documents.aadharBack || "/placeholder.svg"}
                                                alt="Aadhar Back"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    {/* PAN Card */}
                                    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#9131e7]/20">
                                        <p className="text-gray-400 text-sm mb-2">PAN Card</p>
                                        <div className="aspect-video bg-[#3f3f3f] rounded-lg overflow-hidden border border-[#444]">
                                            <img
                                                src={selectedKYC.documents.panCard || "/placeholder.svg"}
                                                alt="PAN Card"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    {/* Profile Photo */}
                                    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#9131e7]/20">
                                        <p className="text-gray-400 text-sm mb-2">Profile Photo (Selfie)</p>
                                        <div className="aspect-video bg-[#3f3f3f] rounded-lg overflow-hidden border border-[#444]">
                                            <img
                                                src={selectedKYC.documents.profilePhoto || "/placeholder.svg"}
                                                alt="Profile Photo"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    {/* Agreement */}
                                    {selectedKYC.documents.agreement && (
                                        <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#9131e7]/20">
                                            <p className="text-gray-400 text-sm mb-2">Agreement</p>
                                            <div className="aspect-video bg-[#3f3f3f] rounded-lg overflow-hidden border border-[#444]">
                                                <img
                                                    src={selectedKYC.documents.agreement || "/placeholder.svg"}
                                                    alt="Agreement"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Reason (Optional) */}
                            <div className="bg-[#1a1a2e] rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-2">Admin Notes / Rejection Reason</h4>
                                <textarea
                                    className="w-full px-4 py-3 bg-[#9131e7]/30 text-white rounded-lg border border-[#4f4f4f] focus:border-[#9131e7] focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="Enter notes or rejection reason..."
                                ></textarea>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-bold text-white mb-2">No KYC Selected</h3>
                            <p className="text-gray-400">Select a KYC request from the list to review</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
