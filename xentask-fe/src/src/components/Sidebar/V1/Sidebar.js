/**
 * Main Sidebar Component
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid"
import { useUI } from '../Contexts/UIContext';
import { DataContext } from '../Contexts/DataContext';
import SidebarSpace from './SidebarSpace';
import SidebarListItem from './SidebarListItem';
import SidebarFolderItem from './SidebarFolderItem';
import DropHelperContainer from './DropHelperContainer';

// DnD
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    pointerWithin,
    rectIntersection,
} from "@dnd-kit/core"


import {snapCenterToCursor 
} from '@dnd-kit/modifiers';


import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    isDragging,
} from "@dnd-kit/sortable"


//  Realistically We Will Use The DataContext Data Thats Populated Via The API Upon Page Load
//  On The Overview API Call And Build The Containers That Way
/*var conts = [
    {
        id: uuidv4(),
        name: "Space 1",
        type: 'container',
        items: [
            {
                id: uuidv4(),
                name: 'List 1',
                type: 'list',
            },
            {
                id: uuidv4(),
                name: 'List 2',
                type: 'list',
            },
            {
                id: uuidv4(),
                name: 'Folder 1',
                type: 'folder',
                items: [{
                    id: uuidv4(),
                    name: 'List 3',
                    type: 'list',
                },
                {
                    id: uuidv4(),
                    name: 'List 4',
                    type: 'list',
                }]
            },
        ]
    },
    {
        id: uuidv4(),
        name: "Space 2",
        type: 'container',
        items: [
            {
                id: uuidv4(),
                name: 'List 5',
                type: 'list',
            },
            {
                id: uuidv4(),
                name: 'List 6',
                type: 'list',
            },
            {
                id: uuidv4(),
                name: 'Folder 2',
                type: 'folder',
                items: [{
                    id: uuidv4(),
                    name: 'List 7',
                    type: 'list',
 
                },
                {
                    id: uuidv4(),
                    name: 'List 8',
                    type: 'list',
                }]
            },
        ]
    }
]*/



