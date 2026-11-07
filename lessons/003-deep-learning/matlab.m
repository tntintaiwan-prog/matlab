% 同一攝影機畫面，使用兩個滑桿各自調整偵測門檻。
retina = faceDetector('large-network');
haar = vision.CascadeObjectDetector();
fig = figure('Name','RetinaFace 與 Haar 人臉偵測','NumberTitle','off');
setappdata(fig,'stopFlag',false);
try
    cam = webcam(1);
    left = axes('Parent',fig,'Position',[0.05 0.25 0.43 0.65]);
    right = axes('Parent',fig,'Position',[0.52 0.25 0.43 0.65]);
    uicontrol(fig,'Style','text','String','RetinaFace 信心門檻', ...
        'Units','normalized','Position',[0.05 0.14 0.43 0.04]);
    uicontrol(fig,'Style','text','String','Haar 合併門檻', ...
        'Units','normalized','Position',[0.52 0.14 0.43 0.04]);
    confidence = uicontrol(fig,'Style','slider','Min',0,'Max',1,'Value',0.5, ...
        'Units','normalized','Position',[0.05 0.10 0.43 0.04]);
    merge = uicontrol(fig,'Style','slider','Min',1,'Max',10,'Value',5, ...
        'SliderStep',[1/9 2/9],'Units','normalized','Position',[0.52 0.10 0.43 0.04]);
    uicontrol(fig,'Style','pushbutton','String','停止偵測', ...
        'Units','normalized','Position',[0.40 0.01 0.20 0.06], ...
        'Callback',@(~,~)setappdata(fig,'stopFlag',true));

    while isgraphics(fig) && ~getappdata(fig,'stopFlag')
        retinaThreshold = confidence.Value;
        haarThreshold = round(merge.Value);
        haar.MergeThreshold = haarThreshold;
        frame = fliplr(snapshot(cam));
        retinaBoxes = detect(retina,frame,Threshold=retinaThreshold);
        haarBoxes = step(haar,frame);
        retinaView = frame;
        haarView = frame;
        if ~isempty(retinaBoxes)
            retinaView = insertShape(frame,'Rectangle',retinaBoxes,'Color','red','LineWidth',3);
        end
        if ~isempty(haarBoxes)
            haarView = insertShape(frame,'Rectangle',haarBoxes,'Color','green','LineWidth',3);
        end
        imshow(retinaView,'Parent',left);
        title(left,sprintf('RetinaFace | %d 張 | 門檻 %.2f',size(retinaBoxes,1),retinaThreshold));
        imshow(haarView,'Parent',right);
        title(right,sprintf('Haar | %d 張 | 門檻 %d',size(haarBoxes,1),haarThreshold));
        drawnow;
    end
catch errorInfo
    clear cam;
    if isgraphics(fig)
        close(fig);
    end
    rethrow(errorInfo);
end
clear cam;
if isgraphics(fig)
    close(fig);
end
disp('已結束人臉偵測');
