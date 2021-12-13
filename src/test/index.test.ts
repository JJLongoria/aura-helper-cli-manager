import { FileWriter, MetadataType, MetadataTypes } from '@aurahelper/core';
import { CLIManager } from '../index';

describe('Testing ./index.js', () => {
    test('Testing compress()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        let response = await cliManager.compress('./src/test/assets/SFDXProject/force-app/main/default/applications/app_service_console.app-meta.xml', undefined);
        response = await cliManager.compress('./src/test/assets/SFDXProject/force-app/main/default/applications', undefined);
        response = await cliManager.compress(['./src/test/assets/SFDXProject/force-app/main/default/applications/app_service_console.app-meta.xml', './src/test/assets/SFDXProject/force-app/main/default/applications/Graphics_Pack.app-meta.xml'], undefined);
        cliManager.abortProcess();

    }, 30000);
    test('Testing compareWithOrg()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');

        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        let response = await cliManager.compareWithOrg();
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.compareWithOrg();
        } catch (error) {
           
        }
        
    }, 300000);
    test('Testing compareOrgBetween()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        let response = await cliManager.compareOrgBetween('MyOrg', 'MyOrg');
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.compareOrgBetween('MyOrg', 'MyOrg');
        } catch (error) {

        }
        //console.log(response);
        
    }, 300000);
    test('Testing retrieveOrgSpecialMetadata()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        const types: { [key: string]: MetadataType } = {};
        types[MetadataTypes.PROFILE] = new MetadataType(MetadataTypes.PROFILE, true);
        let response = await cliManager.retrieveOrgSpecialMetadata(types, false);
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.retrieveOrgSpecialMetadata(types, false);
        } catch (error) {

        }
        //console.log(response);
        
    }, 30000000);
    test('Testing retrieveLocalSpecialMetadata()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        const types: { [key: string]: MetadataType } = {};
        types[MetadataTypes.PROFILE] = new MetadataType(MetadataTypes.PROFILE, true);
        let response = await cliManager.retrieveLocalSpecialMetadata(types);
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.retrieveLocalSpecialMetadata(types);
        } catch (error) {

        }
        //console.log(response);
        
    }, 3000000);
    test('Testing retrieveMixedSpecialMetadata()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        const types: { [key: string]: MetadataType } = {};
        types[MetadataTypes.PROFILE] = new MetadataType(MetadataTypes.PROFILE, true);
        let response = await cliManager.retrieveMixedSpecialMetadata(types, false);
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.retrieveMixedSpecialMetadata(types, false);
        } catch (error) {

        }
        //console.log(response);
        
    }, 30000000);
    test('Testing loadUserPermissions()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        let response = await cliManager.loadUserPermissions();
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.loadUserPermissions();
        } catch (error) {

        }
        //console.log(response);
        
    }, 30000000);
    test('Testing ignoreMetadata()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        cliManager.setIgnoreFile('.ahignore.json');
        await cliManager.ignoreMetadata(['Profile']);
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            const response = await cliManager.ignoreMetadata(['Profile']);
        } catch (error) {

        }
        //console.log(response);
        
    }, 300000);
    test('Testing isAuraHelperCLIInstalled()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        let response = await cliManager.isAuraHelperCLIInstalled();
        console.log('Is Installed: ' + response);
        //console.log(response);
        
    }, 30000000);
    test('Testing getAuraHelperCLIVersion()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
        let response = await cliManager.getAuraHelperCLIVersion();
        console.log(response);
        
    }, 30000000);
    test('Testing describeLocalMetadata()', async () => {
        const cliManager = new CLIManager('../gitTest/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('../gitTest/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setOutputPath('D:/Workspace/NodeJS/Aura Helper Framework/ah-cli-manager/test/assets/SFDXProject/manifest');
        let response = await cliManager.describeLocalMetadata(undefined);
        try {
            response = await cliManager.describeLocalMetadata(undefined);
        } catch (error) {

        }
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.describeLocalMetadata(undefined);
        } catch (error) {

        }
        
    }, 30000000);
    test('Testing describeOrgMetadata()', async () => {
        const cliManager = new CLIManager('../gitTest/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('../gitTest/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setOutputPath('D:/Workspace/NodeJS/Aura Helper Framework/ah-cli-manager/test/assets/SFDXProject/manifest');
        let response = await cliManager.describeOrgMetadata(undefined, false);
        try {
            cliManager.setProjectFolder('./src/test/assets/SFDXProjects');
            response = await cliManager.describeOrgMetadata(undefined, false);
        } catch (error) {

        }
        
    }, 30000000);
    test('Testing createPackageFromGit()', async () => {
        const cliManager = new CLIManager('../gitTest/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('../gitTest/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('D:/Workspace/NodeJS/Aura Helper Framework/ah-cli-manager/src/test/assets/SFDXProject/manifest');
        let response = await cliManager.createPackageFromGit('test', 'origin/master', 'both', 'after', false);
        try {
            cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
            response = await cliManager.createPackageFromGit('test', 'origin/master', 'both', 'after', false);
        } catch (error) {

        }
        
    }, 30000000);
    test('Testing createPackageFromJSON()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('.ahignore.json');
        cliManager.setOutputPath('./manifest');
        const metadata = await cliManager.describeLocalMetadata();
        for (const metadataTypeName of Object.keys(metadata)) {
            metadata[metadataTypeName].checked = true;
            if (metadata[metadataTypeName].childs && Object.keys(metadata[metadataTypeName].childs).length > 0) {
                for (const metadataObjectName of Object.keys(metadata[metadataTypeName].childs)) {
                    metadata[metadataTypeName].childs[metadataObjectName].checked = true;
                    if (metadata[metadataTypeName].childs[metadataObjectName].childs && Object.keys(metadata[metadataTypeName].childs[metadataObjectName].childs).length > 0) {
                        for (const metadataItemName of Object.keys(metadata[metadataTypeName].childs[metadataObjectName].childs)) {
                            metadata[metadataTypeName].childs[metadataObjectName].childs[metadataItemName].checked = true;
                        }
                    }
                }
            }
        }
        FileWriter.createFileSync('./src/test/assets/files/metadataJson.json', JSON.stringify(metadata, null, 2));
        let response = await cliManager.createPackageFromJSON('../files/metadataJson.json', 'package', 'after', false, true);
        
    }, 30000000);
    test('Testing createPackageFromOtherPackages()', async () => {
        const cliManager = new CLIManager('./src/test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./src/test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./src/test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./manifest');
        const packages = [
            '../files/package1.xml',
            '../files/package2.xml',
            '../files/package3.xml',
            '../files/package4.xml',
            '../files/destructiveChanges1.xml',
            '../files/destructiveChanges2.xml',
            '../files/destructiveChangesPost1.xml',
            '../files/destructiveChangesPost2.xml'
        ];
        let response = await cliManager.createPackageFromOtherPackages(packages, 'both', 'after', false);
        try {
            cliManager.setOutputPath('./src/test/assets/SFDXProject/manifest');
            response = await cliManager.createPackageFromOtherPackages(packages, 'both', 'after', false);
        } catch (error) {

        }
        
    }, 30000000);
});