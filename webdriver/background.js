chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if(message.type == "download") {
            if (message.downloadType == "text") {
                chrome.downloads.download({
                    url: URL.createObjectURL(new Blob([message.data], {type: 'text/xml'})),
                    filename: 'train_annotations/' + message.filename,
                    saveAs: false
                });
            } else if (message.downloadType == "image") {
                chrome.downloads.download({
                    url: message.data,
                    filename: 'train_images/' + message.filename,
                    saveAs: false
                })
            }
        }
    }
);