const Sidebar = () => {

    var mappingData, conts;

    const fixCursorSnapOffset = args => {
        // Bail out if keyboard activated
        if (!args.pointerCoordinates) {
          return rectIntersection(args)
        }
        const { x, y } = args.pointerCoordinates
        const { width, height } = args.collisionRect
        const updated = {
          ...args,
          // The collision rectangle is broken when using snapCenterToCursor. Reset
          // the collision rectangle based on pointer location and overlay size.
          collisionRect: {
            width,
            height,
            bottom: y + height / 2,
            left: x - width / 2,
            right: x + width / 2,
            top: y - height / 2
          }
        }
        return rectIntersection(updated)
      }
      

    //  Global Contexts
    const { openModal } = useUI();
    const { globalData } = useContext(DataContext);

    function buildTree(includeMapping = false) {

        const flatMapping = includeMapping
            ? {
                spaces: {},
                spaceItems: {}
            } : null;

        const tree = Object.values(globalData.SPACES).map((space, spaceIndex) => {

            if (includeMapping) {
                flatMapping.spaces[space.id] = spaceIndex;
            }

            let _lists = Object.values(space.lists).map((list, listIndex) => {
                if (includeMapping) {
                    flatMapping.spaceItems[list.id] = listIndex;
                }

                return {
                    id: list.id,
                    name: list.name,
                    type: 'list',
                };
            });

            let _folders = Object.values(space.folders).map((folder, folderIndex) => {

                if (includeMapping) {
                    flatMapping.spaceItems[folder.id] = folderIndex;
                }

                let _folderList = Object.values(folder.lists).map((list, listIndex) => {

                    if (includeMapping) {
                        flatMapping.spaceItems[list.id] = listIndex;
                    }

                    return {
                        id: list.id,
                        name: list.name,
                        type: 'list'
                    };

                });

                return {
                    id: folder.id,
                    name: folder.name,
                    items: _folderList,
                    type: 'folder',
                };

            });

            return {
                id: space.id,
                name: space.name,
                items: [..._lists, ..._folders],
                type: 'container'
            };

        });

        if (includeMapping) {
            mappingData = flatMapping;
            localStorage.setItem('sideBarOrder', JSON.stringify(flatMapping));
        }

        return tree;
    }

    function sortTree(tree, flatMapping) {

        const sortByIndex = (a, b, category) => {
            return flatMapping[category][a.id] - flatMapping[category][b.id];
        };

        const sortItems = (items) => {
            return items.sort((a, b) => {
                return sortByIndex(a, b, 'spaceItems');
            }).map(item => {
                if (item.type === 'folder') {
                    item.items = sortItems(item.items);
                }
                return item;
            });
        };

        // Sort the top-level spaces based on their indices
        tree.sort((a, b) => sortByIndex(a, b, 'spaces'));

        // Sort items within each space
        return tree.map(space => {
            space.items = sortItems(space.items);
            return space;
        });
    }

    if (localStorage.getItem('sideBarOrder') === null) {

        conts = buildTree(true);

    } else {

        mappingData = JSON.parse(localStorage.getItem('sideBarOrder'));
        conts = buildTree();
        conts = sortTree(conts, mappingData);

    }

    const [containers, setContainers] = useState(conts);
    const [activeId, setActiveId] = useState(null);
    const [activeType, setActiveType] = useState(null);

    useEffect(() => {
        setContainers(conts);
        //console.log("Updating Containers");
    }, [globalData]);


    const flattenMappings = (spaces) => {
        const flattenedSpaces = [];

        // Iterate over each space object
        Object.values(spaces).forEach((space) => {
            const spaceItems = [];

            // Add lists directly belonging to the space
            if (space.lists) {
                Object.values(space.lists).forEach((list) => {
                    spaceItems.push({
                        itemId: list.id,
                        itemName: list.name,
                        itemType: "list",
                    });
                });
            }

            // Recursively flatten folder items
            const flattenFolders = (folders) => {
                if (folders) {
                    Object.values(folders).forEach((folder) => {
                        // Add lists directly belonging to the folder
                        if (folder.lists) {
                            Object.values(folder.lists).forEach((list) => {
                                spaceItems.push({
                                    itemId: list.id,
                                    itemName: list.name,
                                    itemType: "list",
                                });
                            });
                        }

                        // Recursively flatten nested folders
                        if (folder.folders) {
                            flattenFolders(folder.folders);
                        }
                    });
                }
            };

            // Flatten folder items
            flattenFolders(space.folders);

            // Add space object to flattenedSpaces array
            flattenedSpaces.push({
                spaceId: space.id,
                spaceName: space.name,
                items: spaceItems,
            });
        });

        return flattenedSpaces;
    };




    function flattenMappingfunction(data) {
        let flatMap = {};

        function traverse(item) {
            flatMap[item.id] = {
                name: item.name,
                type: item.type
            };

            if (item.type === 'folder') {
                flatMap[item.id].children = [];
                item.items.forEach(subItem => {
                    traverse(subItem);
                    flatMap[subItem.id] = {
                        name: subItem.name,
                        type: subItem.type
                    };
                    flatMap[item.id].children.push({
                        id: subItem.id,
                        name: subItem.name,
                        type: subItem.type
                    });
                });
            } else if (item.type === 'container') {
                item.items.forEach(subItem => {
                    traverse(subItem);
                });
            }
        }

        data.forEach(container => {
            traverse(container);
        });

        return flatMap;
    }


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
        })
    )

    function handleDragStart(event) {
        const { active } = event
        const { id } = active

        setActiveType(active.data.current.type);
        setActiveId(id);
    }

    function getItemInfo(id) {

        let _info = {};

        for (let i = 0; i < containers.length; i++) {
            const container = containers[i];
            const itemIndex = container.items.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                _info['containerIndex'] = i;
                _info['itemIndex'] = itemIndex;
                break; // No need to continue once found
            }
        }

        return _info;
    }

    function findFolderItemIndex(list, id) {

        const itemIndex = list.items.findIndex(item => item.id === id);

        if (itemIndex !== -1) return itemIndex;

    }

    function findRootContainer(id) {
        return containers.findIndex(container => container.id === id);
    }

    const handleDragMove = (event) => {

        const { active, over } = event;

        //  Should not ever be undefined Exit Early If It Is
        if (!active && !over) return;

        if (over.data.current.type !== "helper") {

            // When Moving Items To A New Sortable Context
            if (active.id != over.id) {

                const _activeType = active.data.current.type;
                const _overType = over.data.current.type;

            }
        }

    };

    //  Problem With This is since we're rearranging as we go and don't update the mapping till
    //  after the drag end we wont know what the other orders of the list that its passed by is 
    //  we might have to update it in handleDragMove some how 
    //  or just update the entire thing at drag end
    function handleDragEnd(event) {

        const { active, over } = event;

        if (active.id != over.id) {

            // Make A Copy Of The Containers
            let newItems = [...containers];

            const _activeType = active.data.current.type;
            const _overType = over.data.current.type;

            //  Handle Space Container Reordering
            if (_activeType == 'container' && _overType == 'container') {

                let _activeItemIndex = containers.findIndex(item => item.id === active.id);
                let _overItemIndex = containers.findIndex(item => item.id === over.id);

                //console.log("Moving Containers", _activeItemIndex, _overItemIndex);
                newItems = arrayMove(newItems,
                    _activeItemIndex,
                    _overItemIndex
                )


                mappingData.spaces[active.id] = _overItemIndex;
                mappingData.spaces[over.id] = _activeItemIndex;

                localStorage.setItem('sideBarOrder', JSON.stringify(mappingData));
                setContainers(newItems);
                setActiveId(null);
                setActiveType(null);

            }

            // Handle List Reordering When Dropped
            if ((_activeType == 'list' || _activeType == 'folder') && (_overType == 'list' || _overType == 'folder')) {

                //  Handle Cases When Items Are Dragging Around Inside A Folder
                if (active.data.current.isFolderItem && over.data.current.isFolderItem) {

                    let _overItemInfo = getItemInfo(over.data.current.parentId);    // Grab Info On The Folder Item
                    let _overRootContainerIndex = _overItemInfo.containerIndex;     // The Root Container Index
                    let _overFolderIndex = _overItemInfo.itemIndex;                 // The Folders Index Within The Containers Items List
                    let _overItemIndex = findFolderItemIndex(containers[_overRootContainerIndex].items[_overFolderIndex], over.id);

                    //  Grab Information About The Current Active Dragged Item
                    let _activeItemInfo = getItemInfo(active.data.current.parentId);  // Grab Info About The Active Item
                    let _activeRootContainerIndex = _activeItemInfo.containerIndex;     // The Root Container Index
                    let _activeFolderIndex = _overItemInfo.itemIndex;                   // The Folders Index Within The Containers Items List
                    let _activeItemIndex = findFolderItemIndex(containers[_activeRootContainerIndex].items[_activeFolderIndex], active.id);

                    //console.log(newItems[_activeRootContainerIndex].items[_activeFolderIndex]);

                    newItems[_activeRootContainerIndex].items[_activeFolderIndex].items = arrayMove(
                        newItems[_activeRootContainerIndex].items[_activeFolderIndex].items,
                        _activeItemIndex,
                        _overItemIndex
                    )


                    mappingData.spaceItems[active.id] = _overItemIndex;
                    mappingData.spaceItems[over.id] = _activeItemIndex;

                    localStorage.setItem('sideBarOrder', JSON.stringify(mappingData));

                    setContainers(newItems);
                    setActiveId(null);
                    setActiveType(null);
                    return;

                } else { //  Handle Reordering Outside A Folder

                    let _activeItemInfo = getItemInfo(active.id);
                    let _overItemInfo = getItemInfo(over.id);

                    let _activeContainerIndex = _activeItemInfo.containerIndex;
                    let _overContainerIndex = _overItemInfo.containerIndex;

                    if (_activeContainerIndex == undefined && _overContainerIndex == undefined) return;

                    let _activeItemIndex = _activeItemInfo.itemIndex;
                    let _overItemIndex = _overItemInfo.itemIndex;


                    newItems[_activeContainerIndex].items = arrayMove(
                        newItems[_activeContainerIndex].items,
                        _activeItemIndex,
                        _overItemIndex
                    );

                    mappingData.spaceItems[active.id] = _overItemIndex;
                    mappingData.spaceItems[over.id] = _activeItemIndex;

                    localStorage.setItem('sideBarOrder', JSON.stringify(mappingData));
                   // console.log("Saved Mapping Data", active.id, over.id);

                    setContainers(newItems);
                    setActiveId(null);
                    setActiveType(null);
                    return;
                }
            }

            // Dropped Inside A Helper Node
            if (over.data.current.type == "helper") {

                const parentId = over.data.current.parentId;
                const isFolderItem = over.data.current.isFolderItem;
                let targetIndex;

                //  Helper Nodes Can Be Within A Folder As Well
                if (!isFolderItem) {

                    targetIndex = findRootContainer(parentId);

                    //  If The Item Dragged Here Is From A Folder
                    if (active.data.current.isFolderItem) {

                        //  Grab Information About The Current Active Dragged Item
                        let _activeItemInfo = getItemInfo(active.data.current.parentId);    // Grab Info About The Active Item
                        let _activeRootContainerIndex = _activeItemInfo.containerIndex;     // They Could Be Coming From Another Container So Check In Case
                        let _activeFolderIndex = _activeItemInfo.itemIndex;                 // The Folders Index Within The Containers Items List
                        let _activeItemIndex = findFolderItemIndex(containers[_activeRootContainerIndex].items[_activeFolderIndex], active.id);

                        // Remove The Item From The Folder
                        const [removeditem] = newItems[_activeRootContainerIndex].items[_activeFolderIndex].items.splice(_activeItemIndex, 1);

                        //let lastIndex = newItems[targetIndex].items.length;

                        // Add It To The Bottom Of The Array
                        newItems[targetIndex].items.push(removeditem);

                        mappingData.spaceItems[active.id] = newItems[targetIndex].items.length - 1;


                    } else {

                        // Allow Dropping Everything Else In Here 
                        let _activeItemInfo = getItemInfo(active.id);    // Grab Info About The Active Item
                        let _activeRootContainerIndex = _activeItemInfo.containerIndex;     // They Could Be Coming From Another Container So Check In Case
                        let _activeItemIndex = _activeItemInfo.itemIndex;                 // The Folders Index Within The Containers Items List

                        const [removeditem] = newItems[_activeRootContainerIndex].items.splice(_activeItemIndex, 1);

                        newItems[targetIndex].items.push(removeditem);
                        mappingData.spaceItems[active.id] = newItems[targetIndex].items.length - 1;
                    }

                    localStorage.setItem('sideBarOrder', JSON.stringify(mappingData));

                    setContainers(newItems);
                    setActiveId(null);
                    setActiveType(null);
                    return;

                }
            }
        }

        setActiveId(null);
        setActiveType(null);

    }

    //  Dictionary To Keep Track Of Id's Name Mapping
    var idToNameMapping = flattenMappingfunction(containers);
    //console.log("idToNameMapping", idToNameMapping)

    // Example usage
    const flattenedData = flattenMappings(globalData.SPACES);
    //console.log("flattenedData", flattenedData);




    return (
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">

                <div className="sb-sidenav-menu" style={{ overflowX: 'hidden' }}>
                    <div className="nav">
                        <div className="sb-sidenav-menu-heading">Home</div>

                        <Link to="/" className="nav-link">
                            <div className="sb-nav-link-icon"><i className="fas fa-home"></i></div>
                            Home
                        </Link>

                        <Link to="/tasks" className="nav-link">
                            <div className="sb-nav-link-icon"><i className="fas fa-tasks"></i></div>
                            Tasks
                        </Link>

                        <a className="nav-link" href="/tasks">
                            <div className="sb-nav-link-icon"><i className="fas fa-file"></i></div>
                            Documents
                        </a>

                        <a className="nav-link" href="index.html">
                            <div className="sb-nav-link-icon"><i className="fas fa-stopwatch"></i></div>
                            Timesheets
                        </a>

                        <a className="nav-link collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#collapsePages" aria-expanded="false" aria-controls="collapsePages">
                            <div className="sb-nav-link-icon"><i className="fas fa-star"></i></div>
                            Favorites
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                        </a>
                        <div className="collapse" id="collapsePages" aria-labelledby="headingTwo" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav accordion" id="sidenavAccordionPages">
                                <a className="nav-link collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#pagesCollapseAuth" aria-expanded="false" aria-controls="pagesCollapseAuth">
                                    Authentication
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                                </a>
                                <div className="collapse" id="pagesCollapseAuth" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <a className="nav-link" href="login.html">Login</a>
                                        <a className="nav-link" href="register.html">Register</a>
                                        <a className="nav-link" href="password.html">Forgot Password</a>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#pagesCollapseError" aria-expanded="false" aria-controls="pagesCollapseError">
                                    Error
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                                </a>
                                <div className="collapse" id="pagesCollapseError" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <a className="nav-link" href="401.html">401 Page</a>
                                        <a className="nav-link" href="404.html">404 Page</a>
                                        <a className="nav-link" href="500.html">500 Page</a>
                                    </nav>
                                </div>
                            </nav>
                        </div>

                        {/* Begin Workspaces Sections */}
                        <div className="sb-sidenav-menu-heading">
                            Spaces
                            {/* Button To Open Up Create Modal */}

                            <button
                                className="btn btn-outline-secondary btn-sm border-0 position-relative float-end"
                                style={{ bottom: 6 }}
                                type="button"
                                onClick={
                                    () => openModal("Create A New Space", { compProps: { form: 'space' } })}
                            >
                                <i className="fa-solid fa-plus"></i>

                            </button>

                        </div>

                        {/* Navbar Search */}
                        <div className="row">
                            <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
                                <div className="input-group">
                                    <input className="form-control" type="text" placeholder="Search for..." aria-label="Search for..."
                                        aria-describedby="btnNavbarSearch" />
                                    <button className="btn btn-primary" id="btnNavbarSearch" type="button"><i className="fas fa-search"></i></button>
                                </div>
                            </form>
                        </div>

                        {/* Draggable Components */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={fixCursorSnapOffset}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                        >

                            <SortableContext items={containers.map(i => i.id)} >

                                {containers.map(container => (
                                    <SidebarSpace
                                        id={container.id}
                                        name={container.name}
                                        key={container.id}
                                        isDraggingSpace={activeType == "container"}
                                    >
                                        <SortableContext items={container.items.map(i => i.id)}>

                                            {container.items.map(item => (

                                                item.type === "list" ? (
                                                    <SidebarListItem
                                                        name={item.name}
                                                        id={item.id}
                                                        key={item.id}
                                                        parentId={container.id}
                                                        spaceParent={container.id}
                                                    />

                                                ) : (
                                                    <>
                                                        <SidebarFolderItem
                                                            id={item.id}
                                                            key={item.id}
                                                            name={item.name}
                                                            parentId={container.id}
                                                            spaceParent={container.id}
                                                        >
                                                            {

                                                                !activeId && (idToNameMapping[item.id].children.includes(activeId) == false) && (
                                                                    <>
                                                                        <SortableContext items={item.items.map(item => item.id)}>
                                                                            {item.items.map(subItem => (
                                                                                <SidebarListItem
                                                                                    name={subItem.name}
                                                                                    id={subItem.id}
                                                                                    key={subItem.id}
                                                                                    parentId={item.id}
                                                                                    spaceParent={container.id}
                                                                                    folderParent={item.id}
                                                                                    isFolderItem={true}
                                                                                />
                                                                            ))}
                                                                        </SortableContext>
                                                                    </>
                                                                )

                                                            }

                                                            <DropHelperContainer
                                                                id={uuidv4()}
                                                                parentId={container.id}
                                                                show={(activeId && activeType !== 'container') ? true : false}
                                                            />


                                                        </SidebarFolderItem>


                                                    </>
                                                )

                                            ))}

                                        </SortableContext>

                                        {/* This Is To Help With Dropping Items Back Into The Container If Stuck */}
                                        <DropHelperContainer
                                            id={uuidv4()}
                                            parentId={container.id}
                                            show={(activeId && activeType !== 'container') ? true : false}
                                        />

                                    </SidebarSpace>
                                ))}

                            </SortableContext>

                            <DragOverlay 
                                adjustScale={false}
                                modifiers={{fixCursorSnapOffset}}
                            >

                                {/* Drag Overlay For List Item */}
                                {(activeId && activeType == "list") && (

                                    <SidebarListItem
                                        name={idToNameMapping[activeId].name}
                                        id={activeId}
                                        key={activeId}
                                    />
                                )}

      

                                {/* Drag Overlay For Container */}
                                {(activeId && activeType == "container") && (
                                    <SidebarSpace
                                        id={activeId}
                                        name={idToNameMapping[activeId]}
                                        key={activeId}
                                        isDraggingSpace={activeType == "container"}
                                    >
                                    </SidebarSpace>
                                )}


                            </DragOverlay>

                        </DndContext>

                    </div>
                </div>

                {
                    /**<div className="sb-sidenav-footer">
                        <div className="small">Logged in as:</div>
                        Start Bootstrap
                        </div>**/
                }

            </nav>
        </div>
    );
};

export default Sidebar;