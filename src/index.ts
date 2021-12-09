import EventEmitter from "events";
import { MetadataFactory } from '@aurahelper/metadata-factory';
import { AuraHelperCLIProgress, AuraHelperCLIResponse, CLIManagerException, CoreUtils, DataNotFoundException, DependenciesCheckResponse, DependenciesRepairResponse, FileChecker, MetadataType, OperationNotSupportedException, PackageGeneratorResult, Process, ProcessFactory, ProcessHandler, RetrieveResult, WrongDatatypeException } from "@aurahelper/core";
const Validator = CoreUtils.Validator;
const StrUtils = CoreUtils.StrUtils;
const Utils = CoreUtils.Utils;
const MetadataUtils = CoreUtils.MetadataUtils;

const EVENT = {
    ABORT: 'abort',
    PROGRESS: 'progress'
};

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
export class CLIManager {

    projectFolder: string;
    apiVersion?: string | number;
    namespacePrefix: string;
    compressFiles: boolean;
    sortOrder?: string;
    ignoreFile: string;
    outputPath?: string;

    _inProgress: boolean;
    _event: EventEmitter;
    _processes: { [key: string]: Process };
    _abort: boolean;


    /**
     * Constructor to create a new CLI Manager object
     * @param {string} [projectFolder] Path to the local project root folder. './' by default
     * @param {string | number} [apiVersion] API Version number to run processes and connect to salesforce
     * @param {string} [namespacePrefix] Namespace prefix from the Org 
     */
    constructor(projectFolder?: string, apiVersion?: string | number, namespacePrefix?: string) {
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
     * @param {string | number} apiVersion API Version number to run processes and connect to salesforce
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setApiVersion(apiVersion: string | number): CLIManager {
        this.apiVersion = apiVersion;
        return this;
    }

    /**
     * Method to set the local root project path to execute all Aura Helper CLI Processes
     * @param {string} projectFolder Path to the local project root folder. './' by default
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setProjectFolder(projectFolder: string): CLIManager {
        this.projectFolder = (projectFolder !== undefined) ? projectFolder : './';
        return this;
    }

    /**
     * Method to set the Namespace prefix from the project org
     * @param {string} namespacePrefix Namespace prefix from the Org
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setNamespacePrefix(namespacePrefix: string): CLIManager {
        this.namespacePrefix = (namespacePrefix !== undefined) ? namespacePrefix : '';
        return this;
    }

    /**
     * Method to set if compress the affected files by Aura Helper processes
     * @param {boolean} compressFiles True to compress all affected files by Aura Helper proceses, false in otherwise
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setCompressFiles(compressFiles: boolean): CLIManager {
        this.compressFiles = compressFiles;
        return this;
    }

    /**
     * Method to set the sort order when compress XML Files
     * @param {string} sortOrder Sort order value
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setSortOrder(sortOrder: string): CLIManager {
        this.sortOrder = sortOrder;
        return this;
    }

    /**
     * Method to set the ignore file path to use on some Aura Helper CLI Processes
     * @param {string} ignoreFile Path to the ignore file
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setIgnoreFile(ignoreFile: string): CLIManager {
        this.ignoreFile = ignoreFile;
        return this;
    }

    /**
     * Method to set the output folder path to redirect the response to files
     * @param {string} outputPath Path to the output folder
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    setOutputPath(outputPath: string): CLIManager {
        this.outputPath = outputPath;
        return this;
    }

    /**
     * Method to handle the progress event to handle AHCLI Progression
     * @param {Function} callback Callback function to handle the progress
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    onProgress(callback: (progress: AuraHelperCLIProgress) => void): CLIManager {
        this._event.on(EVENT.PROGRESS, callback);
        return this;
    }

    /**
     * Method to handle the event when CLIManager processes are aborted
     * @param {Function} callback Callback function to call when CLI Manager is aborted
     * 
     * @returns {CLIManager} Returns the cli manager object
     */
    onAbort(callback: () => void): CLIManager {
        this._event.on(EVENT.ABORT, callback);
        return this;
    }

    /**
     * Method to abort all CLI Manager running processes. When finishes call onAbort() callback
     */
    abortProcess(): void {
        this._abort = true;
        killProcesses(this);
        this._event.emit(EVENT.ABORT);
    }

    /**
     * Method to compress a single file or folder or array with files to compress (compress more than one folder is not allowed but you can compress an entire folder an subfolders)
     * @param {string | string[]} filesOrFolders file path or paths to compress or folder path to compress
     * @param {string} [sortOrder] Sort order value to sort XML Elements
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
    compress(filesOrFolders: string | string[], sortOrder: string): Promise<void> {
        startOperation(this);
        return new Promise<void>((resolve, reject) => {
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
                if (nFiles === 0 && nFolders === 0) {
                    throw new DataNotFoundException('Not files or folders selected to compress');
                } else if (nFiles > 0 && nFolders > 0) {
                    throw new OperationNotSupportedException('Can\'t compress files and folders at the same time. Please, add only folders or files to compress');
                } else if (nFolders > 1) {
                    throw new OperationNotSupportedException('Can\'t compress more than one folder at the same time.');
                }
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
                    this.handleResponse(response, () => {
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
     * @returns {Promise<{ [key: string]: MetadataType }>} Return a promise with a JSON Metadata Object with the data respose. Contains the Metadata Types that exists on the project org and not in the local project.
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    compareWithOrg(): Promise<{ [key: string]: MetadataType }> {
        startOperation(this);
        return new Promise<{ [key: string]: MetadataType }>((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperOrgCompare(projectFolder, { apiVersion: this.apiVersion }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @param {string} sourceOrTarget Source org Username or Alias to compare. If does not pass target, the source will be the local project auth org and the target the parameter passed as sourceOrTarget 
     * @param {string} [target] Target org Username or Alias to compare. (Require)
     * 
     * @returns {Promise<{ [key: string]: MetadataType }>} Return a promise with a JSON Metadata Object with the data respose. Contains the Metadata Types that exists on target and not on source.
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    compareOrgBetween(sourceOrTarget: string, target?: string): Promise<{ [key: string]: MetadataType }> {
        let source: string | undefined = sourceOrTarget;
        if (source && !target) {
            target = sourceOrTarget;
            source = undefined;
        }
        startOperation(this);
        return new Promise<{ [key: string]: MetadataType }>((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperOrgCompareBetween(projectFolder, { source: source, target: target, apiVersion: this.apiVersion }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @param {string[]} [types] List of Metadata Type API Names to describe. Undefined to describe all metadata types
     * @param {boolean} [groupGlobalActions] True to group global quick actions on "GlobalActions" group, false to include as object and item.
     * 
     * @returns {Promise<{ [key: string]: MetadataType }>} Return a promise with a Metadata JSON Object with the selected Metadata Types data
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    describeLocalMetadata(types?: string[], groupGlobalActions?: boolean): Promise<{ [key: string]: MetadataType }> {
        startOperation(this);
        return new Promise<{ [key: string]: MetadataType }>((resolve, reject) => {
            try {
                types = transformTypesToAHCLIInput(types, true);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperDescribeMetadata(projectFolder, { fromOrg: false, types: types, apiVersion: this.apiVersion, groupGlobalActions: groupGlobalActions }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @param {string[]} [types] List of Metadata Type API Names to describe. Undefined to describe all metadata types
     * @param {boolean} [downloadAll] True to download all Metadata types from all namespaces, false to download only data from org namespace
     * @param {boolean} [groupGlobalActions] True to group global quick actions on "GlobalActions" group, false to include as object and item.
     * 
     * @returns {Promise<{ [key: string]: MetadataType }>} Return a promise with a Metadata JSON Object with the selected Metadata Types data
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    describeOrgMetadata(types?: string[], downloadAll?: boolean, groupGlobalActions?: boolean): Promise<{ [key: string]: MetadataType }> {
        startOperation(this);
        return new Promise<{ [key: string]: MetadataType }>((resolve, reject) => {
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
                    this.handleResponse(response, () => {
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
     * @param {string | { [key: string]: MetadataType }} [types] Metadata JSON Object or Metadata JSON file with the selected types to retrieve
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
    retrieveLocalSpecialMetadata(types?: string | { [key: string]: MetadataType }): Promise<RetrieveResult> {
        startOperation(this);
        return new Promise<RetrieveResult>((resolve, reject) => {
            try {
                const typesToRetrieve = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRetrieveSpecial(projectFolder, {
                    fromOrg: false,
                    types: typesToRetrieve,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @param {string | { [key: string]: MetadataType }} [types] Metadata JSON Object or Metadata JSON file with the selected types to retrieve
     * @param {boolean} [downloadAll] True to download all Metadata types from all namespaces, false to download only data from org namespace
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
    retrieveOrgSpecialMetadata(types?: string | { [key: string]: MetadataType }, downloadAll?: boolean): Promise<RetrieveResult> {
        startOperation(this);
        return new Promise<RetrieveResult>((resolve, reject) => {
            try {
                const typesToRetrieve = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRetrieveSpecial(projectFolder, {
                    fromOrg: true,
                    types: typesToRetrieve,
                    downloadAll: downloadAll,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @param {string | { [key: string]: MetadataType }} [types] Metadata JSON Object or Metadata JSON file with the selected types to retrieve
     * @param {boolean} [downloadAll] True to download all Metadata types from all namespaces, false to download only data from org namespace
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
    retrieveMixedSpecialMetadata(types?: string | { [key: string]: MetadataType }, downloadAll?: boolean) {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const typesToRetrieve = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRetrieveSpecial(projectFolder, {
                    fromOrg: false,
                    types: typesToRetrieve,
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
                    this.handleResponse(response, () => {
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
     * @returns {Promise<string[]>} Return a promise with the list of available user permission API Names
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     * @throws {WrongDatatypeException} If the api version is not a Number or String. Can be undefined
     */
    loadUserPermissions(): Promise<string[]> {
        startOperation(this);
        return new Promise<string[]>((resolve, reject) => {
            try {
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperLoadPermissions(projectFolder, {
                    apiVersion: this.apiVersion,
                }, (ahCliProgress) => {
                    this._event.emit(EVENT.PROGRESS, ahCliProgress);
                });
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @param {string} source Source tag, branch or commit to compare to create the package and destructive files
     * @param {string} [target] Target tag, branch or commit to compare to create the package and destructive files
     * @param {string} [createType] Create type option (package, destructive, both)
     * @param {string} [deleteOrder] Delete order to create the destructive file (before or after)
     * @param {boolean} [useIgnore] true to use the ignore file when create the package, false in otherwise
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
    createPackageFromGit(source: string, target?: string, createType?: string, deleteOrder?: string, useIgnore?: boolean): Promise<PackageGeneratorResult> {
        startOperation(this);
        return new Promise<PackageGeneratorResult>((resolve, reject) => {
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
                    this.handleResponse(response, () => {
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
     * @param {string} source Metadata JSON file with the selected types to add to the package or destructive file
     * @param {string} [createType] Create type value to create Package XML or Destructive XML with the JSON data (package or destructive) 
     * @param {string} [deleteOrder] Delete order for the destructive XML file (before or after)
     * @param {boolean} [useIgnore] true to use the ignore file when create the package, false in otherwise
     * @param {boolean} [explicit] True to put all metadata type and object names explicit into the package, false to use wildcards if apply (true recommended)
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
    createPackageFromJSON(source: string, createType?: string, deleteOrder?: string, useIgnore?: boolean, explicit?: boolean): Promise<PackageGeneratorResult> {
        startOperation(this);
        return new Promise<PackageGeneratorResult>((resolve, reject) => {
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
                    this.handleResponse(response, () => {
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
     * @param {string | string[]} source Path or Paths to the Package XML or Destructive XML files
     * @param {string} [createType] Create type value to create Package XML or Destructive XML with the package data (package or destructive) 
     * @param {string} [deleteOrder] Delete order for the destructive XML file (before or after)
     * @param {boolean} [useIgnore] true to use the ignore file when create the package, false in otherwise
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
    createPackageFromOtherPackages(source: string | string[], createType?: string, deleteOrder?: string, useIgnore?: boolean): Promise<PackageGeneratorResult> {
        startOperation(this);
        return new Promise<PackageGeneratorResult>((resolve, reject) => {
            try {
                const sourceRes = transformTypesToAHCLIInput(Utils.forceArray(source), true);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperPackageGenerator(projectFolder, {
                    outputPath: this.outputPath,
                    createType: createType,
                    createFrom: 'package',
                    source: (sourceRes) ? sourceRes.join(',') : undefined,
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
                    this.handleResponse(response, () => {
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
     * @param {string[]} [types] List of Metadata Type API Names to ignore. Undefined to ignore all metadata types
     * 
     * @returns {Promise<void>} Return an empty promise when the ignore operation finish succesfully
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     */
    ignoreMetadata(types?: string[]): Promise<void> {
        startOperation(this);
        return new Promise<void>((resolve, reject) => {
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
                    this.handleResponse(response, () => {
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
     * @param {string | { [key: string]: MetadataType }} [types] Metadata JSON Object or Metadata JSON file with the selected types to repair or check error dependencies. Undefined to repair or check error all metadata types
     * @param {boolean} [onlyCheck] True to not repair and only check the errors, false to repair errors automatically
     * @param {boolean} [useIgnore] true to use the ignore file when repair dependencies, false in otherwise
     * 
     * @returns {Promise<{ [key: string]: DependenciesRepairResponse } | { [key: string]: DependenciesCheckResponse[] } | undefined>} Return a promise with the Repair response if you check repair, or the Only Check Response when select check only option
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     */
    repairDependencies(types?: string | { [key: string]: MetadataType }, onlyCheck?: boolean, useIgnore?: boolean): Promise<{ [key: string]: DependenciesRepairResponse } | { [key: string]: DependenciesCheckResponse[] } | undefined> {
        startOperation(this);
        return new Promise<{ [key: string]: DependenciesRepairResponse } | { [key: string]: DependenciesCheckResponse[] } | undefined>((resolve, reject) => {
            try {
                const typesToRetrieve = transformTypesToAHCLIInput(types);
                const projectFolder = Validator.validateFolderPath(this.projectFolder);
                const process = ProcessFactory.auraHelperRepairDependencies(projectFolder, {
                    types: typesToRetrieve,
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
                    this.handleResponse(response, () => {
                        endOperation(this);
                        if (response.result) {
                            if (onlyCheck) {
                                const checkResponse: { [key: string]: DependenciesCheckResponse[] } = {};
                                for (const key of Object.keys(response.result)) {
                                    const result: DependenciesCheckResponse[] = [];
                                    for (const error of response.result[key]) {
                                        result.push({
                                            endColumn: error.endColumn,
                                            startColumn: error.startColumn,
                                            file: error.file,
                                            item: error.item,
                                            line: error.line,
                                            message: error.message,
                                            object: error.object,
                                            severity: error.severity,
                                        });
                                    }
                                    checkResponse[key] = result;
                                }
                                resolve(checkResponse);
                            } else {
                                resolve(response.result);
                            }
                        } else {
                            resolve(undefined);
                        }
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
     * @returns {Promise<boolean>} Return a promise with true if is installer, false in otherwise
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     */
    isAuraHelperCLIInstalled(): Promise<boolean> {
        startOperation(this);
        return new Promise<boolean>((resolve, reject) => {
            try {
                const process = ProcessFactory.isAuraHelperInstalled();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then(() => {
                    endOperation(this);
                    resolve(true);
                }).catch((_error) => {
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
     * @returns {Promise<string>} Return a promise with the Aura Helper CLI response
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     */
    getAuraHelperCLIVersion(): Promise<string> {
        startOperation(this);
        return new Promise<string>((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperVersion();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    this.handleResponse(response, () => {
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
     * @returns {Promise<any>} Return a promise with the Aura Helper CLI response
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     */
    updateAuraHelperCLI(): Promise<any> {
        startOperation(this);
        return new Promise<any>((resolve, reject) => {
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
     * @returns {Promise<any>} Return a promise with the Aura Helper CLI response
     * 
     * @throws {CLIManagerException} If run other cli manager process when has one process running or Aura Helper CLI Return an error 
     * @throws {DataRequiredException} If required data is not provided
     * @throws {OSNotSupportedException} When run this processes with not supported operative system
     * @throws {WrongDirectoryPathException} If the project folder path is not a String or can't convert to absolute path
     * @throws {DirectoryNotFoundException} If the project folder path not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the project folder path is not a directory
     */
    updateAuraHelperCLIWithNPM(): Promise<any> {
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

    handleResponse(response: any, onSuccess: () => void) {
        if (response !== undefined) {
            if (Utils.isObject(response)) {
                if (response.status === 0) {
                    onSuccess.call(this);
                } else {
                    if (response.message) {
                        throw new CLIManagerException(response.message);
                    } else {
                        throw new CLIManagerException(response);
                    }
                }
            } else {
                onSuccess.call(this);
            }
        } else {
            response = new AuraHelperCLIResponse(0, '', {});
            onSuccess.call(this);
        }
    }
}

function transformTypesToAHCLIInput(types?: string | string[] | { [key: string]: MetadataType }, onlyTypes?: boolean): string[] | undefined {
    const result = [];
    if (!types) {
        return undefined;
    }
    if (Array.isArray(types)) {
        for (const type of types) {
            if (!Utils.isString(type)) {
                throw new WrongDatatypeException('The types list must contains Strings only');
            }
            result.push(type);
        }
    } else {
        const metadataTypes = Validator.validateMetadataJSON(types);
        for (const metadataTypeName of Object.keys(metadataTypes)) {
            const metadataType = metadataTypes[metadataTypeName];
            if (onlyTypes) {
                if (metadataType.checked) {
                    result.push(metadataTypeName);
                }
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

function killProcesses(cliManager: CLIManager): void {
    if (cliManager._processes && Object.keys(cliManager._processes).length > 0) {
        for (let process of Object.keys(cliManager._processes)) {
            killProcess(cliManager, cliManager._processes[process]);
        }
    }
}

function killProcess(cliManager: CLIManager, process: Process) {
    process.kill();
    delete cliManager._processes[process.name];
}

function startOperation(cliManager: CLIManager) {
    cliManager._abort = false;
    cliManager._inProgress = true;
    cliManager._processes = {};
}

function endOperation(cliManager: CLIManager) {
    cliManager._inProgress = false;
    cliManager._processes = {};
}

function addProcess(cliManager: CLIManager, process: Process) {
    cliManager._processes[process.name] = process;
}