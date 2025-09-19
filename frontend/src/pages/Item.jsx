import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { viewItem, toggleItemStatus,markReceived } from "../utils/api";
import Axess from '../assets/AxessLogo.png'

const Item = () => {
  const { assetId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [location, setLocation] = useState("");
  const [project, setProject] = useState("");
  // Fetch item details
  useEffect(() => {
    setLoading(true);
    setError(null);
    viewItem(assetId)
      .then((data) => {
        setItem(data.data.item);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch item.");
        setLoading(false);
      });
  }, [assetId]);

  // Handler for toggling status
  const handleToggleStatus = async () => {
    if (!item) return;
    // Prevent status change unless received is true
    if (!item.received) {
      alert("Item must be marked as received before changing status.");
      return;
    }
    setIsUpdating(true);
    let newStatus = item.status === "IN" ? "OUT" : "IN";

    // Prevent marking as OUT without location and project
    if (
      newStatus === "OUT" &&
      (location.trim() === "" || project.trim() === "")
    ) {
      alert("Please provide both location and project to mark as OUT.");
      setIsUpdating(false);
      return;
    }

    const payload =
      newStatus === "OUT"
        ? {
            status: newStatus,
            location: location || null,
            project: project || null,
          }
        : { status: newStatus };

    try {
      await toggleItemStatus(assetId, payload);
      // Refetch item after update
      const updated = await viewItem(assetId);
      setItem(updated.data.item);
      setLocation("");
      setProject("");
    } catch (err) {
      alert("Failed to update status.");
    }
    setIsUpdating(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Loading item...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Item not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-4 px-2">
          <img src={Axess} className='h-[100px] w-[200px]' alt="Axess Logo" />
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex  items-center gap-2">
          <span className="text-xs text-gray-400">Asset ID:</span>
          <span className="font-bold text-lg text-gray-700">{item.id}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-gray-900">{item.name}</span>
          <span className="text-sm text-gray-600">
            {item.category} -&gt; {item.subCategory}
          </span>
          <span className="text-sm text-gray-600">
            Model: <span className="font-medium">{item.model}</span>
          </span>
          <span className="text-sm text-gray-600">
            Manufacturer: <span className="font-medium">{item.manufacturer}</span>
          </span>
         {item.status ==='IN'&&( <span className="text-sm text-gray-600">
            Warehouse: <span className="font-medium">{item.warehouse}</span>
          </span>)}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Calibration Type</span>
          <span className="text-sm text-gray-700">{item.calibrationType || "N/A"}</span>
          <span className="text-xs text-gray-400 mt-2">Calibration Start</span>
          <span className="text-sm text-gray-700">{item.calibrationStart ? new Date(item.calibrationStart).toLocaleDateString() : "N/A"}</span>
          <span className="text-xs text-gray-400 mt-2">Calibration Expiry</span>
          <span className="text-sm text-gray-700">{item.calibrationExpiry ? new Date(item.calibrationExpiry).toLocaleDateString() : "N/A"}</span>
        </div>
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs text-gray-400">Status:</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${item.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.status}
          </span>
          {/* Received status */}
          <span className="text-xs text-gray-400 ml-4">Received:</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${item.received ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.received ? "Yes" : "No"}
          </span>
        </div>
        {/* Certificate Section */}
        {item.certificateUrl && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Certificate</span>
            <div className="w-full rounded overflow-hidden border border-gray-200 bg-gray-50">
              <iframe
                src={item.certificateUrl}
                title="Certificate"
                className="w-full h-40 md:h-56"
                frameBorder="0"
              ></iframe>
            </div>
            <a
              href={item.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-xs underline mt-1"
            >
              Download Certificate
            </a>
          </div>
        )}
        {/* QR Code Preview */}
        {item.qrCodeUrl && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">QR Code</span>
            <img
              src={item.qrCodeUrl}
              alt="QR Code"
              className="w-24 h-24 object-contain bg-white border border-gray-200 rounded"
            />
          </div>
        )}
        {/* Toggle Status Section */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating || (item.status === "IN" ? false : false)}
            className={`w-full py-2 rounded text-white font-semibold transition ${
              item.status === "IN"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isUpdating
              ? "Updating..."
              : item.status === "IN"
                ? "Mark as OUT"
                : "Mark as IN"}
          </button>
          {/* Show location/project inputs if toggling to OUT */}
          {item.status === "IN" && (
            <div className="flex flex-col gap-2 mt-1">
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isUpdating}
              />
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                disabled={isUpdating}
              />
              <span className="text-xs text-gray-400">
                Enter location and project to mark OUT
              </span>
            </div>
          )}
        </div>
        {/* Mark Received Button */}
        { !item.received && (
          <button
            onClick={async () => {
              try {
                await markReceived(item.id || item.assetId);
                // Refetch item after marking as received
                const updated = await viewItem(assetId);
                setItem(updated.data.item);
              } catch (err) {
                setError("Failed to mark as received.");
              }
            }}
            className="mt-2 w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Mark as Received
          </button>
        )}
    
      </div>
    </div>
  );
};

export default Item;