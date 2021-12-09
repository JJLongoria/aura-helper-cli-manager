const EventEmitter = require('events').EventEmitter;
const { ProcessHandler, ProcessFactory } = require('@aurahelper/core').ProcessManager;
const { Validator, Utils, MetadataUtils, StrUtils } = require('@aurahelper/core').CoreUtils;
const { AuraHelperCLIResponse, RetrieveResult, PackageGeneratorResult } = require('@aurahelper/core').Types;
const { FileChecker } = require('@aurahelper/core').FileSystem;
const MetadataFactory = require('@aurahelper/metadata-factory');
const { CLIManagerException, OperationNotSupportedException, DataNotFoundException, WrongDatatypeException } = require('@aurahelper/core').Exceptions;

const EVENT = {
    ABORT: 'abort',
    PROGRESS: 'progress'
}

/**
 * Class to create and handle Aura Helper CLI processes. 
 * With this class you can execute all CLI operations and handle the processes progress easy with the callbacks functions. 
 * Aura Helper CLI Has too many processes to list or describe metadata types, import and export data between orgs, retrieve special metadata types, 
 * compress xml files, execute apex anonymous scripts N times or create package files to deploy or delete from git changes among other operations.
 * 
 * The setters methods are defined like a builder pattern to make it more usefull
 * 
 * All CLI Manager methods return a Promise with the associated data to the processes. 
 */
class CLIManager {

    /**
     * Constructor to create a new CLI Manager object
     * @param {String} [projectFolder] Path to the local project root folder. './' by default
     * @param {(String | Number)} [apiVersion] API Version number to run processes and connect to salesforce
     * @param {String} [namespacePrefix] Namespace prefix from the Org 
     */
    constructor(projectFolder, apiVersion, namespacePrefix) {
        this.projectFolder = (projectFolder !== undefined) ? projectFolder : './';
        this.apiVersion = apiVersion;
        this.namespacePrefix = (namespacePrefix !== undefined) ? namespacePrefix : '';
        this.compressFiles = false;
        this.sortOrder;
        this.ignoreFile = this.projectFolder + '/.ahignore.json';
        this.outputPath;

        this._inProgress = false;
        this._event = new EventEmitter();
        this._processes = {};
        this._abort = false;
    }

    /**
     * Method to set the API Version number to execute some Aura Helper CLI Processes
     * @param {String | Number} apiVersion API Version number to run processes and connect to salesforce
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setApiVersion(apiVersion) {
        this.apiVersion = apiVersion;
        return this;
    }

    /**
     * Method to set the local root project path to execute all Aura Helper CLI Processes
     * @param {String} projectFolder Path to the local project root folder. './' by default
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setProjectFolder(projectFolder) {
        this.projectFolder = (projectFolder !== undefined) ? projectFolder : './';
        return this;
    }

    /**
     * Method to set the Namespace prefix from the project org
     * @param {String} namespacePrefix Namespace prefix from the Org
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setNamespacePrefix(namespacePrefix) {
        this.namespacePrefix = (namespacePrefix !== undefined) ? namespacePrefix : '';
        return this;
    }

    /**
     * Method to set if compress the affected files by Aura Helper processes
     * @param {Boolean} compressFiles True to compress all affected files by Aura Helper proceses, false in otherwise
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setCompressFiles(compressFiles) {
        this.compressFiles = compressFiles;
        return this;
    }

    /**
     * Method to set the sort order when compress XML Files
     * @param {String} sortOrder Sort order value
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setSortOrder(sortOrder) {
        this.sortOrder = sortOrder;
        return this;
    }

    /**
     * Method to set the ignore file path to use on some Aura Helper CLI Processes
     * @param {String} ignoreFile Path to the ignore file
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setIgnoreFile(ignoreFile) {
        this.ignoreFile = ignoreFile;
        return this;
    }

    /**
     * Method to set the output folder path to redirect the response to files
     * @param {String} outputPath Path to the output folder
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setOutputPath(outputPath) {
        this.outputPath = outputPath;
        return this;
    }

    /**
     * Method to handle the progress event to handle AHCLI Progression
     * @param {Function} callback Callback function to handle the progress
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    onProgress(callback) {
        this._event.on(EVENT.PROGRESS, callback);
        return this;
    }

    /**
     * Method to handle the event when CLIManager processes are aborted
     * @param {Function} callback Callback function to call when CLI Manager is aborted
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    onAbort(callback) {
        this._event.on(EVENT.ABORT, callback);
        return this;
    }

    /**
     * Method to abort all CLI Manager running processes. When finishes call onAbort() callback
     */
    abortProcess() {
        this._abort = true;
        killProcesses(this);
        this._event.emit(EVENT.ABORT);
    }

