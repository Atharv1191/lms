import React, { useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill'; // Corrected the import
import { assets } from '../../assets/assets';

const AddCourse = () => {
  const quilRef = useRef(null);
  const editorRef = useRef(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLectureToChapter = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, { ...lectureDetails }],
          };
        }
        return chapter;
      })
    );
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
    setShowPopup(false);
  };

  useEffect(() => {
    if (!quilRef.current && editorRef.current) {
      quilRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  return (
    <div className='h-screen overflow-auto flex flex-col items-start justify-start md:p-8 p-4'>
      <form className='flex flex-col gap-6 max-w-lg w-full text-gray-600'>
        <div>
          <label className='block text-sm font-medium mb-1'>Course Title</label>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type course title here'
            className='outline-none w-full md:py-2.5 py-2 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>

        <div className='flex flex-col'>
          <label className='block text-sm font-medium mb-1'>Course Description</label>
          <div ref={editorRef} className='min-h-[150px] border border-gray-300 rounded-md'></div>
        </div>

        <div className='flex flex-col md:flex-row gap-4 items-center'>
          <div className='w-full'>
            <label className='block text-sm font-medium mb-1'>Course Price</label>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              placeholder='0'
              className='outline-none w-full md:w-28 md:py-2.5 py-2 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div className='w-full'>
            <label className='block text-sm font-medium mb-1'>Course Thumbnail</label>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3 cursor-pointer'>
              <img
                src={assets.file_upload_icon}
                alt='Upload Icon'
                className='p-3 bg-blue-500 rounded text-white'
              />
              <input
                type='file'
                id='thumbnailImage'
                onChange={(e) => setImage(e.target.files[0])}
                accept='image/*'
                hidden
              />
              {image && (
                <img
                  className='max-h-20 rounded-md'
                  src={URL.createObjectURL(image)}
                  alt='Course Thumbnail'
                />
              )}
            </label>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <p>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type='number'
            placeholder='0'
            min={0} // Corrected the min value for discount
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
            required
          />
        </div>

        {/* Adding Chapters & Lectures */}
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div className='bg-white border rounded-lg mb-4' key={chapterIndex}>
              <div className='flex justify-between items-center p-4 border-b'>
                <div className='flex items-center'>
                  <img
                    className={`mr-2 cursor-pointer transition-all ${
                      chapter.collapsed && '-rotate-90'
                    }`}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=''
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                  />
                  <span className='font-semibold'>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <span className='text-gray-500'>
                  {chapter.chapterContent.length} Lectures
                </span>
                <img
                  onClick={() => handleChapter('remove', chapter.chapterId)}
                  className='cursor-pointer'
                  src={assets.cross_icon}
                  alt=''
                />
              </div>
              {!chapter.collapsed && (
                <div className='p-4'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className='flex justify-between items-center mb-2'>
                      <span>
                        {lectureIndex + 1} - {lecture.lectureDuration} mins -{' '}
                        <a href={lecture.lectureUrl} target='_blank' className='text-blue-500'>
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        src={assets.cross_icon}
                        alt=''
                        className='cursor-pointer'
                      />
                    </div>
                  ))}
                  <div
                    onClick={() => handleLecture('add', chapter.chapterId)}
                    className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2'
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
          <div
            onClick={() => handleChapter('add')}
            className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer'
          >
            + Add Chapter
          </div>
          {showPopup && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
              <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>
                <div className='mb-2'>
                  <p>Lecture Title</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-1 px-2'
                    value={lectureDetails.lectureTitle}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                    }
                  />
                </div>
                <div className='mb-2'>
                  <p>Duration (minutes)</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-1 px-2'
                    value={lectureDetails.lectureDuration}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                    }
                  />
                </div>
                <div className='mb-2'>
                  <p>Lecture URL</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-1 px-2'
                    value={lectureDetails.lectureUrl}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                    }
                  />
                </div>
                <div className='flex gap-2 my-4'>
                  <p>Is Preview Free?</p>
                  <input
                    type='checkbox'
                    className='mt-1 scale-125'
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        isPreviewFree: e.target.checked,
                      })
                    }
                  />
                </div>
                <button
                  onClick={addLectureToChapter} // Added the onClick event to add the lecture
                  className='w-full bg-blue-400 text-white px-4 py-2 rounded'
                  type='button'
                >
                  Add
                </button>
                <img
                  onClick={() => setShowPopup(false)}
                  src={assets.cross_icon}
                  alt='Close'
                  className='absolute top-4 right-4 w-4 cursor-pointer'
                />
              </div>
            </div>
          )}
        </div>

        <button type='submit' className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
