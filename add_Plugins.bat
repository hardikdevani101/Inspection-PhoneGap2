@echo  on 
@call phonegap local plugin add https://bitbucket.org/dpansheriya/phonegap-camera.git

@call phonegap local plugin add https://bitbucket.org/logilite/phonegap.plugins.ftp.git

@call phonegap plugin add https://github.com/m1is/AviaryCordovaPlugin.git

@call phonegap plugin add https://github.com/apache/cordova-plugin-network-information.git

@call phonegap local plugin add org.apache.cordova.file

@call phonegap plugin add org.apache.cordova.device

@call phonegap local plugin add org.apache.cordova.file-transfer

@call phonegap local plugin add org.apache.cordova.dialogs

@call phonegap local build android

