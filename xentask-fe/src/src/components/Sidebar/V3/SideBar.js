import { Link, useParams,useLocation  } from 'react-router-dom';
import { useState, useContext, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useUI } from '../../Contexts/UIContext';
import { DataContext } from '../../Contexts/DataContext';
import { ucFirst, firstLetter } from '../../../Utils/Utils';

import FieldsDropdown from '../../Fields/FieldsDropdown';

import {
    DndProvider,
    DropOptions,
    getBackendOptions,
    getDescendants,
    MultiBackend,
    Tree,
    NodeModel
} from "@minoru/react-dnd-treeview";
import React from "react";
import Node from "./SideBarNode";
import Placeholder from "./Placeholder";
import useTreeOpenHandler from "./useTreeOpenHandler";
import styles from "./styles.module.css";

var mappingData;

function flattenData(data) {
    // Retrieve and decode the order mapping if it exists
    let orderMap = localStorage.getItem('sideBarOrder');
    if (orderMap) {
        orderMap = JSON.parse(orderMap);
    } else {
        orderMap = {};
    }

    const flatMap = [];
    const existingIds = new Set();

    function addNode(node, parentId, parentSpaceId, type) {
        const { id, name, is_private, date_created, created_by, lists, folders } = node;
        const flatNode = {
            id,
            parent: parentId,
            text: name,
            droppable: type === 'space' || type === 'folder',
            data: {
                type,
                is_private,
                date_created,
                created_by,
                parentSpaceId // Include the space parent ID
            }
        };

        flatMap.push(flatNode);
        existingIds.add(id);

        if (lists) {
            for (const listId in lists) {
                existingIds.add(listId);
                addNode(lists[listId], id, parentSpaceId, 'list'); // Pass parentSpaceId to lists
            }
        }

        if (folders) {
            for (const folderId in folders) {
                existingIds.add(folderId);
                addNode(folders[folderId], id, parentSpaceId, 'folder'); // Pass parentSpaceId to folders
            }
        }
    }

    for (const spaceId in data) {
        addNode(data[spaceId], 0, spaceId, 'space'); // Pass parentSpaceId to spaces
    }

    // Clean up orderMap by removing non-existing ids
    for (const id in orderMap) {
        if (!existingIds.has(id)) {
            delete orderMap[id];
        }
    }

    // Add new ids to orderMap with appropriate index
    flatMap.forEach((node, index) => {
        if (!(node.id in orderMap)) {
            orderMap[node.id] = Object.keys(orderMap).length; // Append new items at the end
        }
    });

    // Sort flatMap based on the orderMap
    flatMap.sort((a, b) => (orderMap[a.id] - orderMap[b.id]));

    // Save updated orderMap to localStorage
    localStorage.setItem('sideBarOrder', JSON.stringify(orderMap));
    mappingData = orderMap;
    return flatMap;
}

const reorderArray = (array, sourceIndex, targetIndex) => {
    const newArray = [...array];
    const element = newArray.splice(sourceIndex, 1)[0];
    newArray.splice(targetIndex, 0, element);
    return newArray;
};

const updateMappingData = (treeData) => {
    // Update mappingData with the new order indices
    treeData.forEach((node, index) => {
        mappingData[node.id] = index;
    });
    // Save the updated mappingData to localStorage
    localStorage.setItem('sideBarOrder', JSON.stringify(mappingData));
};

