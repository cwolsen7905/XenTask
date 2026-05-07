import React, { createContext,useContext,useState } from 'react';
import axios from 'axios';

export const DataContext = createContext({});

export const DataProvider = ({ children }) => {

  // The API URLs To Hit Based On The Env We're On
  const [globalData, setData] = useState({});

  // This Will Control The List Table Data So The List Tables Can Be Refreshed Anywhere
  const [listTable, setListTable] = useState({});

  //#region SIDEBAR RELATED FUNCTIONS

    //  Refresh The Spaces Data
    const refreshSpaces = async() => {

      try {
        const response = await axios.get(`https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}`, { withCredentials: true });

        if( response.status == 200 ){

          setData( prevData => ({
            ...prevData,
            SPACES: response.data
          }));

        }

      } catch(error) {
        console.log(error);
      }

    }

    // Function to add or update a space
    const addOrUpdateSpace = (space) => {
      setData(prevData => ({
        ...prevData,
        SPACES: {
          ...prevData.SPACES,
          [space.id]: {
            ...prevData.SPACES[space.id], // Retain existing properties
            ...space, // Override with new properties
          },
        },
      }));
    };

    // Function to update a specific key within a space
    const updateSpaceByKey = (spaceId, key, value) => {
      
      //console.log( "UpdateSpaceByKey", spaceId, key, value);

      setData(prevData => ({
        ...prevData,
        SPACES: {
          ...prevData.SPACES,
          [spaceId]: {
            ...prevData.SPACES[spaceId],
            [key]: value,
          },
        },
      }));

    };

    // Function to add or update a list within a space
    const addOrUpdateList = (spaceId, list) => {

      //console.log("addOrUpdateList",spaceId,list);

      setData(prevData => {
        const updatedData = { ...prevData };
      
        if (!updatedData.SPACES) {
          updatedData.SPACES = {};
        }
      
        if (!updatedData.SPACES[spaceId]) {
          updatedData.SPACES[spaceId] = { lists: {} };
        } else if (!updatedData.SPACES[spaceId].lists) {
          updatedData.SPACES[spaceId].lists = {};
        }
      
        return {
          ...updatedData,
          SPACES: {
            ...updatedData.SPACES,
            [spaceId]: {
              ...updatedData.SPACES[spaceId],
              lists: {
                ...updatedData.SPACES[spaceId].lists,
                [list.id]: {
                  ...updatedData.SPACES[spaceId].lists[list.id], // Retain existing properties
                  ...list, // Override with new properties
                },
              },
            },
          },
        };
      });
      
      


    };

    const updateListByKey = (spaceId, listId, key, value, folderId = null) => {
      setData(prevData => {
        const updatedSpace = { ...prevData.SPACES[spaceId] };
    
        if (folderId) {
          // Update list inside a folder
          const updatedFolder = {
            ...updatedSpace.folders[folderId],
            lists: {
              ...updatedSpace.folders[folderId].lists,
              [listId]: {
                ...updatedSpace.folders[folderId].lists[listId],
                [key]: value,
              },
            },
          };
          updatedSpace.folders = {
            ...updatedSpace.folders,
            [folderId]: updatedFolder,
          };
        } else {
          // Update list directly under space
          updatedSpace.lists = {
            ...updatedSpace.lists,
            [listId]: {
              ...updatedSpace.lists[listId],
              [key]: value,
            },
          };
        }
    
        return {
          ...prevData,
          SPACES: {
            ...prevData.SPACES,
            [spaceId]: updatedSpace,
          },
        };
      });
    };

    // Function to add or update a folder within a space
    const addOrUpdateFolder = (spaceId, folder) => {
      setData(prevData => {
        const updatedData = { ...prevData };
      
        if (!updatedData.SPACES) {
          updatedData.SPACES = {};
        }
      
        if (!updatedData.SPACES[spaceId]) {
          updatedData.SPACES[spaceId] = { folders: {} };
        } else if (!updatedData.SPACES[spaceId].folders) {
          updatedData.SPACES[spaceId].folders = {};
        }
      
        return {
          ...updatedData,
          SPACES: {
            ...updatedData.SPACES,
            [spaceId]: {
              ...updatedData.SPACES[spaceId],
              folders: {
                ...updatedData.SPACES[spaceId].folders,
                [folder.id]: {
                  ...updatedData.SPACES[spaceId].folders[folder.id], // Retain existing properties
                  ...folder, // Override with new properties
                },
              },
            },
          },
        };
      });
      
    };

    //  Add A New List To A Folder
    const addListToFolder = (spaceId, folderId, newListId, newListData) => {
      setData(prevData => ({
        ...prevData,
        SPACES: {
          ...prevData.SPACES,
          [spaceId]: {
            ...prevData.SPACES[spaceId],
            folders: {
              ...prevData.SPACES[spaceId].folders,
              [folderId]: {
                ...prevData.SPACES[spaceId].folders[folderId],
                lists: {
                  ...prevData.SPACES[spaceId].folders[folderId].lists,
                  [newListId]: newListData
                }
              }
            }
          }
        }
      }));
    };

    // Function to add update a specific key within a folder in a space
    const updateFolderByKey = (spaceId, folderId, key, value) => {
      setData(prevData => ({
        ...prevData,
        SPACES: {
          ...prevData.SPACES,
          [spaceId]: {
            ...prevData.SPACES[spaceId],
            folders: {
              ...prevData.SPACES[spaceId].folders,
              [folderId]: {
                ...prevData.SPACES[spaceId].folders[folderId],
                [key]: value,
              },
            },
          },
        },
      }));
    };

    // Function to delete a space
    const deleteSpace = (spaceId) => {
      setData(prevData => {
        const updatedSpaces = { ...prevData.SPACES };
        delete updatedSpaces[spaceId];
        return { ...prevData, SPACES: updatedSpaces };
      });
    };

    // Function to delete a list from a space
    const deleteList = (spaceId, listId) => {
      //console.log(`Deleting Folder ${listId} From Space: ${spaceId} `)
      setData(prevData => {
        const updatedLists = { ...prevData.SPACES[spaceId].lists };
        delete updatedLists[listId];
        return {
          ...prevData,
          SPACES: {
            ...prevData.SPACES,
            [spaceId]: {
              ...prevData.SPACES[spaceId],
              lists: updatedLists,
            },
          },
        };
      });
    };

    const deleteFolderListItem = (spaceId, folderId, listId) => {
      
      //console.log(`Deleting List ${listId} From folder ${folderId} From Space: ${spaceId} `)

      setData(prevData => {
        const updatedSpaces = {
          ...prevData.SPACES,
          [spaceId]: {
            ...prevData.SPACES[spaceId],
            folders: {
              ...prevData.SPACES[spaceId].folders,
              [folderId]: {
                ...prevData.SPACES[spaceId].folders[folderId],
                lists: {
                  ...prevData.SPACES[spaceId].folders[folderId].lists
                }
              }
            }
          }
        };
    
        // Delete the specified list
        delete updatedSpaces[spaceId].folders[folderId].lists[listId];
    
        return {
          ...prevData,
          SPACES: updatedSpaces
        };
      });
    };

    // Function to delete a folder from a space
    const deleteFolder = (spaceId, folderId) => {
      setData(prevData => {
        const updatedFolders = { ...prevData.SPACES[spaceId].folders };
        delete updatedFolders[folderId];
        return {
          ...prevData,
          SPACES: {
            ...prevData.SPACES,
            [spaceId]: {
              ...prevData.SPACES[spaceId],
              folders: updatedFolders,
            },
          },
        };
      });
    };
  //#endregion
  
  //#region USER DATA FUNCTIONS
    const refreshUserData = (userData) => {
      // Update USER object in the state
      const updatedState = {
          ...globalData,      // Spread all properties of the current state
          USER: userData      // Replace USER object with the new userData object
      };

      // Update state using setState
      setData(updatedState);
    };
  //#endregion
  
  //#region LIST TABLE RELATED FUNCTIONS
    
    /**
     * 
     * @param {string} listId - The List Table To Refresh
     */
    const refreshTasks = async ( listId ) => {

      try {
          
          //  Make A Call To The API To pull Up Lists Tasks
          let _url = `https://${globalData.api_url}/list/${listId}/tasks`;

          const response = await axios.get( _url, { withCredentials: true } );

          if( response.status == 200 ) {

              //  Update State Variable
              setListTable(response.data);
              
              return true;
          
          } else {
            
            return false;
          
          }

      } catch (error) {

          console.log(error);
          return false;

      }

    }

  //#endregion

  return (
    <DataContext.Provider value={{
      globalData,
      listTable,
      setData,
      addListToFolder,
      addOrUpdateSpace,
      updateSpaceByKey,
      addOrUpdateList,
      updateListByKey,
      addOrUpdateFolder,
      updateFolderByKey,
      deleteSpace,
      deleteList,
      deleteFolder,
      deleteFolderListItem,
      refreshSpaces,
      refreshUserData,
      refreshTasks
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);