import React, { useContext, useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill'; // Corrected the import
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddCourse = () => {
  const { backendUrl, getToken } = useContext(AppContext);
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

  // const addLectureToChapter = () => {
  //   setChapters(
  //     chapters.map((chapter) => {
  //       if (chapter.chapterId === currentChapterId) {
  //         return {
  //           ...chapter,
  //           chapterContent: [...chapter.chapterContent, { ...lectureDetails }],
  //         };
  //       }
  //       return chapter;
  //     })
  //   );
  //   setLectureDetails({
  //     lectureTitle: '',
  //     lectureDuration: '',
  //     lectureUrl: '',
  //     isPreviewFree: false,
  //   });
  //   setShowPopup(false);
  // };
  const addLectureToChapter = () => {
    const newLecture = {
      ...lectureDetails,
      lectureId: uniqid(), // Assign a unique lecture ID
      lectureOrder: chapters.find((chapter) => chapter.chapterId === currentChapterId)
        .chapterContent.length + 1, // Set lecture order based on existing lectures in chapter
    };
  
    // Log the new lecture for debugging
    console.log("Adding new lecture to chapter:", newLecture);
  
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          };
        }
        return chapter;
      })
    );
  
    // Reset lecture details and close popup
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
    setShowPopup(false);
  };
  
  
  
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!image) {
        toast.error('Thumbnail Not Selected');
        return;
      }
      const courseData = {
        courseTitle,
        courseDescription: quilRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };
      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setCourseTitle('');
        setCoursePrice('');
        setDiscount('');
        setImage('');
        setChapters([]);
        quilRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!quilRef.current && editorRef.current) {
      quilRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  return (
    <div className="h-screen overflow-auto flex flex-col items-start justify-start md:p-8 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg w-full text-gray-600">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Type course title here"
            className="outline-none w-full md:py-2.5 py-2 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Course Description</label>
          <div ref={editorRef} className="min-h-[150px] border border-gray-300 rounded-md"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Course Price</label>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              placeholder="0"
              className="outline-none w-full md:w-28 md:py-2.5 py-2 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Course Thumbnail</label>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3 cursor-pointer">
              <img
                src={assets.file_upload_icon}
                alt="Upload Icon"
                className="p-3 bg-blue-500 rounded text-white"
              />
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                hidden
              />
              {image && (
                <img
                  className="max-h-20 rounded-md"
                  src={URL.createObjectURL(image)}
                  alt="Course Thumbnail"
                />
              )}
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type="number"
            placeholder="0"
            min={0} // Corrected the min value for discount
            className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            required
          />
        </div>

        {/* Adding Chapters & Lectures */}
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div className="bg-white border rounded-lg mb-4" key={chapterIndex}>
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <img
                    className={`mr-2 cursor-pointer transition-all ${
                      chapter.collapsed && '-rotate-90'
                    }`}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=""
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                  />
                  <span className="font-semibold">
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <span className="text-gray-500">{chapter.chapterContent.length} Lectures</span>
                <img
                  onClick={() => handleChapter('remove', chapter.chapterId)}
                  className="cursor-pointer"
                  src={assets.cross_icon}
                  alt=""
                />
              </div>
              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="flex justify-between items-center mb-2">
                      <span>
                        {lectureIndex + 1} - {lecture.lectureDuration} mins -{' '}
                        <a href={lecture.lectureUrl} target="_blank" className="text-blue-500">
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        src={assets.cross_icon}
                        alt=""
                        className="cursor-pointer"
                      />
                    </div>
                  ))}
                  <div
                    onClick={() => handleLecture('add', chapter.chapterId)}
                    className="flex gap-2 items-center cursor-pointer hover:bg-gray-100 py-2 px-3 rounded border"
                  >
                    <img src={assets.add_icon} alt="Add" />
                    <span className="text-sm font-medium">Add Lecture</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div
            onClick={() => handleChapter('add')}
            className="flex gap-2 items-center cursor-pointer hover:bg-gray-100 py-2 px-3 rounded border"
          >
            <img src={assets.add_icon} alt="Add" />
            <span className="text-sm font-medium">Add Chapter</span>
          </div>
        </div>

        <div className="flex items-center justify-start gap-2">
          <button
            type="submit"
            className="outline-none bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 rounded-md"
          >
            Submit
          </button>
          <button
            type="button"
            className="outline-none bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Popup for Adding Lecture */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add Lecture</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Lecture Title</label>
              <input
                value={lectureDetails.lectureTitle}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lecture Title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Lecture Duration (minutes)</label>
              <input
                value={lectureDetails.lectureDuration}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                }
                type="number"
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Duration"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Lecture Video URL</label>
              <input
                value={lectureDetails.lectureUrl}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Video URL"
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                }
                type="checkbox"
                id="isFreePreview"
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isFreePreview" className="ml-2 block text-sm text-gray-700">
                Free Preview
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={addLectureToChapter}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
