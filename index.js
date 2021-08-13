const { ProcessHandler, ProcessFactory } = require('@ah/core').ProcessManager;
const { Validator, Utils } = require('@ah/core').CoreUtils;
const { FileChecker } = require('@ah/core').FileSystem;

class CLIManager {

    constructor(projectFolder, apiVersion, namespacePrefix) {
        this.projectFolder = (projectFolder !== undefined) ? Validator.validateFolderPath(projectFolder) : projectFolder;
        this.apiVersion = apiVersion;
        this.namespacePrefix = (namespacePrefix !== undefined) ? namespacePrefix : '';
        this.processes = {};
        this.abort = false;
        this.compressFiles = false;
        this.sortOrder;
        this.inProgress = false;
        this.ignoreFile;
        this.abortCallback;
        this.progressCallback;
        this.outputPath;
    }

    onProgress(progressCallback) {
        this.progressCallback = progressCallback;
    }

    onAbort(abortCallback) {
        this.abortCallback = abortCallback;
    }

    abortProcess() {
        this.abort = true;
        killProcesses(this);
        if (this.abortCallback) {
            this.abortCallback.call(this);
        }
    }

    setApiVersion(apiVersion) {
        this.apiVersion = apiVersion;
        return this;
    }

    setProjectFolder(projectFolder) {
        this.projectFolder = (projectFolder !== undefined) ? Validator.validateFolderPath(projectFolder) : projectFolder;
        return this;
    }

    setNamespacePrefix(namespacePrefix) {
        this.namespacePrefix = (namespacePrefix !== undefined) ? namespacePrefix : '';
        return this;
    }

    setCompressFiles(compressFiles) {
        this.compressFiles = compressFiles;
        return this;
    }

    setSortOrder(sortOrder) {
        this.sortOrder = sortOrder;
        return this;
    }

    setIgnoreFile(ignoreFile) {
        this.ignoreFile = ignoreFile;
        return this;
    }

    setOutputPath(outputPath) {
        this.outputPath = outputPath;
        return this;
    }

    compress(filesOrFolders, sortOrder) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                let nFiles = 0;
                let nFolders = 0; 
                const paths = Utils.forceArray(filesOrFolders);
                const resultPaths = [];
                for(const path of paths){
                    if(FileChecker.isFile(path)){
                        nFiles++;
                        resultPaths.push(Validator.validateFilePath(path));
                    } else {
                        nFolders++;
                        resultPaths.push(Validator.validateFolderPath(path));
                    }
                }
                if(nFiles == 0 && nFolders == 0){
                    reject('Not files or folders selected to compress');
                    return;
                } else if(nFiles > 0 && nFolders > 0){
                    reject('Can\'t compress files and folders at the same time. Please, add only folders or files to compress');
                    return;
                }  else if (nFolders > 1) {
                    reject('Can\'t compress more than one folder at the same time.');
                    return;
                }
                let process;
                if (nFiles > 0) {
                    process = ProcessFactory.auraHelperCompressFile(this.projectFolder, { file: resultPaths, sortOrder: sortOrder }, progressCallback);
                }
                else {
                    process = ProcessFactory.auraHelperCompressFolder(this.projectFolder, { folder: resultPaths, sortOrder: sortOrder }, progressCallback);
                }
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

