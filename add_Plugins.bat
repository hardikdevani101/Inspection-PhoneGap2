@echo  on 
@call cordova plugin add https://bitbucket.org/logilite/phonegap.plugins.camera.git

@call cordova plugin add https://bitbucket.org/logilite/phonegap.plugins.ftp.git

@call cordova plugin add https://bitbucket.org/logilite/phonegap.plugins.aviary.git

@call cordova plugin add https://github.com/apache/cordova-plugin-network-information.git

@call cordova plugin add org.apache.cordova.file

@call cordova plugin add org.apache.cordova.device

@call cordova plugin add org.apache.cordova.file-transfer

@call cordova plugin add org.apache.cordova.dialogs

@call cordova plugin add https://github.com/apache/cordova-plugin-whitelist.git

@call cordova build android

