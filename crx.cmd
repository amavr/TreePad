del treepad.zip
cd app
"C:\Program Files\7-Zip\7z.exe" a -r treepad.zip *.*
move treepad.zip ..
cd ..
"C:\Program Files\7-Zip\7z.exe" a treepad.zip key.pem
"C:\Program Files\7-Zip\7z.exe" d treepad.zip manifest.json
"C:\Program Files\7-Zip\7z.exe" a treepad.zip manifest.json