const SideBar = () => {
    
    // This Is Used For When Adding A Task From Sidebar
    const location = useLocation();
    const pathMatch = location.pathname.match(/^\/lists\/(.+)$/);
    const isListPath = Boolean(pathMatch);
    const listId = isListPath ? pathMatch[1] : null;
    

    // Global Contexts
    const { openModal } = useUI();
    const { globalData, refreshSpaces, refreshTasks } = useContext(DataContext);

    const tree = flattenData(globalData.SPACES);

    const [treeData, setTreeData] = useState(tree);

    const [workspaceDropdown, setWorkspaces] = useState(null);

    useEffect(() => {
        const newTree = flattenData(globalData.SPACES);
        setTreeData(newTree);
    }, [globalData.SPACES])

    //  Everytime Workspaces Are Updated Rebuild The Dropdown
    useEffect(() => {

        let _workspaceDropdown = {
            value: globalData.USER.default_workspace,
            options: []
        }

        _workspaceDropdown.options = globalData.USER.workspaces.map((item) => {
            return {
                label: item.name,
                image: item.image,
                color: item.color,
                id: item.workspace_hash
            }
        });

        //console.log("Workspaces Dropdown", _workspaceDropdown);

        setWorkspaces(_workspaceDropdown);

    }, [])



    //  Update The Resources Parent
    //  Moving A List/Folder To Another Space
    //  Or Moving A List Into A Folder
    const updateParent = async (id, type, parentId, parentType, dropTarget) => {

        //console.log(`Updating ${type} : ${id} To ${parentType} : ${parentId}`)

        let _url = `https://${globalData.api_url}/${type}/${id}/updateParent`;

        let _data = {
            parent_id: parentId,
            parent_type: parentType
        }

        try {

            const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

            refreshSpaces();

        } catch (error) {
            console.error(error);
        }

    }

    const handleDrop = (newTree, e) => {

        const { dragSourceId, dropTargetId, destinationIndex, dragSource, dropTarget } = e;

        // Handle edge cases
        if (typeof dragSourceId === "undefined" || typeof dropTargetId === "undefined") return;

        // Look for the draggable's indices from the tree
        const start = treeData.find((v) => v.id === dragSourceId);
        const end = treeData.find((v) => v.id === dropTargetId);

        if (start?.parent === dropTargetId && start && typeof destinationIndex === "number") {
            setTreeData((treeData) => {
                const output = reorderArray(treeData, treeData.indexOf(start), destinationIndex);
                updateMappingData(output);
                return output;
            });
        }

        if (start?.parent !== dropTargetId && start && typeof destinationIndex === "number") {
            if (
                getDescendants(treeData, dragSourceId).find((el) => el.id === dropTargetId) ||
                dropTargetId === dragSourceId ||
                (end && !end?.droppable)
            )
                return;

            setTreeData((treeData) => {
                const output = reorderArray(treeData, treeData.indexOf(start), destinationIndex);

                // Move to a new parent
                const movedElement = output.find((el) => el.id === dragSourceId);
                if (movedElement) movedElement.parent = dropTargetId;

                if (dragSource.data.type == 'folder') {
                   
                    movedElement.data.parentSpaceId = dragSource.parent;
                    
                }

                updateParent(dragSourceId, dragSource.data.type, movedElement.parent, dropTarget.data.type, dropTarget);
                updateMappingData(output);
                return output;
            });
        }
    };

    const handleCanDrop = (
        currentTree,
        { dragSourceId, dropTargetId, dragSource, dropTarget }
    ) => {

        try {
            const srcType = dragSource.data.type;

            if (dragSource && dropTarget) {

                const dropType = dropTarget.data.type;

                //  Don't Allow Spaces Or Folders To Be Dropped Within The Same Type
                if (
                    (srcType == 'space' && dropType == 'space') ||
                    (srcType == 'folder' && dropType == 'folder')
                ) {
                    return false;
                }

            } else if (dropTarget == undefined) {

                //  Don't Allow List Or Folder To Be Dropped Outside The Root Element
                if (srcType == 'list' || srcType == 'folder') return false;

            }

            //  Allow Dropping If None Of The Above Is True
            return true;

        } catch (error) {
            //  Temporary Fix Since We're Using React DND and React Dnd-kit
            return;
        }

    };

    const { ref, getPipeHeight, toggle } = useTreeOpenHandler();

    //  Template For The First Dropdown 
    const workspaceItemTPL = (option) => {

        let _firstLetter = ucFirst(option.label);
        _firstLetter = firstLetter(_firstLetter);

        let _tpl = '';
        //  If We Have No Image
        if (!option.image) {
            _tpl = <span
                className="circle-user"
                style={{
                    backgroundColor: option.color ? option.color : '#7C4DFF',
                    borderRadius: '50%',
                    width: '33px',
                    height: '33px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    position: 'relative',
                    marginRight: '5px', // Spacing between circle and label
                }}
            >
                {_firstLetter}
            </span>

        } else {

            _tpl = <span
                className="circle-user"
                style={{ backgroundColor: option.color ? option.color : '#7C4DFF' }}
            >
                <img src={option.image} />
            </span>
        }

        return (
            <div className="d-flex align-items-center">
                {/* The Workspace Logo */}
                {_tpl}
                <span>{option.label}</span>
            </div>
        );

    }

    //  This Will Change The Default Workspace
    const dropdownCallBack = (item) => {

        //console.log("Item Was Clicked", item.id);

    }

    const stickyButtons = () => {
        return (
            <li>
                <a className="dropdown-item" href="#!"
                    onClick={(e) => { 
                        e.preventDefault(); 
                        openModal("Create A New Workspace", { compProps: { form: 'workspace' }}) 
                        }}
                    >
                    <span className="pe-2"><i className="fa-solid fa-plus"></i></span>
                    New Workspace
                </a>
            </li>
        )
    }

    return (
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">

                <div className="sb-sidenav-menu" style={{ overflowX: 'hidden' }}>
                    <div className="nav">

                        <div className='mt-2'>
                            {workspaceDropdown && (
                                <FieldsDropdown
                                    data={workspaceDropdown}
                                    itemTemplate={workspaceItemTPL}
                                    hasSearch={false}
                                    callBack={dropdownCallBack}
                                    dropdownBtnstyles={{ padding: 1.5 + 'rem' }}
                                    //stickyMenuButtons={stickyButtons}
                                />
                            )}

                        </div>

                        <button
                            className="btn btn-primary btn-sm border-0 position-relative mt-2"

                            type="button"
                            onClick={
                                () => openModal(
                                    "Workspace Settings",
                                    { compProps: { form: 'workspaceSettings' } },
                                    { modalSize: 'modal-xl' }
                                )
                            }
                        >
                            Workspace Settings
                        </button>

                        <div className="sb-sidenav-menu-heading">Home</div>

                        <Link to="/" className="nav-link">
                            <div className="sb-nav-link-icon"><i className="fas fa-home"></i></div>
                            Home
                        </Link>

                        <Link to="/assigned" className="nav-link">
                            <div className="sb-nav-link-icon"><i className="fas fa-tasks"></i></div>
                            Tasks
                        </Link>

                        <Link to="/contacts/contacts" className="nav-link">
                            <div className="sb-nav-link-icon"><i class="fa-solid fa-address-book"></i></div>
                            Contacts
                        </Link>
                        
                        {/* 
                        <Link to="/timesheets" className="nav-link">
                            <div className="sb-nav-link-icon"><i className="fas fa-stopwatch"></i></div>
                            Timesheets
                        </Link>
                        */}
                        
                        {/**
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
                        </div>*/}

                        {/* Begin Workspaces Sections */}
                        <div className="sb-sidenav-menu-heading">
                            Spaces
                            {/* Button To Open Up Create Modal */}
                            <button
                                className="btn btn-success btn-sm border-0 position-relative float-end"
                                style={{ bottom: 6 }}
                                type="button"
                                onClick={
                                    () => openModal(
                                        "Create A New Space", 
                                        { 
                                            compProps: { form: 'space' }

                                        }
                                    )}
                            >
                                Add Space
                            </button>

                            <button
                                className="btn btn-primary btn-sm border-0 position-relative me-2 float-end"
                                style={{ bottom: 6 }}
                                type="button"
                                onClick={
                                    () => openModal(
                                        "Create A New Task",
                                            {
                                                compProps: {
                                                    
                                                    callBack: (callBackData) => { 

                                                        // If The Route Is On ListId And The New Task Is Created On Said List
                                                        // Then We Should Refresh The View
                                                        if( callBackData.list_id == listId ) {
                                                            refreshTasks(listId);
                                                        }
                                                    }
                                                },
                                                type: "createTask"
                                            },
                                            { modalSize: 'modal-xl' }
                                    )}
                            >
                                Add Task
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

                        {/* Draggable */}
                        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                            <div className={styles.wrapper}>
                                <Tree
                                    ref={ref}
                                    classes={{
                                        root: styles.treeRoot,
                                        placeholder: styles.placeholder,
                                        dropTarget: styles.dropTarget,
                                        listItem: styles.listItem
                                    }}
                                    tree={treeData}
                                    sort={false}
                                    rootId={0}
                                    insertDroppableFirst={false}
                                    enableAnimateExpand={true}
                                    onDrop={handleDrop}
                                    canDrop={handleCanDrop}
                                    dropTargetOffset={5}
                                    placeholderRender={(node, { depth }) => (
                                        <Placeholder node={node} depth={depth} />
                                    )}
                                    render={(node, { depth, isOpen, isDropTarget, isDragging }) => (
                                        <Node
                                            key={node.id}
                                            node={node}
                                            depth={depth}
                                            isOpen={isOpen}
                                            isDragging={isDragging}
                                            onClick={() => {
                                                if (node.droppable) {
                                                    toggle(node?.id);
                                                }
                                            }}
                                            isDropTarget={isDropTarget}
                                            treeData={treeData}
                                        />
                                    )}
                                />
                            </div>
                        </DndProvider>
                    </div>
                </div>

                {/* Footer */}
                {
                /* <div className="sb-sidenav-footer">
                    <div className="small">Logged in as:</div>
                    Start Bootstrap
                </div> */
                }
            </nav>
        </div>
    );
}


export default SideBar;