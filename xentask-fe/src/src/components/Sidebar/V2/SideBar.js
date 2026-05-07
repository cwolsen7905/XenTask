/**
 * Main Sidebar Component
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from "uuid"
import { useUI } from '../../Contexts/UIContext';
import { DataContext } from '../../Contexts/DataContext';
import SortableTreeItem from './SortableTreeItem';
import { sortableTreeKeyboardCoordinates } from './SidebarUtils.js';

// DnD
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    MeasuringStrategy,
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"


const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

//  Realistically We Will Use The DataContext Data Thats Populated Via The API Upon Page Load
//  On The Overview API Call And Build The Containers That Way

const Sidebar = ({ indentationWidth = 1.5 }) => {

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
                type: 'space'
            };

        });

        /*if (includeMapping) {
            mappingData = flatMapping;
            localStorage.setItem('sideBarOrder', JSON.stringify(flatMapping));
        }*/

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

    var conts = buildTree();

    const [containers, setContainers] = useState(conts);
    const [activeId, setActiveId] = useState(null);
    const [overId, setOverId] = useState(null);
    const [activeType, setActiveType] = useState(null);
    const [offsetLeft, setOffsetLeft] = useState(0);

    useEffect(() => {
        setContainers(conts);
        //console.log("Updating Containers");
    }, [globalData]);

    function flattenMapping(data) {
        let flatMap = {};

        function traverse(item, parentId = null) {
            flatMap[item.id] = {
                name: item.name,
                type: item.type,
                parentId: parentId
            };

            if (item.type === 'folder') {
                flatMap[item.id].children = [];
                item.items.forEach(subItem => {
                    traverse(subItem, item.id);
                    flatMap[subItem.id] = {
                        name: subItem.name,
                        type: subItem.type,
                        parentId: item.id
                    };
                    flatMap[item.id].children.push({
                        id: subItem.id,
                        name: subItem.name,
                        type: subItem.type
                    });
                });
            } else if (item.type === 'space') { // Assuming you meant 'container' instead of 'space'
                item.items.forEach(subItem => {
                    traverse(subItem, item.id);
                });
            }
        }

        data.forEach(container => {
            traverse(container);
        });

        return flatMap;
    }

    function flattenMappingArray(data) {
        let flatArray = [];

        function traverse(item, depth = 0, index = 0, parentId = null) {
            const newItem = {
                id: item.id,
                name: item.name,
                type: item.type,
                parentId: parentId,
                depth: depth,
                index: index
            };

            if (item.type === 'folder' || item.type === 'space') {
                newItem.children = [];
                flatArray.push(newItem); // Add the current item to the flat array before its children

                item.items.forEach((subItem, subIndex) => {
                    // Add each subItem to the children array of the current item
                    newItem.children.push({
                        id: subItem.id,
                        name: subItem.name,
                        type: subItem.type,
                        parentId: item.id,
                        depth: depth + 1,
                        index: subIndex
                    });
                    // Recursively traverse each subItem
                    traverse(subItem, depth + 1, subIndex, item.id);
                });
            } else {
                flatArray.push(newItem); // Add the current item to the flat array
            }
        }

        data.forEach(space => {
            traverse(space);
        });

        return flatArray;
    }

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

    function handleDragMove(event) {
        const delta = event.delta;
        setOffsetLeft(delta.x);
    }

    function handleDragOver(event) {
        const over = event.over;
        setOverId(over?.id ?? null);
    }


    function handleDragEnd(event) {

        const { active, over } = event;

        setActiveId(null);
        setActiveType(null);

    }

    function handleDragCancel() {
        resetState();
    }

    function resetState() {

        setOverId(null);
        setActiveId(null);
        setOffsetLeft(0);

        document.body.style.setProperty("cursor", "");
    }
    
    //  Dictionary To Keep Track Of Id's Name Mapping
    var flatMap = flattenMappingArray(containers);
    //console.log("flatMap", flatMap);

    const sortedIds = useMemo(
        () => flatMap.map(({ id }) => id),
        [flatMap]
    );

    const sensorContext = useRef({
        items: flatMap,
        offset: offsetLeft,
    });


    const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indentationWidth)
    );

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 1,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter,
        })
    )

    useEffect(() => {
        sensorContext.current = {
            items: flatMap,
            offset: offsetLeft,
        };
    }, [flatMap, offsetLeft]);

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
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                            onDragOver={handleDragOver}
                            measuring={measuring}
                        >

                            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>

                                {flatMap.map(({ id, name, type, children, collapsed, depth }) => (

                                    <SortableTreeItem
                                        key={id}
                                        id={id}
                                        value={id}
                                        type={type}
                                        name={name}
                                        depth={depth}
                                        //depth={id === activeId && projected ? projected.depth : depth}
                                        indentationWidth={indentationWidth}
                                    //indicator={indicator}
                                    //collapsed={children.length}
                                    // onCollapse={
                                    //( children && children.length ) ? () => handleCollapse(id) : undefined
                                    //}
                                    //onRemove={ () => handleRemove(id) }
                                    />
                                ))}

                            </SortableContext>

                            <DragOverlay>

                                <SortableTreeItem
                                //depth={activeItem.depth}
                                //clone
                                //childCount={getChildCount(items, activeId) + 1}
                                //value={activeId}
                                //indentationWidth={indentationWidth}
                                />

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