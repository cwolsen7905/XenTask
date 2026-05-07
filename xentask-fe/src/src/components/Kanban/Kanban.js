
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useUI } from '../Contexts/UIContext';
import { useData } from '../Contexts/DataContext';
import KanbanContainer from './KanbanContainer'
import KanbanItem from './KanbanItem'

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

const Kanban = ({

    taskData,
    allFields,
    taskCustomFields,
    priority,
    statuses,
    columnVisibility,

    //  Inherited Functions
    deleteSelectedTasks,
    openTaskModal,
    updateField,
    /*
    userDefinedFilters,
    updateRearrangeMenus,
    saveFilter,
    updateFilter,
    deleteFilter,
    shareFilter,
    openColumnPanel,
   
    sortable,
    rearrangeable,
    rearrangeMenus,
    filterDropdownOptions,
    */

}) => {

    //  Data Context
    const { globalData, listTable, refreshTasks } = useData();

    //  UI Context
    const { openModal, showToastNotification } = useUI();

    // DnD Related States
    //const [activeId, setActiveId] = useState(null);
    const [activeObj, setActiveObj] = useState(null);
    const [containers, setContainers] = useState([]);
    const [originalContainer, setOriginalContainer] = useState(null);


    //  This Is For Everytime The List Table Data Is Updated
    //  Because A Task Can Be Technically Added From Anywhere
    useEffect(() => {

        if (Object.keys(listTable).length > 0) buildTaskContainers();

    }, [taskData]);

    //  Builds The Task Tables Data
    const buildTaskContainers = () => {

        //console.log(statuses)
        // Setup Task Views and Rearrangables
        //const { tasks, customFields, statuses, priority, workspace_users } = responseData;


        //  Build The Containers
        const newContainers = statuses.map(item => {
            return {
                id: `container-${item.hash}`,
                name: item.name,
                color: item.color,
                type: item.type,
                items: taskData
                    .filter(e => e.status === item.hash)
                    .map(e => ({
                        ...e,
                        id: `item-${e.hash}`
                    })),

            };
        });

        setContainers(newContainers);
        //console.log(newContainers);
        // Update the containers state with the new data
        //setContainers( buildContainers( data ) );

    }


    /**
     * DND Related
     */
    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 1,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),


    )
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

    function handleDragStart(event) {
        const { active } = event;
        setActiveObj(active.data.current.task);
        setOriginalContainer(active.data.current.parentContainer);

    }

    const handleDragMove = event => {
        const { active, over } = event;
    
        // Handle Items Sorting (same container)
        if (
            active.id.toString().includes("item") &&
            over?.id.toString().includes("item") &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Same container logic...
            const activeContainer = findValueOfItems(active.id, "item");
            const overContainer = findValueOfItems(over.id, "item");
    
            if (!activeContainer || !overContainer) return;
    
            const activeContainerIndex = containers.findIndex(
                container => container.id === activeContainer.id
            );
            const overContainerIndex = containers.findIndex(
                container => container.id === overContainer.id
            );
    
            const activeItemIndex = activeContainer.items.findIndex(
                item => item.id === active.id
            );
            const overItemIndex = overContainer.items.findIndex(
                item => item.id === over.id
            );
    
            if (activeContainerIndex === overContainerIndex) {
                // Do nothing if it's the same container
                return;
            }
    
            let newItems = [...containers];
            const [removedItem] = newItems[activeContainerIndex].items.splice(activeItemIndex, 1);
            newItems[overContainerIndex].items.splice(overItemIndex, 0, removedItem);
            setContainers(newItems);
        }
    
        // Handling Item Drop Into a Container (including empty containers)
        if (
            active.id.toString().includes("item") &&
            over?.id.toString().includes("container") &&
            active &&
            over &&
            active.id !== over.id
        ) {
            const activeContainer = findValueOfItems(active.id, "item");
            const overContainer = findValueOfItems(over.id, "container");
    
            if (!activeContainer || !overContainer) return;
    
            const activeContainerIndex = containers.findIndex(
                container => container.id === activeContainer.id
            );
            const overContainerIndex = containers.findIndex(
                container => container.id === overContainer.id
            );
    
            const activeItemIndex = activeContainer.items.findIndex(
                item => item.id === active.id
            );
    
            let newItems = [...containers];
            const [removedItem] = newItems[activeContainerIndex].items.splice(activeItemIndex, 1);
    
            // In case of an empty container, directly push the item
            newItems[overContainerIndex].items.push(removedItem);
            setContainers(newItems);
        }
    };
    
    function handleDragEnd(event) {
        const { active, over } = event;
    
        // Handling item Sorting (same container)
        if (active && over && active.id !== over.id) {
            const activeContainer = findValueOfItems(active.id, "item");
            if (!activeContainer) return;
    
            const activeContainerIndex = containers.findIndex(
                container => container.id === activeContainer.id
            );
    
            const activeItemIndex = activeContainer.items.findIndex(
                item => item.id === active.id
            );
    
            const overItemIndex = activeContainer.items.findIndex(
                item => item.id === over.id
            );
    
            let newItems = [...containers];
            newItems[activeContainerIndex].items = arrayMove(
                newItems[activeContainerIndex].items,
                activeItemIndex,
                overItemIndex
            );
    
            setContainers(newItems);
        }
    
        // Check If The Containers Switched And Update The Status Field
        const endContainer = active.data.current.parentContainer;
        if (originalContainer !== endContainer) {
            updateField({
                task_id: active.data.current.task.hash,
                type: 'basic',
                fieldName: 'status',
                value: endContainer.replace("container-", "")
            });
        }
    
        setActiveObj(null);
        setOriginalContainer(null);
    }

    /*
    const onAddItem = (containerId) => {

        //  Set Up A Temporary ID
        //const id = `item-${uuidv4()}`

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
    */

    return (
        <>

            <div class="kanban-container d-flex" style={{ height: '77vh' }}>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                >

                    {containers.map(container => (

                        <KanbanContainer
                            id={container.id}
                            title={container.name}
                            color={container.color}
                            key={container.id}
                        >
                            <SortableContext items={container.items.map((j) => j.id)}>

                                {container.items.map(j => (

                                    <KanbanItem
                                        data={j}
                                        allFields={allFields}
                                        parentContainer={container.id}
                                        openTaskModal={openTaskModal}
                                        taskCustomFields={taskCustomFields}
                                        priority={priority}
                                        columnVisibility={columnVisibility}
                                        updateField={updateField}
                                    />

                                ))}

                            </SortableContext>

                        </KanbanContainer>
                    ))}

                    <DragOverlay adjustScale={false}>

                        {/* Drag Overlay For item Item */}
                        {
                            activeObj && (
                                <KanbanItem style={{ transform: 'rotate(15deg)' }}
                                    data={activeObj}
                                    allFields={allFields}
                                    taskCustomFields={taskCustomFields}
                                    priority={priority}
                                    columnVisibility={columnVisibility}
                                  
                                />
                            )
                        }
                    </DragOverlay>
                </DndContext>
            </div>
        </>
    );
};


export default Kanban;