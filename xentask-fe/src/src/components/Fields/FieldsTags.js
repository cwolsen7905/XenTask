import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

/**
 * This Component Is used To Allow Users To Type In Tags
 * 
 * @param {function}  validation - A Function To Validate And Check If A Tag Is Valid For Adding 
 * @param {bool}      allowDupes - Allow Duplicate Tags
 * @returns 
 */
export default forwardRef(function TagInput({ validation, allowDupes = true }, ref) {

  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  //  Callback Functions So We Can Collect The Attachments To Process During Task View
  const getItems = useCallback(() => {
    return tags;
  }, [tags]);

  const resetTags = () =>{
    setTags([]);
  }

  useImperativeHandle(ref, () => {
    return {
      getItems,
      resetTags,
    };
  });



  const handleKeyDown = (e) => {

    if (e.key === 'Enter' || e.key === ',') {

      e.preventDefault();
      addTag(inputValue);

    } else if (e.key === 'Backspace' && !inputValue) {

      editLastTag();

    }

  };

  const handlePaste = (e) => {

    e.preventDefault();

    const paste = e.clipboardData.getData('text');

    const emailArray = paste.split(',').map(tag => tag.trim());

    emailArray.forEach(tag => {

      let _validTag = true;

      //  If We've Passed A Validation For The Tags
      //  Verify That The Tag Is Valid
      if (validation && !validation(tag)) _validTag = false;

      //  If We Don't Allow Duplicate Tags Check For Dupes
      if (!allowDupes && tags.includes(tag)) _validTag = false;

      if (_validTag) {
        setTags(prevEmails => [...prevEmails, tag]);
      }

    });

    setInputValue('');

  };

  const addTag = (tag) => {

    let _validTag = true;

    //  If We've Passed A Validation For The Tags
    //  Verify That The Tag Is Valid
    if (validation && !validation(tag)) _validTag = false;

    //  If We Don't Allow Duplicate Tags Check For Dupes
    if (!allowDupes && tags.includes(tag)) _validTag = false;

    //  If The Tag Is Valid Set The Tags
    if (_validTag) setTags([...tags, tag]);

    // Reset Input Value For The Next Tag
    setInputValue('');

  };

  const editLastTag = () => {
    const lastEmail = tags.pop();
    setInputValue(lastEmail);
    setTags([...tags]);
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleContainerClick = () => {
    inputRef.current.focus();
  };

  return (
    <div className="form-control" style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '0.5rem',
      minHeight: '38px',
      cursor: 'text'
    }} onClick={handleContainerClick}>
      {tags.map((tag, index) => (
        <span key={index} style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0d6efd',
          color: '#fff',
          borderRadius: '0.25rem',
          padding: '0.25rem 0.5rem',
          marginRight: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          {tag}
          <button type="button" style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            marginLeft: '0.5rem',
            cursor: 'pointer'
          }} aria-label="Close" onClick={() => removeTag(index)}>×</button>
        </span>
      ))}
      <input
        type="text"
        ref={inputRef}
        style={{
          border: 'none',
          outline: 'none',
          flex: '1',
          minWidth: '150px',
          padding: '0',
          margin: '0',
          boxShadow: 'none',
          background: 'transparent'
        }}
        placeholder={tags.length === 0 ? "Enter Email(s) Here. You Can Hit Enter or ',' Keys To Add Emails" : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        autoComplete="new-password" // Use a random value to prevent autocomplete
      />
    </div>
  );
}
);

