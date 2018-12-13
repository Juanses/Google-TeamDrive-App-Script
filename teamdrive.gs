//You need to activate advance services : https://developers.google.com/apps-script/advanced/drive
var TeamDriveclass = function(){
  
  this.createSubFolder = function (parentId, title) {
    if(!parentId) throw new TypeError("Expected a string ID to be passed, identifying the parent folder in which a folder will be created.");
    if(!title) title = "Random Folder Title";
    //Use of TeamDrives
    var params = {
      supportsTeamDrives: true,
      includeTeamDriveItems: true
    };
    //Metadata for the folder creation
    var metadata = {
      parents:[],
      mimeType: MimeType.FOLDER,
      title: title,
    };
    //Get the Drive Element of the parent folder
    var folder = Drive.Files.get(parentId, params);
    if(folder.mimeType !== MimeType.FOLDER)
      throw new TypeError("Input parent folder ID is a file of type='" + file.mimeType + "'. Folders must be type='" + MimeType.FOLDER + "'.");
    //Add the parent folder as a parent of the new future new Folder, so it won't be created at the root
    metadata.parents.push(folder);
    //Creation of the folder
    return Drive.Files.insert(metadata, null, params);
  }
  
  this.getListofElementsinFolder = function (folderid){
    var pageToken
    var results = []; //The result
    
    do {
      //I get the list of the files and folders
      var drivelist = Drive.Files.list({ 
        pageSize: 100,
        includeTeamDriveItems: true,
        supportsTeamDrives: true,
        q: "'"+folderid+"' in parents and trashed = False"
      });
      
      for (var i = 0; i < drivelist.items.length; i++) {
        var element = {};
        var driveelement = drivelist.items[i];    
        if (driveelement.mimeType == "application/vnd.google-apps.folder"){
          element["type"] = "Folder";
        }else{
          element["type"] = "File";
        }
        
        element["title"] = driveelement.title;
        element["id"] = driveelement.id;
        results.push(element);
      }
      pageToken = drivelist.nextPageToken;
    } while (pageToken); 
    
    return results
  }
  
  this.copyFile = function (newName, sourceId, targetFolderId) {
    if (!newName || !sourceId || !targetFolderId)
      return;
    const options = {
      fields: "id,title,parents", // properties sent back to you from the API
      supportsTeamDrives: true, // needed for Team Drives
    };
    const metadata = {
      title: newName,
      // Team Drives files & folders can have only 1 parent
      parents: [ {id: targetFolderId} ],
      // other possible fields you can supply: 
      // https://developers.google.com/drive/api/v2/reference/files/copy#request-body
    };
    
    return Drive.Files.copy(metadata, sourceId, options);
  }
  
  this.copyFolderContent = function (sourcefolder, destinationfolder) {
    var elements = this.getListofElementsinFolder(sourcefolder);
    for (var i = 0; i < elements.length; i++) {
      if (elements[i]["type"] == "File"){
        this.copyFile(elements[i]["title"], elements[i]["id"],destinationfolder);
      }else{
        var newfolder = createSubFolder(destinationfolder, elements[i]["title"]);
        this.copyFolderContent (elements[i]["id"],newfolder["id"]);
      }
    } 
  }
  
}

function test(){
  recursive ("1CFfvA5GRVIoxz34OJFx6w-wo7R-coQ23","1T6ZDOX07kOR6ID3Dsfywwp5AsFPBVKBL")
}

