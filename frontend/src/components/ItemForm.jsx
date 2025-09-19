import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createItem, updateItem } from '../utils/api.js';

const ItemForm = ({ item, onCancel, onSuccess }) => {
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm();
  const [status, setStatus] = useState(item?.status || 'IN');

  useEffect(() => {
    if (item) {
      Object.entries(item).forEach(([key, value]) => {
        if (key === 'calibrationStart' || key === 'calibrationExpiry') {
          setValue(key, value ? new Date(value).toISOString().split('T')[0] : '');
        } else if (key === 'status') {
          setValue(key, value || 'IN');
          setStatus(value || 'IN');
        } else if (key !== 'certificate') {
          setValue(key, value || '');
        }
      });
    } else {
      reset({ status: 'IN', assignedProject: '' });
      setStatus('IN');
    }
  }, [item, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'certificate' && value && value[0]) {
          formData.append(key, value[0]);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (item) {
        await updateItem(item.id, formData);
      } else {
        await createItem(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error submitting item:', err);
    }
  };

  const handleCancel = () => {
    reset({
      id: '',
      assetId: '',
      name: '',
      category: '',
      subCategory: '',
      description: '',
      model: '',
      hsCode: '',
      unitPrice: '',
      calibrationType: '',
      calibrationStart: '',
      calibrationExpiry: '',
      certificate: null,
      status: 'IN'
    });
    setStatus('IN');
    onCancel();
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
      <h1 className='text-2xl font-bold'>{item ? 'Edit Item' : 'Create Item'}</h1>

      <input type='text' placeholder='Serial number' {...register('serialNo')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Asset ID' {...register('id', { required: true })} className='bg-gray-100 px-2 py-1 border rounded-md' disabled={!!item} />
      <input type='text' placeholder='Name' {...register('name', { required: true })} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Category' {...register('category')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Sub Category' {...register('subCategory')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Description' {...register('description')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Model' {...register('model')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Manufacturer' {...register('manufacturer')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='HS Code' {...register('hsCode')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      {/* Warehouse Dropdown */}
      <input type='text' placeholder='Warehouse' {...register('warehouse')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='number' placeholder='Unit Price' {...register('unitPrice')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='text' placeholder='Assigned Project' {...register('assignedProject')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      {/* Calibration Type Dropdown */}
      <select {...register('calibrationType')} className='bg-gray-100 px-2 py-1 border rounded-md' defaultValue="">
        <option value="" disabled>Select Calibration Type</option>
        <option value="Calibration">Calibration</option>
        <option value="Inspection">Inspection</option>
      </select>
      <input type='date' placeholder='Calibration Start' {...register('calibrationStart')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='date' placeholder='Calibration Expiry' {...register('calibrationExpiry')} className='bg-gray-100 px-2 py-1 border rounded-md' />
      <input type='file' {...register('certificate')} className='border px-2 py-1 rounded-md' accept='application/pdf,image/*' />

      <div className='flex gap-3'>
        <button type='submit' className='bg-cyan-200 hover:bg-cyan-300 py-1 px-2 border rounded-lg cursor-pointer'>{item ? 'Update' : 'Create'}</button>
        <button type='button' onClick={handleCancel} className='bg-gray-50 hover:bg-gray-100 py-1 px-2 border rounded-lg cursor-pointer'>Cancel</button>
      </div>
    </form>
  );
};

export default ItemForm;