    /**
     * Method to compress a single file or folder or array with files to compress (compress more than one folder is not allowed but you can compress an entire folder an subfolders)
     * @param {String | Array<String>} filesOrFolders file path or paths to compress or folder path to compress
     * @param {String} [sortOrder] Sort order value to sort XML Elements
     *  
     * @returns {Promise<Any>} Return an empty promise when compress files finish succesfully
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {OperationNotSupportedException} If try to compress more than one folder, or file and folders at the same time
     * @throws {DataNotFoundException} If not found file or folder paths 
     * @throws {WrongDirectoryPathException} If the project folder or folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder or folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder or folder path is not a directory
     * @throws {WrongFilePathException} If the file path is not a String or can't convert to absolute path
     * @throws {FileNotFoundException} If the file path not exists or not have access to it
     * @throws {InvalidFilePathException} If the file path is not a file
     */
    compress(filesOrFolders, sortOrder) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                let nFiles = 0;
                let nFolders = 0;
                const paths = Utils.forceArray(filesOrFolders);
                const resultPaths = [];
                for (const path of paths) {
                    if (FileChecker.isFile(path)) {
                        nFiles++;
                        resultPaths.push(Validator.validateFilePath(path));
                    } else {
                        nFolders++;
                        resultPaths.push(Validator.validateFolderPath(path));
                    }
                }
                if (nFiles == 0 && nFolders == 0)
                    throw new DataNotFoundException('Not files or folders selected to compress');
                else if (nFiles > 0 && nFolders > 0)
                    throw new OperationNotSupportedException('Can\'t compress files and folders at the same time. Please, add only folders or files to compress');
                else if (nFolders > 1)
                    throw new OperationNotSupportedException('Can\'t compress more than one folder at the same time.');
                let process;
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                if (nFiles > 0) {
                    process = ProcessFactory.auraHelperCompressFile(projectFolder, { file: resultPaths, sortOrder: sortOrder }, (ahCliProgress) => {
                        this._event.emit(EVENT.PROGRESS, ahCliProgress);
                    });
                }
                else {
                    process = ProcessFactory.auraHelperCompressFolder(projectFolder, { folder: resultPaths, sortOrder: sortOrder }, (ahCliProgress) => {
                        this._event.emit(EVENT.PROGRESS, ahCliProgress);
                    });
                }
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve();
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to compare the local project with the project auth org. Return the Metadata Types that exists on Org and not exists on local project
     * 
     * @returns {Promise<Object>} Return a promise with a JSON Metadata Object with the data respose. Contains the Metadata Types that exists on the project org and not in the local project.
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    compareWithOrg() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperOrgCompare(projectFolder, { apiVersion: this.apiVersion }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                })
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(MetadataFactory.deserializeMetadataTypes(response.result, true));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to compare between two orgs. Return the Metadata Types that exists on target and not exists on source. Source and Target must be authorized in the system.
     * @param {String} sourceOrTarget Source org Username or Alias to compare. If does not pass target, the source will be the local project auth org and the target the parameter passed as sourceOrTarget 
     * @param {String} [target] Target org Username or Alias to compare. (Require)
     * 
     * @returns {Promise<Object>} Return a promise with a JSON Metadata Object with the data respose. Contains the Metadata Types that exists on target and not on source.
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    compareOrgBetween(sourceOrTarget, target) {
        if (sourceOrTarget && !target) {
            target = sourceOrTarget;
            sourceOrTarget = undefined;
        }
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperOrgCompareBetween(projectFolder, { source: sourceOrTarget, target: target, apiVersion: this.apiVersion }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                })
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(MetadataFactory.deserializeMetadataTypes(response.result, true));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to describe the all or selected Metadata Types from your local project
     * @param {Array<String>} [types] List of Metadata Type API Names to describe. Undefined to describe all metadata types
     * @param {Boolean} [groupGlobalActions] True to group global quick actions on "GlobalActions" group, false to include as object and item.
     * 
     * @returns {Promise<Object>} Return a promise with a Metadata JSON Object with the selected Metadata Types data
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    describeLocalMetadata(types, groupGlobalActions) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types, true);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperDescribeMetadata(projectFolder, { fromOrg: false, types: types, apiVersion: this.apiVersion, groupGlobalActions: groupGlobalActions }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                })
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(MetadataFactory.deserializeMetadataTypes(response.result, true));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to describe the all or selected Metadata Types from your project org
     * @param {Boolean} [downloadAll] True to download all Metadata types from all namespaces, false to download only data from org namespace
     * @param {Array<String>} [types] List of Metadata Type API Names to describe. Undefined to describe all metadata types
     * @param {Boolean} [groupGlobalActions] True to group global quick actions on "GlobalActions" group, false to include as object and item.
     * 
     * @returns {Promise<Object>} Return a promise with a Metadata JSON Object with the selected Metadata Types data
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    describeOrgMetadata(downloadAll, types, groupGlobalActions) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types, true);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperDescribeMetadata(projectFolder, {
                    fromOrg: true,
                    downloadAll: downloadAll,
                    types: types,
                    apiVersion: this.apiVersion,
                    groupGlobalActions: groupGlobalActions
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(MetadataFactory.deserializeMetadataTypes(response.result, true));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to retrieve all or selected local special types
     * @param {(String | Object)} [types] Metadata JSON Object or Metadata JSON file with the selected types to retrieve
     * 
     * @returns {Promise<RetrieveResult>} Return a promise with a RetrieveResult object
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongFilePathException} If the JSON Metadata file is not a String or can't convert to absolute path
     * @throws {FileNotFoundException} If the JSON Metadata file not exists or not have access to it
     * @throws {InvalidFilePathException} If the JSON Metadata file is not a file
     * @throws {WrongFormatException} If JSON Metadata file is not a JSON file or not have the correct Metadata JSON format
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    retrieveLocalSpecialMetadata(types) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRetrieveSpecial(projectFolder, {
                    fromOrg: false,
                    types: types,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(new RetrieveResult(response.result));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to retrieve all or selected special types from org
     * @param {Boolean} [downloadAll] True to download all Metadata types from all namespaces, false to download only data from org namespace
     * @param {(String | Object)} [types] Metadata JSON Object or Metadata JSON file with the selected types to retrieve
     * 
     * @returns {Promise<RetrieveResult>} Return a promise with a RetrieveResult object
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongFilePathException} If the JSON Metadata file is not a String or can't convert to absolute path
     * @throws {FileNotFoundException} If the JSON Metadata file not exists or not have access to it
     * @throws {InvalidFilePathException} If the JSON Metadata file is not a file
     * @throws {WrongFormatException} If JSON Metadata file is not a JSON file or not have the correct Metadata JSON format
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    retrieveOrgSpecialMetadata(downloadAll, types) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRetrieveSpecial(projectFolder, {
                    fromOrg: true,
                    types: types,
                    downloadAll: downloadAll,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(new RetrieveResult(response.result));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to retrieve all or selected special types on mixed mode
     * @param {Boolean} [downloadAll] True to download all Metadata types from all namespaces, false to download only data from org namespace
     * @param {(String | Object)} [types] Metadata JSON Object or Metadata JSON file with the selected types to retrieve
     * 
     * @returns {Promise<RetrieveResult>} Return a promise with a RetrieveResult object
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongFilePathException} If the JSON Metadata file is not a String or can't convert to absolute path
     * @throws {FileNotFoundException} If the JSON Metadata file not exists or not have access to it
     * @throws {InvalidFilePathException} If the JSON Metadata file is not a file
     * @throws {WrongFormatException} If JSON Metadata file is not a JSON file or not have the correct Metadata JSON format
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    retrieveMixedSpecialMetadata(downloadAll, types) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRetrieveSpecial(projectFolder, {
                    fromOrg: false,
                    types: types,
                    includeOrg: true,
                    downloadAll: downloadAll,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(new RetrieveResult(response.result));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to load all available user permissions on the project org
     * 
     * @returns {Promise<Array<String>>} Return a promise with the list of available user permission API Names
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    loadUserPermissions() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperLoadPermissions(projectFolder, {
                    apiVersion: this.apiVersion,
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(response);
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to create the package XML and destructive XML files from git diffs and changes between two commits, tags, branches
     * @param {String} source Source tag, branch or commit to compare to create the package and destructive files
     * @param {String} [target] Target tag, branch or commit to compare to create the package and destructive files
     * @param {String} [createType] Create type option (package, destructive, both)
     * @param {String} [deleteOrder] Delete order to create the destructive file (before or after)
     * @param {Boolean} [useIgnore] true to use the ignore file when create the package, false in otherwise
     * 
     * @returns {Promise<PackageGeneratorResult>} Return a promise with the PackageGeneratorResult object with the generated file paths
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    createPackageFromGit(source, target, createType, deleteOrder, useIgnore) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperPackageGenerator(projectFolder, {
                    outputPath: this.outputPath,
                    createType: createType,
                    createFrom: 'git',
                    source: source,
                    target: target,
                    deleteOrder: deleteOrder,
                    useIgnore: useIgnore,
                    ignoreFile: this.ignoreFile,
                    apiVersion: this.apiVersion,
                    explicit: true,
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(new PackageGeneratorResult(response.result));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to create the package XML or destructive XML file from a Metadata JSON file
     * @param {String} source Metadata JSON file with the selected types to add to the package or destructive file
     * @param {String} [createType] Create type value to create Package XML or Destructive XML with the JSON data (package or destructive) 
     * @param {String} [deleteOrder] Delete order for the destructive XML file (before or after)
     * @param {Boolean} [useIgnore] true to use the ignore file when create the package, false in otherwise
     * @param {Boolean} [explicit] True to put all metadata type and object names explicit into the package, false to use wildcards if apply (true recommended)
     * 
     * @returns {Promise<PackageGeneratorResult>} Return a promise with the PackageGeneratorResult object with the generated file paths
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    createPackageFromJSON(source, createType, deleteOrder, useIgnore, explicit) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperPackageGenerator(projectFolder, {
                    outputPath: this.outputPath,
                    createType: createType,
                    createFrom: 'json',
                    source: source,
                    deleteOrder: deleteOrder,
                    useIgnore: useIgnore,
                    ignoreFile: this.ignoreFile,
                    apiVersion: this.apiVersion,
                    explicit: explicit,
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(new PackageGeneratorResult(response.result));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to create the package XML or destructive XML from other Package XML Files
     * @param {String | Array<String>} source Path or Paths to the Package XML or Destructive XML files
     * @param {String} [createType] Create type value to create Package XML or Destructive XML with the package data (package or destructive) 
     * @param {String} [deleteOrder] Delete order for the destructive XML file (before or after)
     * @param {Boolean} [useIgnore] true to use the ignore file when create the package, false in otherwise
     * 
     * @returns {Promise<PackageGeneratorResult>} Return a promise with the PackageGeneratorResult object with the generated file paths
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    createPackageFromOtherPackages(source, createType, deleteOrder, useIgnore) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                source = Utils.forceArray(source);
                source = transformTypesToAHCLIInput(source, true);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperPackageGenerator(projectFolder, {
                    outputPath: this.outputPath,
                    createType: createType,
                    createFrom: 'package',
                    source: source.join(','),
                    deleteOrder: deleteOrder,
                    useIgnore: useIgnore,
                    ignoreFile: this.ignoreFile,
                    apiVersion: this.apiVersion,
                    explicit: true,
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(new PackageGeneratorResult(response.result));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to ignore Metadata Types from the local project
     * @param {Array<String>} [types] List of Metadata Type API Names to ignore. Undefined to ignore all metadata types
     * 
     * @returns {Promise<Any>} Return an empty promise when the ignore operation finish succesfully
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     */
    ignoreMetadata(types) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types, true);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperIgnore(projectFolder, {
                    types: types,
                    ignoreFile: this.ignoreFile,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve();
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to repair all error dependencies from your local project. Also you can check only to check if has errors.
     * @param {(String | Object)} [types] Metadata JSON Object or Metadata JSON file with the selected types to repair or check error dependencies. Undefined to repair or check error all metadata types
     * @param {Boolean} [onlyCheck] True to not repair and only check the errors, false to repair errors automatically
     * @param {Boolean} [useIgnore] true to use the ignore file when repair dependencies, false in otherwise
     * 
     * @returns {Promise<Object>} Return a promise with the Repair response if you check repair, or the Only Check Response when select check only option
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     */
    repairDependencies(types, onlyCheck, useIgnore) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRepairDependencies(projectFolder, {
                    types: types,
                    useIgnore: useIgnore,
                    onlyCheck: onlyCheck,
                    ignoreFile: this.ignoreFile,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(response.result);
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to check if Aura Helper is installed on the system
     * 
     * @returns {Promise<Boolean>} Return a promise with true if is installer, false in otherwise
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     */
    isAuraHelperCLIInstalled() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.isAuraHelperInstalled();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then(() => {
                    endOperation(this);
                    resolve(true)
                }).catch((error) => {
                    endOperation(this);
                    reject(false);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to get the Aura Helper CLI installed version on the system
     * 
     * @returns {Promise<Object>} Return a promise with the Aura Helper CLI response
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     */
    getAuraHelperCLIVersion() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperVersion();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
                        endOperation(this);
                        resolve(StrUtils.replace(response, 'Aura Helper CLI Version: v', ''));
                    });
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to update Aura Helper CLI with aura helper update command
     * 
     * @returns {Promise<Object>} Return a promise with the Aura Helper CLI response
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     */
    updateAuraHelperCLI() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperUpdate();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    endOperation(this);
                    resolve(response);
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }

    /**
     * Method to update Aura Helper CLI with NPM command
     * 
     * @returns {Promise<Object>} Return a promise with the Aura Helper CLI response
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     */
    updateAuraHelperCLIWithNPM() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperUpdateNPM();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    endOperation(this);
                    resolve(response);
                }).catch((error) => {
                    endOperation(this);
                    reject(error);
                });
            } catch (error) {
                endOperation(this);
                reject(error);
            }
        });
    }
}
module.exports = CLIManager;

function transformTypesToAHCLIInput(types, onlyTypes) {
    const result = [];
    if (!types)
        return undefined;
    if (Utils.isArray(types)) {
        for (const type of types) {
            if (!Utils.isString(type))
                throw new WrongDatatypeException('The types list must contains Strings only');
            result.push(type);
        }
    } else {
        types = Validator.validateMetadataJSON(types);
        for (const metadataTypeName of Object.keys(types)) {
            const metadataType = types[metadataTypeName];
            if (onlyTypes) {
                if (metadataType.checked)
                    result.push(metadataTypeName);
            } else {
                if (metadataType.checked) {
                    result.push(metadataTypeName);
                } else if (MetadataUtils.haveChilds(metadataType)) {
                    for (const metadataObjectName of Object.keys(metadataType.childs)) {
                        const metadataObject = metadataType.childs[metadataObjectName];
                        if (metadataObject.checked) {
                            result.push(metadataTypeName + ':' + metadataObject);
                        } else if (MetadataUtils.haveChilds(metadataObject)) {
                            for (const metadataItemtName of Object.keys(metadataObject.childs)) {
                                const metadataItem = metadataObject.childs[metadataItemtName];
                                if (metadataItem.checked) {
                                    result.push(metadataTypeName + ':' + metadataObject + ':' + metadataItem);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
}

function getCallback(args, cliManager) {
    return Utils.getCallbackFunction(args) || cliManager._progressCallback;
}

function handleResponse(response, onSuccess) {
    if (response !== undefined) {
        if (Utils.isObject(response)) {
            if (response.status === 0) {
                onSuccess.call(this);
            } else {
                if (response.message)
                    throw new CLIManagerException(response.message);
                else
                    throw new CLIManagerException(response);
            }
        } else {
            onSuccess.call(this);
        }
    } else {
        response = new AuraHelperCLIResponse(0, '', {});
        onSuccess.call(this);
    }
}

function killProcesses(cliManager) {
    if (cliManager._processes && Object.keys(cliManager._processes).length > 0) {
        for (let process of Object.keys(cliManager._processes)) {
            killProcess(cliManager, cliManager._processes[process]);
        }
    }
}

function killProcess(cliManager, process) {
    process.kill();
    delete cliManager._processes[process.name];
}

function startOperation(cliManager) {
    if (!cliManager.allowConcurrence) {
        if (cliManager._inProgress)
            throw new CLIManagerException('Connection in use. Abort the current operation to execute other.');
        cliManager._abort = false;
        cliManager._inProgress = true;
        cliManager._processes = {};
    }
}

function endOperation(cliManager) {
    cliManager._inProgress = false;
    cliManager._processes = {};
}

function addProcess(cliManager, process) {
    cliManager._processes[process.name] = process;
}