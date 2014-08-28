@echo  on 
@call phonegap local plugin add https://bitbucket.org/dpansheriya/phonegap-camera.git

@call phonegap local plugin add https://bitbucket.org/logilite/phonegap.plugins.ftp.git

@call phonegap local plugin add org.apache.cordova.file

@call phonegap local plugin add org.apache.cordova.file-transfer

@call phonegap local plugin add org.apache.cordova.dialogs

@call phonegap local build android
