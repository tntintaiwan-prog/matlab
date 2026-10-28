% 練習答案；請在 MATLAB 驗證攝影機、模型與框色。
clc;
clear;
cam = webcam(1);
Dld = faceDetector('large-network');
Mld = vision.CascadeObjectDetector();
Threshold = 5;
Mld.MergeThreshold = Threshold;

fig = figure('Name','班級／學號／姓名 | 雙演算法人臉偵測','NumberTitle','off');
stopBtn = uicontrol('Style','pushbutton', ...
    'String','停止偵測', ...
    'Position',[20 20 100 40], ...
    'FontSize',12, ...
    'Callback',@(src,event)setappdata(fig,'stopFlag',true));
setappdata(fig,'stopFlag',false);

try
    while ishandle(fig)
        if getappdata(fig,'stopFlag')
            break;
        end
        image = fliplr(snapshot(cam));

        [bboxes,scores] = detect(Dld,image);
        Dld_image = image;
        if ~isempty(bboxes)
            Dld_image = insertObjectAnnotation(image,'rectangle', ...
                bboxes,'Detected','FontSize',20,'Color','red', ...
                'LineWidth',5,'TextColor','white');
        end
        bbox = step(Mld,image);
        Mld_image = image;
        if ~isempty(bbox)
            Mld_image = insertObjectAnnotation(image,'rectangle', ...
                bbox,'Detected','FontSize',20,'Color','green', ...
                'LineWidth',5,'TextColor','white');
        end

        subplot(1,2,1,'Parent',fig);
        imshow(Dld_image);
        title(['RetinaFace 人臉數量：' num2str(size(bboxes,1))]);
        xlabel('深度學習 / RetinaFace');
        subplot(1,2,2,'Parent',fig);
        imshow(Mld_image);
        title(['Haar 人臉數量：' num2str(size(bbox,1))]);
        xlabel(['Haar / MergeThreshold = ' num2str(Threshold)]);

        drawnow;
    end
catch ME
    clear cam;
    if isgraphics(fig)
        close(fig);
    end
    rethrow(ME);
end
clear cam;
if isgraphics(fig)
    close(fig);
end
disp('程式結束');
