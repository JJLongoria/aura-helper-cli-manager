# **Aura Helper CLI Manager Module**

[![Version](https://img.shields.io/npm/v/@aurahelper/core?logo=npm)](https://www.npmjs.com/package/@aurahelper/core)
[![Total Downloads](https://img.shields.io/npm/dt/@aurahelper/core?logo=npm)](https://www.npmjs.com/package/@aurahelper/core)
[![Downloads/Month](https://img.shields.io/npm/dm/@aurahelper/core?logo=npm)](https://www.npmjs.com/package/@aurahelper/core)
[![Issues](https://img.shields.io/github/issues/jjlongoria/aura-helper-core)](https://github.com/JJLongoria/aura-helper-core/issues)
[![Known Vulnerabilities](https://snyk.io/test/github/JJLongoria/aura-helper-core/badge.svg)](https://snyk.io/test/github/JJLongoria/aura-helper-core)
[![Code Size](https://img.shields.io/github/languages/code-size/jjlongoria/aura-helper-core)](https://github.com/JJLongoria/aura-helper-core)
[![License](https://img.shields.io/github/license/jjlongoria/aura-helper-core?logo=github)](https://github.com/JJLongoria/aura-helper-core/blob/master/LICENSE)


Module to create and handle Aura Helper CLI processes. With this module you can execute all CLI operations and handle the processes progress easy with the callbacks functions.

Aura Helper CLI is a Command Line Interface application to work with Salesforce projects. Is specially designed to DevOps workflows and Continous Integration.

Aura Helper CLI has too many processes to list or describe metadata types, import and export data between orgs, retrieve special metadata types, compress xml files, execute apex anonymous scripts N times or create package files to deploy or delete from git changes among other operations.

---

## *Table of Contents*

- [**CLIManager Class**](#climanager-class)

- [**Repair Response**](#repair-response)
  
- [**Only Check Response**](#only-check-response)

- [**Metadata JSON Format**](#metadata-json-format)

---

# [**CLIManager Class**](#climanager-class)
Class to create and handle Aura Helper CLI processes. With this module you can execute all CLI operations and handle the processes progress easy with the callbacks functions. Aura Helper CLI Has too many processes to list or describe metadata types, import and export data between orgs, retrieve special metadata types, compress xml files, execute apex anonymous scripts N times or create package files to deploy or delete from git changes among other operations.

The setters methods are defined like a builder pattern to make it more usefull

All CLI Manager methods return a Promise with the associated data to the processes. 

### *Class Members*
- [**Fields**](#climanager-class-fields)

- [**Constructors**](#climanager-class-constructor)

- [**Methods**](#climanager-class-methods)

</br>

# [**Fields**](#climanager-class-fields)
The fields that start with _ are for internal use only (Does not modify this fields to a correct CLI Manager work). To the rest of fields, setter methods are recommended instead modify fields.

### [**projectFolder**](#connection-class-fields-projectFolder)
Path to the local project root folder
- String

### [**apiVersion**](#connection-class-fields-apiVersion)
API Version number to run processes and connect to salesforce
- String | Number

### [**namespacePrefix**](#connection-class-fields-namespacePrefix)
Namespace prefix from the Org 
- String

### [**compressFiles**](#connection-class-fields-compressFiles)
True to compress all affected files when execute CLI Processes, false in otherwise 
- Boolean

### [**sortOrder**](#connection-class-fields-sortOrder)
Sort order value to sort the compresses files
- String

### [**ignoreFile**](#connection-class-fields-ignoreFile)
Path to the ignore file to use on all processes that can ignore metadata
- String

### [**outputPath**](#connection-class-fields-outputPath)
Path to the folder to save all outputs from commands when choose save output into a file.
- String

</br>

# [**Constructors**](#climanager-class-constructors)
The CLI Manager class has only one constructor to create a connection

## [**constructor(projectFolder, apiVersion, namespacePrefix)**](#connection-class-constructors-construct)
Constructor to create a new CLI Manager object. All parameters are optional and you can use the setters methods to set the values when you want.

### **Parameters:**
  - **projectFolder**: Path to the local project root folder
    - String
  - **apiVersion**: API Version number to run processes and connect to salesforce
    - String | Number
  - **namespacePrefix**: Namespace prefix from the Org
    - String

</br>

# [**Methods**](#climanager-class-methods)

  - [**setApiVersion(apiVersion)**](#setapiversionapiversion)

    Method to set the API Version number to execute some Aura Helper CLI Processes

  - [**setProjectFolder(apiVersion)**](#setprojectfolderapiversion)

    Method to set the local root project path to execute all Aura Helper CLI Processes

  - [**setNamespacePrefix(namespacePrefix)**](#setnamespaceprefixnamespaceprefix)

    Method to set the Namespace prefix from the project org

  - [**setCompressFiles(compressFiles)**](#setcompressfilescompressfiles)

    Method to set if compress the affected files by Aura Helper processes

  - [**setSortOrder(sortOrder)**](#setsortordersortorder)

    Method to set the sort order when compress XML Files

  - [**setIgnoreFile(ignoreFile)**](#setignorefileignorefile)
    
    Method to set the ignore file path to use on some Aura Helper CLI Processes

  - [**setOutputPath(outputPath)**](#setoutputpathoutputpath)
    
    Method to set the output folder path to redirect the response to files

  - [**onProgress(callback)**](#onprogresscallback)
    
    Method to handle the progress event to handle AHCLI Progression

  - [**onAbort(callback)**](#onabortcallback)
    
    Method to handle when CLI Manager is aborted

  - [**abortProcess()**](#abortprocess)
    
    Method to abort all CLI Manager running processes. When finishes call onAbort() callback

  - [**compress(filesOrFolders, sortOrder)**](#compressfilesorfolders-sortorder)
    
    Method to compress a single file or folder or array with files to compress (compress more than one folder is not allowed but you can compress an entire folder an subfolders)

  - [**compareWithOrg()**](#comparewithorg)
    
    Method to compare the local project with the project auth org. Return the Metadata Types that exists on Org and not exists on local project

  - [**compareOrgBetween(source, target)**](#compareorgbetweensource-target)
    
    Method to compare between two orgs. Return the Metadata Types that exists on target and not exists on source. Source and Target must be authorized in the system.

  - [describeLocalMetadata(types)](#describelocalmetadatatypes)
    
    Method to describe the all or selected Metadata Types from your local project

  - [**describeOrgMetadata(downloadAll, types)**](#describeorgmetadatadownloadall-types)
    
    Method to describe the all or selected Metadata Types from your project org

  - [**retrieveLocalSpecialMetadata(types)**](#retrievelocalspecialmetadatatypes)
    
    Method to retrieve all or selected local special types

  - [**retrieveOrgSpecialMetadata(downloadAll, types)**](#retrieveorgspecialmetadatadownloadall-types)
    
    Method to retrieve all or selected special types from org

  - [**retrieveMixedSpecialMetadata(downloadAll, types)**](#retrievemixedspecialmetadatadownloadall-types)
    
    Method to retrieve all or selected special types on mixed mode

  - [**loadUserPermissions()**](#loaduserpermissions)
    
    Method to load all available user permissions on the project org

  - [**createPackageFromGit(source, target, createType, deleteOrder, useIgnore)**](#createpackagefromgitsource-target-createtype-deleteorder-useignore)
    
    Method to create the package XML and destructive XML files from git diffs and changes between two commits, tags, branches

  - [**createPackageFromJSON(source, createType, deleteOrder, useIgnore, explicit)**](#createpackagefromjsonsource-createtype-deleteorder-useignore-explicit)
    
    Method to create the package XML or destructive XML file from a Metadata JSON file
    
  - [**createPackageFromOtherPackages(source, createType, deleteOrder, useIgnore, explicit)**](#createpackagefromotherpackagessource-createtype-deleteorder-useignore-explicit)
   
    Method to create the package XML or destructive XML from other Package XML Files

  - [**ignoreMetadata(types)**](#ignoremetadatatypes)
   
    Method to ignore Metadata Types from the local project

  - [repairDependencies(types, onlyCheck, useIgnore)](#repairdependenciestypes-onlycheck-useignore)
    
    Method to repair all error dependencies from your local project. Also you can check only to check if has errors.

  - [isAuraHelperCLIInstalled()](#isaurahelpercliinstalled)

    Method to check if Aura Helper is installed on the system

  - [getAuraHelperCLIVersion()](#getaurahelpercliversion)

    Method to get the Aura Helper CLI installed version on the system

  - [updateAuraHelperCLI()](#updateaurahelpercli)

    Method to update Aura Helper CLI with aura helper update command

  - [updateAuraHelperCLIWithNPM()](#updateaurahelpercliwithnpm)

    Method to update Aura Helper CLI with NPM command

---
## [**setApiVersion(apiVersion)**](#setapiversionapiversion)
Method to set the API Version number to execute some Aura Helper CLI Processes

### **Parameters:**
  - **apiVersion**: API Version number to run processes and connect to salesforce
    - String

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager API version**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setApiVersion(50); 
---

## [**setProjectFolder(apiVersion)**](#setprojectfolderapiversion)
Method to set the local root project path to execute all Aura Helper CLI Processes

### **Parameters:**
  - **apiVersion**: Path to the local project root folder. './' by default
    - String

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager project folder**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setProjectFolder('path/to/root/project/folder'); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).setProjectFolder('path/to/root/project/folder'); 
---

## [**setNamespacePrefix(namespacePrefix)**](#setnamespaceprefixnamespaceprefix)
Method to set the Namespace prefix from the project org

### **Parameters:**
  - **namespacePrefix**: Namespace prefix from the Org
    - String

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager namespace prefix**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setNamespacePrefix('NSPrefix'); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).setNamespacePrefix('NSPrefix'); 
---

## [**setCompressFiles(compressFiles)**](#setcompressfilescompressfiles)
Method to set if compress the affected files by Aura Helper processes

### **Parameters:**
  - **compressFiles**: True to compress all affected files by Aura Helper proceses, false in otherwise
    - Boolean

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager compress files**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setCompressFiles(true); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).setCompressFiles(true); 
---

## [**setSortOrder(sortOrder)**](#setsortordersortorder)
Method to set the sort order when compress XML Files

### **Parameters:**
  - **sortOrder**: Sort order value
    - String

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager compress files**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setSortOrder('alphabetDesc'); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).setSortOrder('alphabetDesc'); 
---

## [**setIgnoreFile(ignoreFile)**](#setignorefileignorefile)
Method to set the ignore file path to use on some Aura Helper CLI Processes

### **Parameters:**
  - **ignoreFile**: Path to the ignore file
    - String

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager ignore file**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setIgnoreFile('path/to/ignore/file.json'); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).setIgnoreFile('path/to/ignore/file.json'); 
---

## [**setOutputPath(outputPath)**](#setoutputpathoutputpath)
Method to set the output folder path to redirect the response to files

### **Parameters:**
  - **outputPath**: Path to the output folder
    - String

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager ignore file**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.setOutputPath('path/to/ignore/output/path'); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).setOutputPath('path/to/ignore/output/path'); 
---

## [**onProgress(callback)**](#onprogresscallback)
Method to handle the progress event to handle AHCLI Progression

### **Parameters:**
  - **callback**: Callback function to handle the progress
    - Function

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager on progress callback**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.onProgress((status) => {

    }); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).onProgress((status) => {

    }); 
---

## [**onAbort(callback)**](#onabortcallback)
Method to handle the event when CLIManager processes are aborted

### **Parameters:**
  - **callback**: Callback function to call when CLI Manager is aborted
    - Function

### **Return:**
Returns the cli manager object
- CLIManager

### **Examples:**
**Set CLI Manager on aport callback**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.onAbort(() => {
        // Execute when abort all processes
    }); 

    // Or can concatenate method calls because setters return a cli manager object
    cliManager.setApiVersion(50).onAbort(() => {

    }); 
---

## [**abortProcess()**](#abortprocess)
Method to abort all CLI Manager running processes. When finishes call onAbort() callback

### **Examples:**
**Abort CLI Manager running processes**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager();

    cliManager.onAbort(() => {
        console.log('process aborted');
    }); 

    cliManager.abortProcess(); 
---

## [**compress(filesOrFolders, sortOrder)**](#compressfilesorfolders-sortorder)
Method to compress a single file or folder or array with files to compress (compress more than one folder is not allowed but you can compress an entire folder an subfolders)

### **Parameters:**
  - **filesOrFolders**: file path or paths to compress or folder path to compress
    - String | Array\<String\>
  - **sortOrder**: Sort order value to sort XML Elements compress
    - String

### **Return:**
Return an empty promise when compress files finish succesfully
- Promise\<Any\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **OperationNotSupportedException**: If try to compress more than one folder, or file and folders at the same time
- **DataNotFoundException**: If not found file or folder paths
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the project folder or package folder is not a directory
- **WrongFilePathException**: If the file is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the file is not a file
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Compress a single XML file**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const filePath = 'path/to/file.xml';

    cliManager.compress(filePath).then((response) => {
        console.log('File compressed successfully');
    }).catch((error) => {
        // Handle error
    }); 

**Compress an entire folder and subfolders**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const folderPath = 'path/to/folder';

    cliManager.compress(folderPath).then((response) => {
        console.log('Files compressed successfully');
    }).catch((error) => {
        // Handle error
    }); 

**Compress a file list**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const files = [
        'path/to/file1.xml',
        'path/to/file2.xml',
        'path/to/file3.xml',
        'path/to/file4.xml',
        'path/to/file5.xml',
    ];

    cliManager.compress(files).then((response) => {
        console.log('Files compressed successfully');
    }).catch((error) => {
        // Handle error
    }); 
---

## [**compareWithOrg()**](#comparewithorg)
Method to compare the local project with the project auth org. Return the Metadata Types that exists on Org and not exists on local project. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**

### **Return:**
Return a promise with a JSON Metadata Object with the data respose. Contains the Metadata Types that exists on the project org and not in the local project.
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the project folder or package folder is not a directory
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Compare local project with org**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.compareWithOrg().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**compareOrgBetween(source, target)**](#compareorgbetweensource-target)
Method to compare between two orgs. Return the Metadata Types that exists on target and not exists on source. Source and Target must be authorized in the system. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **source**: Source org Username or Alias to compare. If undefined, use the local project auth org as source 
    - String
  - **target**: Target org Username or Alias to compare. (Require)
    - String

### **Return:**
Return a promise with a JSON Metadata Object with the data respose. Contains the Metadata Types that exists on target and not on source.
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the project folder or package folder is not a directory
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Compare the project org with another org**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.compareOrgBetween(undefined, 'TargetOrgAlias').then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Compare two different orgs**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.compareOrgBetween('SourceOrgAlias', 'TargetOrgAlias').then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**describeLocalMetadata(types)**](#describelocalmetadatatypes)
Method to describe the all or selected Metadata Types from your local project. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **types**: List of Metadata Type API Names to describe. Undefined to describe all local metadata types 
    - Array\<String\>

### **Return:**
Return a promise with a Metadata JSON Object with the selected Metadata Types data
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the project folder or package folder is not a directory
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Describe all local metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.describeLocalMetadata().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Describe some local metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const typesToDescribe = [
        'CustomObject',
        'ApexClass',
        'CustomField',
        'CustomTab'
    ];

    cliManager.describeLocalMetadata(typesToDescribe).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**describeOrgMetadata(downloadAll, types)**](#describeorgmetadatadownloadall-types)
Method to describe the all or selected Metadata Types from your project org. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **downloadAll**: True to download all Metadata types from all namespaces, false to download only data from org namespace 
    - Boolean
  - **types**: List of Metadata Type API Names to describe. Undefined to describe all local metadata types
    - Array\<String\>

### **Return:**
Return a promise with a Metadata JSON Object with the selected Metadata Types data
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the project folder or package folder is not a directory
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Describe all org metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.describeOrgMetadata().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Describe some org metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const typesToDescribe = [
        'CustomObject',
        'ApexClass',
        'CustomField',
        'CustomTab'
    ];

    cliManager.describeOrgMetadata(typesToDescribe).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**retrieveLocalSpecialMetadata(types)**](#retrievelocalspecialmetadatatypes)
Method to retrieve all or selected local special types. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **types**: Metadata JSON Object or Metadata JSON file with the selected types to retrieve
    - String | Object

### **Return:**
Return a promise with a RetrieveResult object
- Promise\<RetrieveResult\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongFilePathException**: If the JSON Metadata file not exists or not have access to it
- **FileNotFoundException**: If the JSON Metadata file is not a file
- **InvalidFilePathException**: If the folder path not exists or not have access to it
- **WrongFormatException**: If JSON Metadata file is not a JSON file or not have the correct Metadata JSON format
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Retrieve all local special metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.retrieveLocalSpecialMetadata().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Retrieve some local special metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const pathToJSONMetadataFile = 'path/to/json/file.json';

    cliManager.retrieveLocalSpecialMetadata(pathToJSONMetadataFile).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**retrieveOrgSpecialMetadata(downloadAll, types)**](#retrieveorgspecialmetadatadownloadall-types)
Method to retrieve all or selected special types from org. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **downloadAll**: True to download all Metadata types from all namespaces, false to download only data from org namespace
    - Boolean
  - **types**: Metadata JSON Object or Metadata JSON file with the selected types to retrieve
    - String | Object

### **Return:**
Return a promise with a RetrieveResult object
- Promise\<RetrieveResult\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongFilePathException**: If the JSON Metadata file not exists or not have access to it
- **FileNotFoundException**: If the JSON Metadata file is not a file
- **InvalidFilePathException**: If the folder path not exists or not have access to it
- **WrongFormatException**: If JSON Metadata file is not a JSON file or not have the correct Metadata JSON format
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Retrieve all org special metadata types from org namespace**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.retrieveOrgSpecialMetadata(false).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Retrieve some org special metadata types from org namespace**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const pathToJSONMetadataFile = 'path/to/json/file.json';

    cliManager.retrieveOrgSpecialMetadata(false, pathToJSONMetadataFile).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**retrieveMixedSpecialMetadata(downloadAll, types)**](#retrievemixedspecialmetadatadownloadall-types)
Method to retrieve all or selected special types on mixed mode. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **downloadAll**: True to download all Metadata types from all namespaces, false to download only data from org namespace
    - Boolean
  - **types**: Metadata JSON Object or Metadata JSON file with the selected types to retrieve
    - String | Object

### **Return:**
Return a promise with a RetrieveResult object
- Promise\<RetrieveResult\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongFilePathException**: If the JSON Metadata file not exists or not have access to it
- **FileNotFoundException**: If the JSON Metadata file is not a file
- **InvalidFilePathException**: If the folder path not exists or not have access to it
- **WrongFormatException**: If JSON Metadata file is not a JSON file or not have the correct Metadata JSON format
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Retrieve all mixed special metadata types from org namespace**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.retrieveMixedSpecialMetadata(false).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Retrieve some mixed special metadata types from org namespace**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const pathToJSONMetadataFile = 'path/to/json/file.json';

    cliManager.retrieveMixedSpecialMetadata(false, pathToJSONMetadataFile).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**loadUserPermissions()**](#loaduserpermissions)
Method to load all available user permissions on the project org

### **Return:**
Return a promise with the list of available user permission API Names
- Promise\<Array\<String\>\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Load available user permissions from project org**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const pathToJSONMetadataFile = 'path/to/json/file.json';

    cliManager.loadUserPermissions().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**createPackageFromGit(source, target, createType, deleteOrder, useIgnore)**](#createpackagefromgitsource-target-createtype-deleteorder-useignore)
Method to create the package XML and destructive XML files from git diffs and changes between two commits, tags, branches

### **Parameters:**
  - **source**: Source tag, branch or commit to compare to create the package and destructive files
    - String
  - **target**: Target tag, branch or commit to compare to create the package and destructive files
    - String
  - **createType**: Create type option (package, destructive, both)
    - String
  - **deleteOrder**: Delete order to create the destructive file (before or after)
    - String
  - **useIgnore**: true to use the ignore file when create the package, false in otherwise
    - Boolean

### **Return:**
Return a promise with the PackageGeneratorResult object with the generated file paths
- Promise\<PackageGeneratorResult\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Create package and destructive files from changes between two branches**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const sourceBranch = 'feature1';
    const targetBranch = 'master';
    const createType = 'both';
    const deleteOrder = 'after';

    cliManager.createPackageFromGit(sourceBranch, targetBranch, createType, deleteOrder).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Create package file from changes between two branches**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const sourceBranch = 'feature1';
    const targetBranch = 'master';
    const createType = 'package';

    cliManager.createPackageFromGit(sourceBranch, targetBranch, createType).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**createPackageFromJSON(source, createType, deleteOrder, useIgnore, explicit)**](#createpackagefromjsonsource-createtype-deleteorder-useignore-explicit)
Method to create the package XML or destructive XML file from a Metadata JSON file. See [Metadata JSON Format](#metadata-file) section to understand the JSON Metadata Format

### **Parameters:**
  - **source**: Metadata JSON file with the selected types to add to the package or destructive file
    - String
  - **createType**: Create type value to create Package XML or Destructive XML with the JSON data (package or destructive) 
    - String
  - **deleteOrder**: Delete order to create the destructive file (before or after)
    - String
  - **useIgnore**: true to use the ignore file when create the package, false in otherwise
    - Boolean
  - **explicit**: True to put all metadata type and object names explicit into the package, false to use wildcards if apply (true recommended)
    - Boolean

### **Return:**
Return a promise with the PackageGeneratorResult object with the generated file paths
- Promise\<PackageGeneratorResult\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Create package file from Metadata JSON File**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const jsonFile = 'path/to/metadata/json/file.json';
    const createType = 'package';
    const deleteOrder = 'after';

    cliManager.createPackageFromJSON(jsonFile, createType, deleteOrder).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Create destructive file from Metadata JSON File**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const jsonFile = 'path/to/metadata/json/file.json';
    const createType = 'destructive';
    const deleteOrder = 'after';

    cliManager.createPackageFromJSON(jsonFile, createType, deleteOrder).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**createPackageFromOtherPackages(source, createType, deleteOrder, useIgnore, explicit)**](#createpackagefromotherpackagessource-createtype-deleteorder-useignore-explicit)
Method to create the package XML or destructive XML from other Package XML Files

### **Parameters:**
  - **source**: Path or Paths to the Package XML or Destructive XML files
    - String | Array\<String\>
  - **createType**: Create type value to create Package XML or Destructive XML with the package data (package or destructive) 
    - String
  - **deleteOrder**: Delete order to create the destructive file (before or after)
    - String
  - **useIgnore**: true to use the ignore file when create the package, false in otherwise
    - Boolean

### **Return:**
Return a promise with the PackageGeneratorResult object with the generated file paths
- Promise\<PackageGeneratorResult\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path
- **WrongDatatypeException**: If the api version is not a Number or String. Can be undefined


### **Examples:**
**Create package file from other package files**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const sources = [
        'path/to/package.xml',
        'path/to/package2.xml',
        'path/to/destructiveChanges.xml',
        'path/to/destructiveChangesPost.xml',
        'path/to/destructiveChangesPost1.xml',
    ];
    const createType = 'package';
    const deleteOrder = 'after';

    cliManager.createPackageFromOtherPackages(sources, createType, deleteOrder).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Create destructive file from other package files**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const sources = [
        'path/to/package.xml',
        'path/to/package2.xml',
        'path/to/destructiveChanges.xml',
        'path/to/destructiveChangesPost.xml',
        'path/to/destructiveChangesPost1.xml',
    ];
    const createType = 'destructive';
    const deleteOrder = 'after';

    cliManager.createPackageFromOtherPackages(jsonFile, createType, deleteOrder).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**ignoreMetadata(types)**](#ignoremetadatatypes)
Method to ignore Metadata Types from the local project

### **Parameters:**
  - **types**: List of Metadata Type API Names to ignore. Undefined to ignore all metadata types
    - Array\<String\>

### **Return:**
Return an empty promise when the ignore operation finish succesfully
- Promise\<Any\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path

### **Examples:**
**Ignore all metadata types from ignore file**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.ignoreMetadata().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Ignore some metadata types from ignore file**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const typesToIgnore = [
        'CustomObject',
        'CustomField',
        'Profile',
    ];
    const createType = 'destructive';
    const deleteOrder = 'after';

    cliManager.ignoreMetadata(typesToIgnore).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**repairDependencies(types, onlyCheck, useIgnore)**](#repairdependenciestypes-onlycheck-useignore)
Method to repair all error dependencies from your local project. Also you can check only to check if has errors. See [Repair Response](#repair-response) section to understand the response when select repair dependencies or See [Only Check Response](#only-check-response) section to understand the response when select only check dependencies errors.



### **Parameters:**
  - **types**: Metadata JSON Object or Metadata JSON file with the selected types to repair or check error dependencies. Undefined to repair or check error all metadata types
    - String | Object
  - **onlyCheck**: True to not repair and only check the errors, false to repair errors automatically
    - Boolean
   - **useIgnore**: true to use the ignore file when repair dependencies, false in otherwise
    - Boolean

### **Return:**
Return a promise with the Repair response if you check repair, or the Only Check Response when select check only option
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system
- **WrongDirectoryPathException**: If the folder path is not a String or can't convert to absolute path
- **DirectoryNotFoundException**: If the folder path not exists or not have access to it
- **InvalidDirectoryPathException**: If the JSON Metadata file is not a String or can't convert to absolute path

### **Examples:**
**Repair all metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.repairDependencies().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Repair some metadata types**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    const typesToRepair = [
        'CustomObject',
        'CustomField',
        'Profile',
    ];
    const createType = 'destructive';
    const deleteOrder = 'after';

    cliManager.Repair(typesToRepair).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });

**Check dependencies errors**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.repairDependencies(undefined, true).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**isAuraHelperCLIInstalled()**](#isaurahelpercliinstalled)
Method to check if Aura Helper is installed on the system

### **Return:**
Return a promise with true if is installer, false in otherwise
- Promise\<Boolean\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system

### **Examples:**
**Check if Aura Helper is installed**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.isAuraHelperCLIInstalled(isInstalled).then((response) => {
        if(isInstalled)
            console.log('Aura Helper is installed');
        else
            console.log('Aura Helper is not installed');
    }).catch((error) => {
        // Handle error
    });
---

## [**getAuraHelperCLIVersion()**](#getaurahelpercliversion)
Method to get the Aura Helper CLI installed version on the system

### **Return:**
Return a promise with the Aura Helper CLI response
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system

### **Examples:**
**Check if Aura Helper is installed**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.getAuraHelperCLIVersion(response).then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**updateAuraHelperCLI()**](#updateaurahelpercli)
Method to update Aura Helper CLI with aura helper update command

### **Return:**
Return a promise with the Aura Helper CLI response
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system

### **Examples:**
**Update Aura Helper CLI**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.updateAuraHelperCLI().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

## [**updateAuraHelperCLIWithNPM()**](#updateaurahelpercliwithnpm)
Method to update Aura Helper CLI with NPM command

### **Return:**
Return a promise with the Aura Helper CLI response
- Promise\<Object\>

### **Throws:**
This method can throw the next exceptions:

- **CLIManagerException**: If run other cli manager process when has one process running or Aura Helper CLI Return an error  
- **DataRequiredException**: If required data is not provided
- **OSNotSupportedException**: When run this processes with not supported operative system

### **Examples:**
**Update Aura Helper CLI with NPM**

    const CLIManager = require('@aurahelper/cli-manager');

    const cliManager = new CLIManager('root/project/path', 50);

    cliManager.updateAuraHelperCLIWithNPM().then((response) => {
        console.log(response);
    }).catch((error) => {
        // Handle error
    });
---

# [**Repair Response**](#repair-response)
When you repair dependencies with any option (compress or not, repair specified types...) the response error has the next structure:

    {
        "MetadataTypeName": {
            "metadataType": "MetadataTypeName"
            "errors": [
                {
                    "file": "path/to/file"
                    "errors": [
                        {
                            "elementPath": "xmlSuperParentTag>xmlParentTag>xmlTag",
                            "value": "error value",
                            "metadataType": "error Metadata Type",
                            "metadataObject": "error Metadata Object",
                            "metadataItem": "error Metadata Item",
                            "xmlElement": {
                                // xml Element error data
                            }
                        },
                        {
                            ...
                        },
                        {
                            ...
                        }
                    ]
                },
                {
                    ...
                },
                {
                    ...
                }
            ]
        }
    }

Example:

    {
        "CustomApplication": {
            "metadataType": "CustomApplication"
            "errors": [
                {
                    "file": "..../force-app/main/default/applications/customApplicationExample.app-meta.xml"
                    "errors": [
                        {
                            "elementPath": "actionOverrides>content",
                            "value": "FlexiPageExample",
                            "metadataType": "FlexiPage",
                            "metadataObject": "FlexiPageExample",
                            "xmlElement": {
                                "actionName": "View",
                                "comment": "Action override description",
                                "content": "FlexiPageExample",
                                "formFactor": "Large",
                                "pageOrSobjectType": "Account",
                                "skipRecordTypeSelect": false,
                                "type": "Flexipage"
                            }
                        },
                        {
                            ...
                        },
                        {
                            ...
                        }
                    ]
                },
                {
                    ...
                },
                {
                    ...
                }
            ]
        },
        "PermissionSet": {
            "metadataType": "PermissionSet"
            "errors": [
                {
                    "file": "..../force-app/main/default/permissionsets/permissionSetExample.app-meta.xml"
                    "errors": [
                        {
                            "elementPath": "fieldPermissions>field",
                            "value": "Account.custom_field__c",
                            "metadataType": "CustomField",
                            "metadataObject": "Account",
                            "metadataItem": "custom_field__c",
                            "xmlElement": {
                                "editable": false,
                                "field": "Account.custom_field__c",
                                "readable": false
                            }
                        },
                        {
                            ...
                        },
                        {
                            ...
                        }
                    ]
                },
                {
                    ...
                },
                {
                    ...
                }
            ]
        }
    }

# [**Only Check Response**](#only-check-response)
When you only check dependencies errors the response error has the next structure:

    {
        "MetadataTypeName": [
            {
                "object": "MetadataObject",
                "item": "MetadataItem"
                "line": 16,
                "startColumn": 146,
                "endColumn": 166,
                "message": "MetadataTypeName named MetadataObject.MetadataItem does not exists",
                "severity": "Warning",
                "file": "/path/to/file"
            },
            {
                "object": "MetadataObject",
                "item": "MetadataItem"
                "line": 17,
                "startColumn": 146,
                "endColumn": 166,
                "message": "MetadataTypeName named MetadataObject.MetadataItem does not exists",
                "severity": "Warning",
                "file": "/path/to/file"
            },
        ],
        "MetadataTypeName": [
            {
                ...
            },
            {
                ...
            }
        ]
    }

Example:

    {
        "CustomApplication": [
            {
                "object": "FlexiPageExample",
                "line": 16,
                "startColumn": 146,
                "endColumn": 166,
                "message": "FlexiPage named FlexiPageExample does not exists",
                "severity": "Warning",
                "file": "..../force-app/main/default/applications/customApplicationExample.app-meta.xml"
            },
            {
                "object": "FlexiPageExample",
                "line": 17,
                "startColumn": 146,
                "endColumn": 166,
                "message": "FlexiPage named FlexiPageExample does not exists",
                "severity": "Warning",
                "file": "..../force-app/main/default/applications/customApplicationExample.app-meta.xml"
            },
        ],
        "PermissionSet": [
            {
                "object": "Account",
                "item": "custom_field__c",
                "line": 1771,
                "startColumn": 56,
                "endColumn": 85,
                "message": "CustomField named Account.custom_field__c does not exists",
                "severity": "Warning",
                "file": "..../force-app/main/default/permissionsets/permissionSetExample.permissionset-meta.xml"
            },
            {
                "object": "Account",
                "item": "custom_field2__c",
                "line": 1772,
                "startColumn": 56,
                "endColumn": 85,
                "message": "CustomField named Account.custom_field2__c does not exists",
                "severity": "Warning",
                "file": "..../force-app/main/default/permissionsets/permissionSetExample.permissionset-meta.xml"
            },
        ]
    }

# [**Metadata JSON Format**](#metadata-file)

The Metadata JSON Format used by Aura Helper Framework and modules have the next structure. Some fields are required and the datatypes checked to ensure the correct file structure. 

    {
        "MetadataAPIName": {
            "name": "MetadataAPIName",                                  // Required (String). Contains the Metadata Type API Name (like object Key)
            "checked": false,                                           // Required (Boolean). Field for include this type on package or not
            "path": "path/to/the/metadata/folder",                      // Optional (String). Path to the Metadata Type folder in local project
            "suffix": "fileSuffix",                                     // Optional (String). Metadata File suffix
            "childs": {                                                 // Object with a collection of childs (Field required (JSON Object) but can be an empty object)
                "MetadataObjectName":{
                    "name": "MetadataObjectName",                       // Required (String). Contains the Metadata Object API Name (like object Key)
                    "checked": false,                                   // Required (Boolean). Field for include this object on package or not
                    "path": "path/to/the/metadata/file/or/folder",      // Optional (String). Path to the object file or folder path
                    "childs": {                                         // Object with a collection of childs (Field required (JSON Object) but can be an empty object)
                        "MetadataItemName": {
                            "name": "MetadataItemName",                 // Required (String). Contains the Metadata Item API Name (like object Key)
                            "checked": false,                           // Required (Boolean). Field for include this object on package or not
                            "path": "path/to/the/metadata/file"
                        },
                        "MetadataItemName2": {
                            ...
                        },
                        ...,
                        ...,
                        ...
                    }
                }
                "MetadataObjectName2":{
                   ...
                },
                ...,
                ...,
                ...
            }
        }
    }

### **Example**:

    {
        "CustomObject": {
            "name": "CustomObject",
            "checked": false,
            "path":  "path/to/root/project/force-app/main/default/objects",
            "suffix": "object",
            "childs": {
                "Account": {
                    "name": "Account",
                    "checked": true,            // Add Account Object to the package
                    "path": "path/to/root/project/force-app/main/default/objects/Account/Account.object-meta.xml",
                    "childs": {}
                },
                "Case": {
                    "name": "Case",
                    "checked": true,            // Add Case Object to the package
                    "path": "path/to/root/project/force-app/main/default/objects/Case/Case.object-meta.xml",
                    "childs": {}
                },
                ...,
                ...,
                ...
            }
        },
        "CustomField": {
            "name": "CustomField",
            "checked": false,
            "path":  "path/to/root/project/force-app/main/default/objects",
            "suffix": "field",
            "childs": {
                "Account": {
                    "name": "Account",
                    "checked": false,            
                    "path": "path/to/root/project/force-app/main/default/objects/Account/fields",
                    "childs": {
                        "customField__c": {
                            "name": "customField__c",
                            "checked": true,    // Add customField__c to the package
                            "path": "path/to/root/project/force-app/main/default/objects/Account/fields/customField__c.field-meta.xml",
                        },
                        ...,
                        ...,
                        ...
                    }
                },
                "Case": {
                    "name": "Case",
                    "checked": false,           
                    "path": "path/to/root/project/force-app/main/default/objects/Case/fields",
                    "childs": {
                        "CaseNumber": {
                            "name": "CaseNumber",
                            "checked": true,    // Add CaseNumber to the package
                            "path": "path/to/root/project/force-app/main/default/objects/Account/fields/CaseNumber.field-meta.xml",
                        },
                        ...,
                        ...,
                        ...
                    }
                },
                ...,
                ...,
                ...
            }
        }
    }



