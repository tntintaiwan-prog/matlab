"""正弦波範例；本機執行需 numpy 與 matplotlib。"""
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 2, 800)
A = 1
f = 2
y = A * np.sin(2 * np.pi * f * t)
plt.plot(t, y)
plt.xlabel('Time (s)')
plt.ylabel('Amplitude')
plt.grid(True)
plt.show()
