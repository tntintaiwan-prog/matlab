"""本機參考版本：pip install opencv-python
使用 OpenCV Haar cascade。按 Q、Esc 或關閉視窗停止。
minNeighbors 與 MATLAB MergeThreshold 不可直接視為數值等效。
"""
import cv2


def main():
    detector = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if detector.empty():
        raise RuntimeError('無法載入人臉模型')
    camera = cv2.VideoCapture(0)
    title = 'Face detection - Q or Esc to stop'
    try:
        if not camera.isOpened():
            raise RuntimeError('無法開啟攝影機')
        cv2.namedWindow(title)
        while True:
            ok, frame = camera.read()
            if not ok:
                raise RuntimeError('無法讀取攝影機畫面')
            frame = cv2.flip(frame, 1)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector.detectMultiScale(gray, scaleFactor=1.1,
                                             minNeighbors=5, minSize=(30, 30))
            for x, y, w, h in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
            cv2.putText(frame, f'Faces: {len(faces)}', (15, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.imshow(title, frame)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord('q'), 27) or cv2.getWindowProperty(title, cv2.WND_PROP_VISIBLE) < 1:
                break
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
