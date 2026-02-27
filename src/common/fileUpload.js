const multer = require('multer');
const fs = require('fs');
const path = require('path');

class FileUpload {
	
    uploadStorage = multer.diskStorage({
		
        destination: function (req, file, cb) {
			const reqParams =req.params;
            // var imageDir=`./public/uploads/${reqParams.id}`;
            let imageDir;
            if (reqParams.fileName === "doc_husbandPhoto" || reqParams.fileName === "doc_wifePhoto" || reqParams.fileName === "doc_husbandSignature" || reqParams.fileName === "doc_wifeSignature") {
                imageDir = `./public/uploads/${reqParams.id}`;
            } else {
                imageDir = process.env.UPLOAD_PATH+`${reqParams.id}`;
            }
            fs.mkdirSync(imageDir, { recursive: true })
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf") {
                cb(null, imageDir)
            } else {
                cb(new Error('invalid file type.'))
            }
        },
        filename: function (req, file, cb) {
			const reqParams =req.params;
			if(file.mimetype == "application/pdf"){
				if(reqParams.fileName === undefined){
					cb(null,file.fieldname +'.pdf')
				}else{
					cb(null, reqParams.fileName + '.pdf');
				}

			}else{
				if(reqParams.fileName ==undefined){
					cb(null,file.fieldname +'.png')
				}else{
					cb(null, reqParams.fileName + '.png');
				}
				
			}
            
        }
    });
    uploadStore = multer({ storage: this.uploadStorage });

    copyToImageDir(req, file) {
        const { id, fileName } = req.params;
        const extension = file.mimetype === 'application/pdf' ? '.pdf' : '.png';
        const filename = (fileName || file.fieldname) + extension;
    
        const srcPath = path.join('./public/uploads', id, filename);
        const destPath = path.join(process.env.UPLOAD_PATH, id, filename);
    
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
    
        fs.copyFileSync(srcPath, destPath);
    }
    
}

module.exports = new FileUpload({});
