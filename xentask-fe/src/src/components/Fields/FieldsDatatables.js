import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { useData } from '../Contexts/DataContext';
import axios from 'axios';

const FieldsContacts = ({ options, tableData, value, setDataTables, callBack, showError }) => {
  const { globalData } = useData();
  const { multiSelect } = options;
  const [isInvalid, setInvalid] = useState(showError);
  const [tags, setTags] = useState(value || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalValue, setOriginalValue] = useState('');

  const defaultColumns = tableData?.labelColumns || [tableData.columns[0].id];

  const availableTags = tableData?.data.map(record => {
    const data = tableData.columns.map(column => ({
      columnId: column.id,
      label: column.label,
      value: record[column.id],
    }));

    const label = defaultColumns
      .map(colId => {
        const column = tableData.columns.find(col => col.id === colId);
        return column ? record[column.id] : '';
      })
      .join(' ');

    return { id: record._id, label, data };
  });

  useEffect(() => {
    setInvalid(showError);
  }, [showError]);

  const handleTagClick = (tag) => {
    if (!multiSelect && tags.length > 0) return;
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
    let newValues = tagsCopy.filter(tag => tag !== tagToRemove);
    setTags(newValues);
    if (callBack) callBack(newValues);
  };

  const updateDatableColumn = async (docId, columnId, value) => {
    console.log("Updating Column", docId, columnId, value);

    let _url = `https://${globalData.api_url}/datatable/${tableData.id}`;

    let _data = { docId, columnId, value };

    try {
      const response = await axios.put(_url, _data, { withCredentials: true });

      if (response.status === 200) {
        setDataTables(prevData => ({
          ...prevData,
          [tableData.id]: {
            ...prevData[tableData.id],
            data: prevData[tableData.id].data.map(item =>
              item._id === docId ? { ...item, [columnId]: value } : item
            ),
          },
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const labelButton = (item) => {
    return (
      <OverlayTrigger
        trigger="click"
        placement="auto"
        rootClose={true} // Close the popover when clicking outside
        overlay={
          <Popover id="phonePopOver">
            <Popover.Header as="h3">Edit Data</Popover.Header>
            <Popover.Body>
              <div>
                {item.data.map((elm) => (
                  <div className="mb-2" key={elm.id}>
                    <label>{elm.label}</label>
                    <input
                      className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
                      defaultValue={elm.value}
                      disabled
                      onFocus={(e) => { setOriginalValue(e.target.value) }}
                      onBlur={(e) => {
                        if (originalValue !== e.target.value) {
                          updateDatableColumn(item.id, elm.columnId, e.target.value);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </Popover.Body>
          </Popover>
        }
      >
        <button type="button" className="btn btn-secondary" onClick={(e) => e.stopPropagation()}>
          {item.label}
        </button>
      </OverlayTrigger>
    );
  };

  const handleRowClick = (tagId) => {
    handleTagClick(tagId);
  };

  const filteredTags = (availableTags || []).filter((tag) => {
    try {
      if (!tags.includes(tag.id)) {
        return tag.label.toLowerCase().includes(searchQuery.toLowerCase());
      }
    } catch (error) {
      console.error(error, tag);
      return false;
    }
  });

  return (
    <div className="input-group">
      <div className="form-control align-items-center" style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: 20 }}>
        {(tags && tags.length > 0) &&
          tags.map((tag) => {
            let _item = availableTags.find((item) => item.id === tag);
            return (
              <div key={_item.id} style={{ display: 'inline-flex', marginRight: '4px' }}>
                <div className="btn-group btn-group-sm" role="group" aria-label="Small button group">
                  {labelButton(_item)}
                  <button type="button" className="btn btn-danger" onClick={(e) => handleRemoveTag(tag, e)} aria-label="Close">×</button>
                </div>
              </div>
            );
          })}
      </div>

      <button
        className="btn btn-outline-secondary"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        data-bs-auto-close="outside"
        data-bs-popper-config='{"strategy":"fixed"}'
      >
        <FontAwesomeIcon icon={faPencilAlt} />
      </button>

      <div className="dropdown-menu dropdown-menu-end" style={{ maxHeight: "30em", overflowY: "auto", maxWidth: 300 }}>
        <div className="custom-select-search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="custom-select-search form-control"
          />
        </div>
        <hr />
        <ul className="list-group">
          {filteredTags.map((tag) => (
            <li
              key={tag.id}
              className="list-group-item list-group-item-action"
              onClick={() => handleTagClick(tag.id)}
            >
              {labelButton(tag)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FieldsContacts;
