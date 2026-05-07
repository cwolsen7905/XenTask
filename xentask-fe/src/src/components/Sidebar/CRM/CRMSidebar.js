import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { useUI } from '../../../components/Contexts/UIContext';
import { useData } from '../../../components/Contexts/DataContext';
import SidebarTableItem from './SidebarTableItem';

import axios from 'axios';

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

const CRMSideBar = () => {

    const { openModal } = useUI();
    const { globalData } = useData();
    const [navbarItems, setNavbarItems] = useState([
        {
            id: "aaf0cc5b8b",
            name: "Test Table",
        },
        {
            id: "aaf0cc5b8d",
            name: "Table 2",
        },
    ]);
    const [activeObj, setActiveObj] = useState(null);

    function handleDragStart(event) {

        const { active } = event;
        setActiveObj(active.data.current);

    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) return;

        // Step 1: Get a copy of the current state
        let updatedItems = [...navbarItems];

        // Step 2: Find the indexes of active and over items
        const activeIndex = updatedItems.findIndex(item => item.id === active.id);
        const overIndex = updatedItems.findIndex(item => item.id === over.id);

        // Step 3: Perform the reordering if valid indexes are found
        if (activeIndex !== -1 && overIndex !== -1) {
            updatedItems = arrayMove(updatedItems, activeIndex, overIndex);
        }

        //console.log("moving Items In the Container", updatedItems);
        // Step 4: Update the state and pass the new array to the callback
        setNavbarItems(updatedItems);
        //updateConditionalFieldsOrder(updatedItems);
        setActiveObj(null);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 1,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),
    )

    return (
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">

                <div className="sb-sidenav-menu" style={{ overflowX: 'hidden' }}>
                    <div className="nav">

                        <div className='mt-2'>
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

                        <div className="sb-sidenav-menu-heading">
                            Reports
                        </div>

                        {/* Begin Workspaces Sections */}
                        <div className="sb-sidenav-menu-heading">
                            Tables
                            <button
                                className="btn btn-primary btn-sm border-0 position-relative me-2 float-end"
                                style={{ bottom: 6 }}
                                type="button"
                                onClick={
                                    () => openModal(
                                        "Create A New Table",
                                        { compProps: { form: 'newTable' } }
                                    )
                                }
                            >
                                Add Table
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
                        <DndContext
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            sensors={sensors}
                            collisionDetection={closestCorners}
                        >
                            {navbarItems.length > 0 && (
                                <SortableContext items={navbarItems.map((elm) => elm.id)}>

                                    {navbarItems.map((e, i) => (
                                        <SidebarTableItem data={e} />
                                    ))}

                                </SortableContext>
                            )}

                            <DragOverlay adjustScale={false}>

                                {/* Drag Overlay For item Item */}
                                {
                                    activeObj && (
                                        <SidebarTableItem data={activeObj} />
                                    )
                                }
                            </DragOverlay>


                        </DndContext>

                    </div>
                </div>

            </nav>
        </div>
    );
}


export default CRMSideBar;