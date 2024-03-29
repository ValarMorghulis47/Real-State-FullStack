import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInFailure,
  toggleLoggedIn
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const { loading, error } = useSelector((state) => state.user);
  const [showMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit} = useForm()
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signin = async (data1) => {
    try {
      dispatch(signInStart());
      const userData = await fetch(`${import.meta.env.VITE_BASE_URI}/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data1),
        credentials: 'include'
      });
      const data = await userData.json();
      if (!userData.ok) {
        dispatch(signInFailure());
        setErrorMessage(data.error.message);
        return;
      }
      dispatch(toggleLoggedIn());
      navigate('/');
    } catch (error) {
      dispatch(signInFailure());
      setErrorMessage(error.message);
    }
  };
  useEffect(() => {
    if (error) {
        setShowMessage(true);
        const timer = setTimeout(() => {
            setShowMessage(false);
        }, 3000); // Change this value to adjust the time

        return () => clearTimeout(timer); // This will clear the timer if the component unmounts before the timer finishes
    }
}, [error]);
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
      <form onSubmit={handleSubmit(signin)} className='flex flex-col gap-4'>
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          id='email'
          {...register("email", {
            required: true,
            validate: {
              matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                "Email address must be a valid address",
            }
          })}
        />
        <input
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          id='password'
          {...register("password")}
        />

        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Dont have an account?</p>
        <Link to={'/sign-up'}>
          <span className='text-blue-700'>Sign up</span>
        </Link>
      </div>
      {showMessage && error && <p className='text-red-500 mt-5'>{errorMessage}</p>}
    </div>
  );
}
