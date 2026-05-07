import { useState, forwardRef, useImperativeHandle, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import { DraggableTableRow } from "./DraggableTableRow";
import { Table } from 'react-bootstrap';

// The Fields Input
import FieldsInput from '../../../../Fields/FieldsInput';
import FieldsCheckBox from '../../../../Fields/FieldsCheckBox';
import FieldsDate from '../../../../Fields/FieldsDate';
import FieldsDropdown from '../../../../Fields/FieldsDropdown';
import FieldsSlider from '../../../../Fields/FieldsSlider';
import FieldsLabel from '../../../../Fields/FieldsLabel';

// DnD
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from "@dnd-kit/core"

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable"



//const inter = Inter({ subsets: ["latin"] })
export default forwardRef( function CustomFieldPreview({ data }, ref) {

  var cont = [
    // Pinned
    {
      id: `container-${uuidv4()}`,
      items: []
    },
    // Normal
    {
      id: `container-${uuidv4()}`,
      items: []
    },
  ];

  //  Make's Sure The Data Is Correct When Populating
  data.forEach( ( element, index ) => {

    let newItem = {
      id: element.id || element.hash ,
      name: element.name,
      pinned: element.pinned,
      required: element.required,
      type: element.type,
      value: "",
    };

    switch( element.type ) {

      case ('dropdown'):
        //  Create A New Element For None Option
        newItem.value = "none"
        newItem["options"] = [{
          id: "none",
          label: "None",
          value: "none",
          color: null,
        }];

        newItem["options"].push(...element.options);
        break;

      case ('labels'):
        newItem.value = [];
        newItem["options"] = [...element.options];
        break;

      case ('currency'):
        newItem["currency"] = element.value;
        //console.log("Previewer",element);
        break;

      case ('slider'):
        //console.log("Previewer",element);
        newItem["options"] = {...element.options};
        newItem["value"] = 0;
      break;

      default:
        break;

    }

    if (element.pinned) {
      cont[0].items.push(newItem);
    } else {
      cont[1].items.push(newItem);
    }

  });

  // Update rowData when data prop changes
  useEffect(() => {
    setContainers(cont);
  }, [data]);

  const [containers, setContainers] = useState(cont);
  const [activeId, setActiveId] = useState(null);

  // Expose Functions To The Parent Component To Get The Current Containers State
  const getItems = useCallback(() => {
    return containers;
  }, [containers]);

  useImperativeHandle(ref, () => {
    return {
      getItems,
    };
  });

  // Find the value of the items
  function findValueOfItems(id, type) {

    if (type === "container") {
      return containers.find(item => item.id === id)
    }

    if (type === "item") {
      return containers.find(container =>
        container.items.find(item => item.id === id)
      )
    }
  }

  const findItem = id => {

    const container = findValueOfItems(id, "item")
    if (!container) return "";

    const item = container.items.find(item => item.id === id)
    if (!item) return "";

    return item;

  }

  //  Get The Correct Cell Contents
  const getCell = (options) => {
    
    switch (options.type) {

      case ('text'):
      case ('number'):
      case ('currency'):
      case ('link'):
      case ('phone'):
        return <FieldsInput options={options} />;

      case ('checkbox'):
        return <FieldsCheckBox value={options.value} />;

      case ('dropdown'):
        return <FieldsDropdown data={options} />;

      case ('date'):
        return <FieldsDate options={options.value} />;

      case ('slider'):
        return <FieldsSlider options={options} />

      case ('labels'):
        return <FieldsLabel data={options} />

      default:
        <input placeholder="No Field Matches The Type" />
        break;

    }

  };

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragStart(event) {
    const { active } = event
    const { id } = active
    setActiveId(id);
    //console.log("activeID",id);
  }

  // Handle The Drag End Events And Sets New Item Position
  function handleDragEnd(event) {

    const { active, over } = event

    // Handling item Sorting
    if (
      active &&
      over &&
      active.id !== over.id
    ) {

      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, "item")

      // If the active or over container is not found, return
      if (!activeContainer ) return;

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        container => container.id === activeContainer.id
      )

      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        item => item.id === active.id
      )
      
      // Find The Index Of The Over Item
      const overitemIndex = activeContainer.items.findIndex(
        item => item.id === over.id
      )
      
      // Set The New Item Position
      let newItems = [...containers]

      newItems[activeContainerIndex].items = arrayMove(
        newItems[activeContainerIndex].items,
        activeitemIndex,
        overitemIndex
      )

      setContainers(newItems);

    }

    setActiveId(null);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Table bordered="true" table-responsive="true" >
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {containers.map(container => (

              <SortableContext key={container.id} items={container.items.map(i => i.id)}>
                {container.items.map(i => (
                  <DraggableTableRow key={i.id} row={{ name: i.name, cell: getCell(i), id: i.id, pinned: i.pinned }} />
                ))}
              </SortableContext>


            ))}

          </tbody>
        </Table>
        <DragOverlay adjustScale={false}>

          {/* Drag Overlay For item Item */}
          {
            activeId && (
              <DraggableTableRow row={{ cell: getCell(activeId),name: findItem(activeId).name, id: activeId }} />
            )
          }

        </DragOverlay>

      </DndContext>
    </>

  )
});








