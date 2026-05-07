import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { groupByKey, groupByKeyToObject } from "../../../Utils/Utils";

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

// Components
import Container from "../../Draggable/dnd-kit/Container";
import Items from "../../Draggable/dnd-kit/Item";

export default forwardRef(function StatusSettings({ data }, ref) {

  const [containers, setContainers] = useState([]);

  //  Update The Containers State When Data Is Changed
  useEffect(() => {

    let _groups = groupByKeyToObject(data, 'type');

    //console.log("Built Groups", _groups);

    // Function to build the containers based on the new data
    const buildContainers = (data) => {

      const newContainers = [
        {
          name: "Not Started",
          items: _groups.not_started ? _groups.not_started.map(item => ({
            id: 'item-'+( item.id || item.hash ),
            name: item.name,
            dragToOtherContain: item.is_default ? false : true,
            color: item.color,
            isImported: true
          })) : [],
          canAdd: true,
          keyName: 'not_started'
        },
        {
          name: "Active",
          items: _groups.active ? _groups.active.map(item => ({
            id: 'item-'+( item.id || item.hash ),
            name: item.name,
            dragToOtherContain: item.is_default ? false : true,
            color: item.color,
            isImported: true
          })) : [],
          canAdd: true,
          keyName: 'active'
        },
        {
          name: "Completed",
          items: _groups.completed ? _groups.completed.map(item => ({
            id: 'item-'+( item.id || item.hash ),
            name: item.name,
            dragToOtherContain: item.is_default ? false : true,
            color: item.color,
            isImported: true
          })) : [],
          canAdd: true,
          keyName: 'completed'
        },
        {
          name: "Cancelled",
          items: _groups.cancelled ? _groups.cancelled.map(item => ({
            id: 'item-'+( item.id || item.hash ),
            name: item.name,
            dragToOtherContain: item.is_default ? false : true,
            color: item.color,
            isImported: true
          })) : [],
          canAdd: false,
          keyName: 'cancelled'
        },
      ];

      // Preserve existing IDs by matching container types
      return newContainers.map(newContainer => {
        const existingContainer = containers.find( c => c.keyName === newContainer.keyName) ;
        return {
          ...newContainer,
          id: existingContainer ? existingContainer.id : `container-${uuidv4() }`
        };
      });
    };

    // Update the containers state with the new data
    setContainers( buildContainers(data) );
    
  }, [data]); // Run the effect whenever data changes

  const [activeId, setActiveId] = useState(null);
  const [currentContainerId, setCurrentContainerId] = useState();

  //  This Keeps Track Of Which Statuses Imported From The DB Were Deleted
  const [importDeleted, setImportDeleted] = useState([]);

  // Expose Functions To The Parent Component To Get The Current Containers State
  const getItems = useCallback(() => {

    return { containers: containers, deleted: importDeleted };

  }, [containers, importDeleted]);

  useImperativeHandle(ref, () => {
    return {
      getItems,
    };
  });

  const onAddContainer = (name) => {
    //if (!containerName) return
    const id = `container-${uuidv4()}`
    setContainers([
      ...containers,
      {
        id,
        name: name,//containerName,
        items: []
      }
    ])

    //setContainerName("")
    //setShowAddContainerModal(false)

  }

  const onAddItem = (containerId) => {

    //  Set Up A Temporary ID
    const id = `item-${uuidv4()}`

    const container = containers.find(item => item.id === containerId)

    if (!container) return

    container.items.push({
      id,
      name: "New Status",
      dragToOtherContain: true,
      color: null,
      isImported: false
    })

    setContainers([...containers]);
    
    //setItemName("")
    //setShowAddItemModal(false)

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

  const findItem = id => {

    const container = findValueOfItems(id, "item")
    if (!container) return "";

    const item = container.items.find(item => item.id === id)
    if (!item) return "";

    return item;

  }

  const findItemTitle = id => {
    const container = findValueOfItems(id, "item")
    if (!container) return ""
    const item = container.items.find(item => item.id === id)
    if (!item) return ""
    return item.name
  }

  const findItemDragToOtherContain = id => {
    const container = findValueOfItems(id, "item")
    if (!container) return ""
    const item = container.items.find(item => item.id === id)
    if (!item) return ""

    return item.dragToOtherContain;
  }

  const findContainerTitle = id => {
    const container = findValueOfItems(id, "container")
    if (!container) return ""
    return container.name
  }

  const findContainerItems = id => {
    const container = findValueOfItems(id, "container")
    if (!container) return []
    return container.items
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
      active.id.toString().includes("item") &&
      over?.id.toString().includes("item") &&
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
      ) {
        //console.log("Item Cannot Be Dragged To Another Container");
        return;
      }

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) {
        //console.log("Cannot Find Active Or Over Containers");
        return;
      }
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
      active.id.toString().includes("item") &&
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

  function handleNameChange(itemId, name) {

    // Make a shallow copy of the containers array
    const updatedContainers = [...containers];

    // Assuming there's only one container in the array
    const container = findValueOfItems(itemId, "item");

    // Find the index of the item within the container
    const itemIndex = container.items.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      // Make a shallow copy of the item being updated
      const updatedItem = { ...container.items[itemIndex] };

      // Update the label of the item
      updatedItem.name = name;

      // Update the items array in the container with the modified item
      container.items[itemIndex] = updatedItem;

      // Update state with the modified containers array
      setContainers(updatedContainers);

    }

  }

  /**
   * Updates The Draggable Items Color
   */
  const updateItemColor = (itemId, color) => {


    // Make a shallow copy of the containers array
    const updatedContainers = [...containers];

    const container = findValueOfItems(itemId, "item");

    // Find the index of the item within the container
    const itemIndex = container.items.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      // Make a shallow copy of the item being updated
      const updatedItem = { ...container.items[itemIndex] };

      // Update the color of the item
      updatedItem.color = color;

      // Update the items array in the container with the modified item
      container.items[itemIndex] = updatedItem;

      // Update state with the modified containers array
      setContainers(updatedContainers);

    } else {

      console.error("Could Not Find Item Index", itemId);

    }

  }

  const deleteItem = (itemId) => {

    const container = findValueOfItems(itemId, "item");

    let _deleted = [...importDeleted];
    _deleted.push(itemId);
    setImportDeleted(_deleted);

    // Filter out the item with the given itemId
    const updatedItems = container.items.filter(item => item.id !== itemId);

    console.log(container);

    // Update the cont array
    container.items = updatedItems;

    // Update the state with the modified cont array
    setContainers([...containers]);

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
      //active.id.toString().includes("item") &&
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

  return (
    <div className="mx-auto max-w-7xl py-10">
      {/* Add Container Modal 
      <Modal
        showModal={showAddContainerModal}
        setShowModal={setShowAddContainerModal}
      >
        <div className="flex flex-col w-full items-start gap-y-4">
          <h1 className="text-gray-800 text-3xl font-bold">Add Container</h1>
          <Input
            type="text"
            placeholder="Container Title"
            name="containername"
            value={containerName}
            onChange={e => setContainerName(e.target.value)}
          />
          <Button onClick={onAddContainer}>Add container</Button>
        </div>
      </Modal>
      */}

      {/* Add Item Modal 
      <Modal showModal={showAddItemModal} setShowModal={setShowAddItemModal}>
        <div className="flex flex-col w-full items-start gap-y-4">
          <h1 className="text-gray-800 text-3xl font-bold">Add Item</h1>
          <Input
            type="text"
            placeholder="Item Title"
            name="itemname"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
          />
          <Button onClick={onAddItem}>Add Item</Button>
        </div>
      </Modal>
      <div className="flex items-center justify-between gap-y-2">
        <h1 className="text-gray-800 text-3xl font-bold">Dnd-kit Guide</h1>
        <Button onClick={() => setShowAddContainerModal(true)}>
          Add Container
        </Button>
      </div>
      */}

      <div className="mt-10">
        <div className="grid grid-cols-3 gap-6">
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
                  title={container.name}
                  key={container.id}
                  hasAddButton={container.canAdd}
                  onAddItem={() => {
                    //setShowAddItemModal(true)
                    setCurrentContainerId(container.id)
                    onAddItem(container.id)
                  }}
                  className="card p-2 mt-4"
                >
                  <SortableContext items={container.items.map( (i) => { 
                    if( i.dragToOtherContain ) return i.id; 
                  })
                    }>
                    <div className="flex items-start flex-col gap-y-4">
                      {container.items.map(i => (
                        <Items title={i.name} id={i.id} key={i.id} dragToOtherContain={i.dragToOtherContain} parentContainer={container.id} color={i.color} updateItemColor={updateItemColor} updateLabel={handleNameChange} deleteItem={deleteItem} />
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
                  <Items id={activeId} title={findItemTitle(activeId)} dragToOtherContain={findItemDragToOtherContain(activeId)} color={findItem(activeId).color} />
                )
              }

              {/* Drag Overlay For Container */}
              {activeId && activeId.toString().includes("container") && (
                <Container id={activeId} title={findContainerTitle(activeId)} className="card p-2 mt-4">
                  {findContainerItems(activeId).map(i => (

                    <Items key={i.id} title={i.name} id={i.id} dragToOtherContain={i.dragToOtherContain} color={i.color} />

                  ))}
                </Container>
              )}

            </DragOverlay>

          </DndContext>

        </div>
      </div>
    </div>
  )
});
