
import React from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation,  } from 'react-router-dom';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {

  const location = useLocation();
  const isCourseListPage = location.pathname.includes('/course-list');
  const {navigate,isEducator,backendUrl,setIsEducator,getToken} = useContext(AppContext)
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();
  const BecomeEducator = async()=>{
    try {
      if(isEducator){
        navigate('/educator')
        return;
      }
      const token = await getToken()
      const {data} = await axios.get(backendUrl +'/api/educator/update-role',{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        setIsEducator(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(data.message)
    }
  }
  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'
      }`}
    >
      <img onClick={()=>navigate('/')} src={assets.logo} alt="logo" className="w-20 lg:w-32 cursor-pointer" />
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        {isSignedIn && (
          <div className="flex items-center gap-5">
            <button onClick={BecomeEducator}>{isEducator?"Educator Dashboard":"Become Educator"}</button>
            <span>|</span>
            <Link to="/my-enrollments">My Enrollments</Link>
          </div>
        )}
        {isSignedIn ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Create Account
          </button>
        )}
      </div>
      {/* Mobile View */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        {isSignedIn && (
          <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
             <button onClick={BecomeEducator}>{isEducator?"Educator Dashboard":"Become Educator"}</button>
            <span>|</span>
            <Link to="/my-enrollments">My Enrollments</Link>
          </div>
        )}
        {isSignedIn ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="User Icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
