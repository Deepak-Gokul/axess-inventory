import ItemForm from '../components/ItemForm'
import ItemTable from '../components/ItemTable'
import { useEffect, useState, useRef } from 'react'
import { createBulk, getAllItems } from '../utils/api.js'
import Axess from '../assets/AxessLogo.png'
const Dashboard = () => {
  const [create, setCreate] = useState(false)
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading,setUploading] = useState(false)
  
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      const res = await getAllItems();
      setItems(res.data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [])

  const handleEdit = (item) => {
    setEditing(item)
    setCreate(true)
  }

  const handleAddNew = () => {
    setEditing(null); // ensure no previous item is set
    setCreate(true);
  }

  const handleBulkUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset file input
      fileInputRef.current.click();
    }
  }

  const handleFileChange = async (event) => {
    setUploading(true)
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('sheet', file);
      const res = await createBulk(formData);
      alert(`${res.data.created || 0} items created successfully.`);
      setUploading(false)
      fetchItems();
    } catch (error) {
      console.error("Bulk upload failed:", error);
      alert("Bulk upload failed. Please try again.");
      setUploading(false)
    }
  }

  // Filter items based on searchTerm
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // Check all relevant fields (may be undefined)
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.id && String(item.id).toLowerCase().includes(term)) ||
      (item.serialNo && String(item.assetId).toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(term)) ||
      (item.assignedProject && item.assignedProject.toLowerCase().includes(term))||
      (item.calibrationType&&item.calibrationType.toLowerCase().includes(term))||
      (item.warehouse&&item.warehouse.toLowerCase().includes(term))
    );
  });

  return (
    <div className='bg-gradient-to-r from-cyan-50 from-25% via-cyan-100 via-75% to-emerald-100 to-100% min-h-screen'>
      <nav className='flex justify-around items-center-safe w-full  pb-4'>
        <img src={Axess} className='h-[100px] w-[200px]' alt="Axess Logo" />
        {/* <h1 className=' text-4xl font-bold'>Axess Inventory</h1> */}
        <input
          type="text"
          placeholder='Search'
          className=' w-[400px] px-3 py-1 bg-gray-50 border rounded-xl'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleAddNew}
          className=' bg-blue-500 border border-black text-white px-2 py-1 rounded-xl cursor-pointer  hover:bg-blue-700'>Add Item</button>
        <button
          onClick={handleBulkUploadClick}
          className=' bg-blue-500 border border-black text-white px-2 py-1 rounded-xl cursor-pointer ml-2 hover:bg-blue-700'>Bulk Upload</button>
        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </nav>
      <div className='flex justify-center'>

        {create && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <ItemForm
                key={editing ? editing.assetId : 'new'} // remount form on change
                item={editing}
                onCancel={() => setCreate(false)}
                onSuccess={() => {
                  setCreate(false);
                  fetchItems();
                }}
              />
            </div>
          </div>
        )}
        <ItemTable items={filteredItems} refresh={fetchItems} onEdit={handleEdit} />
      </div>
      {uploading && (<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-2xl text-white font-extrabold'>
        Creating Items....
      </div>)}
    </div>
  )
}

export default Dashboard