/**
 * Handles CRUD Operations For Custom Fields
 * Like Dropdowns, Labels, Or Anything Else That 
 * Need Multiple Options
 */
import { useState, forwardRef, useImperativeHandle, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

// DnD-kit
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


// Components
import Container from "../../../Draggable/dnd-kit/Container";
import Items from "./CustomFieldOptionsItem";
import { useEffect } from "react";



export default forwardRef( function CustomFieldOptionsList( { data }, ref) {

  const cont = [
    {
      id: `container-${uuidv4()}`,
      label: "Option",
      items: [],
    },
  ]

  const [containers, setContainers] = useState(cont)
  const [activeId, setActiveId] = useState(null)
  const [currentContainerId, setCurrentContainerId] = useState( cont[0].id );

  // Initialize items based on incoming data
  useEffect(() => {
    
    if (data.length > 0) {
      const updatedContainers = [...containers];
      updatedContainers[0].items = [...data];
      setContainers(updatedContainers);
    }

  }, []);

  const getItems = useCallback(() => {
    return containers[0].items;
  }, [containers]);

  useImperativeHandle(ref, () => {
    return {
      getItems,
    };
  });

  const onAddItem = (containerId) => {

    const container = containers.find(item => item.id === containerId)

    if (!container) {
      //console.log("No Container Found Looking For " , containerId );
      //console.log("Current Containers" , containers );
      return;
    }

    const id = uuidv4();

    container.items.push({
      id,
      label: "New Option",
      color: null,
    })

    //console.log(container);

    setContainers([...containers]);

  }

  const deleteItem = (itemId) => {

    const container = containers[0];

    // Filter out the item with the given itemId
    const updatedItems = container.items.filter(item => item.id !== itemId);

    //console.log(container);

    // Update the cont array
    container.items = updatedItems;

    // Update the state with the modified cont array
    setContainers([...containers]);

  }

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

  const findItemlabel = id => {
    const container = findValueOfItems(id, "item")
    if (!container) return ""
    const item = container.items.find(item => item.id === id)
    if (!item) return ""
    return item.label
  }

  const findItem = id => {

    const container = findValueOfItems(id, "item")
    if (!container) return "";

    const item = container.items.find(item => item.id === id)
    if (!item) return "";

    return item;

  }

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
    setActiveId(id)
  }

  const handleDragMove = event => {
    const { active, over } = event
      
    // Handle Items Sorting
    if (
      //active.id.toString().includes("item") &&
      //over?.id.toString().includes("item") &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active container and over container
      const activeContainer = findValueOfItems(active.id, "item")
      const overContainer = findValueOfItems(over.id, "item")

      //  If The Item Can Only Be Dragged Into Its Own Container Don't Process
      if (
        !active.data.current.dragToOtherContain
        && overContainer.id != active.data.current.parentContainer
      ) return;


      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        container => container.id === activeContainer.id
      )
      const overContainerIndex = containers.findIndex(
        container => container.id === overContainer.id
      )

      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        item => item.id === active.id
      )
      const overitemIndex = overContainer.items.findIndex(
        item => item.id === over.id
      )
      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        let newItems = [...containers]
        newItems[activeContainerIndex].items = arrayMove(
          newItems[activeContainerIndex].items,
          activeitemIndex,
          overitemIndex
        )

        setContainers(newItems)

      } else {
        // In different containers
        let newItems = [...containers]
        const [removeditem] = newItems[activeContainerIndex].items.splice(
          activeitemIndex,
          1
        )
        newItems[overContainerIndex].items.splice(overitemIndex, 0, removeditem)
        setContainers(newItems)
      }
    }

    // Handling Item Drop Into a Container
    if (
      //active.id.toString().includes("item") &&
      over?.id.toString().includes("container") &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, "item")
      const overContainer = findValueOfItems(over.id, "container")

      if (
        !active.data.current.dragToOtherContain
        && overContainer.id != active.data.current.parentContainer
      ) {
        //document.body.style.cursor = "no-drop";
        return;
      }

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        container => container.id === activeContainer.id
      )
      const overContainerIndex = containers.findIndex(
        container => container.id === overContainer.id
      )

      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        item => item.id === active.id
      )

      // Remove the active item from the active container and add it to the over container
      let newItems = [...containers]
      const [removeditem] = newItems[activeContainerIndex].items.splice(
        activeitemIndex,
        1
      )
      newItems[overContainerIndex].items.push(removeditem)
      setContainers(newItems)
    }
  }

  // This is the function that handles the sorting of the containers and items when the user is done dragging.
  function handleDragEnd(event) {
    const { active, over } = event

    // Handling Container Sorting
    if (

      active.id.toString().includes("container") &&
      over?.id.toString().includes("container") &&
      active &&
      over &&
      active.id !== over.id

    ) {

      if (
        !active.data.current.dragToOtherContain
        && over.id != active.data.current.parentContainer
      ) return;

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        container => container.id === active.id
      )

      const overContainerIndex = containers.findIndex(
        container => container.id === over.id
      )

      // Swap the active and over container
      let newItems = [...containers]
      newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex)
      setContainers(newItems)

    }

    // Handling item Sorting
    if (
      // active.id.toString().includes("item") &&
      //over?.id.toString().includes("item") &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, "item")
      const overContainer = findValueOfItems(over.id, "item")

      if (
        !active.data.current.dragToOtherContain
        && over.id != active.data.current.parentContainer
      ) return;

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return
      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        container => container.id === activeContainer.id
      )
      const overContainerIndex = containers.findIndex(
        container => container.id === overContainer.id
      )
      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        item => item.id === active.id
      )
      const overitemIndex = overContainer.items.findIndex(
        item => item.id === over.id
      )

      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        let newItems = [...containers]
        newItems[activeContainerIndex].items = arrayMove(
          newItems[activeContainerIndex].items,
          activeitemIndex,
          overitemIndex
        )
        setContainers(newItems)
      } else {
        // In different containers
        let newItems = [...containers]
        const [removeditem] = newItems[activeContainerIndex].items.splice(
          activeitemIndex,
          1
        )
        newItems[overContainerIndex].items.splice(overitemIndex, 0, removeditem)
        setContainers(newItems)
      }
    }

    // Handling item dropping into Container
    if (
      //active.id.toString().includes("item") &&
      over?.id.toString().includes("container") &&
      active &&
      over &&
      active.id !== over.id
    ) {

      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, "item")
      const overContainer = findValueOfItems(over.id, "container")

      if (
        !active.data.current.dragToOtherContain
        && over.id != active.data.current.parentContainer
      ) return;

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        container => container.id === activeContainer.id
      )
      const overContainerIndex = containers.findIndex(
        container => container.id === overContainer.id
      )

      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        item => item.id === active.id
      )

      //console.log(active);


      let newItems = [...containers]

      const [removeditem] = newItems[activeContainerIndex].items.splice(
        activeitemIndex,
        1
      )
      newItems[overContainerIndex].items.push(removeditem)
      setContainers(newItems)
    }

    setActiveId(null)
  }

  /**
   * Handles Name Change To The Draggable Item So The Name Is Updated When Dragging
   * @param {*} itemId 
   * @param {*} name 
   */
  function handleNameChange(itemId, name) {

    // Make a shallow copy of the containers array
    const updatedContainers = [...containers];

    // Assuming there's only one container in the array
    const container = updatedContainers[0];

    // Find the index of the item within the container
    const itemIndex = container.items.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      // Make a shallow copy of the item being updated
      const updatedItem = { ...container.items[itemIndex] };

      // Update the label of the item
      updatedItem.label = name;

      // Update the items array in the container with the modified item
      container.items[itemIndex] = updatedItem;

      // Update state with the modified containers array
      setContainers(updatedContainers);

      /* Send API Request Here To Update The Database */
    }
  }

  const updateItemColor = ( itemId, color ) => {

    // Make a shallow copy of the containers array
    const updatedContainers = [...containers];

    const container = updatedContainers[0];

    // Find the index of the item within the container
    const itemIndex = container.items.findIndex((item) => item.id === itemId);

    if( itemIndex !== -1 ) {
      // Make a shallow copy of the item being updated
      const updatedItem = { ...container.items[itemIndex] };

      // Update the color of the item
      updatedItem.color = color;

      // Update the items array in the container with the modified item
      container.items[itemIndex] = updatedItem;

      // Update state with the modified containers array
      setContainers(updatedContainers);

    } else {

      console.error("Could Not Find Item Index", itemId );

    }

  }

  return (
    <>
      <label className="form-label">Options</label>
      <div className="mx-auto" style={{ maxHeight: 300, overflowY: "auto" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={containers.map(i => i.id)}>
            
            {containers.map(container => (
              <Container
                id={container.id}
                title={container.label}
                key={container.id}
                onAddItem={() => {
                  setCurrentContainerId(container.id)
                  onAddItem(container.id)
                }}
                hasAddButton={false}
                hasTitle={false}
              >
                <SortableContext items={container.items.map(i => i.id)}>
                  <div className="flex items-start flex-col gap-y-4">
                    {container.items.map(i => (
                      <Items label={i.label} id={i.id} key={i.id} dragToOtherContain={i.dragToOtherContain} parentContainer={container.id} color={i.color} deleteItem={deleteItem} callBack={handleNameChange} updateItemColor={updateItemColor} />
                    ))}
                  </div>
                </SortableContext>

              </Container>
            ))}
            
          </SortableContext>

          <DragOverlay adjustScale={false}>

            {/* Drag Overlay For item Item */}
            {
              activeId && (
                <Items id={activeId} label={findItemlabel(activeId)} color={findItem(activeId).color} />
              )
            }

          </DragOverlay>

        </DndContext>
      </div>

      <button type="button" className="btn btn-outline-success" onClick={() => onAddItem(currentContainerId)}>Add Option</button>

    </>

  )
})
