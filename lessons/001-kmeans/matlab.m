% K-means 分群實作（依課堂文件整理）
clc;                    % 清除 Command Window 文字
clear;                  % 清除 Workspace 變數
close all;

number = 1000;
X = randn(number, 2);    % 產生 1000 筆二維常態隨機資料

figure(1);
plot(X(:,1), X(:,2), 'k.', 'MarkerSize', 10);
title('原始資料分布圖');

[Idx, Ctrs, SumD, D] = kmeans(X, 5);

figure(2);              % 使用另一張圖保留原始資料圖
plot(X(Idx==1,1), X(Idx==1,2), 'r.', 'MarkerSize', 10);
hold on;
plot(X(Idx==2,1), X(Idx==2,2), 'b.', 'MarkerSize', 10);
plot(X(Idx==3,1), X(Idx==3,2), 'g.', 'MarkerSize', 10);
plot(X(Idx==4,1), X(Idx==4,2), 'y.', 'MarkerSize', 10);
plot(X(Idx==5,1), X(Idx==5,2), 'm.', 'MarkerSize', 10);
plot(Ctrs(:,1), Ctrs(:,2), 'kx', 'MarkerSize', 14, 'LineWidth', 4);
legend('Cluster 1', 'Cluster 2', 'Cluster 3', 'Cluster 4', ...
       'Cluster 5', 'Centroids', 'Location', 'northwest');
title('k-means分五群');
hold off;
