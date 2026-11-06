# Testing checklist

## Desktop web checks

- Open the app locally on localhost
- browse the homepage
- visit pose detail pages
- load the camera route with a valid pose
- open the camera and enable the stream
- confirm the selected pose overlay renders
- confirm pose detection status updates
- confirm the camera remains operational while the vision layer runs
- capture and preview a photo
- retake a captured photo
- try share and download flows where supported

## iPhone Safari checks

- open the deployed HTTPS URL in Safari
- allow camera access
- test rear camera and front camera switching
- confirm live preview remains stable
- test the rule-of-thirds grid
- confirm overlay sizing and nudging are usable
- ensure the pose detection panel appears without blocking the camera view
- confirm the Ready state appears only when the pose is stable and aligned
- capture a photo and review it
- confirm portrait and landscape layouts still work
- background the browser and reopen it

## Home Screen install checks

- tap Share in Safari
- select Add to Home Screen
- verify the icon and app name are correct
- launch the installed app in standalone mode
- confirm camera access still works in standalone mode
- confirm navigation remains correct

## Android Chrome checks

- open the app in Chrome on Android
- confirm camera permission requests work
- test capture, review, and retake flows
- verify PWA install prompt behavior where supported
- verify no backend is required for the core flow

## Offline checks

- with the app opened once successfully, go offline
- confirm shell pages still open
- confirm a fallback experience is shown when a request fails
- confirm cached assets are reused without crashing

## Known limitations

- real-device verification remains pending unless tested on a physical iPhone
- some PWA install support differs by browser vendor and OS
- detecting real-world pose accuracy requires live user testing with the camera
