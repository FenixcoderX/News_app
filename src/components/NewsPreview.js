import './NewsPreview.sass';
import DOMPurify from 'dompurify';

const NewsPreview = ({
  title,
  imageFilesUrl,
  contentQuill,
  otherFiles,
  otherFilesUrl,
  dateTime,
}) => {
  // Edit content from Quill editor to remove select tags and change some classes
  let editedContentQuill = contentQuill.replace(
    /<select[^>]*>([\s\S]*?)<\/select>/g,
    ''
  );
  editedContentQuill = editedContentQuill.replace(
    /<blockquote>/g,
    '<blockquote class="news-blockquote">'
  );
  editedContentQuill = editedContentQuill.replace(
    /class="ql-code-block-container/g,
    'class="news-ql-code-block-container'
  );

  // Sanitize edited content
  let sanitizedEditedContentQuill = DOMPurify.sanitize(editedContentQuill, {
    USE_PROFILES: { html: true },
  });

  /**
   * Formats a given date string into a localized date and time string
   *
   * @param dateString - The date string to be formatted
   * @returns The formatted date and time string
   */
  function formatLocalDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = date
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(/^24/, '00');

    return `${formattedDate} at ${formattedTime}`;
  }

  return (
    <div className="news-preview-container">
      <h3 className="news-preview-header">{title}</h3>
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
      <div
        className="news-preview"
        dangerouslySetInnerHTML={{ __html: sanitizedEditedContentQuill }}
      ></div>

      {otherFiles.length > 0 && (
        <>
          <div className="mt-2">Uploaded Files:</div>
          <ul className="news-preview-uploaded-files-list">
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
      <label className="form-label ">Publication date</label>
      <div className="news-preview-date">{formatLocalDate(dateTime)}</div>
    </div>
  );
};

export default NewsPreview;
