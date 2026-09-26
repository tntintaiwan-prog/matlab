% 正弦波範例
t = linspace(0, 2, 800);
A = 1;
f = 2;
y = A * sin(2*pi*f*t);
plot(t, y);
xlabel('時間 (s)');
ylabel('振幅');
grid on;
