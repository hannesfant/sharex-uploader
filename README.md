# sharex-uploader

## Sample config.json
```json
{
    "key": "supersecretkey",
    "port": 80,
    "uploadDir": "u/",
    "allowedExtensions": [
        "png",
        "gif",
        "jpg",
        "mp4",
        "mov",
        "mp3",
        "wav",
        "webm",
        "webp",
        "pdf",
        "svg",
        "zip"
    ],
    "siteTitle": "My screenshots"
}
```

## Sample sharex custom uploader settings
```json
{
  "Version": "12.4.1",
  "DestinationType": "ImageUploader, FileUploader",
  "RequestMethod": "POST",
  "RequestURL": "http://localhost/upload",
  "Headers": {
    "key": "supersecretkey"
  },
  "Body": "MultipartFormData",
  "FileFormName": "file"
}
```