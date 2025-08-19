import { useState, useEffect } from "react";
import {
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  XCircleIcon,
} from "lucide-react";
import { api } from "../utils/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function WasteCollectorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState({
    upcomingCollections: [],
    completedCollections: [],
    stats: {
      totalCollections: 0,
      totalEarnings: "₹0",
      averageRating: 0,
      totalWasteCollected: "0 kg",
    },
  });
  const { user } = useLogin();
  const collectorId = user?.userId;

  useEffect(() => {
    if (!collectorId) return;

    const fetchDashboardData = async () => {
      try {
        const response = await api.get(`/pickup/collector-requests/${collectorId}`);
        const requests = response.data;

        const upcomingCollections = requests
          .filter((req) => req.status === "accepted")
          .map((req) => ({
            id: req._id,
            date: new Date(req.createdAt).toLocaleDateString(),
            time: req.preferredTimeSlot,
            location: req.address,
            user: {
              name: req.user?.name || "User",
              contact: req.user?.phone || "Not available",
            },
            wasteType: req.wasteType,
            quantity: `${req.quantity} kg`,
          }));

        const completedCollections = requests
          .filter((req) => req.status === "completed")
          .map((req) => ({
            id: req._id,
            date: new Date(req.completedAt || req.createdAt).toLocaleDateString(),
            location: req.address,
            wasteType: req.wasteType,
            quantity: `${req.quantity} kg`,
            earnings: `₹${req.quantity * 15}`,
            rating: req.rating || "Not rated",
          }));

        const totalCollections = completedCollections.length;
        const totalEarnings = completedCollections.reduce(
          (sum, item) => sum + parseInt(item.earnings.replace("₹", "")),
          0
        );
        const totalWasteCollected = completedCollections.reduce(
          (sum, item) => sum + parseFloat(item.quantity),
          0
        );
        const ratedCollections = completedCollections.filter(
          (item) => item.rating !== "Not rated"
        );
        const averageRating =
          ratedCollections.length > 0
            ? (
              ratedCollections.reduce((sum, item) => sum + item.rating, 0) /
              ratedCollections.length
            ).toFixed(1)
            : 0;

        setDashboardData({
          upcomingCollections,
          completedCollections,
          stats: {
            totalCollections,
            totalEarnings: `₹${totalEarnings}`,
            averageRating,
            totalWasteCollected: `${totalWasteCollected} kg`,
          },
        });
      } catch (error) {
        console.error("Error fetching collector data:", error);
      }
    };

    fetchDashboardData();
  }, [collectorId]);

  // Chart data
  const wasteTypes = ["Plastic", "Paper", "Glass", "Metal", "Organic"];
  const initialData = new Array(wasteTypes.length).fill(0);

  const typeQuantities = dashboardData.completedCollections.reduce((acc, item) => {
    const typeIndex = wasteTypes.findIndex(
      (label) => label.toLowerCase() === item.wasteType.toLowerCase()
    );
    if (typeIndex >= 0) {
      acc[typeIndex] += parseFloat(item.quantity);
    }
    return acc;
  }, [...initialData]);

  const chartData = {
    labels: wasteTypes,
    datasets: [
      {
        data: typeQuantities,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  const filteredHistory = dashboardData.completedCollections.filter((history) =>
    history.wasteType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 min-h-screen p-8 pt-28">
      {/* Dashboard Header */}
      <div className="text-center text-white mb-8">
        <h1 className="text-4xl font-bold">Collector Dashboard</h1>
        <p className="text-lg mt-2">
          Overview of your waste collection activities
        </p>
      </div>

      {/* Upcoming Collections - Now at the top */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2 text-green-500" />
          Upcoming Collections
        </h2>
        {dashboardData.upcomingCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.upcomingCollections.map((collection, index) => (
              <div key={index} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                <p className="font-medium text-lg">{collection.date} at {collection.time}</p>
                <p className="text-sm mt-2"><span className="font-semibold">Location:</span> {collection.location}</p>
                <p className="text-sm"><span className="font-semibold">Waste Type:</span> {collection.wasteType}</p>
                <p className="text-sm"><span className="font-semibold">Quantity:</span> {collection.quantity}</p>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm"><span className="font-semibold">User:</span> {collection.user.name}</p>
                  <p className="text-sm"><span className="font-semibold">Contact:</span> {collection.user.contact}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming collections scheduled</p>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <TruckIcon className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mt-2">Total Collections</h3>
          <p className="text-3xl font-bold">{dashboardData.stats.totalCollections}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mt-2">Total Earnings</h3>
          <p className="text-3xl font-bold">{dashboardData.stats.totalEarnings}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mt-2">Average Rating</h3>
          <p className="text-3xl font-bold">{dashboardData.stats.averageRating}/5</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <DocumentTextIcon className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mt-2">Waste Collected</h3>
          <p className="text-3xl font-bold">{dashboardData.stats.totalWasteCollected}</p>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Waste Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Waste Type Distribution</h2>
          <Pie data={chartData} />
        </div>

        {/* Completed Collections */}
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2 text-green-500" />
            Completed Collections
          </h2>

          {/* Search Bar */}
          <div className="mb-6 flex items-center border p-3 rounded-lg">
            <input
              type="text"
              placeholder="Search by Waste Type"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full focus:outline-none"
            />
          </div>

          {/* Collections History */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Location</th>
                  <th className="py-2 px-4 text-left">Waste Type</th>
                  <th className="py-2 px-4 text-left">Quantity</th>
                  <th className="py-2 px-4 text-left">Earnings</th>
                  <th className="py-2 px-4 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((collection, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{collection.date}</td>
                      <td className="py-2 px-4">{collection.location}</td>
                      <td className="py-2 px-4">{collection.wasteType}</td>
                      <td className="py-2 px-4">{collection.quantity}</td>
                      <td className="py-2 px-4 font-medium">{collection.earnings}</td>
                      <td className="py-2 px-4">
                        {typeof collection.rating === 'number' ? (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < collection.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        ) : (
                          collection.rating
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center">
                      No completed collections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default CollectorDashboard;