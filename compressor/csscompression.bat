cd..

echo on

CMD /C "echo. 2> compressor\vision_app.min.css"
CMD /C "java -jar compressor\yuicompressor-2.4.8.jar www\css\themes\vision.min.css > compressor\vision_app.min.css"
CMD /C "java -jar compressor\yuicompressor-2.4.8.jar www\css\custom.css >> compressor\vision_app.min.css"
CMD /C "java -jar compressor\yuicompressor-2.4.8.jar www\js\lib\jmobile\1.4.5\jquery.mobile.structure-1.4.5.min.css >> compressor\vision_app.min.css"
CMD /C "java -jar compressor\yuicompressor-2.4.8.jar www\css\themes\jquery.mobile.icons.min.css >> compressor\vision_app.min.css"
CMD /C "java -jar compressor\yuicompressor-2.4.8.jar www\css\cropper\cropper.min.css >> compressor\vision_app.min.css"