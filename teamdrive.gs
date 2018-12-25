//You need to activate advance services : https://developers.google.com/apps-script/advanced/drive
// https://developers.google.com/drive/api/v2/reference/files/copy#request-body

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
  
  this.getElementIdfromFolder = function (folderid,elementname) {
    var elementlist = teamdrive.getListofElementsinFolder(newfolder["id"]);
    var found = false;
    for (var key in elementlist){
      if (elementlist[key]["title"].indexOf("elementname") != -1){
        found = true;
         return elementlist[key]["id"];
      };
    }
    if (!found){
      return "Non trouvé";
    }
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
      parents: [ {id: targetFolderId} ]      
    };
    
    return Drive.Files.copy(metadata, sourceId, options);
  }
  
  this.copyFolderContent = function (sourcefolder, destinationfolder) {
    var elements = this.getListofElementsinFolder(sourcefolder);
    for (var i = 0; i < elements.length; i++) {
      if (elements[i]["type"] == "File"){
        this.copyFile(elements[i]["title"], elements[i]["id"],destinationfolder);
      }else{
        var newfolder = this.createSubFolder(destinationfolder, elements[i]["title"]);
        this.copyFolderContent (elements[i]["id"],newfolder["id"]);
      }
    } 
  };
  
  this.moveFolderContent = function  (sourcefolder, destinationfolder){
    this.copyFolderContent(sourcefolder,destinationfolder);
    this.RemoveElementfromDrive(sourcefolder);
  }
  
  this.RemoveElement = function (elementid) {
    var params = {
      supportsTeamDrives: true,
      includeTeamDriveItems: true
    };
    return Drive.Files.remove(elementid,params);
  }
  
  this.renameElement = function (elementid,newname){
    var metadata = {
      fileId: elementid,
      //addParents: commaStringOfParents,
      //removeParents: commaStringOfParents,
      resource: { title : newname }
    }
    var params = {
      supportsTeamDrives: true,
      includeTeamDriveItems: true
    }
    return Drive.Files.update({title: newname}, elementid,null,params); 
  }

}


/*function test(){
  var teamdrive = new TeamDriveclass();
  //teamdrive.copyFolderContent ("1CFfvA5GRVIoxz34OJFx6w-wo7R-coQ23","1T6ZDOX07kOR6ID3Dsfywwp5AsFPBVKBL")
  teamdrive.renameElement("1yh1yXojhDGQ5MtRFWF4kAefg3EV5jr2MgWo3W-S4CaY","Juan");
}*/

