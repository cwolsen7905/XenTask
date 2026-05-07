/**
 * Creates Spaces, Lists, And Folders
 */
import axios from 'axios';
import { useState, useContext } from 'react';
import { ucFirst } from '../../../Utils/Utils';
import { DataContext } from '../../Contexts/DataContext';

const NewWorkspaceResource = ( { options, closeModal } ) => {

    const { globalData, addOrUpdateSpace, addOrUpdateList, addListToFolder, addOrUpdateFolder, deleteFolderListItem } = useContext(DataContext);

    const { form, space_hash, folder_hash } = options;

    const [ nameVal, setNameVal ] = useState('');
    const [ isPrivate, setIsPrivate] = useState('');

    const createNewResource = async (e) => {

        e.preventDefault();
        
        let _workspace = globalData.USER.default_workspace;

        try {
            
            let _postData = {
                name: nameVal,
                is_private: isPrivate,
            };

            _postData['space_hash'] = space_hash;
            _postData['folder_hash'] = folder_hash != undefined ? folder_hash : 0; 

            _postData = JSON.stringify( _postData );

            //console.log(_postData);

            let _url;

            if( form == 'space' ) {

                _url = `https://${globalData.api_url}/workspace/${_workspace}/space`
            
            } else {

                _url = `https://${globalData.api_url}/${form}`
           
            }

            const response = await axios.post( _url,  _postData, { withCredentials: true });

            if (response.status === 200) {

                switch( form ){
                    
                    case('space'):

                        const { id, hash, name, is_private } = response.data;

                        addOrUpdateSpace({
                            id,
                            name,
                            is_private
                        });
                    break;

                    case('list'):

                        if( folder_hash ){

                            addListToFolder ( space_hash, folder_hash, response.data.id, {
                                id: response.data.list_hash,
                                is_private: response.data.is_private,
                                name: response.data.name,
                            })
                          
                        } else {

                            addOrUpdateList( space_hash, 
                                {
                                    id: response.data.hash,
                                    is_private: response.data.is_private,
                                    name: response.data.name,
    
                                }
                            )
                        }
                        
                    break;

                    case('folder'):
                        addOrUpdateFolder(space_hash,{
                            id: response.data.folder_hash,
                            is_private: response.data.is_private,
                            name: response.data.name,
                        });
                    break;
                }
                
                closeModal();

            } else {

                console.error(response);
                
            }

        } catch (error) {
            console.log(error);
        }

       
    }


    return (
        <form onSubmit={createNewResource}>
            <div className="mb-3">
                <label for={`${form}NameInput`} className="form-label">{ucFirst(form)} Name</label>
                <input
                    type="text" 
                    className="form-control" 
                    id={`${form}NameInput`}
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    required
                />
                <div className="form-text">Give A Unique Name For Your New { ucFirst(form) }</div>
            </div>
            {
                form != 'workspace' && (
                    <div className="form-check form-switch">
                        <input 
                            className="form-check-input" type="checkbox" id={`${form}Switch`} 
                            value={isPrivate} 
                            onChange={ () => setIsPrivate(!isPrivate) }
                        />
                        <label className="form-check-label" >Make Private</label> 
                        
                    </div>
                )
            }
            <button type="submit" className="btn btn-primary float-end">Submit</button>
        </form>
    );

}

export default NewWorkspaceResource;