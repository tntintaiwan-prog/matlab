% LEVEL1 PDF practice reference
clc;
clear;
cam = webcam(1);
DeepLearning_detector = faceDetector("large-network");
MachineLearning_detector = vision.CascadeObjectDetector();
Threshold = 5;
MachineLearning_detector.MergeThreshold = Threshold;

fig = figure('Name', '班級/學號/姓名', 'NumberTitle', 'off');
stopBtn = uicontrol('Style', 'pushbutton', ...
    'String', '停止偵測', ...
    'Position', [20 20 100 40], ...
    'FontSize', 12, ...
    'Callback', @(src, event) setappdata(fig, 'stopFlag', true));
setappdata(fig, 'stopFlag', false);

while ishandle(fig)
    if getappdata(fig, 'stopFlag')
        break;
    end
    image = fliplr(snapshot(cam));

    [bboxes, scores] = detect(DeepLearning_detector, image);
    DeepLearning_detected_image = insertObjectAnnotation(image, 'rectangle', bboxes, 'Detected', ...
        'FontSize', 20, 'Color', 'red', 'LineWidth', 5, 'TextColor', 'white');
    bbox = step(MachineLearning_detector, image);
    MachineLearning_detected_image = insertObjectAnnotation(image, 'rectangle', bbox, 'Detected', ...
        'FontSize', 20, 'Color', 'red', 'LineWidth', 5, 'TextColor', 'white');

    subplot(2, 1, 1);
    imshow(DeepLearning_detected_image);
    title(['人臉偵測數量為: ' num2str(size(bboxes, 1))]);
    xlabel('深度學習/RetinaFace人臉偵測');

    subplot(2, 1, 2);
    imshow(MachineLearning_detected_image);
    title(['人臉偵測數量為: ' num2str(size(bbox, 1))]);
    xlabel(['機器學習/Haar特徵人臉偵測，門檻值為: ' num2str(Threshold)]);

    drawnow;
end
clear cam;
close all;
disp('程式結束');
