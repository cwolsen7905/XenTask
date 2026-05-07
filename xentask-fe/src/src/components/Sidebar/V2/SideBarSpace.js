/**
 * Creates A Space Container In The Dropdown
 */
 import {forwardRef,useState} from "react"
 import { useNavigate } from 'react-router-dom';
 import { useUI } from '../../Contexts/UIContext';
 import { Collapse } from 'react-bootstrap';
 
const SidebarSpace = forwardRef(
    (
     { 
         id, 
         children, 
         name, 
         wrapperRef,
         handleProps,
         indentationWidth,
         depth, 
         ...props
    }, ref  
    ) => {

     const { openModal } = useUI();
 
     const navigate = useNavigate();
     
     const [isDropdownOpen, setIsDropdownOpen] = useState(false);

     const navigateToView = () => {
 
         navigate(`/space/${id}`);   // Use navigate to navigate to the desired view
         setIsDropdownOpen(true);    // Open the dropdown after navigating
     };
 
    return (
         <div 
             className="d-flex align-items-center justify-content-between"
             ref={wrapperRef}
             {...props}
             style={{"margin-left": `${indentationWidth * depth}rem`}}
         >
     
             {/* List Item Component Collapse Trigger */}
             <div className="d-flex align-items-center" {...handleProps} ref={ref}>
                 <button className={`nav-link pe-0`}> 
                     <div className="sb-nav-link-icon">
                     <div className="nav-icons">
                         <div className="shown-nav-icon">
                         <i className="fas fa-columns"></i>
                         </div>
                         <div className="hidden-nav-icon">
                             <i className="fas fa-angle-right"></i>
                         </div>
                     </div>
                     </div>
                 </button>
 
                 <span style={{ cursor: 'pointer', padding:1 }} onClick={navigateToView}>{name}</span>
             </div>
 
             {/* Quick Actions */}
             <div className="me-2">
 
                 <button className="btn btn-outline-secondary btn-sm border-0 mt-2" type="button" id="dropdownMenuButton5" data-bs-toggle="dropdown" aria-expanded="false">
                     <i className="fa-solid fa-ellipsis"></i>
                 </button>
 
                 <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton5">

                    {/*
                     <li><a className="dropdown-item" href="#!"><span className="pe-2"><i className="fa-solid fa-pencil"></i></span>Rename</a></li>
                     <li><a className="dropdown-item" href="#!"><span className="pe-2"><i className="fa-solid fa-chain"></i></span>Copy Link</a></li>
                     */}
                     <li><hr className="dropdown-divider" /></li>
 
                     <li className="dropdown-submenu context-item">
 
                         <a className="dropdown-item" href="#!"
                             onClick={(e) => { e.preventDefault() }}>
                             <span className="pe-2"><i className="fa-solid fa-plus"></i></span>
                             Create New
                             <i className="fas fa-angle-right mt-1 ml-2 float-end"></i>
                         </a>
 
                         <ul className="dropdown-menu dropright">
                             <li>
                                 <a className="dropdown-item" href="#!"
                                     onClick={() => openModal( 
                                         "Create A New List", 
                                         { 
                                             compProps: { 
                                                 form: 'list',
                                                 space_hash: id
                                             } 
                                         })}
                                 >
                                     <span className="pe-2">
                                         <i className="fa-solid fa-list"></i>
                                     </span>List
                                 </a>
                             </li>
 
                             <li>
                                 <a className="dropdown-item" href="#!"
                                     onClick={() => openModal( "Create A New Folder", { 
                                         compProps: { 
                                             form: 'folder',
                                             space_hash: id 
                                         } 
                                     })}
                                 >
                                     <span className="pe-2">
                                         <i className="fa-solid fa-folder"></i>
                                     </span>Folder
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li><hr className="dropdown-divider" /></li>
                     <li>
                         <button
                             className="dropdown-item"
                             type="button"
                             onClick={() => openModal(
                                 "Space Settings", 
                                 { 
                                     compProps: { 
                                         form: 'settings', 
                                         type: "space",
                                         id: id,
                                         name: name
                                     } 
 
                                 }, { modalSize: 'modal-lg' })}
                         >
                             <span className="pe-2">
                                 <i className="fa-solid fa-cog"></i>
                             </span>
                             Settings
                         </button>
                     </li>
                 </ul>
 
                 <button className="btn btn-outline-secondary btn-sm border-0 mt-2" type="button" id="dropdownMenuButton6" data-bs-toggle="dropdown" aria-expanded="false">
                     <i className="fa-solid fa-plus"></i>
                 </button>
 
                 <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton6">
                     <li>
                         <a className="dropdown-item" href="#!"
                             onClick={() => openModal("Create A New List", { compProps: { form: 'list', space_hash: id } })}
                         >
                             <span className="pe-2">
                                 <i className="fa-solid fa-list"></i>
                             </span>List
                         </a>
                     </li>
                     <li>
                         <a className="dropdown-item" href="#!"
                             onClick={() => openModal("Create A New Folder", { compProps: { form: 'folder', space_hash: id  }})}
                         >
                             <span className="pe-2">
                                 <i className="fa-solid fa-folder"></i>
                             </span>Folder
                         </a>
                     </li>
                 </ul>
             </div>
         </div>
 
 )
  
});
  
  export default SidebarSpace
  
  /*
      
   */