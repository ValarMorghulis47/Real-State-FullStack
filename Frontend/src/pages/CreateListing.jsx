import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

export default function CreateListing() {
  const { register, watch, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState([]);
  const [loading, setLoading] = useState(false);

  const files = watch('property');
  useEffect(() => {
    if (files && files.length > 2) {
      setErrorMessage('You can only upload up to 2 images');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return;
    }
    if (files && files.length > 0 && files.length < 3) {
      setFileName(Array.from(files).map(file => file.name));
    }
  }, [files]);

  const createProperty = async (data2) => {
    try {
      if (data2.property.length < 1)
        return setError('You must upload at least one image');
      if (data2.regularPrice < data2.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      const formData = new FormData();
      formData.append('title', data2.title);
      formData.append('description', data2.description);
      formData.append('address', data2.address);
      if (data2.discountPrice) {
        formData.append('discountPrice', data2.discountPrice);
      }
      formData.append('regularPrice', data2.regularPrice);
      formData.append('beds', data2.beds);
      formData.append('baths', data2.baths);
      formData.append('offer', data2.offer);
      formData.append('parking', data2.parking);
      formData.append('furnished', data2.furnished);
      if (data2.sell) {
        formData.append('sell',data2.sell);
      }
      if (data2.rent) {
        formData.append('rent',data2.rent);
      }
      // Append images to formData
      for (let i = 0; i < data2.property.length; i++) {
        formData.append(`property`, data2.property[i]);
      }
      const res = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/properties/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error.message);
        return;
      }
      const data = await res.json();
      navigate(`/listing/${data.data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit(createProperty)} className='flex flex-col sm:flex-row gap-4' encType='multipart/form-data'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Title'
            className='border p-3 rounded-lg'
            id='title'
            maxLength='62'
            minLength='10'
            {...register('title')}
            defaultValue={formData.name}
          />
          <textarea
            type='text'
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            {...register('description')}
            defaultValue={formData.description}
          />
          <input
            type='text'
            placeholder='Address'
            className='border p-3 rounded-lg'
            id='address'
            {...register('address')}
            defaultValue={formData.address}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='sale'
                className='w-5'
                {...register('sell')}
                defaultChecked={formData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='rent'
                className='w-5'
                {...register('rent')}
                defaultChecked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5'
                {...register('parking')}
                defaultChecked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5'
                {...register('furnished')}
                defaultChecked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5'
                {...register('offer')}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    offer: e.target.checked,
                  });
                }}
                defaultChecked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                {...register('beds')}
                defaultValue={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bathrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                {...register('baths')}
                defaultValue={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='regularPrice'
                min='50'
                max='10000000'
                required
                className='p-3 border border-gray-300 rounded-lg'
                {...register('regularPrice')}
                defaultValue={formData.regularPrice}
              />
              <div className='flex flex-col items-center'>
                <p>Regular price</p>
                {formData.type === 'rent' && (
                  <span className='text-xs'>($ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  id='discountPrice'
                  min='0'
                  max='10000000'
                  required
                  className='p-3 border border-gray-300 rounded-lg'
                  {...register('discountPrice')}
                  defaultValue={formData.discountPrice}
                />
                <div className='flex flex-col items-center'>
                  <p>Discounted price</p>

                  {formData.type === 'rent' && (
                    <span className='text-xs'>($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <div className='flex gap-4 justify-center'>
            <label htmlFor="property">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                fill="currentColor"
                className="bi bi-camera cursor-pointer mx-auto"
                viewBox="0 0 16 16"
              >
                <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
              </svg>
            </label>
            <input type="file" id="property" style={{ display: "none" }} {...register("property")} multiple />
          </div>
          <div className='flex justify-center'>
            {fileName.map((name, index) => (
              <p key={index} className='ml-6'>{name}</p>
            ))}
          </div>
          {errorMessage && <p className='text-red-700 text-sm text-center'>{errorMessage}</p>}
          <button
            disabled={loading}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}