/*
// DND-KIT Library
import {
  closestCenter,
  PointerSensor,
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors

} from "@dnd-kit/core";

import {
  restrictToVerticalAxis,
  restrictToParentElement,
  restrictToFirstScrollableAncestor
}
from "@dnd-kit/modifiers";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,


} from "@dnd-kit/sortable";

import { DraggableTableRow } from "./DraggableTableRow";
import { el } from '@fullcalendar/core/internal-common';





export default function CustomFieldsPreview({ data }) {

  var formData = [
    // Normal
    {
      id: `container-${uuidv4()}`,
      items:[]
    },
    // Pinned
    {
      id: `container-${uuidv4()}`,
      items:[]
    },

  ];

  //  Make's Sure The Data Is Correct When Populating
  data.forEach( ( element, index ) => {

    let newItem = {
      id: element.id,
      name: element.name,
      pinned: element.pinned,
      required: element.required,
      type: element.type,
      value: "",
    };

    switch (element.type) {

      case ('dropdown'):
        //  Create A New Element For None Option
        newItem.value = "none"
        newItem["options"] = [{
          id: "none",
          label: "None",
          value: "none",
          color: null,
        }];

        newItem["options"].push(...element.options);
        break;

      case ('labels'):
        newItem.value = [];
        newItem["options"] = [...element.options];
        break;

      case ('currency'):
        newItem["currency"] = element.value;
        break;

      case ('slider'):
        newItem["value"] = element.value;
        break;

      default:
        break;

    }

    if( !element.pinned ) {
      formData[0].items.push(newItem);
    } else {
      formData[1].items.push(newItem);
    }

  });

  // Update rowData when data prop changes
  useEffect(() => {
    setData(formData);
  }, [data]);

  const [rowData, setData] = useState(formData);

  console.log("New Row Data", rowData);

  const [activeId, setActiveId] = useState();

  //  Make A Mapping Of Each Items ID
  const items = useMemo(() => rowData?.map(({ id, pinned }) => ({ id, pinned })), [rowData]);

  //  Get The Correct Cell Contents
  const getCell = (options) => {

    switch (options.type) {

      case ('text'):
      case ('number'):
      case ('currency'):
      case ('link'):
      case ('phone'):
        return <FieldsInput options={options} />;

      case ('checkbox'):
        return <FieldsCheckBox options={options} />;

      case ('dropdown'):
        return <FieldsDropdown data={options} />;

      case ('date'):
        return <FieldsDate options={options.value} />;

      case ('slider'):
        return <FieldsSlider options={options.value} />

      case ('labels'):
        return <FieldsLabel data={options} />

      default:
        <input placeholder="No Field Matches The Type" />
        break;

    }

  };

  // Use the state and functions returned from useTable to build your UI
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );



  function handleDragStart(event) {
    console.log(event);
    const { active } = event
    const { id } = active
    setActiveId(id)
  }

  const findItem = id => {
    const item = formData.find(item => item.id === id)
    if (!item) return "";
    return item;
  }

  function handleDragEnd(event) {

    const { active, over } = event;

    let activePinned  = active.data.current.pinned;
    let overPinned    = over.data.current.pinned;

    if( activePinned && !overPinned ) return;

    if (active.id !== over.id) {

      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newData = arrayMove( [...rowData], oldIndex, newIndex );

      console.log(newData);
      setData( newData );

    }

    setActiveId(null);

  }

  function handleDragOver(event) {
    const { active, over } = event;

    // Retrieve the data (including the pinned status) of the active and over items
    const activeData = active.data.current;
    const overData = over.data.current;

    // If the active item is pinned and the over item is not pinned, prevent dragging
    if (activeData.pinned && !overData.pinned) {
      console.log(activeData);
      return false;
    }

    console.log(event);
    return true;
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragMove(event) {
    const { active, over } = event;

    const activePinned = active.data.current.pinned;
    const overPinned = over.data.current.pinned;

    // If the active item is pinned and being dragged over a non-pinned item
    if (activePinned && !overPinned) {
      // Disable sorting visually by setting the transform property to none
      return false;
    } else {

    }
  }



  return (

    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      collisionDetection={closestCorners}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
    >

      <Table bordered="true" table-responsive="true" >
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>


        <SortableContext items={container.items.map(i => i.id)}>
          <div className="flex items-start flex-col gap-y-4">
            {container.items.map(i => (
              <Items label={i.label} id={i.id} key={i.id} dragToOtherContain={i.dragToOtherContain} parentContainer={container.id} color={i.color} deleteItem={deleteItem} callBack={handleNameChange} updateItemColor={updateItemColor} />
            ))}
          </div>
        </SortableContext>

        </tbody>
      </Table>

      <DragOverlay>


        {
          activeId && (
            <DraggableTableRow row = {{ name: findItem(activeId).name, id: activeId }} />
          )
        }

      </DragOverlay>

    </DndContext>

  );

}*/