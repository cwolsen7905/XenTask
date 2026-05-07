import React, { useState, useEffect } from 'react';

const FieldsLabel = ({ data, callBack, showError }) => {

  const [isInvalid, setInvalid] = useState(showError);
  const [tags, setTags] = useState(data.value || []);
  const [searchQuery, setSearchQuery] = useState('');
  const availableTags = data.options || [];

  // Ensure showError updates isInvalid when it changes
  useEffect(() => {
    setInvalid(showError);
  }, [showError]);

  const handleTagClick = (tag) => {
    if (!tags?.includes(tag)) {
      let newValues = [...tags, tag];
      setTags(newValues);
      if (callBack) callBack(newValues);
    }
  };

  const handleRemoveTag = (tagToRemove, event) => {
    event.stopPropagation();
    event.preventDefault();
    let tagsCopy = [...(tags || [])];
    let newValues = tagsCopy.filter((tag) => tag !== tagToRemove);
    setTags(newValues);
    if (callBack) callBack(newValues);
  };

  const tagsTemplate = (tag, hasClose = true, disabled = false) => {
    if (tag !== undefined) {
      const style = {
        color: 'white',
        backgroundColor: tag.color || '#6c757d'
      };

      return (
        <span
          key={tag.id || tag.hash}
          className={`btn btn-sm me-1 mb-2 ${disabled ? 'disabled' : ''}`}
          style={style}
        >
          {('label' in tag) ? tag.label : tag.name}

          {hasClose && (
            <button
              className="btn btn-outline btn-sm mx-2"
              onClick={(e) => { handleRemoveTag(tag.id || tag.hash, e); }}
              style={{ height: 30 }}
            >
              <span className="ml-2">×</span>
            </button>
          )}
        </span>
      );
    }
    return null;
  };

  const filteredTags = (availableTags || []).filter((tag) => {
    try {
      return ('label' in tag ? tag.label : tag.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    } catch (error) {
      console.error(error, tag);
      return false;
    }
  });

  return (
    <div className="dropdown">
      <div
        data-bs-toggle="dropdown"
        aria-expanded="false"
        data-bs-auto-close="outside"
        data-bs-popper-config='{"strategy":"fixed"}'
        className={`tag-input-container ${isInvalid ? 'is-invalid' : ''}`}
      >
        <div className="tags-input">
          {tags.length === 0 ? (
            '-'
          ) : (
            tags.map((tag) =>
              tagsTemplate(availableTags.find((option) => (option.id || option.hash) === tag))
            )
          )}
        </div>
      </div>

      <div
        aria-labelledby="dropdown-custom-components"
        style={{ 
          display: 'block', 
          position: 'absolute', 
          width: '100%' 
        }}
      >
        <div className="dropdown-menu text-center" style={{ maxHeight: '30em', overflowY: 'auto', maxWidth: 300 }}>
          <div
            className="custom-select-search-container"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '6px 8px 0',
            }}
          >
            {tags?.map((tag) =>
              tagsTemplate(availableTags.find((option) => (option.id || option.hash) === tag))
            )}
          </div>

          <hr />

          <div className="custom-select-search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-select-search form-control"
            />
          </div>

          {filteredTags.map((tag) => (
            <button
              key={tag.id || tag.hash}
              onClick={() => handleTagClick(tag.id || tag.hash)}
              disabled={tags?.includes(tag.id || tag.hash)}
              className="dropdown-item"
              style={{ width: '100%', textAlign: 'left' }}
            >
              {tagsTemplate(tag, false, tags.includes(tag.id || tag.hash))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldsLabel;
