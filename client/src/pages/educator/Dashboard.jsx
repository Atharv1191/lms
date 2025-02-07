import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets, dummyDashboardData } from '../../assets/assets'
import Loading from '../../components/student/Loading'

const Dashboard = () => {
  const { currency } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    // Simulating the fetching of data
    setDashboardData(dummyDashboardData)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 p-4 pb-0 pt-8 bg-gray-50'>
      <div className='space-y-5 w-full'>
        <div className='flex flex-wrap gap-5 items-center justify-start'>
          {/* Enrollment Card */}
          <div className='flex items-center gap-3 shadow-lg border border-blue-500 p-6 w-full md:w-56 rounded-xl bg-white'>
            <img src={assets.patients_icon} alt="students-icon" className='w-12 h-12' />
            <div>
              <p className='text-3xl font-semibold text-gray-700'>
                {dashboardData.enrolledStudents ? dashboardData.enrolledStudents.length : 0}
              </p>
              <p className='text-sm text-gray-500'>Total Enrollments</p>
            </div>
          </div>

          {/* Courses Card */}
          <div className='flex items-center gap-3 shadow-lg border border-blue-500 p-6 w-full md:w-56 rounded-xl bg-white'>
            <img src={assets.appointments_icon} alt="courses-icon" className='w-12 h-12' />
            <div>
              <p className='text-3xl font-semibold text-gray-700'>{dashboardData.totalCourses}</p>
              <p className='text-sm text-gray-500'>Total Courses</p>
            </div>
          </div>

          {/* Earnings Card */}
          <div className='flex items-center gap-3 shadow-lg border border-blue-500 p-6 w-full md:w-56 rounded-xl bg-white'>
            <img src={assets.earning_icon} alt="earnings-icon" className='w-12 h-12' />
            <div>
              <p className='text-3xl font-semibold text-gray-700'>{currency} {dashboardData.totalEarnings}</p>
              <p className='text-sm text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className='pb-4 text-lg font-medium'>Latest Enrollments</h2>
          <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='table-fixed md:table-auto w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                <th className='px-4 py-3 font-semibold'>Student Name</th>
                <th className='px-4 py-3 font-semibold'>Course Title</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {dashboardData.enrolledStudentsData.map((item,index)=>(
                <tr className='border-b border-gray-500/20' key={index}>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>
                    {index+1}
                  </td>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                    <img className='w-9 h-9 rounded-full' src={item.student.imageUrl} alt ="profile" />
                    <span className='truncate'>{item.student.name}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                </tr>
              ))}

            </tbody>

            
          </table>

          </div>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard
