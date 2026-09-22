@echo off
set "GS=C:\Program Files\gs\gs10.08.0\bin\gswin64c.exe"
set "INPUT=%~1"
set "OUTPUT=%~dpn1_compressed.pdf"
"%GS%" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="%OUTPUT%" "%INPUT%"
echo Done: %OUTPUT%
pause