    compareWithOrg() {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperOrgCompare(this.projectFolder, { apiVersion: this.apiVersion }, progressCallback)
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

    compareOrgBetween(source, target) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperOrgCompareBetween(this.projectFolder, { source: source, target: target, apiVersion: this.apiVersion }, progressCallback)
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

    describeLocalMetadata(types) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperDescribeMetadata(this.projectFolder, { fromOrg: false, types: types, apiVersion: this.apiVersion }, progressCallback)
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

    describeOrgMetadata(downloadAll, types) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperDescribeMetadata(this.projectFolder, {
                    fromOrg: true,
                    downloadAll: downloadAll,
                    types: types,
                    apiVersion: this.apiVersion
                }, progressCallback);
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

    retrieveLocalSpecialMetadata(types) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperRetrieveSpecial(this.projectFolder, {
                    fromOrg: false,
                    types: types,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, progressCallback);
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

    retrieveOrgSpecialMetadata(downloadAll, types) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperRetrieveSpecial(this.projectFolder, {
                    fromOrg: true,
                    types: types,
                    downloadAll: downloadAll,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, progressCallback);
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

    retrieveMixedSpecialMetadata(downloadAll, types) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperRetrieveSpecial(this.projectFolder, {
                    fromOrg: false,
                    types: types,
                    includeOrg: true,
                    downloadAll: downloadAll,
                    apiVersion: this.apiVersion,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, progressCallback);
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

    loadUserPermissions() {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperLoadPermissions(this.projectFolder, {
                    apiVersion: this.apiVersion,
                }, progressCallback);
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

    createPackageFromGit(source, target, createType, deleteOrder, useIgnore) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperPackageGenerator(this.projectFolder, {
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
                }, progressCallback);
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

    createPackageFromJSON(source, createType, deleteOrder, useIgnore, explicit) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperPackageGenerator(this.projectFolder, {
                    outputPath: this.outputPath,
                    createType: createType,
                    createFrom: 'json',
                    source: source,
                    deleteOrder: deleteOrder,
                    useIgnore: useIgnore,
                    ignoreFile: this.ignoreFile,
                    apiVersion: this.apiVersion,
                    explicit: explicit,
                }, progressCallback);
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

    createPackageFromOtherPackages(source, createType, deleteOrder, useIgnore) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperPackageGenerator(this.projectFolder, {
                    outputPath: this.outputPath,
                    createType: createType,
                    createFrom: 'package',
                    source: source.join(','),
                    deleteOrder: deleteOrder,
                    useIgnore: useIgnore,
                    ignoreFile: this.ignoreFile,
                    apiVersion: this.apiVersion,
                    explicit: true,
                }, progressCallback);
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

    ignoreMetadata(types) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperIgnore(this.projectFolder, {
                    types: types,
                    ignoreFile: this.ignoreFile,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, progressCallback);
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

    repairDependencies(types, onlyCheck, useIgnore) {
        const progressCallback = getCallback(arguments, this);
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperRepairDependencies(this.projectFolder, {
                    types: types,
                    useIgnore: useIgnore,
                    outputFile: this.outputPath,
                    onlyCheck: onlyCheck,
                    ignoreFile: this.ignoreFile,
                    compress: this.compressFiles,
                    sortOrder: this.sortOrder
                }, progressCallback);
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

    isAuraHelperCLIInstalled() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.isAuraHelperInstalled();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then(() => {
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

    getAuraHelperCLIVersion() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperVersion();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
                    handleResponse(response, () => {
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

    updateAuraHelperCLI() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperUpdate();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
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

    updateAuraHelperCLIWithNPM() {
        startOperation(this);
        return new Promise((resolve, reject) => {
            try {
                const process = ProcessFactory.auraHelperUpdateNPM();
                addProcess(this, process);
                ProcessHandler.runProcess(process).then((response) => {
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

function getCallback(args, cliManager){
    return Utils.getCallbackFunction(args) || cliManager.progressCallback;
}

function handleResponse(response, onSuccess) {
    if (response !== undefined) {
        if (Utils.isObject(response)) {
            if (response.status === 0) {
                onSuccess.call(this);
            } else {
                if (response.message)
                    throw new Error(response.message);
                else
                    throw new Error(response.error.message);
            }
        } else {
            onSuccess.call(this);
        }
    } else {
        response = {
            result: {}
        }
        onSuccess.call(this);
    }
}

function killProcesses(cliManager) {
    if (cliManager.processes && Object.keys(cliManager.processes).length > 0) {
        for (let process of Object.keys(cliManager.processes)) {
            killProcess(cliManager, cliManager.processes[process]);
        }
    }
}

function killProcess(cliManager, process) {
    process.kill();
    delete cliManager.processes[process.name];
}

function startOperation(cliManager) {
    if (!cliManager.allowConcurrence) {
        if (cliManager.inProgress)
            throw new Error('Connection in use. Abort the current operation to execute other.');
        cliManager.abort = false;
        cliManager.inProgress = true;
        cliManager.processes = {};
    }
}

function endOperation(cliManager) {
    cliManager.inProgress = false;
    cliManager.processes = {};
}

function addProcess(cliManager, process) {
    cliManager.processes[process.name] = process;
}