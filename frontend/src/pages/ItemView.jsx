import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  viewItem} from '../utils/api';
import Axess from '../assets/AxessLogo.png'
const ItemView = () => {
   const { assetId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [assignedProject, setAssignedProject] = useState("");
  const [location, setLocation] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [role, setRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (navigator.onLine) {
      if (role === null) {
        setShowRoleModal(true);
      }
    } else {
      setRole('user');
    }
  }, [role]);

  const cacheCertificate = async (url) => {
    if ('caches' in window && url) {
      const cache = await caches.open('certificates-cache');
      const match = await cache.match(url);
      if (!match) {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) await cache.put(url, response.clone());
        } catch (err) {
          console.error('Error caching certificate:', err);
        }
      }
      const cachedMatch = await cache.match(url);
      setCertificateUrl(cachedMatch ? url : "");
    } else {
      setCertificateUrl("");
    }
  };

  useEffect(() => {
    if (role === 'user') {
      const fetchItem = async () => {
        try {
          const res = await viewItem(assetId);
          if (res?.data?.success) {
            const fetchedItem = res.data.item;
            setItem(fetchedItem);
            setStatus(fetchedItem.status);
            setAssignedProject(fetchedItem.assignedProject || "");
            setLocation(fetchedItem.location || "");

            if (fetchedItem.certificate) await cacheCertificate(fetchedItem.certificate);

            if ('caches' in window) {
              const cache = await caches.open('item-data-cache');
              await cache.put(`/api/items/${assetId}`, new Response(JSON.stringify(res.data)));
            }
                    } else {
            // Item not found online, remove from cache if exists
            if ('caches' in window) {
              const cache = await caches.open('item-data-cache');
              await cache.delete(`/api/items/${assetId}`);
            }
            setItem(null);
            setCertificateUrl("");
          }
        } catch {
          if ('caches' in window) {
            const cache = await caches.open('item-data-cache');
            const cachedRes = await cache.match(`/api/items/${assetId}`);
            if (cachedRes) {
              const data = await cachedRes.json();
              if (data?.item) {
                const cachedItem = data.item;
                setItem(cachedItem);
                setStatus(cachedItem.status);
                setAssignedProject(cachedItem.assignedProject || "");
                setLocation(cachedItem.location || "");
                if (cachedItem.certificate) await cacheCertificate(cachedItem.certificate);
              } else {
                setItem(null);
                setCertificateUrl("");
              }
            } else {
              setItem(null);
              setCertificateUrl("");
            }        } else {
            setItem(null);
            setCertificateUrl("");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [assetId, role]);

  if (showRoleModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-full mx-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Your Role</h2>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => {
                setRole('user');
                setShowRoleModal(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
            >
              User
            </button>
            <button
              onClick={() => {
                navigate(`/login?redirect=/item/${assetId}`);
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-center text-gray-600 text-lg font-medium">Loading...</div>;
  if (!item) return <div className="p-6 text-center text-red-500 text-lg font-semibold">Item not available offline.</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-gradient-to-br flex flex-col from-white via-gray-50 to-gray-100 shadow-lg rounded-xl mt-6">
      <img src={Axess} className='h-[100px] place-self-center w-[200px]' alt="Axess Logo" />
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-extrabold mb-4 text-gray-700 tracking-wide">{item.name}</h1>
        <div className="space-y-2 text-gray-700 text-base leading-relaxed">
          <p><span className="font-semibold text-gray-800">Asset ID:</span> {item.id}</p>
          <p><span className="font-semibold text-gray-800">Serial Number:</span> {item.serialNo}</p>
          <p><span className="font-semibold text-gray-800">Category:</span> {item.category|| '-'}</p>
          <p><span className="font-semibold text-gray-800">Sub Category:</span> {item.subCategory|| '-'}</p>
          <p><span className="font-semibold text-gray-800">Description:</span> {item.description|| '-'}</p>
          <p><span className="font-semibold text-gray-800">HS Code:</span> {item.hsCode || '-'}</p>
          <p><span className="font-semibold text-gray-800">Manufacturer:</span> {item.manufacturer|| '-'}</p>
          <p><span className="font-semibold text-gray-800">Warehouse:</span> {item.warehouse|| '-'}</p>
          <p><span className="font-semibold text-gray-800">Status:</span> {status}</p>
          <p><span className="font-semibold text-gray-800">Assigned Project:</span> {assignedProject || '-'}</p>
          <p><span className="font-semibold text-gray-800">Location:</span> {location || '-'}</p>
        </div>
      </div>

      <div className="my-6 bg-white rounded-lg shadow-md p-5">
        <h2 className="font-semibold text-xl mb-3 text-gray-900 border-b border-gray-200 pb-2">Certificate :</h2>
        {certificateUrl ? (
          <iframe
            src={certificateUrl}
            title="Certificate"
            width="100%"
            height="500px"
            className="border rounded-md shadow-sm"
          ></iframe>
        ) : (
          <p className="text-gray-500 italic">Certificate not available offline.</p>
        )}
      </div>
    </div>
  );
};

export default ItemView;