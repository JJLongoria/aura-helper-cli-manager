const AHCLIManager = require('../index');
const { FileWriter } = require('@ah/core').FileSystem;

describe('Testing ./index.js', () => {
    test('Testing compress()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.compress('./test/assets/SFDXProject/force-app/main/default/applications/app_service_console.app-meta.xml', undefined, (data) => { });
        response = await cliManager.compress('./test/assets/SFDXProject/force-app/main/default/applications', undefined, (data) => { });
        response = await cliManager.compress(['./test/assets/SFDXProject/force-app/main/default/applications/app_service_console.app-meta.xml', './test/assets/SFDXProject/force-app/main/default/applications/Graphics_Pack.app-meta.xml'], undefined, (data) => { });
        try {
            response = await cliManager.compress({}, undefined, (data) => { });
        } catch (error) {

        }
        try {
            response = await cliManager.compress('./test/assets/SFDXProject/force-app/main/default/profiles', undefined, async (data) => {
                try {
                    await cliManager.compress('./test/assets/SFDXProject/force-app/main/default/profiles/Usuario Financiero.profile-meta.xml', undefined, (data) => { });
                } catch (error) {

                }
            });
        } catch (error) {

        }
        cliManager.abortProcess();
        done();
    }, 30000);
    test('Testing compareWithOrg()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.compareWithOrg((data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.compareWithOrg((data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        done();
    }, 300000);
    test('Testing compareOrgBetween()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.compareOrgBetween('MyOrg', 'MyOrg', (data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.compareOrgBetween('MyOrg', 'MyOrg', (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        //console.log(response);
        done();
    }, 300000);
    test('Testing retrieveOrgSpecialMetadata()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.retrieveOrgSpecialMetadata(false, ['RecordType:Account'], (data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.retrieveOrgSpecialMetadata(false, ['RecordType:Account'], (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        //console.log(response);
        done();
    }, 30000000);
    test('Testing retrieveLocalSpecialMetadata()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.retrieveLocalSpecialMetadata(['Profile'], (data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.retrieveLocalSpecialMetadata(['Profile'], (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        //console.log(response);
        done();
    }, 3000000);
    test('Testing retrieveMixedSpecialMetadata()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.retrieveMixedSpecialMetadata(false, ['RecordType:Account'], (data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.retrieveMixedSpecialMetadata(false, ['RecordType:Account'], (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        //console.log(response);
        done();
    }, 30000000);
    test('Testing loadUserPermissions()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.loadUserPermissions((data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.loadUserPermissions((data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        //console.log(response);
        done();
    }, 30000000);
    test('Testing ignoreMetadata()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.ignoreMetadata(['Profile'], (data) => { 
            //console.log(data);
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.loadUserPermissions(['Profile'], (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        //console.log(response);
        done();
    }, 300000);
    test('Testing isAuraHelperCLIInstalled()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.isAuraHelperCLIInstalled( (data) => { 
            
        });
        console.log('Is Installed: ' + response);
        //console.log(response);
        done();
    }, 30000000);
    test('Testing getAuraHelperCLIVersion()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
        let response = await cliManager.getAuraHelperCLIVersion( (data) => { 
            
        });
        console.log(response);
        //console.log(response);
        done();
    }, 30000000);
    test('Testing describeLocalMetadata()', async (done) => {
        const cliManager = new AHCLIManager('../gitTest/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('../gitTest/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('D:/Workspace/NodeJS/Aura Helper Framework/ah-cli-manager/test/assets/SFDXProject/manifest');
        let response = await cliManager.describeLocalMetadata(undefined, (data) => { 
            
        });
        try{
            response = await cliManager.describeLocalMetadata(undefined, (data) => { 
                cliManager.abortProcess();
            });
        } catch(error){

        }
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.describeLocalMetadata(undefined, (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        done();
    }, 30000000);
    test('Testing describeOrgMetadata()', async (done) => {
        const cliManager = new AHCLIManager('../gitTest/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('../gitTest/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('D:/Workspace/NodeJS/Aura Helper Framework/ah-cli-manager/test/assets/SFDXProject/manifest');
        let response = await cliManager.describeOrgMetadata(false, undefined, (data) => { 
            
        });
        try{
            cliManager.setProjectFolder('./test/assets/SFDXProjects');
            response = await cliManager.describeOrgMetadata(false, undefined, (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        done();
    }, 30000000);
    test('Testing createPackageFromGit()', async (done) => {
        const cliManager = new AHCLIManager('../gitTest/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('../gitTest/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('D:/Workspace/NodeJS/Aura Helper Framework/ah-cli-manager/test/assets/SFDXProject/manifest');
        let response = await cliManager.createPackageFromGit('test', 'origin/master', 'both', 'after', false, (data) => { 
            
        });
        try{
            cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
            response = await cliManager.createPackageFromGit('test', 'origin/master', 'both', 'after', false, (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        done();
    }, 30000000);
    test('Testing createPackageFromJSON()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
        cliManager.setOutputPath('./manifest');
        const result = await cliManager.describeLocalMetadata();
        const metadata = result.result.data;
        for(const metadataTypeName of Object.keys(metadata)){
            metadata[metadataTypeName].checked = true;
            if(metadata[metadataTypeName].childs && Object.keys(metadata[metadataTypeName].childs).length > 0){
                for(const metadataObjectName of Object.keys(metadata[metadataTypeName].childs)){
                    metadata[metadataTypeName].childs[metadataObjectName].checked = true;
                    if(metadata[metadataTypeName].childs[metadataObjectName].childs && Object.keys(metadata[metadataTypeName].childs[metadataObjectName].childs).length > 0){
                        for(const metadataItemName of Object.keys(metadata[metadataTypeName].childs[metadataObjectName].childs)){
                            metadata[metadataTypeName].childs[metadataObjectName].childs[metadataItemName].checked = true;
                        }
                    }
                }
            }
        }
        FileWriter.createFileSync('./test/assets/files/metadataJson.json', JSON.stringify(metadata, null, 2));
        let response = await cliManager.createPackageFromJSON('../files/metadataJson.json', 'package', 'after', false, (data) => { 
            
        });
        try{
            cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
            response = await cliManager.createPackageFromJSON('../files/metadataJson.json', 'package', 'after', false, (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        done();
    }, 30000000);
    test('Testing createPackageFromOtherPackages()', async (done) => {
        const cliManager = new AHCLIManager('./test/assets/SFDXProject', 50);
        cliManager.setApiVersion(50);
        cliManager.setNamespacePrefix('');
        cliManager.setProjectFolder('./test/assets/SFDXProject');
        cliManager.setCompressFiles(true);
        cliManager.setSortOrder('simpleFirst');
        cliManager.setIgnoreFile('./test/assets/SFDXProject/.ahignore.json');
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
        let response = await cliManager.createPackageFromOtherPackages(packages, 'both', 'after', false, (data) => { 
            //console.log(data);
        });
        try{
            cliManager.setOutputPath('./test/assets/SFDXProject/manifest');
            response = await cliManager.createPackageFromOtherPackages(packages, 'both', 'after', false, (data) => { 
                //console.log(data);
            });
        } catch(error){

        }
        done();
    }, 30000000);
});