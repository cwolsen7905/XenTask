import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useContext } from 'react';
import { Table } from 'react-bootstrap';
import FieldsInput from './Fields/FieldsInput';
import FieldsCheckBox from './Fields/FieldsCheckBox';
import FieldsDate from './Fields/FieldsDate';
import FieldsDropdown from './Fields/FieldsDropdown';
import FieldsSlider from './Fields/FieldsSlider';
import FieldsLabel from './Fields/FieldsLabel';
import FieldsUser from './Fields/FieldsUser';
import FieldsContacts from './Fields/FieldsDatatables';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { DataContext } from '../components/Contexts/DataContext';

//import { faThumbTack } from '@fortawesome/free-solid-svg-icons';

/**
 *
 * @param {array} data - Custom Fields
 * @param {object} values - Custom Fields Values If Any
 * @param {bool} createTask - Are We Creating A Task?
 * @oaram {array} errors - Array Of Id's To Show Errors For Custom Fields Components
 */
export default forwardRef(function CustomFields({ taskId, data, values = {}, createTask = false, errors }, ref) {

  const { globalData } = useContext(DataContext);

  //  Update The Dropdown And Values For The Custom Fields
  const [customFields, setCustomFields] = useState([]);
  const [errorFields, setErrorFields] = useState(errors || []);
  const [datatables, setDataTables] = useState(errors || []);
  
  console.log("datatables",datatables);

  const getDataTable = async (id) => {

    //console.log(`Updating ${type} : ${id} To ${parentType} : ${parentId}`)

    let _url = `https://${globalData.api_url}/datatable/${id}`;

    try {

      const response = await axios.get(_url, { withCredentials: true });

      if (response.status == 200) {
        return response.data;
      }

    } catch (error) {
      console.error(error);
    }

  }


  //  Load, Format, And Set The Data
  useEffect(() => {
    let isMounted = true; // To prevent setting state on an unmounted component

    const fetchData = async () => {
      let uniqueTableRequests = new Set();
      let fetchPromises = [];
      let _dataTables = {};

      let _fields = Object.entries(data).map(([key, item]) => {
        let newItem = {
          hash: item.hash,
          name: item.name,
          required: item.required,
          pinned: item.pinned,
          type: item.type,
          value: null,
          options: item.options,
        };

        // Assign value from values array if it exists
        if (item.hash in values) {
          newItem.value = values[item.hash];
        } else {
          switch (item.type) {
            case 'labels':
              newItem.value = [];
              break;
            case 'currency':
              newItem.value = 0.00;
              break;
          }
        }

        // Fetch data only once per unique table
        if ((item.type === 'contacts' || item.type === 'datatables') && item.options?.table) {
          if (!uniqueTableRequests.has(item.options.table)) {
            uniqueTableRequests.add(item.options.table);
            fetchPromises.push(
              getDataTable(item.options.table).then(data => {
                _dataTables[item.options.table] = data;
              })
            );
          }
        }

        return newItem;
      });

      // Wait for all async calls to complete
      await Promise.all(fetchPromises);

      if (isMounted) {
        console.log(_dataTables);
        setDataTables(_dataTables);
        setCustomFields(_fields);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
    };

  }, [data]);

  useEffect(() => {

    if (errors != undefined) {
      setErrorFields(errors);
    }

  }, [errors]);

  //console.log("errorFields", errorFields);

  //  Mostly Used For Task Creation But
  //  Used To Get All The Fields Values As A Collection
  const getItems = useCallback(() => {
    return customFields
  }, [customFields]);

  useImperativeHandle(ref, () => {
    return {
      getItems,
    };
  });

  const updateValue = async (hash, value) => {

    console.log(hash, value);

    setCustomFields(prevItems =>
      prevItems.map(item =>
        item.hash === hash ? { ...item, value: value } : item
      )
    );

    //  Update The Data In DB If We're Viewing A Task
    if (!createTask) {

      let _data = {
        [hash]: value
      };

      try {
        let _url = `https://${globalData.api_url}/task/${taskId}/customField`;
        await axios.put(_url, JSON.stringify(_data), { withCredentials: true });
      } catch (error) {
        console.error(error);
      }

    }

  };

  const getCell = (item) => {

    switch (item.type) {

      case ('text'):
      case ('number'):
      case ('currency'):
      case ('link'):
      case ('phone'):

        return <FieldsInput
          type={item.type}
          value={item.value}
          options={item.options}
          callBack={(value) => updateValue(item.hash, value)}
          required={item.required}
          showError={errorFields.includes(item.hash)}
        />;


      case ('checkbox'):
        return <FieldsCheckBox
          options={item}
          value={item.value}
          required={item.required}
          callBack={(value) => updateValue(item.hash, value)}
          showError={errorFields.includes(item.hash)}
        />;


      case ('dropdown'):
        return <FieldsDropdown
          data={item}
          required={item.required}
          callBack={(value) => updateValue(item.hash, value.id)}
          showError={errorFields.includes(item.hash)}
        />;


      case ('date'):
        return <FieldsDate
          date={item.value}
          options={item.value}
          callBack={(value) => updateValue(item.hash, value)}
          showError={errorFields.includes(item.hash)}
        />;

      case ('slider'):
        return <FieldsSlider
          options={item}
          callBack={(value) => updateValue(item.hash, value)}
          showError={errorFields.includes(item.hash)}
        />


      case ('labels'):
        //console.log(options);
        return <FieldsLabel
          data={item}
          callBack={(value) => updateValue(item.hash, value)}
          showError={errorFields.includes(item.hash)}
        />

      case ('people'):
        return <FieldsUser
          selected={item.value || []}
          callBack={
            (value) => updateValue(item.hash, value)
          }
        />

      case ('contacts'):
        return (
          <FieldsContacts
            options={item.options}
            tableData={datatables[item.options.table]}
            value={item.value}
            setDataTables={setDataTables}
            callBack={(value) => updateValue(item.hash, value)}
            showError={errorFields.includes(item.hash)}
          />
        )

      default:
        break;

    }

  };

  return (
    <div>
      <Table bordered="true" table-responsive="true" >
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {customFields.map((row) => (
            <tr key={row.name}>
              <td>
                <div className="d-flex align-items-center">
                  {row.name}
                  {
                    row.pinned ?
                      <FontAwesomeIcon icon="fa-solid fa-thumbtack" className="ms-auto" />
                      :
                      ''
                  }
                  {
                    row.required ?
                      <span className="text-danger fs-3 ">*</span>
                      :
                      ''
                  }
                </div>
              </td>
              <td>{getCell(row)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

});