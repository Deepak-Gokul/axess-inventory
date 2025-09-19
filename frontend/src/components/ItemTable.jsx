import React, { useState, useEffect, useRef } from 'react';
import { deleteItem,getItemLogs} from '../utils/api';
import { AiOutlineDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { BsCheckCircle } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ItemTable({ items, refresh, onEdit }) {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [showLogs,setShowLogs] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null);
  const [logs,setLogs] = useState([])
  const [selectedItems, setSelectedItems] = useState([]);

  const [displayItems, setDisplayItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const isExpiringSoon = React.useCallback((item) => {
    if (!item.calibrationExpiry) return false;
    const expiryDate = new Date(item.calibrationExpiry);
    const today = new Date();
    const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return diffDays <= 90;
  }, []);

  // Get unique warehouse names from items
  const warehouseOptions = React.useMemo(() => {
    const set = new Set();
    items.forEach(item => {
      if (item.warehouse) set.add(item.warehouse);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      let statusMatch = true;
      if (statusFilter === 'IN') {
        statusMatch = item.status === 'IN';
        if (warehouseFilter !== 'ALL') {
          statusMatch = statusMatch && item.warehouse === warehouseFilter;
        }
      } else if (statusFilter === 'OUT') {
        statusMatch = item.status === 'OUT';
      }
      // statusFilter === 'ALL' shows all
      const expiryMatch = !expiringSoon || (item.calibrationExpiry && isExpiringSoon(item));
      return statusMatch && expiryMatch;
    });
  }, [items, statusFilter, warehouseFilter, expiringSoon, isExpiringSoon]);

  useEffect(() => {
    setDisplayItems(filteredItems.slice(0, pageSize));
    setHasMore(filteredItems.length > pageSize);
  }, [filteredItems]);

  const fetchMoreItems = () => {
    if (!hasMore) return;
    setDisplayItems(prev => {
      const start = prev.length;
      const newItems = filteredItems.slice(start, start + pageSize);
      if (newItems.length === 0) setHasMore(false);
      if (prev.length + newItems.length >= filteredItems.length) setHasMore(false);
      return [...prev, ...newItems];
    });
  };

  useEffect(() => {
    const expiringItems = items.filter(item => {
      if (!item.calibrationExpiry) return false;
      const expiryDate = new Date(item.calibrationExpiry);
      const today = new Date();
      const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);
      return diffDays <= 90;
    });

    if (expiringItems.length > 0) {
      expiringItems.forEach(item => {
        toast.error(`Item ${item.name} (ID: ${item.id}) is expiring within 90 days!`, {
          duration: 5000
        });
      });
    }
  }, [items]);

  const handleViewLogs = async (assetId) => {
    try {
      const res = await getItemLogs(assetId);  // ✅ use api.js wrapper
      if (res.data.success) {
        setLogs(res.data.logs);
        setSelectedItem(assetId);
        setShowLogs(true);
      }
    } catch (err) {
      console.error("Error fetching logs", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      setLoadingId(id);
      await deleteItem(id);
      refresh();
    } catch (err) {
      console.error('Error deleting item:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => {
      const newSelected = prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id];
      console.log("Selected Items:", newSelected);
      return newSelected;
    });
  };

  const handleGenerateCIPL = () => {
    // filter actual item data from ids
    const selected = items.filter(item => selectedItems.includes(item.id));
    console.log("Sending to CIPL:", selected);

    navigate("/cipl", {
      state: { selectedItems: selected }
    });
  };
  return (
    <div className='w-full mt-2 '>
    <Toaster position="top-right" />
    <div className="flex gap-4 mx-2 mb-4">
      <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setWarehouseFilter('ALL'); }} className="border px-2 py-1 cursor-pointer bg-white rounded">
        <option value="ALL">All Status</option>
        <option value="IN">In Warehouse</option>
        <option value="OUT">Out of Warehouse</option>
      </select>
      {statusFilter === 'IN' && (
        <select value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)} className="border cursor-pointer px-2 py-1 rounded">
          <option value="ALL">All Warehouses</option>
          {warehouseOptions.map(wh => (
            <option key={wh} value={wh}>{wh}</option>
          ))}
        </select>
      )}
      <label className="flex items-center gap-2">
        <input type="checkbox" className='cursor-pointer' checked={expiringSoon} onChange={(e) => setExpiringSoon(e.target.checked)} />
        Expiring Soon 
      </label>
    </div>

    <div className="mx-2 mb-4">
      <button onClick={handleGenerateCIPL} className="px-4 cursor-pointer py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Generate CIPL
      </button>
    </div>

      <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
        <table className="w-full border-collapse border bg-white border-gray-300 text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={displayItems.length > 0 && selectedItems.length === displayItems.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = displayItems.map(item => item.id);
                      setSelectedItems(allIds);
                      console.log("Selected Items:", allIds);
                    } else {
                      setSelectedItems([]);
                      console.log("Selected Items: []");
                    }
                  }}
                />
              </th>
              <th className="border p-2">S.No</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Serial Number</th>
              <th className="border p-2">Asset ID</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Sub Category</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Model</th>
              <th className="border p-2">Manufacturer</th>
              <th className="border p-2">HS Code</th>
              <th className="border p-2">Warehouse</th>
              <th className="border p-2">Unit Price</th>
              <th className="border p-2">Calibration Type</th>
              <th className="border p-2">Calibration Start</th>
              <th className="border p-2">Calibration Expiry</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Assigned Project</th>
              <th className="border p-2">QR Code</th>
              <th className="border p-2">Certificate</th>
              <th className="border p-2">Received</th>
              <th className="border p-2">Logs</th>
              <th className="border p-2">Edit</th>
              <th className="border p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan="22" className="text-center p-4 text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              displayItems.map((item, index) => (
              <tr key={item.id} className={isExpiringSoon(item) ? 'bg-red-100' : 'hover:bg-gray-50'} style={{ height: '60px' }}>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                  />
                </td>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.serialNo}</td>
                <td className="border p-2">{item.id}</td>
                <td className="border p-2">{item.category}</td>
                <td className="border p-2">{item.subCategory}</td>
                <td className="border p-2">{item.description}</td>
                <td className="border p-2">{item.model}</td>
                <td className="border p-2">{item.manufacturer}</td>
                <td className="border p-2">{item.hsCode}</td>
                <td className="border p-2">{item.warehouse}</td>
                <td className="border p-2">{item.unitPrice}</td>
                <td className="border p-2">{item.calibrationType}</td>
                <td className="border p-2">{item.calibrationStart ? new Date(item.calibrationStart).toLocaleDateString() : '-'}</td>
                <td className="border p-2">{item.calibrationExpiry ? new Date(item.calibrationExpiry).toLocaleDateString() : '-'}</td>
                <td className="border p-2">{item.status}</td>
                <td className="border p-2">{item.assignedProject || '-'}</td>
                <td className="border p-2 text-center">{item.qrCode ? <a href={`${import.meta.env.VITE_BACKEND_URL}/dashboard/download-qr/${item.id}`} download={`Item-${item.id}-${item.name}.png`} className="text-blue-600 hover:underline">Download</a> : <span className="text-gray-400">None</span>}</td>
                <td className="border p-2 text-center">{item.certificate ? <a href={item.certificate} className="text-blue-600 hover:underline">View</a> : <span className="text-gray-400">None</span>}</td>
                <td className="border p-2">{item.received === true ? <BsCheckCircle />: <ImCross />}</td>
                <td className="border p-2 text-center"><button onClick={() => handleViewLogs(item.id)} className="px-3 py-1 flex items-center gap-2 bg-blue-500 text-white text-xs rounded">View</button></td>
                <td className="border p-2 text-center"><button onClick={() => onEdit(item)} className="px-3 py-1 flex items-center gap-2 bg-yellow-500 text-white text-xs rounded"><CiEdit /></button></td>
                <td className="border p-2 text-center"><button onClick={() => handleDelete(item.id)} disabled={loadingId===item.id} className="px-3 py-1 bg-red-600 gap-2 cursor-pointer flex items-center text-white text-xs rounded disabled:opacity-50"><AiOutlineDelete /> {loadingId===item.id ? '...' : ''}</button></td>
              </tr>
              ))
            )}
          </tbody>
        </table>
        {hasMore && (
          <div id="load-more-trigger" className="text-center py-4 text-gray-500 cursor-pointer" onClick={fetchMoreItems}>
            Load More...
          </div>
        )}
      </div>
          {showLogs && (
            
        <div className="fixed inset-0 bg-opacity-100 flex flex-col items-center justify-center-safe">
           <div className="text-right">
              <button
                onClick={() => setShowLogs(false)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          <div className="bg-white rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Logs for {selectedItem}
            </h2>

            {logs.length > 0 ? (
              <ul className="space-y-2">
                {logs.map((log) => (
                  <li key={log.id} className="border p-3 rounded bg-gray-100 shadow-sm">
                    <p><strong>Action:</strong> {log.action}</p>
                    <p><strong>Location:</strong> {log.location || "N/A"}</p>
                    <p><strong>Project:</strong> {log.project || "N/A"}</p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No logs found for this item.</p>
            )}

           
          </div>
        </div>
      )}
    </div>
  );
}