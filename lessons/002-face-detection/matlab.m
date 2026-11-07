clc;
clear;
cam = webcam(1);
face_detector = vision.CascadeObjectDetector();
face_detector.MergeThreshold = 5 ;
fig = figure('Name','Live 人臉辨識','NumberTitle','off');
stopBit = uicontrol("Style","pushbutton", ...
                    "String",'停止偵測', ...
                    'Position',[20 20 100 40], ...
                    'FontSize',12, ...
                    'Callback', @(src, event) setappdata(fig, 'stopFlag', true));
setappdata(fig, 'stopFlag', false);
while ishandle(fig)
    %檢查是否按下停止按鈕
    if getappdata(fig, 'stopFlag')
        break;
    end
    %取得影像並翻轉
    image = fliplr(snapshot(cam));
    %image = fliper(snapshot(cam));
    %人臉偵測
    bbox = step(face_detector, image);
    detected_image = insertObjectAnnotation(image,'rectangle',bbox,'Detected', ...
        'FontSize',20,'Color','red','LineWidth',5,'TextColor','white');
    %顯示影像
    imshow(detected_image);
    title(['人臉偵測數量為:' num2str(size(bbox,1))]);
    xlabel('點擊左下角的[停止偵測]可結束');
    %立即更新圖形視窗中的內容
    drawnow;
end
clear cam;
close all;
disp('已結束人臉偵測');
