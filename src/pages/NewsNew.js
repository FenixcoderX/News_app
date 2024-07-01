import './NewsNew.sass';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsPreview from '../components/NewsPreview';
import { useSelector } from 'react-redux';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';

/**
 * Creates the current local date in ISO string format
 * @returns The local date in ISO string format
 */
const getLocalDateISOString = () => {
  const now = new Date();
  // Get difference between UTC and local time in milliseconds
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now - offset).toISOString().split('T')[0];
  return localISOTime;
};

const NewsNew = () => {
  // State variable for the title and Quill content
  const [title, setTitle] = useState('');
  const [contentQuill, setContentQuill] = useState('');
  // State variables for image files and other files
  const [imageFiles, setImageFiles] = useState([]);
  const [imageFilesUrl, setImageFilesUrl] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);
  const [otherFilesUrl, setOtherFilesUrl] = useState([]);
  // State variables for date and time
  const [date, setDate] = useState(getLocalDateISOString());
  const [time, setTime] = useState(
    new Date().toTimeString().split(':').slice(0, 2).join(':')
  );
  const [dateTime, setDateTime] = useState(new Date().toISOString());
  // State variable for error message
  const [errorMessage, setErrorMessage] = useState('');

  // User name and ID from the store
  const userName = useSelector((state) => state.user.userName);
  const currentUser = useSelector((state) => state.user.currentUser);

  // Refs for image files and other files
  const imageFilesUploadRef = useRef();
  const otherFilesUploadRef = useRef();
  const quillRef = useRef();

  const navigate = useNavigate();

  /**
   * Saves input value fot the title in the state
   * @param e - The change event object
   */
  const handleChangeTitle = (e) => {
    const title = e.target.value;
    setTitle(title);
  };

  /**
   * Handles the change event when selecting images and files. Validates the files and sets the files and URLs
   *
   * @param e - The change event object
   */
  const handleFilesImagesChange = (e, type) => {
    console.log('type', type);
    let errorMessage = '';

    if (Array.from(e.target.files).length > 5) {
      errorMessage +=
        'Could not upload all images/files, you can choice maximum 5 images and files.';
    }

    const files = Array.from(e.target.files).slice(0, 5);
    const filteredFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
    if (files.length !== filteredFiles.length) {
      errorMessage +=
        'Some images/files were not uploaded. Each image/file must be less than 5MB.';
    }

    setErrorMessage(errorMessage);
    if (type === 'files') {
      setOtherFiles(filteredFiles);
      setOtherFilesUrl(filteredFiles.map((file) => URL.createObjectURL(file)));
    }
    if (type === 'images') {
      setImageFiles(filteredFiles);
      setImageFilesUrl(filteredFiles.map((file) => URL.createObjectURL(file)));
    }
  };

  // Quill editor

  useEffect(() => {
    if (quillRef.current) {
      const quill = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          syntax: { hljs },
          toolbar: [
            ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
            [{ color: [] }, { background: [] }],
            [{ header: [3, 4, 5, 6, false] }],
            ['clean'],
          ],
        },
      });

      quill.on('text-change', () => {
        const cleanContentQuill = DOMPurify.sanitize(quill.root.innerHTML);
        setContentQuill(cleanContentQuill);
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Publish Date and Time

  /**
   * Handles the change event for the date input field
   *
   * @param e - The change event object
   */
  const handleDateChange = (e) => {
    console.log('e.target.value', e.target.value);
    setDate(e.target.value);
    updateDateTime(e.target.value, time);
  };

  /**
   * Handles the change event for the time input field
   *
   * @param e - The change event object
   */
  const handleTimeChange = (e) => {
    setTime(e.target.value);
    updateDateTime(date, e.target.value);
  };

  /**
   * Updates the date and time and sets the new value in the state
   *
   * @param date - The date in the format 'YYYY-MM-DD'
   * @param time - The time in the format 'HH:MM'
   */
  const updateDateTime = (date, time) => {
    const newDateTime = new Date(date + 'T' + time);
    setDateTime(newDateTime.toISOString());
  };

  // Submit form

  /**
   * Handles the form submission for creating a new news. Uploads the image and other files, then creates the news
   *
   * @param e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageFilesUrls = [];
    let otherFilesUrls = [];

    // Upload other files
    if (otherFiles.length !== 0) {
      const formDataOtherFiles = new FormData();
      otherFiles.forEach((file) => {
        formDataOtherFiles.append('files', file); // For multer, 'files' is the key for the files
      });

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/files/upload`,
          {
            method: 'POST',
            credentials: 'include',
            body: formDataOtherFiles,
          }
        );
        otherFilesUrls = await res.json();
        console.log('Other Uploaded files URLs:', otherFilesUrls);

        if (otherFilesUrls.success === false) {
          if (otherFilesUrls.message.includes('Unauthorized')) {
            return setErrorMessage('You need to log in to create a news');
          }
          return setErrorMessage('Something went wrong');
        }
      } catch (err) {
        setErrorMessage(err.message);
      }
    }

    // Upload image files
    if (imageFiles.length !== 0) {
      const formDataImageFiles = new FormData();
      imageFiles.forEach((file) => {
        formDataImageFiles.append('files', file); // 'files' это ключ, по которому multer ожидает файлы
      });

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/files/upload`,
          {
            method: 'POST',
            credentials: 'include',
            body: formDataImageFiles,
          }
        );
        imageFilesUrls = await res.json();
        console.log('Image Uploaded files URLs:', imageFilesUrls);
        if (imageFilesUrls.success === false) {
          if (imageFilesUrls.message.includes('Unauthorized')) {
            return setErrorMessage('You need to log in to create a news');
          }
          return setErrorMessage('Something went wrong');
        }
      } catch (err) {
        setErrorMessage(err.message);
      }
    }

    // Create news
    try {
      const status =
        dateTime <= new Date().toISOString() ? 'published' : 'draft';
      const res = await fetch(`${process.env.REACT_APP_API_URL}/news/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          images: imageFilesUrls,
          content: contentQuill,
          files: otherFilesUrls,
          author: currentUser,
          publishDate: dateTime,
          status: status,
        }),
      });
      const data = await res.json();
      console.log('data', data);
      if (data.success === false) {
        return setErrorMessage('Something went wrong');
      }
      navigate('/');
    } catch (err) {
      setErrorMessage('Something went wrong');
    }
  };

  return (
    <div className="news-new-container">
      <h3 className="news-new-header">Create news</h3>
      {userName === '' && (
        <div className="news-new-subheader text-danger">
          LigIn to create news
        </div>
      )}
      {userName !== '' && (
        <>
          <div className="news-new-subheader">
            Here you can create a new news
          </div>
          <form className="news-new-textarea-form mb-3" onSubmit={handleSubmit}>
            <label className="form-label">Title</label>
            <textarea
              itemID=""
              placeholder="maximum 100 characters"
              value={title}
              onChange={handleChangeTitle}
              className="form-control"
              style={{ textAlign: 'left' }}
              rows="3"
              maxLength={100}
            ></textarea>
            <label className="form-label">Images</label>

            <button
              type="button"
              className="btn btn-dark text-nowrap mt-2 news-new-button-upload"
              onClick={() => imageFilesUploadRef.current.click()}
            >
              Upload images
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFilesImagesChange(e, 'images')}
                multiple
                ref={imageFilesUploadRef}
                hidden
                visible="false"
              />
            </button>

            <div className="news-new-images-container mb-2">
              {imageFilesUrl.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="news-new-images"
                />
              ))}
            </div>
            <label className="form-label">Main content</label>
            <div ref={quillRef}> </div>
            <label className="form-label">Files</label>
            <button
              type="button"
              className="btn btn-dark text-nowrap mt-2 news-new-button-upload"
              onClick={() => otherFilesUploadRef.current.click()}
            >
              Upload files
              <input
                type="file"
                accept="*"
                onChange={(e) => handleFilesImagesChange(e, 'files')}
                multiple
                ref={otherFilesUploadRef}
                hidden
                visible="false"
              />
            </button>
            {otherFiles.length > 0 && (
              <>
                <div className="mt-2">Uploaded Files</div>
                <ul className="news-new-uploaded-files-list">
                  {otherFiles.map((file, index) => (
                    <ul key={index}>
                      <a href={otherFilesUrl[index]} download={file.name}>
                        {file.name}
                      </a>
                    </ul>
                  ))}
                </ul>
              </>
            )}
            <label className="form-label">Publication date</label>
            <div> Select the publication date and time </div>
            <div className="mb-3">
              <input type="date" value={date} onChange={handleDateChange} />
              <input
                type="time"
                value={time}
                step="60"
                onChange={handleTimeChange}
              />
            </div>
            <button
              data-testid="create-button"
              className="btn btn-dark text-nowrap"
              type="submit"
              disabled={title === '' || contentQuill === ''}
            >
              Send
            </button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </form>

          <div className="news-new-subheader">
            Preview of the news you are creating
          </div>
          <NewsPreview
            title={title}
            imageFilesUrl={imageFilesUrl}
            contentQuill={contentQuill}
            otherFiles={otherFiles}
            otherFilesUrl={otherFilesUrl}
            dateTime={dateTime}
          />
        </>
      )}
    </div>
  );
};

export default NewsNew;
