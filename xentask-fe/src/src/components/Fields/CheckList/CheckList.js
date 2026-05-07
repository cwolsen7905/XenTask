import { Form } from 'react-bootstrap';
import { useState, useRef, useEffect,useContext } from 'react';
import FieldsInput from '../FieldsInput';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import { DataContext } from '../../Contexts/DataContext';

const Checklist = ({ id, taskId, name = "Checklist", items = [], getCheckListItems, createTask = false }) => {

  const { globalData } = useContext(DataContext);
  
  const [checkListItems, setCheckListItems] = useState(items);

  const inputRef = useRef();

  const updateItemName = async (itemId, newName) => {

    if (createTask) {

      const updatedItems = checkListItems.map(item =>
        item.id === itemId ? { ...item, name: newName } : item
      );

      setCheckListItems(updatedItems);

    } else {

      try {

        let _url = `https://${globalData.api_url}/task/${taskId}/checklistitem`;

        let _data = {
          checklist_item_id: itemId,
          field: 'name',
          value: newName,
        }

        const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

        if (response.status == 200) {

          const updatedItems = checkListItems.map(item =>
            item.id === itemId ? { ...item, name: newName } : item
          );

          setCheckListItems(updatedItems);

        }

      } catch (error) {

        console.error(error);

      }

    }

  };

  const updateCheckboxItem = async (itemId) => {

    if (createTask) {

      const updatedItems = checkListItems.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );

      setCheckListItems(updatedItems);

    } else {

      try {

        let _url = `https://${globalData.api_url}/task/${taskId}/checklistitem`;

        let _item = checkListItems.find( item => item.id === itemId );

        let _data = {
          checklist_item_id: itemId,
          field: 'checked',
          value: !_item.checked,
        }

        const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

        if (response.status == 200) {

          const updatedItems = checkListItems.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          );

          setCheckListItems(updatedItems);

        }

      } catch (error) {

        console.error(error);

      }

    }

  };


  const addChecklistItem = async () => {

    if (inputRef.current.value.trim() === '') return;

    if (createTask) {

      const newItem = {
        id: uuidv4(), // Generate a unique ID
        name: inputRef.current.value,
        checked: false,
      };

      setCheckListItems(prevItems => [...prevItems, newItem]);

      inputRef.current.value = '';

    } else {

      try {

        let _url = `https://${globalData.api_url}/task/${taskId}/checklistitem`;

        let _data = {
          checklist_id: id,
          name: inputRef.current.value,
        }

        const response = await axios.post(_url, JSON.stringify(_data), { withCredentials: true });

        if (response.status == 200) {

          const newItem = {
            id: response.data.checklist_item_hash,
            name: inputRef.current.value,
            items: [],
          };

          setCheckListItems(prevItems => [...prevItems, newItem]);

          inputRef.current.value = '';

        }

      } catch (error) {

        console.error(error);

      }

    }
  };

  const deleteChecklistItem = async (itemId) => {

    if( createTask ) {

      const updatedItems = checkListItems.filter(item => item.id !== itemId);
      setCheckListItems(updatedItems);

    } else {

      try {

        let _url = `https://${globalData.api_url}/task/${taskId}/checklistitem/${itemId}`;

        const response = await axios.delete( _url, { withCredentials: true });

        if( response.status == 200 ){
          const updatedItems = checkListItems.filter(item => item.id !== itemId);
          setCheckListItems(updatedItems);
        }

      } catch (error) {

        console.error(error);

      }

    }

  };

  useEffect(() => {

    if (getCheckListItems) getCheckListItems(id, checkListItems);

  }, [checkListItems])

  return (
    <>
      <div className="card-body">
        {checkListItems.map(item => (
          <div key={item.id} className="d-flex align-items-center small mb-2">
            <Form.Check
              className="me-2"
              type="checkbox"
              checked={item.checked}
              onChange={() => updateCheckboxItem(item.id)}
            />
            <FieldsInput type={'text'} value={item.name} styles={{ height: '30%' }} callBack={(value) => updateItemName(item.id, value)} />
            <button className="btn btn-danger" onClick={() => deleteChecklistItem(item.id)}>
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <div className="card-footer">
        <div className="input-group" style={{ width: '30%' }}>
          <input type="text" className="form-control" placeholder="Item Name" ref={inputRef} />
          <button className="btn btn-success btn-sm" type="button" onClick={addChecklistItem}>Add Item</button>
        </div>
      </div>
    </>
  );
};

export default Checklist;
